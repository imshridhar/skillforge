import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    LinearProgress,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { ArrowBack, ArrowForward, CheckCircle, Timer } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { examAPI, type ExamAttempt, type ExamQuestion } from '../../api/courseAPI';
import { getQuestionOptions } from '../../utils/assessment';

const ExamTaking: React.FC = () => {
    const { id: examId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!examId) {
            setError('Assessment not found.');
            setLoading(false);
            return;
        }
        let active = true;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                setAttempt(null);
                setQuestions([]);
                setAnswers({});
                setCurrentIndex(0);
                const nextAttempt = await examAPI.startExam(examId);
                if (!nextAttempt?.attemptId) {
                    throw new Error('Unable to start assessment.');
                }
                const examQuestions = await examAPI.getAttemptQuestions(nextAttempt.attemptId);
                if (!active) {
                    return;
                }
                setAttempt(nextAttempt);
                setQuestions(examQuestions);
                setTimeLeft((nextAttempt.exam?.durationMinutes || 30) * 60);
            } catch (loadError: any) {
                if (!active) {
                    return;
                }
                console.error(loadError);
                setError(loadError.response?.data?.message || 'Failed to start assessment.');
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, [examId]);

    useEffect(() => {
        if (!timeLeft || !attempt) {
            return;
        }

        const interval = window.setInterval(() => {
            setTimeLeft((current) => {
                if (current <= 1) {
                    window.clearInterval(interval);
                    return 0;
                }
                return current - 1;
            });
        }, 1000);

        return () => window.clearInterval(interval);
    }, [attempt, timeLeft]);

    useEffect(() => {
        if (timeLeft === 0 && attempt && questions.length > 0 && !submitting) {
            void handleFinish();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    const currentQuestion = questions[currentIndex];
    const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

    const formattedTime = useMemo(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, [timeLeft]);

    const submitCurrentAnswer = async () => {
        if (!attempt || !currentQuestion) {
            return;
        }

        const selectedAnswer = answers[currentQuestion.questionId];
        if (!selectedAnswer) {
            return;
        }

        await examAPI.submitAnswer(attempt.attemptId, currentQuestion.questionId, selectedAnswer);
    };

    const handleNext = async () => {
        try {
            await submitCurrentAnswer();
            setCurrentIndex((current) => Math.min(current + 1, questions.length - 1));
        } catch (submitError: any) {
            console.error(submitError);
            setError(submitError.response?.data?.message || 'Failed to submit answer.');
        }
    };

    const handleFinish = async () => {
        if (!attempt || submitting) {
            return;
        }

        try {
            setSubmitting(true);
            await submitCurrentAnswer();
            const completedAttempt = await examAPI.finishExam(attempt.attemptId);
            navigate(`/learner/exams/attempts/${completedAttempt.attemptId}/review`);
        } catch (submitError: any) {
            setError(submitError.response?.data?.message || 'Failed to submit assessment.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button onClick={() => navigate('/learner/assessments')}>Back to Assessments</Button>
            </Box>
        );
    }

    if (!attempt) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Unable to load this assessment.
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/learner/assessments')}>
                    Back to Assessments
                </Button>
            </Box>
        );
    }

    if (!currentQuestion) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    No questions available for this assessment yet.
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/learner/assessments')}>
                    Back to Assessments
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }} gutterBottom>
                        {attempt.exam.title}
                    </Typography>
                    <Typography color="text.secondary">
                        {attempt.exam.conductMethod} • {attempt.exam.totalQuestions} questions
                    </Typography>
                </Box>
                <Chip icon={<Timer />} label={formattedTime} color={timeLeft < 60 ? 'error' : 'default'} />
            </Stack>

            <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, height: 10, borderRadius: 999 }} />

            <Card sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="overline" color="text.secondary">
                                Question {currentIndex + 1} of {questions.length}
                            </Typography>
                            <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                                {currentQuestion.questionText}
                            </Typography>
                        </Box>

                        {currentQuestion.codeSnippet ? (
                            <Box
                                component="pre"
                                sx={{
                                    p: 2,
                                    m: 0,
                                    borderRadius: 3,
                                    bgcolor: '#0f172a',
                                    color: '#e2e8f0',
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                {currentQuestion.codeSnippet}
                            </Box>
                        ) : null}

                        {currentQuestion.questionType === 'TEXT' ? (
                            <TextField
                                multiline
                                rows={5}
                                value={answers[currentQuestion.questionId] ?? ''}
                                onChange={(event) => setAnswers((current) => ({ ...current, [currentQuestion.questionId]: event.target.value }))}
                                placeholder="Write your response here"
                                fullWidth
                            />
                        ) : currentQuestion.questionType === 'TRUE_FALSE' ? (
                            <RadioGroup
                                value={answers[currentQuestion.questionId] ?? ''}
                                onChange={(event) => setAnswers((current) => ({ ...current, [currentQuestion.questionId]: event.target.value }))}
                            >
                                {['True', 'False'].map((option) => (
                                    <Card key={option} variant="outlined" sx={{ borderRadius: 3, mb: 1 }}>
                                        <CardContent sx={{ py: 1.5 }}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Radio value={option} checked={answers[currentQuestion.questionId] === option} />
                                                <Typography fontWeight={700}>{option}</Typography>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))}
                            </RadioGroup>
                        ) : currentQuestion.questionType === 'FLASHCARD' ? (
                            <Stack spacing={2}>
                                <Card variant="outlined" sx={{ borderRadius: 4, minHeight: 160 }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography color="text.secondary" gutterBottom>
                                            Flip mentally and self-assess this card.
                                        </Typography>
                                        <Typography variant="body1" fontWeight={700}>
                                            Answer: {currentQuestion.correctAnswer}
                                        </Typography>
                                    </CardContent>
                                </Card>
                                <Stack direction="row" spacing={2}>
                                    <Button fullWidth variant={answers[currentQuestion.questionId] === 'Need Review' ? 'contained' : 'outlined'} onClick={() => setAnswers((current) => ({ ...current, [currentQuestion.questionId]: 'Need Review' }))}>
                                        Need Review
                                    </Button>
                                    <Button fullWidth variant={answers[currentQuestion.questionId] === 'Got it' ? 'contained' : 'outlined'} onClick={() => setAnswers((current) => ({ ...current, [currentQuestion.questionId]: 'Got it' }))}>
                                        Got It
                                    </Button>
                                </Stack>
                            </Stack>
                        ) : (
                            <RadioGroup
                                value={answers[currentQuestion.questionId] ?? ''}
                                onChange={(event) => setAnswers((current) => ({ ...current, [currentQuestion.questionId]: event.target.value }))}
                            >
                                {getQuestionOptions(currentQuestion).map((option) => (
                                    <Card key={option.value} variant="outlined" sx={{ borderRadius: 3, mb: 1 }}>
                                        <CardContent sx={{ py: 1.5 }}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Radio value={option.value} checked={answers[currentQuestion.questionId] === option.value} />
                                                <Typography fontWeight={700}>{option.value}. {option.text}</Typography>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))}
                            </RadioGroup>
                        )}

                        <Stack direction="row" justifyContent="space-between">
                            <Button
                                startIcon={<ArrowBack />}
                                disabled={currentIndex === 0}
                                onClick={() => setCurrentIndex((current) => Math.max(current - 1, 0))}
                            >
                                Previous
                            </Button>
                            {currentIndex < questions.length - 1 ? (
                                <Button variant="contained" endIcon={<ArrowForward />} onClick={handleNext}>
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    startIcon={<CheckCircle />}
                                    onClick={handleFinish}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Finish Assessment'}
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ExamTaking;
