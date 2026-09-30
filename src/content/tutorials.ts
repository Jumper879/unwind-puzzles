export interface GameTutorial {
  goal: string
  controls: string
}

export const TUTORIALS: Record<string, GameTutorial> = {
  'tic-tac-toe': {
    goal: 'Get three (Classic) or four (Connect) of your marks in a row before the AI does.',
    controls: 'Tap an empty cell to place your mark.',
  },
  'word-search': {
    goal: "Find every word from today's list hidden in the letter grid.",
    controls: "Drag from a word's first letter to its last letter to select it.",
  },
  sudoku: {
    goal: 'Fill every row, column and box with each number exactly once.',
    controls: 'Tap a number card, then tap a cell to place it. Tap again to erase.',
  },
  'fruit-match': {
    goal: 'Reach the score target within your move limit.',
    controls: 'Swap two adjacent fruits to line up 3 or more of the same kind.',
  },
  crossword: {
    goal: 'Fill the whole grid using the across/down clues.',
    controls: 'Tap a cell to select it, then type using the on-screen keyboard.',
  },
  chess: {
    goal: 'Play a full game, or solve a quick capture or checkmate puzzle.',
    controls: 'Tap a piece to see its legal moves, then tap where you want it to go.',
  },
  'spot-the-difference': {
    goal: 'Find every difference between the two pictures.',
    controls: "Tap the spot where they don't match, on either picture.",
  },
  mosaic: {
    goal: 'Figure out which tile completes the pattern.',
    controls: 'Study the grid, then tap the matching tile from the choices below it.',
  },
}
