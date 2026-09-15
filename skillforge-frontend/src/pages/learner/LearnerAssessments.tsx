import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Grid,
    Stack,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import { AutoAwesome, Insights, PlayArrow } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AssessmentTemplateCard from '../../components/assessments/AssessmentTemplateCard';
import { examAPI, type Exam, type ExamAttempt } from '../../api/courseAPI';
import { isAssessmentOpen, isAttemptPassed } from '../../utils/assessment';

const LearnerAssessments: React.FC = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [assessments, setAssessments] = useState<Exam[]>([]);
    const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [availableAssessments, myAttempts] = await Promise.all([
                    examAPI.getAvailableExams(),
                    examAPI.getMyAttempts(),
                ]);
                setAssessments(availableAssessments);
                setAttempts(myAttempts);
            } catch (loadError: any) {
                console.error(loadError);
                setError(loadError.response?.data?.message || 'Failed to load assessments.');
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    const groupedAssessments = useMemo(() => ({
        official: assessments.filter((assessment) => assessment.examType !== 'PRACTICE'),
        practice: assessments.filter((assessment) => assessment.examType === 'PRACTICE'),
    }), [assessments]);
    const completedAttempts = useMemo(
        () => attempts.filter((attempt) => attempt.status === 'COMPLETED'),
        [attempts],
    );

    if (loading) {
        return (
            <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }} gutterBottom>
                        Assessment Templates
                    </Typography>
                    <Typography color="text.secondary">
                        Instructor templates and learner practice versions stay synchronized here, including results from your completed attempts.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AutoAwesome />}
                    onClick={() => navigate('/learner/practice')}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                    Practice Exam Templates
                </Button>
            </Stack>

            {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}

            <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)} sx={{ mb: 3 }}>
                <Tab label={`Available (${assessments.length})`} />
                <Tab label={`My Results (${completedAttempts.length})`} />
            </Tabs>

            {tabValue === 0 ? (
                <Stack spacing={4}>
                    <Box>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                            Instructor Assessments
                        </Typography>
                        <Grid container spacing={3}>
                            {groupedAssessments.official.map((assessment) => (
                                <Grid size={{ xs: 12, md: 6, xl: 4 }} key={assessment.examId}>
                                    <AssessmentTemplateCard
                                        assessment={assessment}
                                        primaryActionLabel={isAssessmentOpen(assessment) ? 'Start Assessment' : 'Awaiting Release'}
                                        onPrimaryAction={() => navigate(`/learner/exams/${assessment.examId}`)}
                                        primaryDisabled={!isAssessmentOpen(assessment)}
                                        secondaryActionLabel="Create Practice"
                                        onSecondaryAction={() => navigate('/learner/practice')}
                                        footer={
                                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                                {!isAssessmentOpen(assessment) ? <Chip label="Visible before release" size="small" color="warning" /> : null}
                                                <Chip label={assessment.conductMethod} size="small" variant="outlined" />
                                            </Stack>
                                        }
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                            My Practice Versions
                        </Typography>
                        <Grid container spacing={3}>
                            {groupedAssessments.practice.map((assessment) => (
                                <Grid size={{ xs: 12, md: 6, xl: 4 }} key={assessment.examId}>
                                    <AssessmentTemplateCard
                                        assessment={assessment}
                                        primaryActionLabel="Resume Practice"
                                        onPrimaryAction={() => navigate(`/learner/exams/${assessment.examId}`)}
                                        secondaryActionLabel="Review Results"
                                        onSecondaryAction={() => navigate('/learner/practice')}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Stack>
            ) : (
                <Grid container spacing={3}>
                    {completedAttempts.map((attempt) => (
                        <Grid size={{ xs: 12, md: 6 }} key={attempt.attemptId}>
                            <AssessmentTemplateCard
                                assessment={attempt.exam}
                                primaryActionLabel="Review Attempt"
                                onPrimaryAction={() => navigate(`/learner/exams/attempts/${attempt.attemptId}/review`)}
                                secondaryActionLabel={attempt.exam.examType === 'PRACTICE' ? 'Retry Practice' : 'Open Template'}
                                onSecondaryAction={() => navigate(`/learner/exams/${attempt.exam.examId}`)}
                                footer={
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                        <Chip
                                            icon={<Insights fontSize="small" />}
                                            label={`${Math.round(attempt.score)}%`}
                                            color={isAttemptPassed(attempt) ? 'success' : 'error'}
                                            size="small"
                                        />
                                        <Chip label={isAttemptPassed(attempt) ? 'Passed' : 'Needs Work'} size="small" />
                                        <Chip
                                            icon={<PlayArrow fontSize="small" />}
                                            label={attempt.endTime ? new Date(attempt.endTime).toLocaleDateString() : 'In progress'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Stack>
                                }
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default LearnerAssessments;
