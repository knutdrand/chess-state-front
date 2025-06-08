/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ChapterModel } from './ChapterModel';

export type CourseModel = {
    id: number;
    name: string;
    color: string;
    description: (string | null);
    chapters: Array<ChapterModel>;
};

