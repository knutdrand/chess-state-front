/** Move labels and colours for the course tree. */

function sideAndNumber(fen: string): { side: "w" | "b"; moveNumber: number } {
  const parts = fen.split(" ");
  return { side: parts[1] === "b" ? "b" : "w", moveNumber: Number(parts[5]) || 1 };
}

/** The move the player should play in `fen`, with its move number: "9. O-O" or "9... Nf6". */
export function playerMoveLabel(fen: string, san: string): string {
  const { side, moveNumber } = sideAndNumber(fen);
  return side === "w" ? `${moveNumber}. ${san}` : `${moveNumber}... ${san}`;
}

/** The opponent move that led to `fen`, numbered: "8... Nf6" or "9. Bb5". */
export function replyLabel(fen: string, san: string): string {
  const { side, moveNumber } = sideAndNumber(fen);
  // White to move now => Black just played, in the previous move number.
  return side === "w" ? `${moveNumber - 1}... ${san}` : `${moveNumber}. ${san}`;
}

/** Strength colour from predicted success: red (weak) -> amber -> green (strong); grey if unknown. */
export function strengthColor(p: number | null | undefined): string {
  if (p === null || p === undefined) return "#9e9e9e";
  const hue = Math.max(0, Math.min(1, p)) * 120;
  return `hsl(${Math.round(hue)}, 65%, 38%)`;
}

export function strengthLabel(p: number | null | undefined): string {
  return p === null || p === undefined ? "new" : `${Math.round(p * 100)}%`;
}
