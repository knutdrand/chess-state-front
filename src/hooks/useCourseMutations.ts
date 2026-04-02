import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DefaultService } from "../api";

export function useCourseMutations() {
  const queryClient = useQueryClient();

  const deleteCourseMutation = useMutation(
    (courseId: number) =>
      DefaultService.deleteCourseApiCoursesCourseIdDelete(courseId),
    {
      onSuccess: () => queryClient.invalidateQueries(["courses"]),
    }
  );

  const deleteChapterMutation = useMutation(
    ({ courseId, chapterId }: { courseId: number; chapterId: number }) =>
      DefaultService.deleteChapterApiCoursesCourseIdChaptersChapterIdDelete(
        courseId,
        chapterId
      ),
    {
      onSuccess: () => queryClient.invalidateQueries(["courses"]),
    }
  );

  const toggleEnabledMutation = useMutation(
    ({
      courseId,
      chapterId,
      enabled,
    }: {
      courseId: number;
      chapterId?: number;
      enabled: boolean;
    }) => {
      if (chapterId) {
        return DefaultService.updateChapterEnabledApiCoursesCourseIdChaptersChapterIdPatch(
          courseId,
          chapterId,
          { enabled }
        );
      }
      return DefaultService.updateCourseEnabledApiCoursesCourseIdPatch(
        courseId,
        { enabled }
      );
    },
    {
      onSuccess: () => queryClient.invalidateQueries(["courses"]),
    }
  );

  const invalidateCourses = () => queryClient.invalidateQueries(["courses"]);

  return {
    deleteCourseMutation,
    deleteChapterMutation,
    toggleEnabledMutation,
    invalidateCourses,
  };
}
