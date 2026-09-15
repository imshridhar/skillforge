import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel, Download, WorkspacePremium } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { examAPI, learnerAPI, type CourseCertificate, type ExamAnswer, type ExamAttempt, type ExamQuestion } from '../../api/courseAPI';
import { getQuestionOptions, isAttemptPassed, resolveAnswerText } from '../../utils/assessment';

const ExamReviewPage: React.FC = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [answers, setAnswers] = useState<ExamAnswer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [certificate, setCertificate] = useState<CourseCertificate | null>(null);
    const [certificateLoading, setCertificateLoading] = useState(false);
    const [certificateError, setCertificateError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (!attemptId) {
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                setCertificate(null);
                setCertificateError(null);
                const [attemptData, questionData, answerData] = await Promise.all([
                    examAPI.getAttempt(attemptId),
                    examAPI.getAttemptQuestions(attemptId),
                    examAPI.getAttemptAnswers(attemptId),
                ]);
                setAttempt(attemptData);
                setQuestions(questionData);
                setAnswers(answerData);
            } catch (loadError: any) {
                console.error(loadError);
                setError(loadError.response?.data?.message || 'Failed to load attempt review.');
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [attemptId]);

    useEffect(() => {
        if (!attempt) {
            return;
        }

        const eligible = isAttemptPassed(attempt) && attempt.exam.examType !== 'PRACTICE';
        if (!eligible) {
            setCertificate(null);
            setCertificateError(null);
            return;
        }

        let active = true;
        const loadCertificate = async () => {
            try {
                setCertificateLoading(true);
                setCertificateError(null);
                const cert = await learnerAPI.getAttemptCertificate(attempt.attemptId);
                if (!active) {
                    return;
                }
                setCertificate(cert);
            } catch (certError: any) {
                if (!active) {
                    return;
                }
                console.error(certError);
                setCertificate(null);
                setCertificateError(certError.response?.data?.message || 'Unable to load certificate yet.');
            } finally {
                if (active) {
                    setCertificateLoading(false);
                }
            }
        };

        void loadCertificate();
        return () => {
            active = false;
        };
    }, [attempt]);

    const handleDownloadCertificate = async () => {
        if (!attempt) {
            return;
        }

        try {
            setDownloading(true);
            let activeCertificate = certificate;
            if (!activeCertificate || activeCertificate.examAttempt?.attemptId !== attempt.attemptId) {
                activeCertificate = await learnerAPI.getAttemptCertificate(attempt.attemptId);
                setCertificate(activeCertificate);
            }

            const blob = await learnerAPI.downloadCertificate(activeCertificate.certificateId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const courseTitle = activeCertificate.course?.title || attempt.exam.title || 'Course';
            link.download = `SkillForge-Certificate-${courseTitle.replace(/\\s+/g, '_')}.html`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (downloadError: any) {
            console.error(downloadError);
            setCertificateError(downloadError.response?.data?.message || 'Failed to download certificate.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!attempt) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">{error || 'Attempt not found.'}</Alert>
            </Box>
        );
    }

    const eligibleForCertificate = isAttemptPassed(attempt) && attempt.exam.examType !== 'PRACTICE';
    const certificateMessage = certificateError
        ? certificateError.toLowerCase().includes('not found')
            ? 'Certificate is still being prepared. Please try again shortly.'
            : certificateError
        : null;

    return (
        <Box sx={{ p: 3 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/learner/assessments')} sx={{ mb: 3 }}>
                Back to Assessments
            </Button>

            {error ? <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert> : null}

            <Card sx={{ borderRadius: 4, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                        <Box>
                            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
                                {attempt.exam.title}
                            </Typography>
                            <Typography color="text.secondary">
                                Completed {attempt.endTime ? new Date(attempt.endTime).toLocaleString() : 'recently'}
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            <Chip label={`${Math.round(attempt.score)}%`} color={isAttemptPassed(attempt) ? 'success' : 'error'} />
                            <Chip label={isAttemptPassed(attempt) ? 'Passed' : 'Needs Work'} />
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            {eligibleForCertificate ? (
                <Card sx={{ borderRadius: 4, mb: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <WorkspacePremium color="primary" />
                                    <Typography variant="h6" fontWeight={800}>
                                        Certificate
                                    </Typography>
                                </Stack>
                                <Typography color="text.secondary">
                                    Download your certificate for completing this course assessment.
                                </Typography>
                                {certificate?.certificateNumber ? (
                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                        <Chip label={`ID ${certificate.certificateNumber}`} size="small" variant="outlined" />
                                        {certificate.score != null ? (
                                            <Chip label={`Score ${Math.round(certificate.score)}%`} size="small" color="success" />
                                        ) : null}
                                    </Stack>
                                ) : null}
                            </Box>
                            <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Download />}
                                        onClick={handleDownloadCertificate}
                                        disabled={certificateLoading || downloading}
                                    >
                                    {downloading ? 'Preparing...' : 'Download Certificate'}
                                </Button>
                            </Stack>
                        </Stack>
                        {certificateLoading ? (
                            <Typography color="text.secondary" sx={{ mt: 2 }}>
                                Fetching certificate details...
                            </Typography>
                        ) : null}
                        {certificateMessage ? (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                {certificateMessage}
                            </Alert>
                        ) : null}
                    </CardContent>
                </Card>
            ) : null}

            <Stack spacing={2}>
                {questions.map((question, index) => {
                    const answer = answers.find((entry) => entry.question.questionId === question.questionId);
                    const selectedText = resolveAnswerText(question, answer?.selectedAnswer);
                    const correctText = resolveAnswerText(question, question.correctAnswer);

                    return (
                        <Card key={question.questionId} sx={{ borderRadius: 4 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                                        <Box>
                                            <Typography variant="overline" color="text.secondary">
                                                Question {index + 1}
                                            </Typography>
                                            <Typography variant="h6" fontWeight={800}>
                                                {question.questionText}
                                            </Typography>
                                        </Box>
                                        {answer?.isCorrect ? <CheckCircle color="success" /> : <Cancel color="error" />}
                                    </Stack>

                                    {question.questionType === 'MCQ' || question.questionType === 'CODE' ? (
                                        <Stack spacing={1}>
                                            {getQuestionOptions(question).map((option) => {
                                                const isChosen = answer?.selectedAnswer === option.value;
                                                const isCorrectOption = resolveAnswerText(question, question.correctAnswer) === option.text;
                                                return (
                                                    <Box
                                                        key={option.value}
                                                        sx={{
                                                            p: 1.5,
                                                            borderRadius: 2,
                                                            border: '1px solid',
                                                            borderColor: isCorrectOption ? 'success.main' : isChosen ? 'error.main' : 'divider',
                                                            bgcolor: isCorrectOption ? 'rgba(16,185,129,0.08)' : isChosen ? 'rgba(239,68,68,0.08)' : 'transparent',
                                                        }}
                                                    >
                                                        <Typography fontWeight={700}>{option.value}. {option.text}</Typography>
                                                    </Box>
                                                );
                                            })}
                                        </Stack>
                                    ) : null}

                                    {question.questionType === 'TEXT' || question.questionType === 'FLASHCARD' || question.questionType === 'TRUE_FALSE' ? (
                                        <Stack spacing={1}>
                                            <Typography><strong>Your answer:</strong> {selectedText || 'No answer submitted'}</Typography>
                                            <Typography><strong>Expected answer:</strong> {correctText}</Typography>
                                        </Stack>
                                    ) : null}

                                    {answer?.feedback ? (
                                        <Alert severity={answer.isCorrect ? 'success' : 'info'}>
                                            {answer.feedback}
                                        </Alert>
                                    ) : null}
                                </Stack>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>
        </Box>
    );
};

export default ExamReviewPage;
