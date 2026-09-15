import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Menu,
    Alert,
    Skeleton,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Snackbar,
} from '@mui/material';
import {
    Search,
    MoreVert,
    Visibility,
    CheckCircle,
    School,
    TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { learnerAPI, type LearningGoal } from '../../api/courseAPI';

const difficultyColors: Record<string, string> = {
    BEGINNER: '#10b981',
    INTERMEDIATE: '#f59e0b',
    ADVANCED: '#ef4444',
};

const CourseOversight: React.FC = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<LearningGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedCourse, setSelectedCourse] = useState<LearningGoal | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
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
            const response = await learnerAPI.getCourses(0, 100);
            setCourses(response.content);
        } catch {
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
                    learningOutcomes: '',
                    isPublished: true,
                    instructor: { userId: '1', firstName: 'John', lastName: 'Instructor', email: 'instructor@skillforge.com' },
                    createdAt: '2024-01-15T10:00:00Z',
                    updatedAt: '2024-02-01T14:00:00Z',
                },
                {
                    goalId: '2',
                    title: 'Advanced Data Structures',
                    description: 'Master complex data structures.',
                    subject: 'Computer Science',
                    difficultyLevel: 'INTERMEDIATE',
                    prerequisites: '',
                    learningOutcomes: '',
                    isPublished: true,
                    instructor: { userId: '1', firstName: 'John', lastName: 'Instructor', email: 'instructor@skillforge.com' },
                    createdAt: '2024-01-20T08:00:00Z',
                    updatedAt: '2024-02-05T11:00:00Z',
                },
                {
                    goalId: '3',
                    title: 'Web Development with React',
                    description: 'Build modern web applications.',
                    subject: 'Web Development',
                    difficultyLevel: 'INTERMEDIATE',
                    prerequisites: '',
                    learningOutcomes: '',
                    isPublished: false,
                    instructor: { userId: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@skillforge.com' },
                    createdAt: '2024-02-01T09:00:00Z',
                    updatedAt: '2024-02-08T16:00:00Z',
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

    const handleViewDetails = () => {
        setDetailDialogOpen(true);
        handleMenuClose();
    };

    const stats = {
        total: courses.length,
        published: courses.filter((c) => c.isPublished).length,
        draft: courses.filter((c) => !c.isPublished).length,
    };

    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.instructor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.instructor.lastName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'PUBLISHED' && course.isPublished) ||
            (statusFilter === 'DRAFT' && !course.isPublished);
        return matchesSearch && matchesStatus;
    });

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Course Oversight 🎓
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Monitor and manage all courses on the platform
                </Typography>
            </Box>

            {error && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {error} - Showing demo data
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    <School />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" fontWeight={700}>
                                        {loading ? <Skeleton width={40} /> : stats.total}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Courses
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ borderLeft: '4px solid #10b981' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#10b981' }}>
                                    <CheckCircle />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" fontWeight={700}>
                                        {loading ? <Skeleton width={40} /> : stats.published}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Published
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ borderLeft: '4px solid #f59e0b' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#f59e0b' }}>
                                    <TrendingUp />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" fontWeight={700}>
                                        {loading ? <Skeleton width={40} /> : stats.draft}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Drafts
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    placeholder="Search courses or instructors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ flexGrow: 1, maxWidth: 400 }}
                />
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                        <MenuItem value="ALL">All Status</MenuItem>
                        <MenuItem value="PUBLISHED">Published</MenuItem>
                        <MenuItem value="DRAFT">Draft</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Courses Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Course</TableCell>
                            <TableCell>Instructor</TableCell>
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
                                    <TableCell><Skeleton /></TableCell>
                                </TableRow>
                            ))
                            : filteredCourses.map((course) => (
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
                                                    Created: {new Date(course.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 28, height: 28 }}>
                                                {course.instructor.firstName[0]}
                                            </Avatar>
                                            <Typography variant="body2">
                                                {course.instructor.firstName} {course.instructor.lastName}
                                            </Typography>
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

            {/* Actions Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleViewDetails}>
                    <Visibility sx={{ mr: 1 }} /> View Details
                </MenuItem>
            </Menu>

            {/* Detail Dialog */}
            <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Course Details</DialogTitle>
                <DialogContent>
                    {selectedCourse && (
                        <Box sx={{ pt: 1 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                {selectedCourse.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                {selectedCourse.description}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={6}>
                                    <Typography variant="caption" color="text.secondary">Subject</Typography>
                                    <Typography variant="body2">{selectedCourse.subject}</Typography>
                                </Grid>
                                <Grid size={6}>
                                    <Typography variant="caption" color="text.secondary">Difficulty</Typography>
                                    <Typography variant="body2">{selectedCourse.difficultyLevel}</Typography>
                                </Grid>
                                <Grid size={6}>
                                    <Typography variant="caption" color="text.secondary">Instructor</Typography>
                                    <Typography variant="body2">
                                        {selectedCourse.instructor.firstName} {selectedCourse.instructor.lastName}
                                    </Typography>
                                </Grid>
                                <Grid size={6}>
                                    <Typography variant="caption" color="text.secondary">Status</Typography>
                                    <Typography variant="body2">
                                        {selectedCourse.isPublished ? 'Published' : 'Draft'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
            <DialogActions>
                <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
                {selectedCourse ? (
                    <Button
                        variant="contained"
                        onClick={() => {
                            setDetailDialogOpen(false);
                            navigate(`/admin/courses/${selectedCourse.goalId}`);
                        }}
                    >
                        Open Course
                    </Button>
                ) : null}
            </DialogActions>
            </Dialog>

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

export default CourseOversight;
