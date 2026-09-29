import type { WordEntry } from './types'

/**
 * Original word/clue list, written for this project — not sourced from any
 * external crossword database, so there's no license to check (the brief
 * flags checking word-list licenses before use; writing our own sidesteps
 * that question). Starter set across a few everyday themes; the filler
 * (generator.ts) is fully data-driven, so growing this list is a content
 * edit, not an engine change — same pattern as word-search's themes.ts.
 */
export const WORD_LIST: WordEntry[] = [
  // 3-letter
  { word: 'SUN', clue: 'Star our planet orbits' },
  { word: 'SEA', clue: 'Large body of salt water' },
  { word: 'TEA', clue: 'Hot drink brewed from leaves' },
  { word: 'OWL', clue: 'Nocturnal bird known for hooting' },
  { word: 'ICE', clue: 'Frozen water' },
  { word: 'MAP', clue: 'Guide for finding your way' },
  { word: 'CAT', clue: 'Purring pet' },
  { word: 'DOG', clue: "Man's best friend" },
  { word: 'SKY', clue: 'Where clouds float' },
  { word: 'BEE', clue: 'Buzzing pollinator' },
  { word: 'LEG', clue: 'Body part used for walking' },
  { word: 'ARM', clue: 'Body part with an elbow' },
  { word: 'EAR', clue: 'Organ used for hearing' },
  { word: 'RUG', clue: 'Small carpet' },
  { word: 'CUP', clue: 'Holds your coffee' },

  // 4-letter
  { word: 'MOON', clue: "Earth's only natural satellite" },
  { word: 'STAR', clue: 'Twinkling point of light at night' },
  { word: 'RAIN', clue: 'Falls from clouds' },
  { word: 'LEAF', clue: 'Falls from a tree in autumn' },
  { word: 'FISH', clue: 'Swims and breathes through gills' },
  { word: 'BIRD', clue: 'Feathered flyer' },
  { word: 'BOOK', clue: 'You turn its pages to read' },
  { word: 'DESK', clue: 'Where you might do homework' },
  { word: 'LAMP', clue: 'Lights up a room' },
  { word: 'DOOR', clue: 'You open it to enter a room' },
  { word: 'SNOW', clue: 'Cold, white winter precipitation' },
  { word: 'WIND', clue: 'Moving air' },
  { word: 'ROSE', clue: 'Thorny, fragrant flower' },
  { word: 'TREE', clue: 'Has roots, a trunk, and branches' },
  { word: 'CAKE', clue: 'Baked treat with candles on a birthday' },
  { word: 'MILK', clue: 'White drink that comes from cows' },
  { word: 'GATE', clue: 'Hinged barrier in a fence' },
  { word: 'LAKE', clue: 'Inland body of still water' },
  { word: 'PATH', clue: 'Walking trail' },
  { word: 'NEST', clue: "A bird's home" },

  // 5-letter
  { word: 'CLOUD', clue: 'White puff floating in the sky' },
  { word: 'RIVER', clue: 'Flowing body of fresh water' },
  { word: 'OCEAN', clue: 'The largest body of water on Earth' },
  { word: 'PLANT', clue: 'Living thing that grows from a seed' },
  { word: 'HOUSE', clue: 'Where a family lives' },
  { word: 'CHAIR', clue: 'You sit on it' },
  { word: 'BREAD', clue: 'Baked from flour and yeast' },
  { word: 'APPLE', clue: 'Crunchy fruit, often red or green' },
  { word: 'GRAPE', clue: 'Small fruit that grows in bunches' },
  { word: 'PEACH', clue: 'Fuzzy-skinned summer fruit' },
  { word: 'HONEY', clue: 'Sweet substance made by bees' },
  { word: 'CANDY', clue: 'Sweet treat, often wrapped' },
  { word: 'SMILE', clue: 'What you do when you are happy' },
  { word: 'DREAM', clue: 'What happens while you sleep' },
  { word: 'BEACH', clue: 'Sandy shore by the sea' },
  { word: 'STORM', clue: 'Weather event with wind and rain' },
  { word: 'FIELD', clue: 'Open grassy area' },
  { word: 'STONE', clue: 'Small piece of rock' },
  { word: 'LIGHT', clue: 'Opposite of dark' },
  { word: 'NIGHT', clue: 'When the stars come out' },

  // 6-letter
  { word: 'GARDEN', clue: 'Where flowers and vegetables grow' },
  { word: 'PUZZLE', clue: 'A game meant to challenge your mind' },
  { word: 'CASTLE', clue: 'Fortress with towers' },
  { word: 'ISLAND', clue: 'Land surrounded by water' },
  { word: 'PENCIL', clue: 'Writing tool you can erase' },
  { word: 'WINDOW', clue: 'You look through it to see outside' },
  { word: 'FOREST', clue: 'Large area covered in trees' },
  { word: 'PLANET', clue: 'Earth is one, so is Mars' },
  { word: 'BASKET', clue: 'Woven container for carrying things' },

  // 7-letter
  { word: 'RAINBOW', clue: 'Colorful arc after rain' },
]

export function findByLength(length: number): WordEntry[] {
  return WORD_LIST.filter((w) => w.word.length === length)
}

export function findByLetter(length: number, position: number, letter: string): WordEntry[] {
  return WORD_LIST.filter((w) => w.word.length === length && w.word[position] === letter)
}
