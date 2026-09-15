import React from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from '@mui/material';
import {
    AssignmentTurnedIn,
    AutoStories,
    Bolt,
    PlayArrow,
    PublishedWithChanges,
    Quiz,
    Timer,
} from '@mui/icons-material';
import type { Exam } from '../../api/courseAPI';
import { conductMethodLabel } from '../../utils/assessment';

interface AssessmentTemplateCardProps {
    assessment: Exam;
    primaryActionLabel: string;
    onPrimaryAction: () => void;
    primaryDisabled?: boolean;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    secondaryDisabled?: boolean;
    footer?: React.ReactNode;
}

const statusColor: Record<string, string> = {
    DRAFT: '#f59e0b',
    PUBLISHED: '#10b981',
    ARCHIVED: '#6b7280',
};

const typeColor: Record<string, string> = {
    EXAM: '#1d4ed8',
    QUIZ: '#7c3aed',
    PRACTICE: '#0f766e',
};

const AssessmentTemplateCard: React.FC<AssessmentTemplateCardProps> = ({
    assessment,
    primaryActionLabel,
    onPrimaryAction,
    primaryDisabled,
    secondaryActionLabel,
    onSecondaryAction,
    secondaryDisabled,
    footer,
}) => {
    const accent = statusColor[assessment.status] ?? '#64748b';
    const courseLabel = assessment.course?.title ?? (assessment.examType === 'PRACTICE' ? 'Personal Practice' : 'General');

    return (
        <Card
            sx={{
                height: '100%',
                borderRadius: 4,
                border: `1px solid ${accent}22`,
                background: `linear-gradient(180deg, ${accent}10 0%, rgba(255,255,255,0.98) 30%)`,
                boxShadow: '0 20px 45px rgba(15, 23, 42, 0.06)',
            }}
        >
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'flex-start' }}>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Chip
                            icon={<PublishedWithChanges sx={{ fontSize: 16 }} />}
                            label={assessment.status}
                            size="small"
                            sx={{
                                bgcolor: `${accent}18`,
                                color: accent,
                                fontWeight: 700,
                            }}
                        />
                        <Chip
                            icon={<AssignmentTurnedIn sx={{ fontSize: 16 }} />}
                            label={assessment.examType}
                            size="small"
                            sx={{
                                bgcolor: `${typeColor[assessment.examType] ?? '#334155'}18`,
                                color: typeColor[assessment.examType] ?? '#334155',
                                fontWeight: 700,
                            }}
                        />
                    </Stack>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Timer sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                            {assessment.durationMinutes} mins
                        </Typography>
                    </Stack>
                </Box>

                <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.03em', mb: 0.5 }}>
                        {assessment.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {assessment.description || 'Assessment template ready for delivery and practice.'}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip icon={<AutoStories sx={{ fontSize: 16 }} />} label={courseLabel} size="small" variant="outlined" />
                    <Chip icon={<Quiz sx={{ fontSize: 16 }} />} label={`${assessment.totalQuestions} questions`} size="small" variant="outlined" />
                    <Chip icon={<Bolt sx={{ fontSize: 16 }} />} label={conductMethodLabel(assessment.conductMethod)} size="small" variant="outlined" />
                </Stack>

                <Box
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'rgba(15, 23, 42, 0.03)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: 1.5,
                    }}
                >
                    <Box>
                        <Typography variant="caption" color="text.secondary">Passing Score</Typography>
                        <Typography variant="subtitle2" fontWeight={800}>{assessment.passingScore}%</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Method</Typography>
                        <Typography variant="subtitle2" fontWeight={800}>{conductMethodLabel(assessment.conductMethod)}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Topics</Typography>
                        <Typography variant="subtitle2" fontWeight={800} noWrap>
                            {assessment.learningGoals || 'Course outcomes'}
                        </Typography>
                    </Box>
                </Box>

                {footer}

                <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={onPrimaryAction}
                        disabled={primaryDisabled}
                        sx={{ textTransform: 'none', borderRadius: 2.5, fontWeight: 700 }}
                    >
                        {primaryActionLabel}
                    </Button>
                    {secondaryActionLabel && onSecondaryAction ? (
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={onSecondaryAction}
                            disabled={secondaryDisabled}
                            sx={{ textTransform: 'none', borderRadius: 2.5, fontWeight: 700 }}
                        >
                            {secondaryActionLabel}
                        </Button>
                    ) : null}
                </Box>
            </CardContent>
        </Card>
    );
};

export default AssessmentTemplateCard;
