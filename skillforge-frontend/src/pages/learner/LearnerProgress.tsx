import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    LinearProgress,
    Chip,
    Avatar,
    useTheme,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    MenuBook,
    EmojiEvents,
    TrendingUp,
    Schedule,
} from '@mui/icons-material';
import type { Enrollment } from '../../api/courseAPI';
import { learnerAPI } from '../../api/courseAPI';

const LearnerProgress: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await learnerAPI.getMyEnrollments();
                setEnrollments(data || []);
            } catch (err: any) {
                console.error("Failed to load progress data:", err);
                setError(err.response?.data?.message || err.message || 'Failed to load progress');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>;
    }

    const completedCourses = enrollments.filter(e => e.status === 'COMPLETED').length;
    const inProgressCourses = enrollments.filter(e => e.status === 'ACTIVE').length;

    // Average progress of active courses
    const activeEnrollments = enrollments.filter(e => e.status === 'ACTIVE');
    const avgProgress = activeEnrollments.length > 0
        ? Math.round(activeEnrollments.reduce((acc, curr) => acc + curr.progressPercentage, 0) / activeEnrollments.length)
        : 0;

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                    My Progress
                </Typography>
                <Typography color="text.secondary">
                    Review your learning journey and track your completions.
                </Typography>
            </Box>

            {/* Quick Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ borderRadius: 3, bgcolor: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5', border: '1px solid', borderColor: 'rgba(16,185,129,0.2)', boxShadow: 'none' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                            <Avatar sx={{ bgcolor: '#10b981', width: 56, height: 56 }}>
                                <EmojiEvents />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" fontWeight={700} color="text.primary">{completedCourses}</Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={600}>COMPLETED</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ borderRadius: 3, bgcolor: isDark ? 'rgba(56,189,248,0.1)' : '#e0f2fe', border: '1px solid', borderColor: 'rgba(56,189,248,0.2)', boxShadow: 'none' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                            <Avatar sx={{ bgcolor: '#38bdf8', width: 56, height: 56 }}>
                                <MenuBook />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" fontWeight={700} color="text.primary">{inProgressCourses}</Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={600}>IN PROGRESS</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ borderRadius: 3, bgcolor: isDark ? 'rgba(139,92,246,0.1)' : '#ede9fe', border: '1px solid', borderColor: 'rgba(139,92,246,0.2)', boxShadow: 'none' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                            <Avatar sx={{ bgcolor: '#8b5cf6', width: 56, height: 56 }}>
                                <TrendingUp />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" fontWeight={700} color="text.primary">{avgProgress}%</Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={600}>AVG PROGRESS</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Course Progress List */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Detailed Course Progress</Typography>
            <Grid container spacing={3}>
                {enrollments.length > 0 ? enrollments.map((enrollment) => (
                    <Grid size={{ xs: 12 }} key={enrollment.enrollmentId}>
                        <Card sx={{ borderRadius: 3, overflow: 'visible' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Grid container spacing={3} alignItems="center">
                                    <Grid size={{ xs: 12, md: 5 }}>
                                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                            {enrollment.goal.title}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                            <Schedule fontSize="small" />
                                            <Typography variant="body2">
                                                Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight={600} color="text.secondary">Progress</Typography>
                                            <Typography variant="body2" fontWeight={700} color="primary">{enrollment.progressPercentage}%</Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={enrollment.progressPercentage}
                                            sx={{
                                                height: 10,
                                                borderRadius: 5,
                                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                                '& .MuiLinearProgress-bar': { borderRadius: 5 }
                                            }}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                        <Chip
                                            label={enrollment.status}
                                            color={enrollment.status === 'COMPLETED' ? 'success' : (enrollment.status === 'ACTIVE' ? 'primary' : 'default')}
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                )) : (
                    <Grid size={{ xs: 12 }}>
                        <Card sx={{ p: 5, textAlign: 'center', borderRadius: 3, bgcolor: isDark ? 'background.paper' : '#f9fafb' }}>
                            <Typography variant="h6" color="text.secondary">You don't have any enrollments yet.</Typography>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default LearnerProgress;
