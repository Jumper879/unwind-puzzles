// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from '../api/telegram-webhook'

const SECRET = 'test-secret'

function req(body: unknown, secret: string | null = SECRET) {
  return new Request('https://x.test/api/telegram-webhook', {
    method: 'POST',
    headers: secret === null ? {} : { 'x-telegram-bot-api-secret-token': secret },
    body: JSON.stringify(body),
  })
}

const msg = (text: string, extra: object = {}) => ({
  message: { text, chat: { id: 42, type: 'private' }, from: { first_name: 'Ada' }, ...extra },
})

describe('telegram webhook', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    process.env.TELEGRAM_WEBHOOK_SECRET = SECRET
    process.env.TELEGRAM_BOT_TOKEN = '123:TOKEN'
    process.env.TELEGRAM_BOT_USERNAME = 'UnwindBot'
    fetchMock = vi.fn(async () => new Response('{"ok":true}'))
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  const sent = () => JSON.parse(fetchMock.mock.calls[0][1].body)

  it('rejects a wrong or missing secret with 401 and sends nothing', async () => {
    expect((await POST(req(msg('/start'), 'nope'))).status).toBe(401)
    expect((await POST(req(msg('/start'), null))).status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('/start (with a parameter) sends the welcome with the web_app and share buttons', async () => {
    const res = await POST(req(msg('/start ref123')))
    expect(res.status).toBe(200)
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.telegram.org/bot123:TOKEN/sendMessage')
    const body = sent()
    expect(body.chat_id).toBe(42)
    expect(body.text).toContain('Hey Ada, welcome to Unwind Puzzles 🧩')
    expect(body.reply_markup.inline_keyboard[0][0]).toEqual({
      text: '▶️ Play Unwind',
      web_app: { url: 'https://unwind-puzzles.vercel.app/' },
    })
    expect(body.reply_markup.inline_keyboard[1][0].url).toContain('https://t.me/UnwindBot')
  })

  it('escapes the first name and falls back to "there"', async () => {
    await POST(req(msg('/start', { from: { first_name: '<b>&' } })))
    expect(sent().text).toContain('Hey &lt;b&gt;&amp;,')
    fetchMock.mockClear()
    await POST(req(msg('/start', { from: {} })))
    expect(sent().text).toContain('Hey there,')
  })

  it('/help replies with the help text and Play button', async () => {
    await POST(req(msg('/help')))
    expect(sent().text).toMatch(/^Tap Play to open the game\./)
    expect(sent().reply_markup.inline_keyboard[0][0].web_app).toBeDefined()
  })

  it('unknown text gets the fallback with the Play button', async () => {
    await POST(req(msg('hello?')))
    expect(sent().text).toBe('Ready when you are 🧩')
    expect(sent().reply_markup.inline_keyboard[0][0].web_app).toBeDefined()
  })

  it('ignores non-private chats and non-message updates, still 200', async () => {
    expect((await POST(req(msg('/start', { chat: { id: 1, type: 'group' } })))).status).toBe(200)
    expect((await POST(req({ edited_message: {} }))).status).toBe(200)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 200 and never logs the token when sending fails', async () => {
    fetchMock.mockRejectedValue(new Error('boom https://api.telegram.org/bot123:TOKEN/x'))
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect((await POST(req(msg('/start')))).status).toBe(200)
    expect(JSON.stringify(spy.mock.calls)).not.toContain('TOKEN')
    spy.mockRestore()
  })

  it('GET is 405', () => {
    expect(GET().status).toBe(405)
  })
})
