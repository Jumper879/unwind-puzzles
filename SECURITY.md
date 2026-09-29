# SECURITY.md

## Auth flows

**Guest (web/PWA).** `supabase.auth.signInAnonymously()` on first load (`useBootstrapSession`,
`src/platform/browser.ts`). The resulting JWT carries `is_anonymous: true`, which RLS policies
could branch on if guest-only restrictions are ever needed (none are, currently — guests and
upgraded accounts are treated the same). Session persists via Supabase's own storage; lost on
sign-out, cleared site data, or a new device, matching the brief.

**Telegram.** `src/platform/telegram.ts` sends the raw `initData` string to the `telegram-auth`
Edge Function (`supabase/functions/telegram-auth`). That function, and only that function, treats
`initData` as authoritative:

1. Rebuild `data_check_string` from every field except `hash`, sorted alphabetically, joined as
   `key=value\n`.
2. `secret_key = HMAC_SHA256(key="WebAppData", message=BOT_TOKEN)`.
3. `expected_hash = hex(HMAC_SHA256(key=secret_key, message=data_check_string))`.
4. Constant-time compare `expected_hash` against the provided `hash`.
5. Reject if `auth_date` is older than 24h.

Only after all five checks pass does the function look up (or create) the profile by
`telegram_id` and mint a real Supabase session for it, handed back to the client. The client's
`initDataUnsafe` is used **only** for a cosmetic display name (see the comment in `telegram.ts`)
— never for anything that reaches the database.

`TELEGRAM_BOT_TOKEN` lives only in the Edge Function's environment (`supabase secrets set`),
never in client code, `.env.example`, or any committed file.

## Anti-cheat

Every table that feeds scoring, progress or streaks (`game_sessions`, `results`,
`personal_bests`, `level_progress`, `progress`, `streaks`) has **no client insert/update RLS
policy at all** — see `DATABASE.md`. The only way to affect them:

- `start_session(game_id, level_id, client_platform)` — issues the session server-side and
  copies `seed` from the `levels` row, so a client always plays the seed the server chose.
- `submit_result(session_id, ...)` — looks up the caller's own **active** session (`for update`,
  so a session can't be double-submitted by a race), flags (not rejects) implausible timing —
  `time_ms < 300` or more than 2s past the session's actual server-clock elapsed time — as
  `is_valid = false`, and only lets valid results update progress/streaks.

Flagged rather than deleted: `is_valid = false` rows stay in `results` for review instead of
silently vanishing.

**Not yet implemented** (flagged honestly, not silently skipped): per-game server-side solution
re-validation (sudoku/crossword/word-search/chess-puzzle move-list checking, etc.) — there's no
game content yet to validate against. This is a Phase 3+ item as each game's engine ships, and
belongs in that game's own section of `GAMES.md` once written, not invented speculatively here.
Rate limiting on the RPCs also isn't configured yet — add via Supabase's built-in rate limiting
or an Edge Function wrapper before this goes to real users.

## Privacy / data deletion

- `export_my_data()` (`0009_privacy_rpcs.sql`) returns every row the caller owns, across every
  table, as one JSON document — self-service GDPR/NDPR-style export.
- `request_account_deletion()` logs an `events` row recording the request. The actual delete
  (`auth.admin.deleteUser`, which cascades through every `references profiles(id) on delete
cascade` foreign key) needs the service role, so it's a Phase 7 Edge Function, not this RPC —
  noted in that function's own comment rather than half-implemented here.

## What's intentionally client-writable

Only `settings` (sound/music/haptics/relax-mode/theme/language) and `events` (first-party,
in-house analytics — no third-party trackers, per the brief) allow a direct client
insert/update. Neither is score- or progress-relevant, so there's nothing to gain by writing
either one directly.

## Environment / secrets

- `.env.example` documents the two client-safe values (`VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY`) — safe to expose since the anon key only ever acts through RLS and
  the RPCs above.
- `TELEGRAM_BOT_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` are Edge Function secrets only, never
  client-side, never committed.
- `.env.local` (where real keys would go locally) is git-ignored via the scaffold's default
  `*.local` pattern.

**Not yet exercised against a live project or a real bot token** — same caveat as
`DATABASE.md`: this is written directly against the documented Telegram/Supabase behavior and
needs a real end-to-end smoke test as soon as both exist.
