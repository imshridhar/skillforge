import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Chip,
    Button,
    IconButton,
    useTheme,
    CircularProgress,
    Alert,
    alpha
} from '@mui/material';
import {
    PlayCircle,
    ChevronLeft,
    ChevronRight,
    Star,
    AccessTime,
    People,
    LocalFireDepartment,
    TrendingUp,
} from '@mui/icons-material';
import { learnerAPI } from '../api/courseAPI';
import { useNavigate } from 'react-router-dom';

// ─── Interfaces ────────────────────────────────────────────────────────
interface DashboardStats {
    currentCourse: {
        courseId?: string;
        title: string;
        module: string;
        progress: number;
        status: string;
    };
    dailyGoal: {
        minutesToday: number;
        target: number;
        streak: number;
    };
    skillData: { label: string; value: number }[];
}

interface Recommendation {
    id: string;
    title: string;
    level: string;
    levelColor: string;
    description: string;
    duration: string;
    rating: number;
    learners: string;
}



const achievements = [
    { icon: '🏆', color: '#ffb74d' },
    { icon: '🎯', color: '#6366F1' },
    { icon: '✅', color: '#10B981' },
];

// ─── Radar Chart (SVG) ────────────────────────────────────────────────
const SkillRadar: React.FC<{ isDark: boolean; skillData: { label: string; value: number }[] }> = ({ isDark, skillData }) => {
    const cx = 120, cy = 120, r = 80;
    const n = skillData.length || 1;
    const angleStep = (2 * Math.PI) / n;

    const getPoint = (i: number, scale: number) => ({
        x: cx + r * scale * Math.sin(i * angleStep),
        y: cy - r * scale * Math.cos(i * angleStep),
    });

    const gridLevels = [0.25, 0.5, 0.75, 1];
    const dataPoints = skillData.map((s, i) => getPoint(i, s.value));
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const labelColor = isDark ? '#F8FAFC' : '#475569';

    return (
        <svg width="240" height="240" viewBox="0 0 240 240" style={{ filter: 'drop-shadow(0 0 12px rgba(6,182,212,0.3))' }}>
            <defs>
                <linearGradient id="cyberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
            </defs>
            {gridLevels.map((lv) => (
                <polygon key={lv} points={Array.from({ length: n }, (_, i) => {
                    const p = getPoint(i, lv);
                    return `${p.x},${p.y}`;
                }).join(' ')} fill="none" stroke={gridColor} strokeWidth="1" />
            ))}
            {skillData.map((_, i) => {
                const p = getPoint(i, 1);
                return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={gridColor} strokeWidth="1" />;
            })}
            <polygon points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="url(#cyberGradient)" fillOpacity="0.4" stroke="url(#cyberGradient)" strokeWidth="2.5" />
            {dataPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke="url(#cyberGradient)" strokeWidth="2" />
            ))}
            {skillData.map((s, i) => {
                const p = getPoint(i, 1.25);
                return (
                    <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
                        fontSize="11" fill={labelColor} fontWeight="700" letterSpacing="0.05em">{s.label}</text>
                );
            })}
        </svg>
    );
};

// ─── Daily Goal Ring (SVG) ─────────────────────────────────────────────
const DailyGoalRing: React.FC<{ minutes: number; target: number; isDark: boolean }> = ({ minutes, target, isDark }) => {
    const pct = Math.min(minutes / target, 1);
    const r = 50, cx = 60, cy = 60;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - pct);
    const trackColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const textColor = isDark ? '#F8FAFC' : '#0F172A';
    const subColor = isDark ? '#94A3B8' : '#475569';

    return (
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ filter: 'drop-shadow(0 4px 12px rgba(16,185,129,0.3))' }}>
            <defs>
                <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
            </defs>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth="8" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#emeraldGradient)" strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.19, 1, 0.22, 1)' }} />
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize="28" fontWeight="800" fill={textColor}>{minutes}</text>
            <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill={subColor} fontWeight="600" letterSpacing="0.03em">mins today</text>
        </svg>
    );
};

