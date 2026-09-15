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
    Avatar,
    LinearProgress,
    Alert,
    Skeleton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    TrendingUp,
    People,
    School,
    CheckCircle,
} from '@mui/icons-material';
import { instructorAPI, type InstructorAnalyticsResponse } from '../../api/courseAPI';

const StudentAnalytics: React.FC = () => {
    const [selectedCourse, setSelectedCourse] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<InstructorAnalyticsResponse | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await instructorAPI.getAnalytics();
            setAnalytics(response);
            setError(null);
        } catch (loadError: any) {
            console.error(loadError);
            setError(loadError.response?.data?.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const enrollmentStats = analytics?.courses ?? [];
    const students = analytics?.learners ?? [];
    const totalStats = analytics?.summary ?? {
        totalStudents: 0,
        totalCompleted: 0,
        avgProgress: 0,
        avgExamScore: 0,
    };

    const filteredStudents = selectedCourse === 'all'
        ? students
        : students.filter((student) => student.courseId === selectedCourse);

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'success';
        if (progress >= 50) return 'warning';
        return 'error';
    };

    const formatStatusLabel = (status: string) =>
        status
            .toLowerCase()
            .split('_')
            .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
            .join(' ');

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'COMPLETED':
                return 'success';
            case 'ACTIVE':
                return 'primary';
            case 'PAUSED':
                return 'warning';
            default:
                return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Student Analytics
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Track student progress and enrollment statistics
                </Typography>
            </Box>

            {error && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #6366f120 0%, #6366f110 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    <People />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" fontWeight={700}>
                                        {loading ? <Skeleton width={60} /> : totalStats.totalStudents}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Students
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #10b98120 0%, #10b98110 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#10b981' }}>
                                    <CheckCircle />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" fontWeight={700}>
                                        {loading ? <Skeleton width={60} /> : totalStats.totalCompleted}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Completed
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f59e0b20 0%, #f59e0b10 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#f59e0b' }}>
                                    <TrendingUp />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" fontWeight={700}>
                                        {loading ? <Skeleton width={60} /> : `${totalStats.avgProgress}%`}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Avg Progress
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Course Filter */}
            <Box sx={{ mb: 3 }}>
                <FormControl sx={{ minWidth: 250 }}>
                    <InputLabel>Filter by Course</InputLabel>
                    <Select
                        value={selectedCourse}
                        label="Filter by Course"
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        <MenuItem value="all">All Courses</MenuItem>
                        {enrollmentStats.map((stat) => (
                            <MenuItem key={stat.goalId} value={stat.goalId}>
                                {stat.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Course Stats */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
                Course Performance
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {enrollmentStats.map((stat) => (
                    <Grid size={{ xs: 12, md: 4 }} key={stat.goalId}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <School color="primary" />
                                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                                        {stat.title}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Average Progress
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {stat.avgProgress}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={stat.avgProgress}
                                        color={getProgressColor(stat.avgProgress)}
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Chip label={`${stat.totalEnrolled} enrolled`} size="small" variant="outlined" />
                                    <Chip label={`${stat.completedCount} completed`} size="small" color="success" />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Chip label={`${stat.attemptsCount} attempts`} size="small" variant="outlined" />
                                    <Chip label={`Avg score ${stat.avgExamScore}%`} size="small" color="primary" />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Students Table */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
                Student Progress
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Course</TableCell>
                            <TableCell>Progress</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                </TableRow>
                            ))
                            : filteredStudents.map((student) => (
                                <TableRow key={student.learnerId} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ width: 32, height: 32 }}>
                                                {student.name.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {student.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {student.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{student.courseTitle}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={student.progress}
                                                color={getProgressColor(student.progress)}
                                                sx={{ width: 100, height: 6, borderRadius: 3 }}
                                            />
                                            <Typography variant="body2">
                                                {student.progress}%
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={formatStatusLabel(student.status)}
                                            size="small"
                                            color={getStatusColor(student.status)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default StudentAnalytics;
