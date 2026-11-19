import { playerMoveLabel, replyLabel, strengthColor, strengthLabel } from './treeLabels';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const AFTER_E4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
const AFTER_E4_E5 = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';

test('player move numbers follow the side to move', () => {
  expect(playerMoveLabel(START, 'e4')).toBe('1. e4');
  expect(playerMoveLabel(AFTER_E4, 'e5')).toBe('1... e5');
  expect(playerMoveLabel(AFTER_E4_E5, 'Nf3')).toBe('2. Nf3');
});

test('reply numbers describe the move that led to the position', () => {
  expect(replyLabel(AFTER_E4_E5, 'e5')).toBe('1... e5'); // black replied, now white to move
  expect(replyLabel(AFTER_E4, 'e4')).toBe('1. e4'); // white replied, now black to move
});

test('strength colour and label', () => {
  expect(strengthColor(null)).toBe('#9e9e9e');
  expect(strengthColor(0)).toBe('hsl(0, 65%, 38%)');
  expect(strengthColor(1)).toBe('hsl(120, 65%, 38%)');
  expect(strengthLabel(0.726)).toBe('73%');
  expect(strengthLabel(undefined)).toBe('new');
});