// ─── Component ─────────────────────────────────────────────────────────
const LearnerDashboard: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const navigate = useNavigate();

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recs, setRecs] = useState<Recommendation[]>([]);
    const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [dashboardStats, recommendations, exams] = await Promise.all([
                    learnerAPI.getDashboardStats(),
                    learnerAPI.getRecommendations(),
                    learnerAPI.getUpcomingExams(),
                ]);
                setStats(dashboardStats);
                setRecs(recommendations);
                setUpcomingExams(exams);
            } catch (err: any) {
                console.error("Failed to load dashboard data:", err);
                setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    const { currentCourse, dailyGoal, skillData } = stats || {};
    const canResume = Boolean(currentCourse?.courseId);
    const resumePath = canResume ? `/learner/course/${currentCourse?.courseId}/learn` : '/learner/my-learning';

    return (
        <Box sx={{ p: 4, minHeight: '100vh', maxWidth: '1440px', margin: '0 auto' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                    Hone your <Box component="span" sx={{ background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>skills</Box> today.
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight={500}>Let's dive back into your learning journey.</Typography>
            </Box>

            {/* Top Row: Current Course + Daily Goal */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
                {/* Current Course Card */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{
                        background: `linear-gradient(135deg, #6366F1 0%, #312E81 100%)`,
                        color: 'white',
                        borderRadius: 4,
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: `0 20px 40px ${alpha('#312E81', 0.4)}`,
                        border: 'none',
                    }}>
                        {/* Decorative background glow */}
                        <Box sx={{
                            position: 'absolute', top: -50, right: -50, width: 200, height: 200,
                            borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.6) 0%, rgba(99,102,241,0) 70%)', filter: 'blur(40px)'
                        }} />

                        <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                            {currentCourse && Object.keys(currentCourse).length > 0 ? (
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Chip label={currentCourse.status} size="small"
                                                sx={{ bgcolor: alpha('#10B981', 0.2), color: '#34D399', border: '1px solid #10B981', mb: 2, fontWeight: 700, letterSpacing: '0.05em' }} />
                                            <Typography variant="h4" fontWeight={800} sx={{ mb: 1, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{currentCourse.title}</Typography>
                                            <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>{currentCourse.module}</Typography>
                                        </Box>
                                        <IconButton
                                            onClick={() => navigate(resumePath)}
                                            sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            backdropFilter: 'blur(10px)',
                                            width: 64, height: 64,
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                                            transition: 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)', transform: 'scale(1.1)' }
                                        }}
                                        >
                                            <PlayCircle sx={{ fontSize: 40 }} />
                                        </IconButton>
                                    </Box>
                                    <Box sx={{ mt: 5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.9 }}>Overall Progress</Typography>
                                            <Typography variant="body2" fontWeight={800}>{currentCourse.progress}%</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={currentCourse.progress}
                                            sx={{
                                                height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
                                                '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #34D399 0%, #10B981 100%)', borderRadius: 5, boxShadow: '0 0 10px rgba(52,211,153,0.8)' }
                                            }} />
                                    </Box>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate(resumePath)}
                                        sx={{
                                        mt: 4, bgcolor: '#ffffff', color: '#6366F1', fontWeight: 800, padding: '10px 28px',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                                        '&:hover': { bgcolor: '#F8FAFC', transform: 'translateY(-2px)' }
                                    }}
                                    >
                                        Resume Learning
                                    </Button>
                                </>
                            ) : (
                                <Box sx={{ py: 6, textAlign: 'center' }}>
                                    <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>No active courses yet</Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.85, mb: 4 }}>Your learning journey begins with the very first step. Enroll now!</Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/learner/courses')}
                                        sx={{ bgcolor: 'white', color: '#6366F1', fontWeight: 800, px: 4, py: 1.5, '&:hover': { bgcolor: '#F8FAFC', transform: 'translateY(-2px)' } }}
                                    >
                                        Browse Courses
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Daily Goal */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 3 }}>
                        {dailyGoal ? (
                            <>
                                <DailyGoalRing minutes={dailyGoal.minutesToday} target={dailyGoal.target} isDark={isDark} />
                                <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ mt: 2 }}>Daily Goal</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center', px: 2, fontWeight: 500 }}>
                                    {dailyGoal.minutesToday >= dailyGoal.target
                                        ? "Incredible, you hit your target!"
                                        : `${dailyGoal.target - dailyGoal.minutesToday} mins left to keep your streak alive.`}
                                </Typography>
                                <Chip icon={<LocalFireDepartment sx={{ color: '#EF4444 !important' }} />}
                                    label={`${dailyGoal?.streak || 0} Day Streak`}
                                    sx={{
                                        color: isDark ? '#FCA5A5' : '#EF4444',
                                        bgcolor: isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2',
                                        fontWeight: 800,
                                        fontSize: '0.85rem',
                                        px: 1,
                                        py: 2,
                                        borderRadius: 2
                                    }} />
                            </>
                        ) : (
                            <CircularProgress />
                        )}
                    </Card>
                </Grid>
            </Grid>

            {/* Middle Row: Skill Analysis + Recommendations */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
                {/* Skill Analysis */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{ borderRadius: 4, height: '100%' }}>
                        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight={800} color="text.primary">Skill Analysis</Typography>
                                <Button
                                    size="small"
                                    onClick={() => navigate('/learner/progress')}
                                    sx={{ textTransform: 'none', fontWeight: 700 }}
                                >
                                    Full Report
                                </Button>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', flexGrow: 1, alignItems: 'center', py: 2 }}>
                                {skillData ? <SkillRadar isDark={isDark} skillData={skillData} /> : <CircularProgress />}
                            </Box>
                            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2, fontWeight: 500 }}>
                                AI-driven proficiency tracking
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recommendations */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card sx={{ borderRadius: 4, height: '100%' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Typography variant="h6" fontWeight={800} color="text.primary">AI Curated Picks</Typography>
                                    <Chip label="Matches Skills" size="small"
                                        sx={{
                                            background: `linear-gradient(135deg, ${alpha('#6366F1', 0.2)} 0%, ${alpha('#06B6D4', 0.2)} 100%)`,
                                            color: theme.palette.primary.main,
                                            fontWeight: 800,
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                        }} />
                                </Box>
                                <Box>
                                    <IconButton size="small"><ChevronLeft /></IconButton>
                                    <IconButton size="small"><ChevronRight /></IconButton>
                                </Box>
                            </Box>
                            {recs.length > 0 ? recs.map((rec) => (
                                <Card key={rec.id} variant="outlined"
                                    sx={{
                                        mb: 2, borderRadius: 3, '&:last-child': { mb: 0 },
                                        borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                        bgcolor: 'transparent',
                                        '&:hover': {
                                            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                                            borderColor: alpha(theme.palette.primary.main, 0.2),
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                                    }}>
                                    <CardContent sx={{ display: 'flex', gap: 2.5, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                        <Box sx={{
                                            width: 80, height: 80, borderRadius: 3, flexShrink: 0,
                                            background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.2) 100%)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <TrendingUp sx={{ fontSize: 32, color: '#10B981' }} />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="h6" fontWeight={800} color="text.primary">{rec.title}</Typography>
                                                <Chip label={rec.level} size="small"
                                                    sx={{
                                                        bgcolor: alpha(rec.levelColor || '#3f51b5', 0.15), color: rec.levelColor || '#3f51b5',
                                                        fontWeight: 800, fontSize: '0.7rem', border: `1px solid ${alpha(rec.levelColor || '#3f51b5', 0.3)}`
                                                    }} />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500, lineHeight: 1.6 }}>
                                                {rec.description}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 3, color: 'text.secondary' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AccessTime sx={{ fontSize: 16 }} />
                                                    <Typography variant="caption" fontWeight={600}>{rec.duration}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Star sx={{ fontSize: 16, color: '#FBBF24' }} />
                                                    <Typography variant="caption" fontWeight={600}>{rec.rating}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <People sx={{ fontSize: 16 }} />
                                                    <Typography variant="caption" fontWeight={600}>{rec.learners} learners</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            )) : (
                                <Box sx={{ py: 6, textAlign: 'center' }}>
                                    <Typography color="text.secondary" fontWeight={500}>No recommendations right now. Keep learning!</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Bottom Row: Upcoming Exams + Achievements */}
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ borderRadius: 4, height: '100%' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6" fontWeight={800} color="text.primary">Upcoming Exams</Typography>
                                <Button
                                    size="small"
                                    onClick={() => navigate('/learner/assessments')}
                                    sx={{ textTransform: 'none', fontWeight: 700 }}
                                >
                                    Schedule
                                </Button>
                            </Box>
                            {upcomingExams.length > 0 ? upcomingExams.map((exam) => (
                                <Box key={exam.id} sx={{
                                    display: 'flex', alignItems: 'center', gap: 3, mb: 3,
                                    '&:last-child': { mb: 0 },
                                    p: 2, borderRadius: 3,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                    transition: 'background-color 0.2s',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                                }}>
                                    <Box sx={{
                                        minWidth: 64, textAlign: 'center', p: 1, borderRadius: 2,
                                        background: `linear-gradient(135deg, ${alpha('#EF4444', 0.1)} 0%, ${alpha('#EF4444', 0.2)} 100%)`,
                                    }}>
                                        <Typography variant="caption" color="error" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            {(exam.date || '').split(' ')[0]}
                                        </Typography>
                                        <Typography variant="h5" fontWeight={800} color="error" sx={{ lineHeight: 1 }}>
                                            {(exam.date || '').split(' ')[1]}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ mb: 0.5 }}>{exam.title}</Typography>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                            {exam.time} • <Box component="span" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>{exam.type}</Box>
                                        </Typography>
                                    </Box>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => navigate('/learner/assessments')}
                                        sx={{ fontWeight: 700, borderRadius: 2, borderWidth: '2px' }}
                                    >
                                        Prepare
                                    </Button>
                                </Box>
                            )) : (
                                <Box sx={{ py: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary" fontWeight={500}>No upcoming exams. Enroll in courses to see exams!</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ borderRadius: 4, height: '100%' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6" fontWeight={800} color="text.primary">Recent Trophies</Typography>
                                <Button
                                    size="small"
                                    onClick={() => navigate('/learner/progress')}
                                    sx={{ textTransform: 'none', fontWeight: 700 }}
                                >
                                    Showcase
                                </Button>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                {achievements.map((a, i) => (
                                    <Box key={i} sx={{
                                        width: 80, height: 80, borderRadius: 3, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        background: `linear-gradient(135deg, ${alpha(a.color, 0.1)} 0%, ${alpha(a.color, 0.25)} 100%)`,
                                        fontSize: 36,
                                        border: `1px solid ${alpha(a.color, 0.2)}`,
                                        boxShadow: `0 8px 16px ${alpha(a.color, 0.1)}`,
                                        transition: 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                                        '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 24px ${alpha(a.color, 0.2)}` }
                                    }}>
                                        {a.icon}
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default LearnerDashboard;
