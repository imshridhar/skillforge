import React, { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import {
    AutoStories,
    Description,
    Launch,
    PictureAsPdf,
    PlayCircle,
    Quiz,
    TouchApp,
    ViewCarousel,
} from '@mui/icons-material';
import type { CourseContentItem } from '../../api/courseAPI';

type ParsedMetadata = Record<string, any> | any[] | null;

const parseMetadata = (metadata?: string): ParsedMetadata => {
    if (!metadata) {
        return null;
    }
    const trimmed = metadata.trim();
    if (!trimmed) {
        return null;
    }
    if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
        return null;
    }
    try {
        return JSON.parse(trimmed) as ParsedMetadata;
    } catch (error) {
        console.warn('Failed to parse content metadata', error);
        return null;
    }
};

const getYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    return match ? match[1] : null;
};

const getVimeoId = (url: string): string | null => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
};

const getVideoEmbedUrl = (url?: string): string | null => {
    if (!url) {
        return null;
    }
    const youtubeId = getYouTubeId(url);
    if (youtubeId) {
        return `https://www.youtube.com/embed/${youtubeId}`;
    }
    const vimeoId = getVimeoId(url);
    if (vimeoId) {
        return `https://player.vimeo.com/video/${vimeoId}`;
    }
    return null;
};

const ResourceLink: React.FC<{ url?: string; label?: string }> = ({ url, label = 'Open Resource' }) => {
    if (!url) {
        return null;
    }
    return (
        <Button variant="outlined" startIcon={<Launch />} href={url} target="_blank" rel="noreferrer">
            {label}
        </Button>
    );
};

