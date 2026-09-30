const PREFIX = 'unwind:local:tutorialSeen:'

export function hasSeenTutorial(gameId: string): boolean {
  return localStorage.getItem(PREFIX + gameId) === '1'
}

export function markTutorialSeen(gameId: string): void {
  localStorage.setItem(PREFIX + gameId, '1')
}
