import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material';
import {
    ArrowBack,
    CheckCircle,
    LibraryBooks,
    PlayCircle,
    School,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AssessmentTemplateCard from '../../components/assessments/AssessmentTemplateCard';
import { adminAPI, instructorAPI, learnerAPI, type CourseOverview } from '../../api/courseAPI';
import { useAppSelector } from '../../store/store';

const CourseDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useAppSelector((state) => state.auth);
    const role = user?.role ?? 'LEARNER';
    const [overview, setOverview] = useState<CourseOverview | null>(null);
    const [enrolled, setEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                const courseOverview =
                    role === 'INSTRUCTOR'
                        ? await instructorAPI.getCourseStructure(id)
                        : role === 'ADMIN'
                            ? await adminAPI.getCourseOverview(id)
                            : await learnerAPI.getCourseOverview(id);

                setOverview(courseOverview);

                if (role === 'LEARNER') {
                    const enrollments = await learnerAPI.getMyEnrollments();
                    setEnrolled(enrollments.some((enrollment) => enrollment.goal.goalId === id));
                } else {
                    setEnrolled(false);
                }
            } catch (loadError: any) {
                console.error(loadError);
                setError(loadError.response?.data?.message || 'Failed to load course.');
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [id, role]);

    const handleEnroll = async () => {
        if (!id || role !== 'LEARNER') {
            return;
        }

        try {
            await learnerAPI.enrollInCourse(id);
            setEnrolled(true);
        } catch (enrollError: any) {
            setError(enrollError.response?.data?.message || 'Failed to enroll in course.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Loading course...</Typography>
            </Box>
        );
    }

    if (!overview) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">{error || 'Course not found.'}</Alert>
            </Box>
        );
    }

    const basePath = role === 'INSTRUCTOR' ? '/instructor' : role === 'ADMIN' ? '/admin' : '/learner';
    const learnPath = `${basePath}/course/${overview.course.goalId}/learn`;
    const showAssessments = role === 'LEARNER' ? enrolled : role === 'INSTRUCTOR';

    return (
        <Box sx={{ p: 3 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate(`${basePath}/courses`)} sx={{ mb: 3 }}>
                Back to Courses
            </Button>

            {error ? <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert> : null}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{ borderRadius: 4, mb: 3 }}>
                        <CardContent sx={{ p: 4 }}>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                                <Chip label={overview.course.difficultyLevel} color="primary" />
                                <Chip label={overview.course.subject} variant="outlined" />
                                <Chip label={`${overview.modules.length} modules`} variant="outlined" />
                            </Stack>
                            <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.03em' }} gutterBottom>
                                {overview.course.title}
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 3 }}>
                                {overview.course.description}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={700}>
                                Instructor: {overview.course.instructor.firstName} {overview.course.instructor.lastName}
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ borderRadius: 4, mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={800} gutterBottom>
                                Course Modules
                            </Typography>
                            {overview.modules.length === 0 ? (
                                <Alert severity="info">Modules and content have not been added yet.</Alert>
                            ) : (
                                <List disablePadding>
                                    {overview.modules.map((module) => (
                                        <Box key={module.contentId}>
                                            <ListItem disableGutters sx={{ py: 1.5, alignItems: 'flex-start' }}>
                                                <ListItemText
                                                    primary={<Typography fontWeight={700}>{module.title}</Typography>}
                                                    secondary={
                                                        <Stack spacing={1} sx={{ mt: 0.5 }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {module.description || 'Module overview'}
                                                            </Typography>
                                                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                                                {module.contents.map((content) => (
                                                                    <Chip
                                                                        key={content.contentId}
                                                                        icon={<LibraryBooks fontSize="small" />}
                                                                        label={`${content.title} - ${content.contentType}`}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                ))}
                                                            </Stack>
                                                        </Stack>
                                                    }
                                                />
                                            </ListItem>
                                            <Divider />
                                        </Box>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>

                    {showAssessments ? (
                        <Box>
                            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                                Course Assessments
                            </Typography>
                            <Grid container spacing={3}>
                                {overview.assessments.map((assessment) => {
                                    const isInstructor = role === 'INSTRUCTOR';
                                    return (
                                        <Grid size={{ xs: 12, md: 6 }} key={assessment.examId}>
                                            <AssessmentTemplateCard
                                                assessment={assessment}
                                                primaryActionLabel={isInstructor ? 'Open Exam' : 'Open Assessment'}
                                                onPrimaryAction={() =>
                                                    navigate(
                                                        isInstructor
                                                            ? `/instructor/exams/${assessment.examId}`
                                                            : `/learner/exams/${assessment.examId}`,
                                                    )
                                                }
                                                secondaryActionLabel={isInstructor ? undefined : 'Practice'}
                                                onSecondaryAction={isInstructor ? undefined : () => navigate('/learner/practice')}
                                            />
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>
                    ) : null}
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{ borderRadius: 4, position: 'sticky', top: 88 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ mb: 3, textAlign: 'center' }}>
                                <School sx={{ fontSize: 56, color: 'primary.main' }} />
                            </Box>

                            {enrolled ? (
                                <Stack spacing={2}>
                                    <Alert icon={<CheckCircle fontSize="inherit" />} severity="success">
                                        You are enrolled. Modules, content, and assessments are unlocked.
                                    </Alert>
                                    <Button variant="contained" startIcon={<PlayCircle />} onClick={() => navigate(learnPath)}>
                                        Start Learning
                                    </Button>
                                    {role === 'INSTRUCTOR' ? (
                                        <Button variant="outlined" onClick={() => navigate(`/instructor/courses/${overview.course.goalId}/edit`)}>
                                            Manage Course
                                        </Button>
                                    ) : null}
                                </Stack>
                            ) : role === 'LEARNER' ? (
                                <Stack spacing={2}>
                                    <Typography variant="h6" fontWeight={800}>
                                        Enroll to Unlock the Full Flow
                                    </Typography>
                                    <Typography color="text.secondary">
                                        After enrollment you can access modules, nested learning content, and linked exams from one place.
                                    </Typography>
                                    <Button variant="contained" onClick={handleEnroll}>
                                        Enroll Now
                                    </Button>
                                </Stack>
                            ) : (
                                <Stack spacing={2}>
                                    <Typography variant="h6" fontWeight={800}>
                                        Course Preview
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Review modules, content, and assessments in preview mode.
                                    </Typography>
                                    <Button variant="contained" startIcon={<PlayCircle />} onClick={() => navigate(learnPath)}>
                                        Preview Course
                                    </Button>
                                    {role === 'INSTRUCTOR' ? (
                                        <Button variant="outlined" onClick={() => navigate(`/instructor/courses/${overview.course.goalId}/edit`)}>
                                            Manage Course
                                        </Button>
                                    ) : null}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CourseDetail;
