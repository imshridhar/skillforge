import React, { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    Add,
    ArrowBack,
    AutoAwesome,
    Delete,
    Save,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { aiAPI, instructorAPI, type CourseModuleDraft, type LearningGoal } from '../../api/courseAPI';
import { parseAiJson } from '../../utils/assessment';

const emptyModule = (): CourseModuleDraft => ({
    title: '',
    description: '',
    durationMinutes: 45,
    metadata: '',
    contents: [],
});

const CreateCourse: React.FC = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [difficultyLevel, setDifficultyLevel] = useState<LearningGoal['difficultyLevel']>('BEGINNER');
    const [prerequisites, setPrerequisites] = useState<string[]>([]);
    const [learningOutcomes, setLearningOutcomes] = useState<string[]>([]);
    const [prerequisiteInput, setPrerequisiteInput] = useState('');
    const [outcomeInput, setOutcomeInput] = useState('');
    const [modules, setModules] = useState<CourseModuleDraft[]>([]);

    const addChip = (
        value: string,
        setter: React.Dispatch<React.SetStateAction<string[]>>,
        reset: React.Dispatch<React.SetStateAction<string>>,
    ) => {
        const trimmed = value.trim();
        if (!trimmed) {
            return;
        }
        setter((current) => [...current, trimmed]);
        reset('');
    };

    const handleAiSuggestions = async () => {
        if (!subject.trim()) {
            setError('Add a subject before asking Gemini for course suggestions.');
            return;
        }

        try {
            setAiLoading(true);
            setError(null);
            const raw = await aiAPI.suggestLearningContent(
                subject,
                difficultyLevel,
                learningOutcomes.join(', ') || description || title,
            );

            const suggestions = parseAiJson<any[]>(raw);
            setModules(suggestions.map((module) => ({
                title: module.title ?? 'Untitled Module',
                description: module.description ?? '',
                durationMinutes: Number(module.durationMinutes ?? 45),
                metadata: module.metadata ?? 'AI suggested module',
                contents: Array.isArray(module.contents)
                    ? module.contents.map((content: any) => ({
                        title: content.title ?? 'Untitled Content',
                        contentType: (content.contentType ?? 'TEXT').toUpperCase(),
                        contentText: content.contentText ?? '',
                        contentUrl: content.contentUrl ?? '',
                        durationMinutes: Number(content.durationMinutes ?? 15),
                        metadata: content.metadata ?? '',
                    }))
                    : [],
            })));
        } catch (aiError) {
            console.error(aiError);
            setError('Failed to generate AI module suggestions.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim() || !subject.trim()) {
            setError('Title, description, and subject are required.');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            await instructorAPI.createCourse({
                title,
                description,
                subject,
                difficultyLevel,
                prerequisites: prerequisites.join('||'),
                learningOutcomes: learningOutcomes.join('||'),
                modules,
            });
            navigate('/instructor/courses');
        } catch (submitError: any) {
            setError(submitError.response?.data?.message || 'Failed to create course.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/instructor/courses')} sx={{ mb: 3 }}>
                Back to Courses
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }} gutterBottom>
                        Course Builder
                    </Typography>
                    <Typography color="text.secondary">
                        Create a course, add modules, nest learning content, and prepare it for learner enrollment.
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<AutoAwesome />}
                    onClick={handleAiSuggestions}
                    disabled={aiLoading}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                    {aiLoading ? 'Generating...' : 'AI Suggest Modules'}
                </Button>
            </Box>

            {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{ borderRadius: 4, mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Stack spacing={2}>
                                <TextField label="Course Title" value={title} onChange={(event) => setTitle(event.target.value)} fullWidth />
                                <TextField label="Description" value={description} onChange={(event) => setDescription(event.target.value)} multiline rows={4} fullWidth />
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField label="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} fullWidth />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField select label="Difficulty" value={difficultyLevel} onChange={(event) => setDifficultyLevel(event.target.value as LearningGoal['difficultyLevel'])} fullWidth>
                                            <MenuItem value="BEGINNER">Beginner</MenuItem>
                                            <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                                            <MenuItem value="ADVANCED">Advanced</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card sx={{ borderRadius: 4, mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" fontWeight={800} gutterBottom>Learning Outcomes</Typography>
                                    <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                                        <TextField size="small" value={outcomeInput} onChange={(event) => setOutcomeInput(event.target.value)} fullWidth />
                                        <Button variant="contained" onClick={() => addChip(outcomeInput, setLearningOutcomes, setOutcomeInput)}>Add</Button>
                                    </Stack>
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                        {learningOutcomes.map((outcome) => (
                                            <Chip key={outcome} label={outcome} onDelete={() => setLearningOutcomes((current) => current.filter((item) => item !== outcome))} />
                                        ))}
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" fontWeight={800} gutterBottom>Prerequisites</Typography>
                                    <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                                        <TextField size="small" value={prerequisiteInput} onChange={(event) => setPrerequisiteInput(event.target.value)} fullWidth />
                                        <Button variant="outlined" onClick={() => addChip(prerequisiteInput, setPrerequisites, setPrerequisiteInput)}>Add</Button>
                                    </Stack>
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                        {prerequisites.map((prerequisite) => (
                                            <Chip key={prerequisite} label={prerequisite} variant="outlined" onDelete={() => setPrerequisites((current) => current.filter((item) => item !== prerequisite))} />
                                        ))}
                                    </Stack>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Card sx={{ borderRadius: 4 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={800}>Modules</Typography>
                                <Button startIcon={<Add />} variant="contained" onClick={() => setModules((current) => [...current, emptyModule()])}>
                                    Add Module
                                </Button>
                            </Box>

                            <Stack spacing={2}>
                                {modules.map((module, index) => (
                                    <Card key={`${module.title}-${index}`} variant="outlined" sx={{ borderRadius: 3 }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Stack spacing={2}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography fontWeight={800}>Module {index + 1}</Typography>
                                                    <IconButton onClick={() => setModules((current) => current.filter((_, moduleIndex) => moduleIndex !== index))}>
                                                        <Delete />
                                                    </IconButton>
                                                </Box>
                                                <TextField label="Module Title" value={module.title} onChange={(event) => setModules((current) => current.map((item, moduleIndex) => moduleIndex === index ? { ...item, title: event.target.value } : item))} fullWidth />
                                                <TextField label="Module Description" value={module.description ?? ''} onChange={(event) => setModules((current) => current.map((item, moduleIndex) => moduleIndex === index ? { ...item, description: event.target.value } : item))} multiline rows={3} fullWidth />
                                                <TextField label="Module Duration" type="number" value={module.durationMinutes ?? 45} onChange={(event) => setModules((current) => current.map((item, moduleIndex) => moduleIndex === index ? { ...item, durationMinutes: Number(event.target.value) } : item))} fullWidth />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="subtitle2" fontWeight={800}>Learning Content</Typography>
                                                    <Button
                                                        size="small"
                                                        startIcon={<Add />}
                                                        onClick={() => setModules((current) => current.map((item, moduleIndex) => moduleIndex === index ? {
                                                            ...item,
                                                            contents: [...item.contents, {
                                                                title: '',
                                                                contentType: 'TEXT',
                                                                contentText: '',
                                                                contentUrl: '',
                                                                durationMinutes: 15,
                                                                metadata: '',
                                                            }],
                                                        } : item))}
                                                    >
                                                        Add Content
                                                    </Button>
                                                </Box>
                                                <Stack spacing={1.5}>
                                                    {module.contents.map((content, contentIndex) => (
                                                        <Card key={`${content.title}-${contentIndex}`} variant="outlined" sx={{ borderRadius: 2 }}>
                                                            <CardContent sx={{ p: 2 }}>
                                                                <Stack spacing={1.5}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <Typography variant="subtitle2" fontWeight={700}>Content {contentIndex + 1}</Typography>
                                                                        <IconButton size="small" onClick={() => setModules((current) => current.map((item, moduleIndex) => moduleIndex === index ? {
                                                                            ...item,
                                                                            contents: item.contents.filter((_, innerIndex) => innerIndex !== contentIndex),
                                                                        } : item))}>
                                                                            <Delete fontSize="small" />
                                                                        </IconButton>
                                                                    </Box>
                                                                    <TextField label="Content Title" value={content.title} onChange={(event) => setModules((current) => current.map((item, moduleIndex) => moduleIndex === index ? {
                                                                        ...item,
                                                                        contents: item.contents.map((entry, innerIndex) => innerIndex === contentIndex ? { ...entry, title: event.target.value } : entry),
                                                                    } : item))} fullWidth />
                                                                    <Grid container spacing={1.5}>
                                                                        <Grid size={{ xs: 12, md: 4 }}>
                                                                            <TextField select label="Type" value={content.contentType} onChange={(event) => setModules((current) => current.map((item, moduleIndex) => moduleIndex === index ? {
                                                                                ...item,
                                                                                contents: item.contents.map((entry, innerIndex) => innerIndex === contentIndex ? { ...entry, contentType: event.target.value as typeof entry.contentType } : entry),
                                                                            } : item))} fullWidth>
                                                                                <MenuItem value="VIDEO">Video</MenuItem>
                                                                                <MenuItem value="NOTE">Notes</MenuItem>
                                                                                <MenuItem value="DOCUMENT">Document</MenuItem>
                                                                                <MenuItem value="TEXT">Text</MenuItem>
                                                                                <MenuItem value="PDF">PDF</MenuItem>
                                                                                <MenuItem value="INTERACTIVE">Interactive</MenuItem>
                                                                                <MenuItem value="QUIZ">Quiz</MenuItem>
                                                                                <MenuItem value="FLASHCARD_SET">Flashcards</MenuItem>
                                                                            </TextField>
                                                                        </Grid>
                                                                        <Grid size={{ xs: 12, md: 4 }}>
                                                                            <TextField label="Duration" type="number" value={content.durationMinutes ?? 15} onChange={(event) => setModules((current) => current.map((item, moduleIndex) => moduleIndex === index ? {
                                                                                ...item,
                                                                                contents: item.contents.map((entry, innerIndex) => innerIndex === contentIndex ? { ...entry, durationMinutes: Number(event.target.value) } : entry),
                                                                            } : item))} fullWidth />
                                                                        </Grid>
                                                                        <Grid size={{ xs: 12, md: 4 }}>
                                                                            <TextField label="URL" value={content.contentUrl ?? ''} onChange={(event) => setModules((current) => current.map((item, moduleIndex) => moduleIndex === index ? {
                                                                                ...item,
                                                                                contents: item.contents.map((entry, innerIndex) => innerIndex === contentIndex ? { ...entry, contentUrl: event.target.value } : entry),
                                                                            } : item))} fullWidth />
                                                                        </Grid>
                                                                    </Grid>
                                                                    <TextField label="Content Body" value={content.contentText ?? ''} onChange={(event) => setModules((current) => current.map((item, moduleIndex) => moduleIndex === index ? {
                                                                        ...item,
                                                                        contents: item.contents.map((entry, innerIndex) => innerIndex === contentIndex ? { ...entry, contentText: event.target.value } : entry),
                                                                    } : item))} multiline rows={2} fullWidth />
                                                                </Stack>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{ borderRadius: 4, position: 'sticky', top: 88 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={800} gutterBottom>
                                Ready to Save
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Learners will see modules, content, and linked assessments after they enroll.
                            </Typography>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                startIcon={<Save />}
                                onClick={handleSubmit}
                                disabled={saving}
                                sx={{ py: 1.5, textTransform: 'none', fontWeight: 800 }}
                            >
                                {saving ? 'Creating...' : 'Create Course Draft'}
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CreateCourse;
