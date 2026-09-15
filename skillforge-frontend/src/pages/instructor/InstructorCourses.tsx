import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Menu,
    MenuItem,
    Alert,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
} from '@mui/material';
import {
    Add,
    MoreVert,
    Edit,
    Delete,
    Visibility,
    Publish,
    School,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { instructorAPI, type LearningGoal } from '../../api/courseAPI';

const difficultyColors: Record<string, string> = {
    BEGINNER: '#10b981',
    INTERMEDIATE: '#f59e0b',
    ADVANCED: '#ef4444',
};

const InstructorCourses: React.FC = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<LearningGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedCourse, setSelectedCourse] = useState<LearningGoal | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await instructorAPI.getMyCourses();
            setCourses(data);
        } catch (err: any) {
            setError('Failed to load courses');
            // Mock data
            setCourses([
                {
                    goalId: '1',
                    title: 'Introduction to Machine Learning',
                    description: 'Learn the fundamentals of machine learning.',
                    subject: 'Artificial Intelligence',
                    difficultyLevel: 'BEGINNER',
                    prerequisites: '',
                    learningOutcomes: 'Understand ML concepts',
                    isPublished: true,
                    instructor: { userId: '1', firstName: 'John', lastName: 'Instructor', email: 'instructor@skillforge.com' },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    goalId: '2',
                    title: 'Advanced Data Structures',
                    description: 'Master complex data structures.',
                    subject: 'Computer Science',
                    difficultyLevel: 'INTERMEDIATE',
                    prerequisites: '',
                    learningOutcomes: 'Implement trees and graphs',
                    isPublished: false,
                    instructor: { userId: '1', firstName: 'John', lastName: 'Instructor', email: 'instructor@skillforge.com' },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, course: LearningGoal) => {
        setAnchorEl(event.currentTarget);
        setSelectedCourse(course);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handlePublish = async () => {
        if (!selectedCourse) return;
        try {
            await instructorAPI.publishCourse(selectedCourse.goalId);
            setCourses((prev) =>
                prev.map((c) => (c.goalId === selectedCourse.goalId ? { ...c, isPublished: true } : c))
            );
            setSnackbar({ open: true, message: 'Course published successfully!', severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: 'Failed to publish course', severity: 'error' });
        }
        handleMenuClose();
    };

    const handleDelete = async () => {
        if (!selectedCourse) return;
        try {
            await instructorAPI.deleteCourse(selectedCourse.goalId);
            setCourses((prev) => prev.filter((c) => c.goalId !== selectedCourse.goalId));
            setSnackbar({ open: true, message: 'Course deleted successfully!', severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: 'Failed to delete course', severity: 'error' });
        }
        setDeleteDialogOpen(false);
        handleMenuClose();
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        My Courses 📖
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your learning goals and track student progress
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/instructor/courses/new')}
                    sx={{ py: 1.5, px: 3 }}
                >
                    Create Course
                </Button>
            </Box>

            {error && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {error} - Showing demo data
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ background: `linear-gradient(135deg, #6366f120 0%, #6366f110 100%)` }}>
                        <CardContent>
                            <Typography variant="h4" fontWeight={700} color="primary">
                                {courses.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Courses
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ background: `linear-gradient(135deg, #10b98120 0%, #10b98110 100%)` }}>
                        <CardContent>
                            <Typography variant="h4" fontWeight={700} sx={{ color: '#10b981' }}>
                                {courses.filter((c) => c.isPublished).length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Published
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ background: `linear-gradient(135deg, #f59e0b20 0%, #f59e0b10 100%)` }}>
                        <CardContent>
                            <Typography variant="h4" fontWeight={700} sx={{ color: '#f59e0b' }}>
                                {courses.filter((c) => !c.isPublished).length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Drafts
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Courses Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Course</TableCell>
                            <TableCell>Subject</TableCell>
                            <TableCell>Difficulty</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading
                            ? Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                </TableRow>
                            ))
                            : courses.map((course) => (
                                <TableRow key={course.goalId} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    backgroundColor: `${difficultyColors[course.difficultyLevel]}20`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <School sx={{ color: difficultyColors[course.difficultyLevel] }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {course.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {course.description.substring(0, 50)}...
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{course.subject}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={course.difficultyLevel}
                                            size="small"
                                            sx={{
                                                backgroundColor: `${difficultyColors[course.difficultyLevel]}20`,
                                                color: difficultyColors[course.difficultyLevel],
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={course.isPublished ? 'Published' : 'Draft'}
                                            size="small"
                                            color={course.isPublished ? 'success' : 'default'}
                                            variant={course.isPublished ? 'filled' : 'outlined'}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={(e) => handleMenuOpen(e, course)}>
                                            <MoreVert />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Empty State */}
            {!loading && courses.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <School sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No courses yet
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/instructor/courses/new')}
                        sx={{ mt: 2 }}
                    >
                        Create Your First Course
                    </Button>
                </Box>
            )}

            {/* Actions Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem
                    onClick={() => {
                        if (selectedCourse) {
                            navigate(`/instructor/courses/${selectedCourse.goalId}`);
                        }
                        handleMenuClose();
                    }}
                >
                    <Visibility sx={{ mr: 1 }} /> View
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (selectedCourse) {
                            navigate(`/instructor/courses/${selectedCourse.goalId}/edit`);
                        }
                        handleMenuClose();
                    }}
                >
                    <Edit sx={{ mr: 1 }} /> Edit
                </MenuItem>
                {selectedCourse && !selectedCourse.isPublished && (
                    <MenuItem onClick={handlePublish}>
                        <Publish sx={{ mr: 1 }} /> Publish
                    </MenuItem>
                )}
                <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'error.main' }}>
                    <Delete sx={{ mr: 1 }} /> Delete
                </MenuItem>
            </Menu>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Course?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{selectedCourse?.title}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default InstructorCourses;
