export interface TreeNode {
  fen: string;
  correct_move: string;
  success_probability: number | null;
  comment: string | null;
  opponent_responses: OpponentResponse[];
}

export interface OpponentResponse {
  move: string;
  weight: number;
  child: TreeNode;
}

export interface CourseTree {
  player_color: "white" | "black" | null;
  roots: TreeNode[];
}
