/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_add_chapters_api_courses__course_id__chapters_post } from '../models/Body_add_chapters_api_courses__course_id__chapters_post';
import type { Body_login_for_access_token_api_token_post } from '../models/Body_login_for_access_token_api_token_post';
import type { Body_register_user_api_register_post } from '../models/Body_register_user_api_register_post';
import type { ChapterModel } from '../models/ChapterModel';
import type { CourseInfo } from '../models/CourseInfo';
import type { CourseModel } from '../models/CourseModel';
import type { ExplanationResponse } from '../models/ExplanationResponse';
import type { InitResponse } from '../models/InitResponse';
import type { Move } from '../models/Move';
import type { MoveResponse } from '../models/MoveResponse';
import type { Player } from '../models/Player';
import type { PlayerConfig } from '../models/PlayerConfig';
import type { ShowInfo } from '../models/ShowInfo';
import type { StudyData } from '../models/StudyData';
import type { Token } from '../models/Token';
import type { UpdateChapterStatus } from '../models/UpdateChapterStatus';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * New Game
     * @returns any Successful Response
     * @throws ApiError
     */
    public static newGameApiPingGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/ping',
        });
    }

    /**
     * Rating
     * @param requestBody
     * @returns Player Successful Response
     * @throws ApiError
     */
    public static ratingApiPlayerConfigPatch(
        requestBody: PlayerConfig,
    ): CancelablePromise<Player> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/player-config',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Explanation
     * @param fen
     * @returns ExplanationResponse Successful Response
     * @throws ApiError
     */
    public static explanationApiExplanationFenGet(
        fen: string,
    ): CancelablePromise<ExplanationResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/explanation/{fen}',
            path: {
                'fen': fen,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Init
     * @returns InitResponse Successful Response
     * @throws ApiError
     */
    public static initApiInitGet(): CancelablePromise<InitResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/init',
        });
    }

    /**
     * Show
     * @param requestBody
     * @returns MoveResponse Successful Response
     * @throws ApiError
     */
    public static showApiShowPost(
        requestBody: ShowInfo,
    ): CancelablePromise<MoveResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/show',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Move
     * @param requestBody
     * @returns MoveResponse Successful Response
     * @throws ApiError
     */
    public static moveApiMovePost(
        requestBody: Move,
    ): CancelablePromise<MoveResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/move',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Player
     * @param username
     * @returns any[] Successful Response
     * @throws ApiError
     */
    public static updatePlayerApiUpdatePlayerUsernamePost(
        username: string,
    ): CancelablePromise<any[]> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/update_player/{username}',
            path: {
                'username': username,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Login For Access Token
     * @param formData
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static loginForAccessTokenApiTokenPost(
        formData: Body_login_for_access_token_api_token_post,
    ): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/token',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Register User
     * @param formData
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static registerUserApiRegisterPost(
        formData: Body_register_user_api_register_post,
    ): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/register',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * List Courses
     * @returns CourseModel Successful Response
     * @throws ApiError
     */
    public static listCoursesApiListCoursesGet(): CancelablePromise<Array<CourseModel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/list-courses',
        });
    }

    /**
     * Add Course
     * @param requestBody
     * @returns CourseModel Successful Response
     * @throws ApiError
     */
    public static addCourseApiAddCoursePost(
        requestBody: CourseInfo,
    ): CancelablePromise<CourseModel> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/add-course',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Course
     * @param courseId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteCourseApiCoursesCourseIdDelete(
        courseId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/courses/{course_id}',
            path: {
                'course_id': courseId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Course Enabled
     * @param courseId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateCourseEnabledApiCoursesCourseIdPatch(
        courseId: number,
        requestBody: UpdateChapterStatus,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/courses/{course_id}',
            path: {
                'course_id': courseId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Chapter
     * @param courseId
     * @param chapterId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteChapterApiCoursesCourseIdChaptersChapterIdDelete(
        courseId: number,
        chapterId: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/courses/{course_id}/chapters/{chapter_id}',
            path: {
                'course_id': courseId,
                'chapter_id': chapterId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Chapter Enabled
     * @param courseId
     * @param chapterId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateChapterEnabledApiCoursesCourseIdChaptersChapterIdPatch(
        courseId: number,
        chapterId: number,
        requestBody: UpdateChapterStatus,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/courses/{course_id}/chapters/{chapter_id}',
            path: {
                'course_id': courseId,
                'chapter_id': chapterId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Study
     * @param courseId
     * @param requestBody
     * @returns ChapterModel Successful Response
     * @throws ApiError
     */
    public static addStudyApiCoursesCourseIdStudyPost(
        courseId: number,
        requestBody: StudyData,
    ): CancelablePromise<Array<ChapterModel>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/courses/{course_id}/study',
            path: {
                'course_id': courseId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Chapters
     * @param courseId
     * @param formData
     * @returns ChapterModel Successful Response
     * @throws ApiError
     */
    public static addChaptersApiCoursesCourseIdChaptersPost(
        courseId: number,
        formData: Body_add_chapters_api_courses__course_id__chapters_post,
    ): CancelablePromise<Array<ChapterModel>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/courses/{course_id}/chapters',
            path: {
                'course_id': courseId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Trigger Error
     * @returns any Successful Response
     * @throws ApiError
     */
    public static triggerErrorApiSentryDebugGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sentry-debug',
        });
    }

    /**
     * Get Openapi Endpoint
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getOpenapiEndpointApiOpenapiJsonGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/openapi.json',
        });
    }

}