const ContentRenderer: React.FC<{ content: CourseContentItem }> = ({ content }) => {
    const metadata = useMemo(() => parseMetadata(content.metadata), [content.metadata]);
    const [quizResponses, setQuizResponses] = useState<Record<number, string>>({});
    const [showQuizResults, setShowQuizResults] = useState(false);
    const [cardIndex, setCardIndex] = useState(0);
    const [cardFlipped, setCardFlipped] = useState(false);

    const plainMetadata = useMemo(() => {
        if (!content.metadata) {
            return null;
        }
        return metadata ? null : content.metadata;
    }, [content.metadata, metadata]);

    if (content.contentType === 'VIDEO') {
        const embedUrl = getVideoEmbedUrl(content.contentUrl);
        return (
            <Stack spacing={2}>
                {embedUrl ? (
                    <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                        <Box
                            component="iframe"
                            src={embedUrl}
                            title={content.title}
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                borderRadius: 2,
                                border: 'none',
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </Box>
                ) : content.contentUrl ? (
                    <Box
                        component="video"
                        src={content.contentUrl}
                        controls
                        sx={{ width: '100%', borderRadius: 2 }}
                    />
                ) : (
                    <Alert severity="info">Video link not provided yet.</Alert>
                )}
                {content.contentText ? (
                    <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{content.contentText}</Typography>
                ) : null}
                <ResourceLink url={content.contentUrl} label="Open Video Source" />
            </Stack>
        );
    }

    if (content.contentType === 'PDF') {
        return (
            <Stack spacing={2}>
                {content.contentUrl ? (
                    <Box sx={{ position: 'relative', paddingTop: '65%' }}>
                        <Box
                            component="iframe"
                            src={content.contentUrl}
                            title={content.title}
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        />
                    </Box>
                ) : (
                    <Alert severity="info">PDF link not provided yet.</Alert>
                )}
                {content.contentText ? (
                    <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{content.contentText}</Typography>
                ) : null}
                <ResourceLink url={content.contentUrl} label="Open PDF" />
            </Stack>
        );
    }

    if (content.contentType === 'INTERACTIVE') {
        const instructions = typeof metadata === 'object' && metadata ? metadata.instructions : null;
        return (
            <Stack spacing={2}>
                {content.contentUrl ? (
                    <Box sx={{ position: 'relative', paddingTop: '60%' }}>
                        <Box
                            component="iframe"
                            src={content.contentUrl}
                            title={content.title}
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        />
                    </Box>
                ) : (
                    <Alert severity="info">Interactive link not provided yet.</Alert>
                )}
                {content.contentText ? (
                    <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{content.contentText}</Typography>
                ) : null}
                {instructions ? <Alert severity="info">{instructions}</Alert> : null}
                <ResourceLink url={content.contentUrl} label="Open Interactive Resource" />
            </Stack>
        );
    }

    if (content.contentType === 'QUIZ') {
        const questions = Array.isArray(metadata) ? metadata : metadata?.questions;
        if (!Array.isArray(questions) || questions.length === 0) {
            return <Alert severity="info">Quiz content is not configured yet.</Alert>;
        }
        return (
            <Stack spacing={2}>
                {content.contentText ? (
                    <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{content.contentText}</Typography>
                ) : null}
                <Stack spacing={2}>
                    {questions.map((question: any, index: number) => {
                        const selected = quizResponses[index];
                        const isCorrect = selected && question.answer && selected === question.answer;
                        return (
                            <Card key={`${content.contentId}-question-${index}`} variant="outlined" sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Stack spacing={1.5}>
                                        <Typography fontWeight={700}>
                                            {index + 1}. {question.question}
                                        </Typography>
                                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                            {(question.options || []).map((option: string) => (
                                                <Chip
                                                    key={`${content.contentId}-${index}-${option}`}
                                                    label={option}
                                                    color={selected === option ? 'primary' : 'default'}
                                                    variant={selected === option ? 'filled' : 'outlined'}
                                                    onClick={() =>
                                                        setQuizResponses((current) => ({ ...current, [index]: option }))
                                                    }
                                                    sx={{ cursor: 'pointer' }}
                                                />
                                            ))}
                                        </Stack>
                                        {showQuizResults && question.answer ? (
                                            <Alert severity={isCorrect ? 'success' : 'warning'}>
                                                {isCorrect ? 'Correct.' : `Correct answer: ${question.answer}`}
                                                {question.explanation ? ` ${question.explanation}` : ''}
                                            </Alert>
                                        ) : null}
                                    </Stack>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>
                <Button
                    variant="contained"
                    onClick={() => setShowQuizResults(true)}
                    startIcon={<Quiz />}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    Check Answers
                </Button>
            </Stack>
        );
    }

    if (content.contentType === 'FLASHCARD_SET') {
        const cards = Array.isArray(metadata) ? metadata : metadata?.cards ?? metadata?.flashcards;
        if (!Array.isArray(cards) || cards.length === 0) {
            return <Alert severity="info">Flashcards are not configured yet.</Alert>;
        }

        const currentCard = cards[Math.max(0, Math.min(cardIndex, cards.length - 1))] ?? {};
        const frontText = currentCard.front ?? 'Front';
        const backText = currentCard.back ?? 'Back';

        return (
            <Stack spacing={2}>
                {content.contentText ? (
                    <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{content.contentText}</Typography>
                ) : null}
                <Card variant="outlined" sx={{ borderRadius: 3, minHeight: 200 }}>
                    <CardContent>
                        <Stack spacing={1}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <ViewCarousel fontSize="small" />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Card {cardIndex + 1} of {cards.length}
                                </Typography>
                            </Stack>
                            <Divider />
                            <Box sx={{ py: 3, textAlign: 'center' }}>
                                <Typography variant="h6" fontWeight={700}>
                                    {cardFlipped ? backText : frontText}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {cardFlipped ? 'Back' : 'Front'}
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setCardFlipped(false);
                            setCardIndex((current) => Math.max(0, current - 1));
                        }}
                        disabled={cardIndex === 0}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<ViewCarousel />}
                        onClick={() => setCardFlipped((current) => !current)}
                    >
                        Flip Card
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setCardFlipped(false);
                            setCardIndex((current) => Math.min(cards.length - 1, current + 1));
                        }}
                        disabled={cardIndex >= cards.length - 1}
                    >
                        Next
                    </Button>
                </Stack>
            </Stack>
        );
    }

    const typeIcon =
        content.contentType === 'DOCUMENT'
            ? <Description fontSize="small" />
            : content.contentType === 'NOTE'
                ? <AutoStories fontSize="small" />
                : <TouchApp fontSize="small" />;

    const typeLabel = content.contentType === 'NOTE' ? 'Note' : content.contentType === 'DOCUMENT' ? 'Document' : 'Lesson';

    return (
        <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
                {typeIcon}
                <Typography variant="subtitle2" color="text.secondary">
                    {typeLabel}
                </Typography>
            </Stack>
            <Card variant="outlined" sx={{ borderRadius: 3, backgroundColor: content.contentType === 'NOTE' ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                <CardContent>
                    <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                        {content.contentText || 'No lesson body provided yet.'}
                    </Typography>
                </CardContent>
            </Card>
            {plainMetadata ? <Alert severity="info">{plainMetadata}</Alert> : null}
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {content.contentType === 'DOCUMENT' ? <Chip icon={<Description />} label="Document" /> : null}
                {content.contentType === 'NOTE' ? <Chip icon={<AutoStories />} label="Notes" /> : null}
                {content.contentType === 'TEXT' ? <Chip icon={<TouchApp />} label="Text" /> : null}
                {content.contentType === 'PDF' ? <Chip icon={<PictureAsPdf />} label="PDF" /> : null}
                {content.contentType === 'VIDEO' ? <Chip icon={<PlayCircle />} label="Video" /> : null}
            </Stack>
            <ResourceLink url={content.contentUrl} label="Open Linked Resource" />
        </Stack>
    );
};

export default ContentRenderer;
