import {
  availableMoves,
  applyMove,
  boardSize,
  checkWinner,
  isBoardFull,
  otherMark,
  winningLines,
} from './board'
import type { Board, Difficulty, Mark, TicTacToeMode } from './types'

// Classic 3x3 is small enough to solve perfectly (no depth cap). The 4x4
// connect4 variant is not — 16 cells makes a full unpruned solve too slow
// for a UI thread, so it gets a depth cap plus a heuristic evaluation for
// non-terminal cutoff nodes. This means "Hard" is provably unbeatable for
// classic, and strong-but-not-provably-perfect for connect4 — documented
// here rather than silently claimed as "unbeatable" for both.
const CONNECT4_SEARCH_DEPTH = 6

function evaluateHeuristic(board: Board, size: number, aiMark: Mark, humanMark: Mark): number {
  let score = 0
  for (const line of winningLines(size)) {
    const marks = line.map((i) => board[i])
    const aiCount = marks.filter((m) => m === aiMark).length
    const humanCount = marks.filter((m) => m === humanMark).length
    if (aiCount > 0 && humanCount > 0) continue // blocked line, worthless to either side
    if (aiCount > 0) score += aiCount ** 2
    if (humanCount > 0) score -= humanCount ** 2
  }
  return score
}

function minimax(
  board: Board,
  mode: TicTacToeMode,
  size: number,
  turn: Mark,
  aiMark: Mark,
  humanMark: Mark,
  depth: number,
  alpha: number,
  beta: number,
): number {
  const win = checkWinner(board, size)
  if (win) return win.winner === aiMark ? 1000 - depth : depth - 1000
  if (isBoardFull(board)) return 0

  const maxDepth = mode === 'classic' ? Infinity : CONNECT4_SEARCH_DEPTH
  if (depth >= maxDepth) return evaluateHeuristic(board, size, aiMark, humanMark)

  const maximizing = turn === aiMark
  let best = maximizing ? -Infinity : Infinity

  for (const move of availableMoves(board)) {
    const value = minimax(
      applyMove(board, move, turn),
      mode,
      size,
      otherMark(turn),
      aiMark,
      humanMark,
      depth + 1,
      alpha,
      beta,
    )
    if (maximizing) {
      best = Math.max(best, value)
      alpha = Math.max(alpha, best)
    } else {
      best = Math.min(best, value)
      beta = Math.min(beta, best)
    }
    if (beta <= alpha) break
  }
  return best
}

function bestMove(board: Board, mode: TicTacToeMode, aiMark: Mark): number {
  const size = boardSize(mode)
  const humanMark = otherMark(aiMark)
  let best = -Infinity
  let bestMoves: number[] = []

  for (const move of availableMoves(board)) {
    const value = minimax(
      applyMove(board, move, aiMark),
      mode,
      size,
      humanMark,
      aiMark,
      humanMark,
      1,
      -Infinity,
      Infinity,
    )
    if (value > best) {
      best = value
      bestMoves = [move]
    } else if (value === best) {
      bestMoves.push(move)
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)]
}

/** Public: the move a hint should suggest — always the objectively best one, regardless of difficulty. */
export function suggestMove(board: Board, mode: TicTacToeMode, aiMark: Mark): number {
  return bestMove(board, mode, aiMark)
}

export function pickAiMove(
  board: Board,
  mode: TicTacToeMode,
  aiMark: Mark,
  difficulty: Difficulty,
): number {
  const moves = availableMoves(board)
  const randomMove = () => moves[Math.floor(Math.random() * moves.length)]

  if (difficulty === 'easy') {
    // Mostly random, occasionally plays well — beatable, not silly.
    return Math.random() < 0.2 ? bestMove(board, mode, aiMark) : randomMove()
  }
  if (difficulty === 'medium') {
    return Math.random() < 0.7 ? bestMove(board, mode, aiMark) : randomMove()
  }
  return bestMove(board, mode, aiMark)
}
