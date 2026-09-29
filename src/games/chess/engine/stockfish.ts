/**
 * Thin wrapper around the raw Stockfish Web Worker. Verified live (not
 * just assumed from reading the bundled source) that `new Worker(url)` +
 * plain string postMessage/onmessage speaks UCI directly — this is the
 * "lite single-threaded" build (~1.8MB total) per PLAN.md's Phase 2
 * research: avoids the COOP/COEP header requirement multi-threaded WASM
 * needs, at a strength cost far beyond what this app's difficulty levels
 * need anyway (it's still much stronger than any casual player).
 */

const ENGINE_URL = '/stockfish/stockfish-19-lite-single.js'

export class StockfishEngine {
  private worker: Worker
  private ready: Promise<void>

  constructor() {
    this.worker = new Worker(ENGINE_URL)
    this.ready = new Promise((resolve) => {
      const onReady = (e: MessageEvent<string>) => {
        if (e.data === 'uciok') {
          this.worker.removeEventListener('message', onReady)
          resolve()
        }
      }
      this.worker.addEventListener('message', onReady)
      this.worker.postMessage('uci')
    })
  }

  async setSkillLevel(level: number): Promise<void> {
    await this.ready
    this.worker.postMessage(`setoption name Skill Level value ${Math.round(level)}`)
  }

  /** Resolves with the engine's chosen move in UCI form ("e2e4", "e7e8q" for promotion). */
  async bestMove(fen: string, moveTimeMs: number): Promise<string> {
    await this.ready
    return new Promise((resolve) => {
      const onMessage = (e: MessageEvent<string>) => {
        if (typeof e.data === 'string' && e.data.startsWith('bestmove')) {
          this.worker.removeEventListener('message', onMessage)
          resolve(e.data.split(' ')[1])
        }
      }
      this.worker.addEventListener('message', onMessage)
      this.worker.postMessage(`position fen ${fen}`)
      this.worker.postMessage(`go movetime ${moveTimeMs}`)
    })
  }

  terminate(): void {
    this.worker.terminate()
  }
}
