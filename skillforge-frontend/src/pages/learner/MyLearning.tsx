import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    LinearProgress,
    Avatar,
    Alert,
    Skeleton,
} from '@mui/material';
import {
    PlayCircle,
    School,
    CheckCircle,
    TrendingUp,
    AccessTime,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { learnerAPI, type Enrollment } from '../../api/courseAPI';

const difficultyColors: Record<string, string> = {
    BEGINNER: '#10b981',
    INTERMEDIATE: '#f59e0b',
    ADVANCED: '#ef4444',
};

const MyLearning: React.FC = () => {
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const data = await learnerAPI.getMyEnrollments();
            setEnrollments(data);
        } catch {
            setError('Failed to load enrollments');
            // Mock data
            setEnrollments([
                {
                    enrollmentId: '1',
                    learner: { userId: '1', firstName: 'Jane', lastName: 'Learner' },
                    goal: {
                        goalId: '1',
                        title: 'Introduction to Machine Learning',
                        description: 'Learn ML fundamentals',
                        subject: 'Artificial Intelligence',
                        difficultyLevel: 'BEGINNER',
                        prerequisites: '',
                        learningOutcomes: '',
                        isPublished: true,
                        instructor: { userId: '2', firstName: 'John', lastName: 'Instructor', email: 'instructor@example.com' },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                    status: 'ACTIVE',
                    progressPercentage: 65,
                    enrolledAt: '2024-01-15T10:00:00Z',
                    lastAccessed: '2024-02-08T14:30:00Z',
                },
                {
                    enrollmentId: '2',
                    learner: { userId: '1', firstName: 'Jane', lastName: 'Learner' },
                    goal: {
                        goalId: '2',
                        title: 'Advanced Data Structures',
                        description: 'Master trees, graphs, and more',
                        subject: 'Computer Science',
                        difficultyLevel: 'INTERMEDIATE',
                        prerequisites: '',
                        learningOutcomes: '',
                        isPublished: true,
                        instructor: { userId: '2', firstName: 'John', lastName: 'Instructor', email: 'instructor@example.com' },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                    status: 'ACTIVE',
                    progressPercentage: 30,
                    enrolledAt: '2024-01-20T08:00:00Z',
                    lastAccessed: '2024-02-07T11:00:00Z',
                },
                {
                    enrollmentId: '3',
                    learner: { userId: '1', firstName: 'Jane', lastName: 'Learner' },
                    goal: {
                        goalId: '3',
                        title: 'Web Development with React',
                        description: 'Build modern web apps',
                        subject: 'Web Development',
                        difficultyLevel: 'INTERMEDIATE',
                        prerequisites: '',
                        learningOutcomes: '',
                        isPublished: true,
                        instructor: { userId: '2', firstName: 'John', lastName: 'Instructor', email: 'instructor@example.com' },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                    status: 'COMPLETED',
                    progressPercentage: 100,
                    enrolledAt: '2023-12-01T10:00:00Z',
                    completedAt: '2024-01-30T15:00:00Z',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        inProgress: enrollments.filter((e) => e.status === 'ACTIVE').length,
        completed: enrollments.filter((e) => e.status === 'COMPLETED').length,
        avgProgress: Math.round(
            enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) / (enrollments.length || 1)
        ),
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Chip label="Completed" size="small" color="success" icon={<CheckCircle />} />;
            case 'ACTIVE':
                return <Chip label="In Progress" size="small" color="primary" icon={<TrendingUp />} />;
            case 'PAUSED':
                return <Chip label="Paused" size="small" color="warning" icon={<AccessTime />} />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    My Learning 📚
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Track your progress and continue learning
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
                    <Card sx={{ background: 'linear-gradient(135deg, #6366f120 0%, #6366f110 100%)' }}>
                        <CardContent>
                            <Typography variant="h4" fontWeight={700} color="primary">
                                {loading ? <Skeleton width={40} /> : stats.inProgress}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                In Progress
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #10b98120 0%, #10b98110 100%)' }}>
                        <CardContent>
                            <Typography variant="h4" fontWeight={700} sx={{ color: '#10b981' }}>
                                {loading ? <Skeleton width={40} /> : stats.completed}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Completed
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f59e0b20 0%, #f59e0b10 100%)' }}>
                        <CardContent>
                            <Typography variant="h4" fontWeight={700} sx={{ color: '#f59e0b' }}>
                                {loading ? <Skeleton width={40} /> : `${stats.avgProgress}%`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Avg Progress
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Enrolled Courses */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
                Your Courses
            </Typography>
            <Grid container spacing={3}>
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <Grid size={{ xs: 12, md: 6 }} key={i}>
                            <Card>
                                <CardContent>
                                    <Skeleton variant="text" width="60%" height={32} />
                                    <Skeleton variant="text" width="100%" />
                                    <Skeleton variant="rectangular" height={10} sx={{ mt: 2, borderRadius: 5 }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                    : enrollments.map((enrollment) => (
                        <Grid size={{ xs: 12, md: 6 }} key={enrollment.enrollmentId}>
                            <Card
                                sx={{
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    },
                                }}
                                onClick={() => navigate(`/learner/courses/${enrollment.goal.goalId}`)}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Chip
                                                label={enrollment.goal.difficultyLevel}
                                                size="small"
                                                sx={{
                                                    backgroundColor: `${difficultyColors[enrollment.goal.difficultyLevel]}20`,
                                                    color: difficultyColors[enrollment.goal.difficultyLevel],
                                                }}
                                            />
                                            <Chip label={enrollment.goal.subject} size="small" variant="outlined" />
                                        </Box>
                                        {getStatusChip(enrollment.status)}
                                    </Box>

                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        {enrollment.goal.title}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                            {enrollment.goal.instructor.firstName[0]}
                                        </Avatar>
                                        <Typography variant="caption" color="text.secondary">
                                            {enrollment.goal.instructor.firstName} {enrollment.goal.instructor.lastName}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Progress
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {enrollment.progressPercentage}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={enrollment.progressPercentage}
                                            color={enrollment.status === 'COMPLETED' ? 'success' : 'primary'}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>

                                    <Button
                                        variant={enrollment.status === 'COMPLETED' ? 'outlined' : 'contained'}
                                        startIcon={enrollment.status === 'COMPLETED' ? <CheckCircle /> : <PlayCircle />}
                                        fullWidth
                                    >
                                        {enrollment.status === 'COMPLETED' ? 'Review' : 'Continue Learning'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
            </Grid>

            {/* Empty State */}
            {!loading && enrollments.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <School sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        You haven't enrolled in any courses yet
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/learner/courses')}
                        sx={{ mt: 2 }}
                    >
                        Browse Courses
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default MyLearning;
