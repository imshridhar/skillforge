import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import {
    Add,
    ArrowBack,
    CheckCircle,
    Publish,
} from '@mui/icons-material';
import AssessmentTemplateCard from '../../components/assessments/AssessmentTemplateCard';
import {
    aiAPI,
    examAPI,
    type ConductMethod,
    type Exam,
    type ExamAttempt,
    type ExamQuestion,
    type LearningGoal,
} from '../../api/courseAPI';
import { conductMethodOptions, extractOptionList, extractOptionText, isPlaceholderQuestion, parseAiJson, questionTypeForMethod } from '../../utils/assessment';

const emptyForm = {
    title: '',
    description: '',
    courseId: '',
    totalQuestions: 10,
    durationMinutes: 30,
    learningGoals: '',
    examType: 'EXAM' as const,
    conductMethod: 'QUIZ' as ConductMethod,
    passingScore: 70,
};

const ExamGeneration: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [courses, setCourses] = useState<LearningGoal[]>([]);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
    const [tabValue, setTabValue] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadExams = async () => {
        const [examData, courseData] = await Promise.all([
            examAPI.getInstructorExams(),
            examAPI.getInstructorCourses(),
        ]);
        setExams(examData);
        setCourses(courseData);
    };

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                await loadExams();
            } catch (loadError: any) {
                console.error(loadError);
                setError(loadError.response?.data?.message || 'Failed to load exam templates.');
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    const openExam = async (exam: Exam) => {
        try {
            setSelectedExam(exam);
            setTabValue(0);
            const [questionData, attemptData] = await Promise.all([
                examAPI.getExamQuestions(exam.examId),
                examAPI.getExamAttemptsByInstructor(exam.examId),
            ]);
            setQuestions(questionData);
            setAttempts(attemptData);
        } catch (openError: any) {
            setError(openError.response?.data?.message || 'Failed to load exam details.');
        }
    };

    const handleCreate = async () => {
        try {
            setSaving(true);
            const created = await examAPI.createExam(form);
            setDialogOpen(false);
            setForm(emptyForm);
            await loadExams();
            await openExam(created);
        } catch (createError: any) {
            setError(createError.response?.data?.message || 'Failed to create exam.');
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateQuestions = async () => {
        if (!selectedExam) {
            return;
        }

        try {
            setGenerating(true);
            const raw = await aiAPI.generateExamQuestions(
                selectedExam.learningGoals || selectedExam.course?.subject || selectedExam.title,
                Math.max(5, selectedExam.totalQuestions),
                selectedExam.conductMethod,
            );
            const aiQuestions = parseAiJson<any[]>(raw);
            if (!Array.isArray(aiQuestions) || aiQuestions.length === 0) {
                throw new Error('AI did not return any questions. Check your Gemini configuration and try again.');
            }

            const placeholderCount = aiQuestions.filter((question) => {
                const questionText = extractOptionText(question.questionText ?? question.question ?? '');
                const optionList = extractOptionList(question.options);
                const fallbackOptions = optionList.length
                    ? optionList
                    : [
                        extractOptionText(question.optionA ?? ''),
                        extractOptionText(question.optionB ?? ''),
                        extractOptionText(question.optionC ?? ''),
                        extractOptionText(question.optionD ?? ''),
                    ].filter(Boolean);
                return isPlaceholderQuestion(questionText, fallbackOptions);
            }).length;

            if (placeholderCount === aiQuestions.length) {
                throw new Error('AI returned placeholder questions. Configure a valid Gemini API key/model and try again.');
            }

            await examAPI.addQuestionsBatch(selectedExam.examId, aiQuestions.map((question) => ({
                questionText: extractOptionText(question.questionText ?? question.question ?? 'Untitled question'),
                questionType: question.questionType ?? questionTypeForMethod(selectedExam.conductMethod),
                optionA: extractOptionText(question.options?.[0] ?? question.optionA ?? ''),
                optionB: extractOptionText(question.options?.[1] ?? question.optionB ?? ''),
                optionC: extractOptionText(question.options?.[2] ?? question.optionC ?? ''),
                optionD: extractOptionText(question.options?.[3] ?? question.optionD ?? ''),
                correctAnswer: extractOptionText(question.correctAnswer ?? ''),
                difficulty: question.difficulty ?? 'MEDIUM',
                topic: extractOptionText(question.topic ?? selectedExam.learningGoals ?? selectedExam.title),
                aiConfidence: question.aiConfidence ?? 85,
                objective: extractOptionText(question.objective ?? 'Gemini generated question'),
                codeSnippet: question.codeSnippet ?? null,
            })));
            await openExam(selectedExam);
        } catch (generationError: any) {
            console.error(generationError);
            setError(generationError.response?.data?.message || generationError.message || 'Failed to generate AI questions.');
        } finally {
            setGenerating(false);
        }
    };

    const handlePublish = async () => {
        if (!selectedExam) {
            return;
        }

        try {
            await examAPI.publishExam(selectedExam.examId);
            await loadExams();
            await openExam({ ...selectedExam, status: 'PUBLISHED' });
        } catch (publishError: any) {
            setError(publishError.response?.data?.message || 'Failed to publish exam.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>Loading exam templates...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }} gutterBottom>
                        Exam Templates
                    </Typography>
                    <Typography color="text.secondary">
                        Build learner-visible templates, generate AI questions, and review result visibility from one place.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
                    Create Exam
                </Button>
            </Stack>

            {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}

            {!selectedExam ? (
                <Grid container spacing={3}>
                    {exams.map((exam) => (
                        <Grid size={{ xs: 12, md: 6, xl: 4 }} key={exam.examId}>
                            <AssessmentTemplateCard
                                assessment={exam}
                                primaryActionLabel="Open Template"
                                onPrimaryAction={() => void openExam(exam)}
                                secondaryActionLabel="Delete"
                                onSecondaryAction={async () => {
                                    await examAPI.deleteExam(exam.examId);
                                    await loadExams();
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box>
                    <Button startIcon={<ArrowBack />} onClick={() => setSelectedExam(null)} sx={{ mb: 2 }}>
                        Back to Templates
                    </Button>

                    <AssessmentTemplateCard
                        assessment={selectedExam}
                        primaryActionLabel={generating ? 'Generating...' : 'Generate AI Questions'}
                        onPrimaryAction={handleGenerateQuestions}
                        primaryDisabled={generating}
                        secondaryActionLabel={selectedExam.status === 'PUBLISHED' ? 'Published' : 'Publish'}
                        onSecondaryAction={handlePublish}
                        secondaryDisabled={selectedExam.status === 'PUBLISHED'}
                    />

                    <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)} sx={{ mt: 3, mb: 2 }}>
                        <Tab label={`Questions (${questions.length})`} />
                        <Tab label={`Results (${attempts.length})`} />
                    </Tabs>

                    {tabValue === 0 ? (
                        <Stack spacing={2}>
                            {questions.map((question) => (
                                <Card key={question.questionId} sx={{ borderRadius: 4 }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                                <CheckCircle color={question.approvalStatus === 'APPROVED' ? 'success' : 'disabled'} />
                                                <Typography fontWeight={800}>{question.questionText}</Typography>
                                            </Stack>
                                            <Typography color="text.secondary">
                                                {question.questionType} • {question.topic} • {question.difficulty}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Correct answer: {question.correctAnswer}
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    ) : (
                        <Grid container spacing={2}>
                            {attempts.map((attempt) => (
                                <Grid size={{ xs: 12, md: 6 }} key={attempt.attemptId}>
                                    <Card sx={{ borderRadius: 4 }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Typography variant="h6" fontWeight={800}>
                                                {attempt.learner?.firstName} {attempt.learner?.lastName}
                                            </Typography>
                                            <Typography color="text.secondary" sx={{ mb: 1 }}>
                                                {attempt.learner?.email}
                                            </Typography>
                                            <Typography variant="h4" fontWeight={800}>
                                                {Math.round(attempt.score)}%
                                            </Typography>
                                            <Typography color="text.secondary">
                                                {attempt.endTime ? new Date(attempt.endTime).toLocaleString() : 'In progress'}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            )}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create Exam Template</DialogTitle>
                <DialogContent sx={{ pt: '12px !important' }}>
                    <Stack spacing={2}>
                        <TextField label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} fullWidth />
                        <TextField label="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} multiline rows={3} fullWidth />
                        <TextField select label="Course" value={form.courseId} onChange={(event) => setForm((current) => ({ ...current, courseId: event.target.value }))} fullWidth>
                            {courses.map((course) => (
                                <MenuItem key={course.goalId} value={course.goalId}>{course.title}</MenuItem>
                            ))}
                        </TextField>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label="Questions" type="number" value={form.totalQuestions} onChange={(event) => setForm((current) => ({ ...current, totalQuestions: Number(event.target.value) }))} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label="Duration (mins)" type="number" value={form.durationMinutes} onChange={(event) => setForm((current) => ({ ...current, durationMinutes: Number(event.target.value) }))} fullWidth />
                            </Grid>
                        </Grid>
                        <TextField select label="Conduct Method" value={form.conductMethod} onChange={(event) => setForm((current) => ({ ...current, conductMethod: event.target.value as ConductMethod }))} fullWidth>
                            {conductMethodOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Learning Goals / Topics" value={form.learningGoals} onChange={(event) => setForm((current) => ({ ...current, learningGoals: event.target.value }))} multiline rows={3} fullWidth />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" startIcon={<Publish />} onClick={handleCreate} disabled={saving}>
                        {saving ? 'Creating...' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExamGeneration;
