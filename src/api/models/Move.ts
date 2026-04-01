/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { State } from './State';

export type Move = {
    state: State;
    from_square: string;
    to_square: string;
    elapsed_time?: number;
    piece?: (string | null);
};

