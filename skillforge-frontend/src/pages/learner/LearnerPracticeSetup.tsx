import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    MenuItem,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { AutoAwesome, FlashOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AssessmentTemplateCard from '../../components/assessments/AssessmentTemplateCard';
import {
    aiAPI,
    examAPI,
    type ConductMethod,
    type Exam,
} from '../../api/courseAPI';
import { conductMethodOptions, extractOptionList, extractOptionText, isPlaceholderQuestion, parseAiJson, questionTypeForMethod } from '../../utils/assessment';

const extractQuestionText = (question: any) => {
    if (question === null || question === undefined) {
        return 'Untitled question';
    }
    if (typeof question === 'string' || typeof question === 'number' || typeof question === 'boolean') {
        return String(question);
    }
    return extractOptionText(
        question?.questionText ??
        question?.question ??
        question?.prompt ??
        question?.statement ??
        question?.front ??
        question?.term ??
        question?.title ??
        'Untitled question'
    );
};

const extractCorrectAnswer = (question: any) => {
    if (!question || typeof question !== 'object') {
        return '';
    }
    return extractOptionText(
        question?.correctAnswer ??
        question?.answer ??
        question?.expectedAnswer ??
        question?.response ??
        question?.back ??
        question?.definition ??
        question?.solution ??
        ''
    );
};

const extractQuestionOptions = (question: any): string[] => {
    if (!question || typeof question !== 'object') {
        return [];
    }
    const rawOptions = Array.isArray(question?.options)
        ? question.options
        : Array.isArray(question?.choices)
            ? question.choices
            : Array.isArray(question?.answers)
                ? question.answers
                : Array.isArray(question?.answerOptions)
                    ? question.answerOptions
                    : [];
    return extractOptionList(rawOptions);
};

const normalizeTrueFalseAnswer = (answer: string) => {
    const normalized = answer.trim().toLowerCase();
    if (normalized === 'true' || normalized === 't' || normalized === 'yes') {
        return 'True';
    }
    if (normalized === 'false' || normalized === 'f' || normalized === 'no') {
        return 'False';
    }
    return answer;
};

const parseAiConfidence = (value: any, fallback = 85) => {
    if (value === null || value === undefined) {
        return fallback;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    const cleaned = String(value).trim().replace('%', '');
    const numeric = Number(cleaned);
    return Number.isFinite(numeric) ? numeric : fallback;
};

const LearnerPracticeSetup: React.FC = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [templates, setTemplates] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [topic, setTopic] = useState('');
    const [questionCount, setQuestionCount] = useState(10);
    const [conductMethod, setConductMethod] = useState<ConductMethod>('MCQ');

    useEffect(() => {
        const loadTemplates = async () => {
            try {
                setLoading(true);
                const exams = await examAPI.getAvailableExams();
                setTemplates(exams.filter((exam) => exam.examType !== 'PRACTICE'));
            } catch (loadError: any) {
                setError(loadError.response?.data?.message || 'Failed to load practice templates.');
            } finally {
                setLoading(false);
            }
        };

        void loadTemplates();
    }, []);

    const handleCreateFromTemplate = async (sourceExamId: string) => {
        try {
            setCreating(true);
            setError(null);
            const exam = await examAPI.createPracticeExam({ sourceExamId });
            navigate(`/learner/exams/${exam.examId}`);
        } catch (createError: any) {
            setError(createError.response?.data?.message || 'Failed to create a practice copy.');
        } finally {
            setCreating(false);
        }
    };

    const handleCreateCustomPractice = async () => {
        if (!topic.trim()) {
            setError('Enter a topic before generating practice questions.');
            return;
        }

        try {
            setCreating(true);
            setError(null);

            const rawQuestions = conductMethod === 'FLASH_CARDS'
                ? await aiAPI.generateFlashcards(topic, questionCount)
                : await aiAPI.generateExamQuestions(topic, questionCount, conductMethod);

            const parsedQuestions = parseAiJson<any[]>(rawQuestions);
            if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
                throw new Error('AI did not return any questions. Check your Gemini configuration and try again.');
            }

            const placeholderCount = parsedQuestions.filter((question) => {
                const questionText = extractQuestionText(question);
                const optionList = extractQuestionOptions(question);
                const fallbackOptions = optionList.length
                    ? optionList
                    : [
                        extractOptionText(question?.optionA ?? ''),
                        extractOptionText(question?.optionB ?? ''),
                        extractOptionText(question?.optionC ?? ''),
                        extractOptionText(question?.optionD ?? ''),
                    ].filter(Boolean);
                return isPlaceholderQuestion(questionText, fallbackOptions);
            }).length;

            if (placeholderCount === parsedQuestions.length) {
                throw new Error('AI returned placeholder questions. Configure a valid Gemini API key/model and try again.');
            }

            const practiceExam = await examAPI.createPracticeExam({
                title: `${topic} Practice`,
                description: `Learner-generated ${conductMethod.toLowerCase()} practice exam for ${topic}.`,
                totalQuestions: questionCount,
                durationMinutes: questionCount * 2,
                learningGoals: topic,
                conductMethod,
            });
            await examAPI.addPracticeQuestionsBatch(practiceExam.examId, parsedQuestions.map((question) => ({
                questionText: extractQuestionText(question),
                questionType: questionTypeForMethod(conductMethod),
                optionA: extractQuestionOptions(question)[0] ?? extractOptionText(question?.optionA ?? ''),
                optionB: extractQuestionOptions(question)[1] ?? extractOptionText(question?.optionB ?? ''),
                optionC: extractQuestionOptions(question)[2] ?? extractOptionText(question?.optionC ?? ''),
                optionD: extractQuestionOptions(question)[3] ?? extractOptionText(question?.optionD ?? ''),
                correctAnswer: conductMethod === 'TRUE_FALSE'
                    ? normalizeTrueFalseAnswer(extractCorrectAnswer(question))
                    : extractCorrectAnswer(question),
                difficulty: question.difficulty ?? 'MEDIUM',
                topic: extractOptionText(question.topic ?? topic),
                aiConfidence: parseAiConfidence(question.aiConfidence ?? 85),
                objective: extractOptionText(question.objective ?? 'Gemini-generated practice question'),
                codeSnippet: question.codeSnippet ?? null,
            })));

            navigate(`/learner/exams/${practiceExam.examId}`);
        } catch (createError: any) {
            console.error(createError);
            setError(createError.response?.data?.message || createError.message || 'Failed to generate practice exam.');
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }} gutterBottom>
                    Practice Exam Templates
                </Typography>
                <Typography color="text.secondary">
                    Practice against the same instructor templates your real assessments use, or spin up a Gemini-generated version on demand.
                </Typography>
            </Box>

            {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}

            <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)} sx={{ mb: 3 }}>
                <Tab label="Template Practice" />
                <Tab label="Custom AI Practice" />
            </Tabs>

            {tabValue === 0 ? (
                <Grid container spacing={3}>
                    {templates.map((template) => (
                        <Grid size={{ xs: 12, md: 6, xl: 4 }} key={template.examId}>
                            <AssessmentTemplateCard
                                assessment={template}
                                primaryActionLabel="Create Practice Copy"
                                onPrimaryAction={() => handleCreateFromTemplate(template.examId)}
                                primaryDisabled={creating}
                                secondaryActionLabel="Open Assessments"
                                onSecondaryAction={() => navigate('/learner/assessments')}
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card sx={{ borderRadius: 4 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack spacing={2.5}>
                                    <TextField
                                        label="Topic"
                                        value={topic}
                                        onChange={(event) => setTopic(event.target.value)}
                                        placeholder="React hooks, binary trees, spring security..."
                                        fullWidth
                                    />
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                select
                                                label="Conduct Method"
                                                value={conductMethod}
                                                onChange={(event) => setConductMethod(event.target.value as ConductMethod)}
                                                fullWidth
                                            >
                                                {conductMethodOptions.filter((option) => option.value !== 'MIXED').map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                label="Question Count"
                                                type="number"
                                                value={questionCount}
                                                onChange={(event) => setQuestionCount(Number(event.target.value))}
                                                fullWidth
                                            />
                                        </Grid>
                                    </Grid>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={conductMethod === 'FLASH_CARDS' ? <FlashOn /> : <AutoAwesome />}
                                        onClick={handleCreateCustomPractice}
                                        disabled={creating}
                                        sx={{ textTransform: 'none', fontWeight: 800 }}
                                    >
                                        {creating ? 'Generating Practice...' : 'Generate Practice Exam'}
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default LearnerPracticeSetup;
