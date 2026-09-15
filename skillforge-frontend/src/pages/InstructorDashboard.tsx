import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    IconButton,
    TextField,
    InputAdornment,
    Avatar,
    AvatarGroup,
    useTheme,
    CircularProgress,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Add,
    TrendingUp,
    Search,
    FilterList,
    EditOutlined,
    DescriptionOutlined,
    AutoAwesome,
    ChevronRight,
    BarChart,
    Notifications,
} from '@mui/icons-material';
import { aiAPI, instructorAPI } from '../api/courseAPI';
import { useNavigate } from 'react-router-dom';

const difficultyColors: Record<string, string> = {
    BEGINNER: '#10b981',
    INTERMEDIATE: '#f59e0b',
    ADVANCED: '#ef4444',
};

// ─── Difficulty Heatmap (SVG) ──────────────────────────────────────────
const DifficultyHeatmap: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const levels = [
        { w: 30, h: 50, color: isDark ? '#818cf8' : '#42a5f5' },
        { w: 30, h: 70, color: isDark ? '#7c3aed' : '#5c6bc0' },
        { w: 30, h: 60, color: isDark ? '#a78bfa' : '#7e57c2' },
        { w: 30, h: 40, color: isDark ? '#c4b5fd' : '#9575cd' },
        { w: 30, h: 80, color: isDark ? '#6d28d9' : '#311b92' },
    ];
    const labelColor = isDark ? '#a5b4fc' : '#999';
    return (
        <svg width="180" height="100" viewBox="0 0 180 100">
            {levels.map((l, i) => (
                <rect key={i} x={i * 35 + 5} y={100 - l.h} width={l.w} height={l.h}
                    fill={l.color} rx="4" />
            ))}
            <text x="5" y="98" fontSize="9" fill={labelColor}>Beginner</text>
            <text x="145" y="98" fontSize="9" fill={labelColor}>Adv.</text>
        </svg>
    );
};

