import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Chip,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Skeleton,
    Alert,
    Pagination,
} from '@mui/material';
import {
    Search,
    School,
    Person,
    SignalCellularAlt,
    FilterList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { learnerAPI, type LearningGoal } from '../../api/courseAPI';

const difficultyColors: Record<string, string> = {
    BEGINNER: '#10b981',
    INTERMEDIATE: '#f59e0b',
    ADVANCED: '#ef4444',
};

const CourseCard: React.FC<{ course: LearningGoal; onViewDetails: () => void }> = ({ course, onViewDetails }) => {
    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                },
            }}
            onClick={onViewDetails}
        >
            <CardMedia
                component="div"
                sx={{
                    height: 140,
                    background: `linear-gradient(135deg, ${difficultyColors[course.difficultyLevel]}40 0%, ${difficultyColors[course.difficultyLevel]}20 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <School sx={{ fontSize: 60, color: difficultyColors[course.difficultyLevel], opacity: 0.8 }} />
            </CardMedia>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                        label={course.difficultyLevel}
                        size="small"
                        sx={{
                            backgroundColor: `${difficultyColors[course.difficultyLevel]}20`,
                            color: difficultyColors[course.difficultyLevel],
                            fontWeight: 600,
                        }}
                    />
                    <Chip label={course.subject} size="small" variant="outlined" />
                </Box>

                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ lineHeight: 1.3 }}>
                    {course.title}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        flexGrow: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        mb: 2,
                    }}
                >
                    {course.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                        {course.instructor.firstName} {course.instructor.lastName}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

const CourseCatalog: React.FC = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<LearningGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchCourses();
    }, [page]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await learnerAPI.getCourses(page - 1, 9);
            setCourses(response.content);
            setTotalPages(response.totalPages);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load courses');
            // Fallback to mock data for demo
            setCourses([
                {
                    goalId: '1',
                    title: 'Introduction to Machine Learning',
                    description: 'Learn the fundamentals of machine learning, including supervised and unsupervised learning algorithms.',
                    subject: 'Artificial Intelligence',
                    difficultyLevel: 'BEGINNER',
                    prerequisites: '',
                    learningOutcomes: 'Understand ML concepts||Implement basic algorithms||Evaluate model performance',
                    isPublished: true,
                    instructor: { userId: '1', firstName: 'John', lastName: 'Instructor', email: 'instructor@skillforge.com' },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    goalId: '2',
                    title: 'Advanced Data Structures',
                    description: 'Master complex data structures including trees, graphs, and hash tables.',
                    subject: 'Computer Science',
                    difficultyLevel: 'INTERMEDIATE',
                    prerequisites: '',
                    learningOutcomes: 'Implement trees and graphs||Analyze time complexity||Solve algorithmic problems',
                    isPublished: true,
                    instructor: { userId: '1', firstName: 'John', lastName: 'Instructor', email: 'instructor@skillforge.com' },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    goalId: '3',
                    title: 'Web Development with React',
                    description: 'Build modern web applications using React.js and related technologies.',
                    subject: 'Web Development',
                    difficultyLevel: 'INTERMEDIATE',
                    prerequisites: '',
                    learningOutcomes: 'Build React components||Manage state with Redux||Integrate REST APIs',
                    isPublished: true,
                    instructor: { userId: '1', firstName: 'John', lastName: 'Instructor', email: 'instructor@skillforge.com' },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = difficultyFilter === 'ALL' || course.difficultyLevel === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Course Catalog 📚
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Discover learning goals and start your journey
                </Typography>
            </Box>

            {/* Filters */}
            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 4,
                    flexWrap: 'wrap',
                }}
            >
                <TextField
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ flexGrow: 1, minWidth: 250 }}
                />
                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                        value={difficultyFilter}
                        label="Difficulty"
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        startAdornment={<SignalCellularAlt sx={{ mr: 1, color: 'action.active' }} />}
                    >
                        <MenuItem value="ALL">All Levels</MenuItem>
                        <MenuItem value="BEGINNER">Beginner</MenuItem>
                        <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                        <MenuItem value="ADVANCED">Advanced</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {error} - Showing demo data
                </Alert>
            )}

            {/* Course Grid */}
            <Grid container spacing={3}>
                {loading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                            <Card sx={{ height: '100%' }}>
                                <Skeleton variant="rectangular" height={140} />
                                <CardContent>
                                    <Skeleton variant="text" width="60%" />
                                    <Skeleton variant="text" width="100%" />
                                    <Skeleton variant="text" width="80%" />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                    : filteredCourses.map((course) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.goalId}>
                            <CourseCard
                                course={course}
                                onViewDetails={() => navigate(`/learner/courses/${course.goalId}`)}
                            />
                        </Grid>
                    ))}
            </Grid>

            {/* Empty State */}
            {!loading && filteredCourses.length === 0 && (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                    }}
                >
                    <FilterList sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No courses found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Try adjusting your filters
                    </Typography>
                </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                        size="large"
                    />
                </Box>
            )}
        </Box>
    );
};

export default CourseCatalog;
