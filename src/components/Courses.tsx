// @ts-nocheck
import React, { useState } from "react";
import { apiUrl } from "../config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddCourseModal from "./AddCourseModal";
import AddChapterModal from "./AddChapterModal";
import ImportStudyModal from "./ImportStudyModal";
import CourseAccordionItem from "./CourseAccordionItem";
import axios from "axios";

const fetchCourses = async (token) => {
  const response = await axios.get(`${apiUrl}/list-courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

interface Course{
  id: string;
  name: string;
  chapters: Chapter[];
  enabled: boolean;
}

interface Chapter {
  id: string;
  name: string;
  enabled: boolean;
}

interface CoursesProps {
  token: string;
}

const Courses = ({ token }: CoursesProps) => {
  const queryClient = useQueryClient();

  // Modals state
  const [showAddCourseModal, setShowAddCourseModal] = useState<boolean>(false);
  const [showImportStudyModal, setShowImportStudyModal] = useState<boolean>(false);
  const [showAddChapterModal, setShowAddChapterModal] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Query: Fetch courses
  const { data: courses = [], isLoading } = useQuery(
    ["courses", token],
    () => fetchCourses(token),
    {
      enabled: !!token,
    }
  );

  // Mutation: Add course
  const addCourseMutation = useMutation(
    (newCourse) =>
      axios.post(`${apiUrl}/courses`, newCourse, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["courses", token]);
        setShowAddCourseModal(false);
      },
    }
  );

  // Mutation: Delete course
  const deleteCourseMutation = useMutation(
    (courseId) =>
      axios.delete(`${apiUrl}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    {
      onSuccess: () => queryClient.invalidateQueries(["courses", token]),
    }
  );

  // Mutation: Add chapter
  const addChapterMutation = useMutation(
    ({ courseId, newChapters }) =>
      axios.post(`${apiUrl}/courses/${courseId}/chapters`, newChapters, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["courses", token]);
        setShowAddChapterModal(false);
      },
    }
  );

  // Mutation: Delete chapter
  const deleteChapterMutation = useMutation(
    ({ courseId, chapterId }) =>
      axios.delete(`${apiUrl}/courses/${courseId}/chapters/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    {
      onSuccess: () => queryClient.invalidateQueries(["courses", token]),
    }
  );

  // Mutation: Toggle enabled state
  const toggleEnabledMutation = useMutation(
    ({ courseId, chapterId, enabled }) => {
      const url = chapterId
        ? `${apiUrl}/courses/${courseId}/chapters/${chapterId}`
        : `${apiUrl}/courses/${courseId}`;
      return axios.patch(
        url,
        { enabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    {
      onSuccess: () => queryClient.invalidateQueries(["courses", token]),
    }
  );

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Courses
      </Typography>
      <Button
        variant="contained"
        onClick={() => setShowAddCourseModal(true)}
        sx={{ mb: 2 }}
      >
        Add New Course
      </Button>

      <Accordion>
        {courses.map((course: Course, index: number) => (
          <Accordion key={course.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{course.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CourseAccordionItem
                course={course}
                index={index}
                onAddChapter={() => {
                  setSelectedCourse(course);
                  setShowAddChapterModal(true);
                }}
                onImportStudy={() => {
                  setSelectedCourse(course);
                  setShowImportStudyModal(true);
                }}
                onDeleteCourse={() =>
                  deleteCourseMutation.mutate(course.id)
                }
                onDeleteChapter={(chapterId) =>
                  deleteChapterMutation.mutate({
                    courseId: course.id,
                    chapterId,
                  })
                }
                onToggleChapterEnabled={(chapterId, enabled) =>
                  toggleEnabledMutation.mutate({
                    courseId: course.id,
                    chapterId,
                    enabled,
                  })
                }
                onToggleCourseEnabled={(enabled) =>
                  toggleEnabledMutation.mutate({
                    courseId: course.id,
                    enabled,
                  })
                }
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </Accordion>

      <AddCourseModal
        open={showAddCourseModal}
        onClose={() => setShowAddCourseModal(false)}
        onAddCourse={(newCourse) =>
          addCourseMutation.mutate(newCourse)
        }
      />

      <AddChapterModal
        open={showAddChapterModal}
        onClose={() => setShowAddChapterModal(false)}
        onAddChapter={(newChapters) =>
          addChapterMutation.mutate({
            courseId: selectedCourse.id,
            newChapters,
          })
        }
      />

      <ImportStudyModal
        open={showImportStudyModal}
        onClose={() => setShowImportStudyModal(false)}
        courseId={selectedCourse?.id}
      />
    </Box>
  );
};

export default Courses;
