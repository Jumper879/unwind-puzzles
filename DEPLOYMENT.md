# Deployment

The app is a Vite SPA on Vercel. `/api/telegram-webhook` is a Vercel serverless function for the
Telegram bot (welcome message + Play button).

## Telegram bot webhook

### Environment variables (Vercel → Project → Settings → Environment Variables)

Server-side only — **no `VITE_` prefix**, so they never reach the client bundle. Redeploy after
changing them.

| Variable                  | Value                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN`      | Token from @BotFather                                                                    |
| `TELEGRAM_WEBHOOK_SECRET` | Random string you choose (1–256 chars of `A-Z a-z 0-9 _ -`), e.g. `openssl rand -hex 24` |
| `TELEGRAM_BOT_USERNAME`   | Bot username without `@` (used by the "Share with a friend" button)                      |

### Register the webhook (once, after the deploy is live)

Open this URL in a browser (replace the placeholders):

```
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://unwind-puzzles.vercel.app/api/telegram-webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>&allowed_updates=["message"]
```

Expect `{"ok":true,"result":true,"description":"Webhook was set"}`. Check it any time with
`https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo`.

### Register the command menu (once)

```
TELEGRAM_BOT_TOKEN=<token> node scripts/set-telegram-commands.mjs
```

Registers `/start` ("Open Unwind Puzzles") and `/help` ("How it works").

### Behaviour

- Requests without a matching `X-Telegram-Bot-Api-Secret-Token` header get `401`.
- Only private-chat text messages are answered; everything else is ignored.
- Always returns `200` to Telegram, even if sending fails (the error is logged without the token).
