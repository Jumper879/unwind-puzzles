// Validates Telegram Mini App initData server-side and returns a real
// Supabase session for the corresponding player, creating the profile on
// first login. Never trust `initDataUnsafe` on the client for this — this
// function is the only place `initData` is treated as authoritative,
// exactly per PLAN.md's SECURITY.md note.
//
// Algorithm per https://core.telegram.org/bots/webapps (checked live,
// see PLAN.md's research table):
//   data_check_string = every field except `hash`, sorted by key,
//                        joined as "key=value" with "\n"
//   secret_key = HMAC_SHA256(key="WebAppData", message=BOT_TOKEN)
//   expected_hash = hex(HMAC_SHA256(key=secret_key, message=data_check_string))
//   valid iff expected_hash === hash (constant-time compare) AND
//             auth_date is within MAX_AUTH_AGE_SECONDS of now.
//
// NOTE: written against the documented algorithm and Supabase's documented
// admin-API session-minting pattern, but not yet exercised against a real
// bot token or Supabase project (none exists yet) — smoke-test this end to
// end as soon as both are available, per PLAN.md Phase 2's checkpoint.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

async function hmacSha256(keyBytes: Uint8Array, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return new Uint8Array(sig)
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function verifyInitData(initData: string): Promise<Record<string, string> | null> {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return null
  params.delete('hash')

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')

  const secretKey = await hmacSha256(new TextEncoder().encode('WebAppData'), BOT_TOKEN)
  const expected = toHex(await hmacSha256(secretKey, dataCheckString))
  if (!constantTimeEqual(expected, hash)) return null

  const authDate = Number(params.get('auth_date') ?? '0')
  if (!authDate || Date.now() / 1000 - authDate > MAX_AUTH_AGE_SECONDS) return null

  return Object.fromEntries(params.entries())
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { initData } = await req.json().catch(() => ({ initData: null }))
  if (typeof initData !== 'string' || !initData) {
    return new Response(JSON.stringify({ error: 'missing initData' }), { status: 400 })
  }

  const fields = await verifyInitData(initData)
  if (!fields) {
    return new Response(JSON.stringify({ error: 'invalid or expired initData' }), { status: 401 })
  }

  const user = JSON.parse(fields.user ?? '{}') as { id?: number; first_name?: string }
  if (!user.id) {
    return new Response(JSON.stringify({ error: 'initData had no user' }), { status: 400 })
  }
  const telegramId = String(user.id)
  const placeholderEmail = `telegram-${telegramId}@users.unwindpuzzles.internal`

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data: existingIdentity } = await admin
    .from('identities')
    .select('profile_id')
    .eq('provider', 'telegram')
    .eq('provider_user_id', telegramId)
    .maybeSingle()

  let authUserId = existingIdentity?.profile_id as string | undefined

  if (!authUserId) {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: placeholderEmail,
      email_confirm: true,
      app_metadata: { provider: 'telegram' },
      user_metadata: { display_name: user.first_name ?? null },
    })
    if (createErr || !created?.user) {
      return new Response(JSON.stringify({ error: createErr?.message ?? 'user creation failed' }), {
        status: 500,
      })
    }
    authUserId = created.user.id
    // The handle_new_user trigger (0001_profiles.sql) already inserted a
    // default 'anonymous' identity row — replace it with the real one.
    await admin
      .from('identities')
      .upsert(
        { profile_id: authUserId, provider: 'telegram', provider_user_id: telegramId },
        { onConflict: 'provider,provider_user_id' },
      )
  }

  // Mint a real session for authUserId via a magic-link token, exchanged
  // server-side — see this file's header comment for why (Supabase's admin
  // API has no direct "create session for existing user id" call).
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: placeholderEmail,
  })
  if (linkErr || !link) {
    return new Response(JSON.stringify({ error: linkErr?.message ?? 'link generation failed' }), {
      status: 500,
    })
  }

  const anon = createClient(SUPABASE_URL, ANON_KEY)
  const { data: session, error: verifyErr } = await anon.auth.verifyOtp({
    type: 'magiclink',
    token_hash: link.properties.hashed_token,
    email: placeholderEmail,
  })
  if (verifyErr || !session.session) {
    return new Response(
      JSON.stringify({ error: verifyErr?.message ?? 'session exchange failed' }),
      {
        status: 500,
      },
    )
  }

  return new Response(
    JSON.stringify({
      access_token: session.session.access_token,
      refresh_token: session.session.refresh_token,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
