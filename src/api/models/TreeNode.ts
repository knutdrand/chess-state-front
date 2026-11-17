/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OpponentResponse } from './OpponentResponse';

export type TreeNode = {
    fen: string;
    correct_move: string;
    success_probability: number;
    comment?: (string | null);
    opponent_responses: Array<OpponentResponse>;
};

