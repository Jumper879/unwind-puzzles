/* global console, fetch */
// One-time: registers the bot's command menu.
//   TELEGRAM_BOT_TOKEN=123:abc node scripts/set-telegram-commands.mjs
const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) {
  console.error('Set TELEGRAM_BOT_TOKEN first.')
  process.exit(1)
}
const res = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    commands: [
      { command: 'start', description: 'Open Unwind Puzzles' },
      { command: 'help', description: 'How it works' },
    ],
  }),
})
const body = await res.json()
console.log(body.ok ? 'Commands registered.' : `Failed: ${body.description}`)
process.exit(body.ok ? 0 : 1)
