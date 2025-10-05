
// @ts-nocheck
import React, { useState, useMemo } from "react";
import { apiUrl } from "../config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AddCourseModal from "./AddCourseModal";
import AddChapterModal from "./AddChapterModal";
import ImportStudyModal from "./ImportStudyModal";
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
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Query: Fetch courses
  const { data: courses = [], isLoading, error } = useQuery(
    ["courses", token],
    () => fetchCourses(token),
    {
      enabled: !!token,
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online',
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

  const toggleRowExpanded = (courseId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const columnHelper = createColumnHelper<Course>();
  
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Course Name",
        cell: info => info.getValue(),
      }),
      columnHelper.accessor("enabled", {
        header: "Status",
        cell: info => (
          <Button
            variant={info.getValue() ? "contained" : "outlined"}
            color={info.getValue() ? "success" : "warning"}
            size="small"
            onClick={() => toggleEnabledMutation.mutate({
              courseId: info.row.original.id,
              enabled: !info.getValue(),
            })}
          >
            {info.getValue() ? "Enabled" : "Disabled"}
          </Button>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: info => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setSelectedCourse(info.row.original);
                setShowAddChapterModal(true);
              }}
            >
              Add Chapter
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setSelectedCourse(info.row.original);
                setShowImportStudyModal(true);
              }}
            >
              Import Study
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => deleteCourseMutation.mutate(info.row.original.id)}
            >
              Delete
            </Button>
            <IconButton onClick={() => toggleRowExpanded(info.row.original.id)}>
              {expandedRows[info.row.original.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        ),
      }),
    ],
    [expandedRows]
  );

  const table = useReactTable({
    data: courses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="h6" gutterBottom>
          Connection Error
        </Typography>
        <Typography color="text.secondary">
          Failed to connect to backend: {error.message}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Make sure your backend service is running on localhost.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Button
        variant="contained"
        onClick={() => setShowAddCourseModal(true)}
        sx={{ mb: 2 }}
      >
        Add New Course
      </Button>

      <TableContainer 
        component={Paper} 
        sx={{ 
          flex: 1,
          overflow: 'auto',
          maxHeight: 'calc(100vh - 180px)' // Adjust this value based on your header size
        }}
      >
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell 
                    key={header.id}
                    sx={{ 
                      backgroundColor: 'background.paper',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <React.Fragment key={row.id}>
                <TableRow>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {expandedRows[row.original.id] && (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      <Collapse in={expandedRows[row.original.id]} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                          <Typography variant="h6" gutterBottom component="div">
                            Chapters
                          </Typography>
                          {row.original.chapters && row.original.chapters.length > 0 ? (
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Chapter Name</TableCell>
                                  <TableCell>Status</TableCell>
                                  <TableCell>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {row.original.chapters.map((chapter) => (
                                  <TableRow key={chapter.id}>
                                    <TableCell>{chapter.name}</TableCell>
                                    <TableCell>
                                      <Button
                                        variant={chapter.enabled ? "contained" : "outlined"}
                                        color={chapter.enabled ? "success" : "warning"}
                                        size="small"
                                        onClick={() => toggleEnabledMutation.mutate({
                                          courseId: row.original.id,
                                          chapterId: chapter.id,
                                          enabled: !chapter.enabled,
                                        })}
                                      >
                                        {chapter.enabled ? "Enabled" : "Disabled"}
                                      </Button>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={() => deleteChapterMutation.mutate({
                                          courseId: row.original.id,
                                          chapterId: chapter.id,
                                        })}
                                      >
                                        Delete
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <Typography color="text.secondary">No chapters available</Typography>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
            courseId: selectedCourse?.id,
            newChapters,
          })
        }
      />

      <ImportStudyModal
        open={showImportStudyModal}
        onClose={() => setShowImportStudyModal(false)}
        courseId={selectedCourse?.id}
        token={token}
        onAddChapter={(newChapters) =>
          addChapterMutation.mutate({
            courseId: selectedCourse?.id,
            newChapters,
          })
        }
      />
    </Box>
  );
};

export default Courses;
