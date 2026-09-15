import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    LinearProgress,
    List,
    ListItemButton,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material';
import {
    ArrowBack,
    DoneAll,
    School,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI, instructorAPI, learnerAPI, type CourseContentItem, type CourseOverview } from '../../api/courseAPI';
import ContentRenderer from '../../components/courses/ContentRenderer';
import { useAppSelector } from '../../store/store';

const CoursePlayer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const role = user?.role ?? 'LEARNER';
    const [overview, setOverview] = useState<CourseOverview | null>(null);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentContentIndex, setCurrentContentIndex] = useState(0);
    const [completedContentIds, setCompletedContentIds] = useState<string[]>([]);
    const [progressPercentage, setProgressPercentage] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            return;
        }

        const load = async () => {
            try {
                if (role === 'INSTRUCTOR') {
                    setOverview(await instructorAPI.getCourseStructure(id));
                    return;
                }
                if (role === 'ADMIN') {
                    setOverview(await adminAPI.getCourseOverview(id));
                    return;
                }
                const courseOverview = await learnerAPI.getCourseOverview(id);
                setOverview(courseOverview);
                const progress = await learnerAPI.getContentProgress(id);
                setCompletedContentIds(progress.completedContentIds);
                setProgressPercentage(Number(progress.progressPercentage) || 0);
            } catch (loadError: any) {
                setError(loadError.response?.data?.message || 'Failed to load course.');
            }
        };

        void load();
    }, [id, role]);

    const currentModule = overview?.modules[currentModuleIndex];
    const currentContent: CourseContentItem | undefined = useMemo(
        () => currentModule?.contents[currentContentIndex],
        [currentModule, currentContentIndex],
    );

    const basePath = role === 'INSTRUCTOR' ? '/instructor' : role === 'ADMIN' ? '/admin' : '/learner';

    const handleContentSelect = async (content: CourseContentItem, index: number) => {
        setCurrentContentIndex(index);
        if (role !== 'LEARNER') {
            return;
        }

        if (completedContentIds.includes(content.contentId)) {
            return;
        }

        try {
            const progress = await learnerAPI.markContentComplete(content.contentId);
            setCompletedContentIds(progress.completedContentIds);
            setProgressPercentage(Number(progress.progressPercentage) || 0);
        } catch (progressError: any) {
            setError(progressError.response?.data?.message || 'Failed to update progress.');
        }
    };

    if (!overview) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">{error || 'Course content not available.'}</Alert>
            </Box>
        );
    }

    if (overview.modules.length === 0) {
        return (
            <Box sx={{ p: 4 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(`${basePath}/courses/${overview.course.goalId}`)} sx={{ mb: 3 }}>
                    Back to Course
                </Button>
                <Alert severity="info">Modules and content have not been added to this course yet.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate(`${basePath}/courses/${overview.course.goalId}`)} sx={{ mb: 3 }}>
                Back to Course
            </Button>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{ borderRadius: 4 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={800} gutterBottom>
                                Modules
                            </Typography>
                            <List disablePadding>
                                {overview.modules.map((module, moduleIndex) => (
                                    <Box key={module.contentId}>
                                        <ListItemButton
                                            selected={moduleIndex === currentModuleIndex}
                                            onClick={() => {
                                                setCurrentModuleIndex(moduleIndex);
                                                setCurrentContentIndex(0);
                                            }}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            <ListItemText
                                                primary={module.title}
                                                secondary={`${module.contents.length} content item${module.contents.length === 1 ? '' : 's'}`}
                                                primaryTypographyProps={{ fontWeight: 700 }}
                                            />
                                        </ListItemButton>
                                        <Divider sx={{ my: 1 }} />
                                    </Box>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{ borderRadius: 4, mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                                <Chip icon={<School fontSize="small" />} label={overview.course.title} />
                                <Chip label={overview.course.subject} variant="outlined" />
                                <Chip label={overview.course.difficultyLevel} variant="outlined" />
                            </Stack>

                            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }} gutterBottom>
                                {currentModule?.title}
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 3 }}>
                                {currentModule?.description}
                            </Typography>

                            {role === 'LEARNER' ? (
                                <Box sx={{ mb: 3 }}>
                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                        <Typography variant="body2" fontWeight={700}>
                                            Course Progress
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {Math.round(progressPercentage)}%
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progressPercentage}
                                        sx={{ height: 8, borderRadius: 999 }}
                                    />
                                </Box>
                            ) : null}

                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
                                {currentModule?.contents.map((content, contentIndex) => (
                                    <Chip
                                        key={content.contentId}
                                        icon={completedContentIds.includes(content.contentId) ? <DoneAll fontSize="small" /> : undefined}
                                        color={
                                            contentIndex === currentContentIndex
                                                ? 'primary'
                                                : completedContentIds.includes(content.contentId)
                                                    ? 'success'
                                                    : 'default'
                                        }
                                        label={content.title}
                                        onClick={() => handleContentSelect(content, contentIndex)}
                                    />
                                ))}
                            </Stack>

                            {currentContent ? (
                                <Box>
                                    <Typography variant="h6" fontWeight={800} gutterBottom>
                                        {currentContent.title}
                                    </Typography>
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                                        <Chip label={currentContent.contentType} size="small" />
                                        <Chip label={`${currentContent.durationMinutes ?? 15} mins`} size="small" variant="outlined" />
                                    </Stack>
                                    <ContentRenderer key={currentContent.contentId} content={currentContent} />
                                </Box>
                            ) : (
                                <Alert severity="info">Select a content item to begin learning.</Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CoursePlayer;
