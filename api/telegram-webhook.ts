/**
 * Telegram bot webhook (Vercel serverless function, server-side only).
 *
 * Secrets come from server env vars (no VITE_ prefix, so they never reach the
 * client bundle) and are never logged:
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, TELEGRAM_BOT_USERNAME
 */

const APP_URL = 'https://unwind-puzzles.vercel.app/'

const WELCOME = (name: string) => `Hey ${name}, welcome to Unwind Puzzles 🧩

Take a breath. Pick a puzzle. Unwind.

8 calm games in one place:
❌ X&O  ·  🔤 Word Search  ·  ✏️ Crossword
🔢 Sudoku Cards  ·  ♟ Chess  ·  🍒 Fruit Match
🔍 Spot the Difference  ·  🧩 Missing Piece

No timers unless you want them. Just you and a good puzzle.

Tap Play to start 👇`

const HELP =
  'Tap Play to open the game. Your progress saves automatically. Questions or feedback? Just reply here.'
const FALLBACK = 'Ready when you are 🧩'

interface TelegramUpdate {
  message?: {
    text?: string
    chat?: { id?: number; type?: string }
    from?: { first_name?: string }
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function playKeyboard() {
  const rows: unknown[][] = [[{ text: '▶️ Play Unwind', web_app: { url: APP_URL } }]]
  const username = (process.env.TELEGRAM_BOT_USERNAME ?? '').replace(/^@/, '').trim()
  if (username) {
    rows.push([
      {
        text: '💌 Share with a friend',
        url: `https://t.me/share/url?url=https://t.me/${username}&text=Calm%20puzzles%20for%20your%20quiet%20moments%20%F0%9F%A7%A9`,
      },
    ])
  }
  return { inline_keyboard: rows }
}

function command(text: string): string | null {
  const m = /^\/(\w+)(?:@\w+)?(?:\s|$)/.exec(text)
  return m ? m[1].toLowerCase() : null
}

function replyFor(text: string, firstName: string | undefined): string {
  const cmd = command(text)
  if (cmd === 'start') {
    const name = escapeHtml((firstName ?? '').trim().slice(0, 64)) || 'there'
    return WELCOME(name)
  }
  if (cmd === 'help') return HELP
  return FALLBACK
}

const ok = () => new Response('ok', { status: 200 })

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  const token = process.env.TELEGRAM_BOT_TOKEN
  // Fail closed: an unset secret must never let everything through.
  if (!secret || request.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const update = (await request.json()) as TelegramUpdate
    const msg = update.message
    // Only private-chat text messages; everything else is ignored.
    if (!msg || msg.chat?.type !== 'private' || typeof msg.chat.id !== 'number' || !msg.text) {
      return ok()
    }
    if (!token) {
      console.error('telegram-webhook: TELEGRAM_BOT_TOKEN is not set')
      return ok()
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: msg.chat.id,
        text: replyFor(msg.text, msg.from?.first_name),
        parse_mode: 'HTML',
        reply_markup: playKeyboard(),
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) console.error(`telegram-webhook: sendMessage failed with HTTP ${res.status}`)
  } catch (err) {
    // Name only — fetch errors can embed the request URL, which contains the token.
    const detail = err instanceof Error ? err.name : 'unknown error'
    console.error(`telegram-webhook: handler error (${detail})`)
  }
  return ok()
}

export function GET(): Response {
  return new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } })
}
