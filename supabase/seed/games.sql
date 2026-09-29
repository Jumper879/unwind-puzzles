-- Matches src/games/registry.ts exactly — keep the two in sync.
insert into public.games (id, name, sort_order) values
  ('tic-tac-toe', 'X&O', 1),
  ('word-search', 'Word Search', 2),
  ('sudoku', 'Sudoku Cards', 3),
  ('fruit-match', 'Fruit Match', 4),
  ('crossword', 'Crossword', 5),
  ('chess', 'Chess', 6),
  ('spot-the-difference', 'Spot the Difference', 7),
  ('mosaic', 'Missing Piece', 8)
on conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;