// ─── Component ─────────────────────────────────────────────────────────
const InstructorDashboard: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<any>(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [toast, setToast] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });
    const [planDialog, setPlanDialog] = useState<{ open: boolean, content: any[] }>({ open: false, content: [] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await instructorAPI.getDashboardStats();
                setDashboardData(data);
            } catch (err: any) {
                console.error("Failed to load instructor dashboard:", err);
                setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleGeneratePlan = async () => {
        setIsGenerating(true);
        try {
            const courseName = dashboardData?.activeCourses?.[0]?.title || "General";
            const rawResponse = await aiAPI.generateCoursePlan(courseName, "Intermediate");
            let parsedPlan = [];

            let cleanResponse = rawResponse;
            if (typeof rawResponse === 'string') {
                if (rawResponse.startsWith('```json')) {
                    cleanResponse = rawResponse.substring(7, rawResponse.length - 3).trim();
                }
                parsedPlan = JSON.parse(cleanResponse);
            } else {
                parsedPlan = rawResponse;
            }

            setPlanDialog({ open: true, content: parsedPlan });
            setToast({ open: true, message: 'Content plan generated successfully!', severity: 'success' });
        } catch (error) {
            console.error("Failed to generate plan:", error);
            setToast({ open: true, message: 'Failed to generate course plan.', severity: 'error' });
        } finally {
            setIsGenerating(false);
        }
    };

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

    const { activeCourses = [], stats = {}, pendingItems = [] } = dashboardData || {};

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary">Instructor Dashboard</Typography>
                    <Typography color="text.secondary">Manage your curriculum and track learner progress with AI insights.</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/instructor/courses/new')}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 3 }}>
                    Create New Course
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Avg Learner Progress */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Avg. Learner Progress</Typography>
                                    <Typography variant="h3" fontWeight={700} color="text.primary">{Number(stats.avgProgress || 0).toFixed(0)}%</Typography>
                                </Box>
                                <TrendingUp sx={{ color: theme.palette.success.main, fontSize: 28 }} />
                            </Box>
                            <LinearProgress variant="determinate" value={Number(stats.avgProgress || 0)}
                                sx={{
                                    mt: 2, height: 6, borderRadius: 3,
                                    bgcolor: isDark ? 'rgba(52,211,153,0.1)' : '#e0e0e0',
                                    '& .MuiLinearProgress-bar': { bgcolor: theme.palette.success.main, borderRadius: 3 }
                                }} />
                            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                                Based on {activeCourses.length} active courses
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Content Difficulty Heatmap */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Content Difficulty Heatmap</Typography>
                                    <Typography variant="caption" color="text.secondary">AI-Adjusted Levels</Typography>
                                </Box>
                                <BarChart sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                            </Box>
                            <Box sx={{ mt: 1 }}>
                                <DifficultyHeatmap isDark={isDark} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pending Exam Approvals */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Pending Exam Approvals</Typography>
                                    <Typography variant="h3" fontWeight={700} color="text.primary">{stats.pendingApprovals || 0}</Typography>
                                </Box>
                                <Notifications sx={{ color: theme.palette.warning.main, fontSize: 28 }} />
                            </Box>
                            {pendingItems.length > 0 ? pendingItems.map((item: any, i: number) => (
                                <Box key={i} sx={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    py: 1, borderBottom: i < pendingItems.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                                }}>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600} color="text.primary">{item.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">{item.type} • {item.duration}</Typography>
                                    </Box>
                                    <ChevronRight sx={{ color: theme.palette.text.secondary, opacity: 0.5 }} />
                                </Box>
                            )) : (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No pending items</Typography>
                            )}
                            <Button
                                size="small"
                                onClick={() => navigate('/instructor/exams')}
                                sx={{ mt: 1, textTransform: 'none' }}
                            >
                                View all pending items
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Active Courses Table */}
            <Card sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight={700} color="text.primary">Active Courses</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField size="small" placeholder="Search courses..."
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                            <Button variant="outlined" startIcon={<FilterList />}
                                sx={{ textTransform: 'none', borderRadius: 2 }}>Filter</Button>
                        </Box>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' } }}>
                                    <TableCell>Course Title</TableCell>
                                    <TableCell>Enrolled</TableCell>
                                    <TableCell>Avg. Score</TableCell>
                                    <TableCell>Difficulty</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {activeCourses.map((course: any) => (
                                    <TableRow key={course.id} sx={{ '&:hover': { bgcolor: isDark ? 'rgba(167,139,250,0.04)' : 'rgba(124,58,237,0.02)' } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ bgcolor: difficultyColors[course.difficulty] || '#6366f1', width: 36, height: 36, fontSize: 16 }}>
                                                    {course.initial}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600} color="text.primary">{course.title}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {course.difficulty}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 10 } }}>
                                                    <Avatar />
                                                    <Avatar />
                                                    <Avatar />
                                                </AvatarGroup>
                                                <Typography variant="body2" color="text.primary">+{course.enrolled}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={`${Number(course.avgScore || 0).toFixed(1)}%`} size="small"
                                                sx={{
                                                    bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ecfdf5',
                                                    color: theme.palette.success.main,
                                                    fontWeight: 600,
                                                }} />
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" color="text.primary">{course.difficulty}</Typography>
                                                <LinearProgress variant="determinate"
                                                    value={course.difficulty === 'INTERMEDIATE' ? 50 : course.difficulty === 'ADVANCED' ? 75 : 25}
                                                    sx={{
                                                        height: 4, borderRadius: 2, mt: 0.5, width: 80,
                                                        bgcolor: isDark ? 'rgba(167,139,250,0.1)' : '#f0f0f0',
                                                        '& .MuiLinearProgress-bar': { bgcolor: difficultyColors[course.difficulty] || '#6366f1' }
                                                    }} />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small" onClick={() => navigate(`/instructor/courses/${course.id}`)}>
                                                <DescriptionOutlined />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}>
                                                <EditOutlined />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, px: 1 }}>
                        <Typography variant="caption" color="text.secondary">Showing {activeCourses.length} courses</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" variant="outlined" sx={{ textTransform: 'none' }}>Previous</Button>
                            <Button size="small" variant="outlined" sx={{ textTransform: 'none' }}>Next</Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* AI Recommendation Banner */}
            <Card sx={{
                borderRadius: 3,
                background: `linear-gradient(135deg, ${isDark ? '#065f46' : '#059669'} 0%, ${isDark ? '#064e3b' : '#047857'} 100%)`,
                color: 'white',
            }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <AutoAwesome />
                            <Typography variant="h6" fontWeight={700}>AI Recommendation</Typography>
                        </Box>
                        <Typography variant="body1">
                            Based on learner progress data, consider reviewing courses with lower average scores
                            and uploading supplementary content to improve outcomes.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        onClick={handleGeneratePlan}
                        disabled={isGenerating}
                        startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : null}
                        sx={{
                            bgcolor: 'white', color: '#065f46', textTransform: 'none', fontWeight: 600,
                            px: 3, borderRadius: 2, '&:hover': { bgcolor: '#ecfdf5' }, flexShrink: 0, ml: 3,
                        }}>
                        {isGenerating ? 'Generating...' : 'Generate Content Plan'}
                    </Button>
                </CardContent>
            </Card>

            <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast({ ...toast, open: false })}>
                <Alert severity={toast.severity} sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>

            <Dialog open={planDialog.open} onClose={() => setPlanDialog({ ...planDialog, open: false })} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesome sx={{ color: theme.palette.primary.main }} />
                        <Typography fontWeight={700}>AI Generated Content Plan</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {planDialog.content.map((module: any, i: number) => (
                        <Box key={i} sx={{ mb: 2, p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5', borderRadius: 2 }}>
                            <Typography variant="subtitle1" fontWeight={700} color="primary">{module.title}</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}><strong>Duration:</strong> {module.duration}</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Outcomes:</strong> {module.outcomes}</Typography>
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPlanDialog({ ...planDialog, open: false })}>Close</Button>
                    <Button variant="contained" onClick={() => {
                        setToast({ open: true, message: 'Plan saved to drafts.', severity: 'success' });
                        setPlanDialog({ ...planDialog, open: false });
                    }}>Save to Drafts</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InstructorDashboard;
