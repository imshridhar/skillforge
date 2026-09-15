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
    IconButton,
    TextField,
    InputAdornment,
    Avatar,
    Switch,
    Slider,
    Select,
    MenuItem,
    useTheme,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Search,
    FilterList,
    MoreVert,
    DownloadOutlined,
    RestartAlt,
    Warning,
    Info,
    Tune,
    Settings,
} from '@mui/icons-material';
import { adminAPI, systemAPI, type SystemConfigData } from '../api/courseAPI';

// ─── Component ─────────────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [systemStats, setSystemStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [config, setConfig] = useState<SystemConfigData | null>(null);

    const [sensitivity, setSensitivity] = useState(0.75);
    const [temperature, setTemperature] = useState(0.4);
    const [autoRemediation, setAutoRemediation] = useState(true);
    const [strictProctoring, setStrictProctoring] = useState(false);
    const [contentModel, setContentModel] = useState('GPT-4 (Recommended)');
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsData, usersData, alertsData, configData] = await Promise.all([
                    systemAPI.getStats(),
                    adminAPI.getUsers(),
                    systemAPI.getAlerts(),
                    systemAPI.getConfig(),
                ]);
                setSystemStats(statsData);
                setUsers(usersData);
                setAlerts(alertsData);
                setConfig(configData);

                // Set AI tuning values from config
                if (configData) {
                    setSensitivity(configData.adaptationSensitivity ?? 0.75);
                    setTemperature(configData.llmTemperature ?? 0.4);
                    setAutoRemediation(configData.autoRemediation ?? true);
                    setStrictProctoring(configData.strictProctoring ?? false);
                    setContentModel(configData.contentModel || 'GPT-4 (Recommended)');
                }
            } catch (err: any) {
                console.error("Failed to load admin dashboard:", err);
                setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleExportLogs = () => {
        const exportPayload = {
            exportedAt: new Date().toISOString(),
            systemStats,
            alerts,
            users,
            config,
        };
        const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'skillforge-system-export.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setActionMessage('Export generated successfully.');
    };

    const handleRestartServices = async () => {
        try {
            const response = await systemAPI.restartServices();
            setActionMessage(response.message || 'Restart request sent.');
        } catch (restartError: any) {
            setActionMessage(restartError.response?.data?.message || 'Failed to request restart.');
        }
    };

    const handleApplyChanges = async () => {
        try {
            const payload: SystemConfigData = {
                ...(config || {}),
                adaptationSensitivity: sensitivity,
                llmTemperature: temperature,
                autoRemediation,
                strictProctoring,
                contentModel,
            };
            const updated = await systemAPI.updateConfig(payload);
            setConfig(updated);
            setActionMessage('Configuration updated successfully.');
        } catch (updateError: any) {
            setActionMessage(updateError.response?.data?.message || 'Failed to update configuration.');
        }
    };

    const alertStyles = {
        warning: {
            icon: <Warning sx={{ color: theme.palette.warning.main }} />,
            bgColor: isDark ? 'rgba(245,158,11,0.08)' : '#fffbeb',
            titleColor: isDark ? '#fbbf24' : '#b45309',
        },
        info: {
            icon: <Info sx={{ color: theme.palette.info.main }} />,
            bgColor: isDark ? 'rgba(59,130,246,0.08)' : '#eff6ff',
            titleColor: isDark ? '#60a5fa' : '#1d4ed8',
        },
        error: {
            icon: <Warning sx={{ color: theme.palette.error.main }} />,
            bgColor: isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2',
            titleColor: isDark ? '#f87171' : '#b91c1c',
        },
    };

    const roleColors: Record<string, string> = {
        ADMIN: '#6b7280',
        INSTRUCTOR: '#f59e0b',
        LEARNER: '#10b981',
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

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary">System Configuration</Typography>
                    <Typography color="text.secondary">Manage platform settings, monitor health, and tune AI parameters.</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadOutlined />}
                        onClick={handleExportLogs}
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}>Export Logs</Button>
                    <Button
                        variant="contained"
                        startIcon={<RestartAlt />}
                        color="error"
                        onClick={handleRestartServices}
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}>Restart Services</Button>
                </Box>
            </Box>

            {actionMessage ? (
                <Alert severity="info" sx={{ mb: 2 }} onClose={() => setActionMessage(null)}>
                    {actionMessage}
                </Alert>
            ) : null}

            {/* System Health Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">Server Health</Typography>
                                <Chip label={systemStats?.serverStatus || 'Unknown'} size="small" sx={{
                                    bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ecfdf5',
                                    color: theme.palette.success.main, fontWeight: 600, fontSize: '0.7rem',
                                }} />
                            </Box>
                            <Typography variant="h4" fontWeight={700} color="text.primary">{systemStats?.serverHealth || 0}%</Typography>
                            <Box sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: isDark ? 'rgba(167,139,250,0.1)' : '#e0e0e0' }}>
                                <Box sx={{ height: '100%', width: `${systemStats?.serverHealth || 0}%`, bgcolor: theme.palette.info.main, borderRadius: 3 }} />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>Uptime last 30 days</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">AI Latency</Typography>
                                <Chip label={systemStats?.aiLatencyChange || ''} size="small" sx={{
                                    bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ecfdf5',
                                    color: theme.palette.success.main, fontWeight: 600, fontSize: '0.7rem',
                                }} />
                            </Box>
                            <Typography variant="h4" fontWeight={700} color="text.primary">{systemStats?.aiLatency || 0}ms</Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, alignItems: 'flex-end' }}>
                                {[30, 40, 45, 50, 60, 55, 70].map((h, i) => (
                                    <Box key={i} sx={{
                                        width: 20, height: h * 0.8,
                                        bgcolor: i < 4
                                            ? (isDark ? 'rgba(167,139,250,0.2)' : '#c7d2fe')
                                            : (isDark ? '#a78bfa' : '#6d28d9'),
                                        borderRadius: 1,
                                    }} />
                                ))}
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>Avg response time (GPT-4)</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">Active Sessions</Typography>
                                <Chip label="Live" size="small" sx={{
                                    bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ecfdf5',
                                    color: theme.palette.success.main, fontWeight: 600, fontSize: '0.7rem',
                                }} />
                            </Box>
                            <Typography variant="h4" fontWeight={700} color="text.primary">{(systemStats?.activeSessions || 0).toLocaleString()}</Typography>
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">Learners <strong style={{ color: theme.palette.text.primary }}>{(systemStats?.totalLearners || 0).toLocaleString()}</strong></Typography>
                                <Typography variant="body2" color="text.secondary">Instructors <strong style={{ color: theme.palette.text.primary }}>{systemStats?.totalInstructors || 0}</strong></Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">Database Load</Typography>
                                <Chip label={systemStats?.databaseStatus || 'Unknown'} size="small" sx={{
                                    bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ecfdf5',
                                    color: theme.palette.success.main, fontWeight: 600, fontSize: '0.7rem',
                                }} />
                            </Box>
                            <Typography variant="h4" fontWeight={700} color="text.primary">{systemStats?.databaseLoad || 0}%</Typography>
                            <Box sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: isDark ? 'rgba(167,139,250,0.1)' : '#e0e0e0' }}>
                                <Box sx={{ height: '100%', width: `${systemStats?.databaseLoad || 0}%`, bgcolor: theme.palette.primary.main, borderRadius: 3 }} />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>PostgreSQL CPU Usage</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* User Management + AI Tuning */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* User Management Table */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={700} color="text.primary">User Management</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField size="small" placeholder="Search users..."
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                    <IconButton><FilterList /></IconButton>
                                </Box>
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem' } }}>
                                            <TableCell>User</TableCell>
                                            <TableCell>Role</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.slice(0, 6).map((user: any) => {
                                            const initials = `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`;
                                            const color = roleColors[user.role] || '#6b7280';
                                            const statusColor = user.isActive ? '#10b981' : '#6b7280';
                                            const statusText = user.isActive ? 'Active' : 'Inactive';
                                            return (
                                                <TableRow key={user.userId} sx={{ '&:hover': { bgcolor: isDark ? 'rgba(167,139,250,0.04)' : 'rgba(124,58,237,0.02)' } }}>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Avatar sx={{ bgcolor: color, width: 32, height: 32, fontSize: 12 }}>
                                                                {initials}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={600} color="text.primary">{user.firstName} {user.lastName}</Typography>
                                                                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={user.role} size="small"
                                                            sx={{ bgcolor: color + '20', color: color, fontWeight: 600, fontSize: '0.7rem' }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusColor }} />
                                                            <Typography variant="body2" sx={{ color: statusColor }}>{statusText}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton size="small"><MoreVert /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                <Typography variant="caption" color="text.secondary">Showing {Math.min(users.length, 6)} of {users.length} users</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button size="small" variant="outlined" sx={{ textTransform: 'none' }}>Previous</Button>
                                    <Button size="small" variant="outlined" sx={{ textTransform: 'none' }}>Next</Button>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* AI Tuning Panel */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Tune sx={{ color: theme.palette.primary.main }} />
                                    <Typography variant="h6" fontWeight={700} color="text.primary">AI Tuning</Typography>
                                </Box>
                                <Chip label="LIVE" size="small" sx={{
                                    bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ecfdf5',
                                    color: theme.palette.success.main, fontWeight: 700, fontSize: '0.65rem',
                                }} />
                            </Box>

                            {/* Adaptation Sensitivity */}
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">Adaptation Sensitivity</Typography>
                                    <Typography variant="body2" color="primary" fontWeight={600}>{sensitivity}</Typography>
                                </Box>
                                <Slider value={sensitivity} onChange={(_, v) => setSensitivity(v as number)}
                                    min={0} max={1} step={0.05} sx={{ mt: 1 }} />
                                <Typography variant="caption" color="text.secondary">
                                    Controls how quickly the difficulty adjusts based on learner errors.
                                </Typography>
                            </Box>

                            {/* LLM Temperature */}
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">LLM Temperature</Typography>
                                    <Typography variant="body2" color="primary" fontWeight={600}>{temperature}</Typography>
                                </Box>
                                <Slider value={temperature} onChange={(_, v) => setTemperature(v as number)}
                                    min={0} max={1} step={0.05} sx={{ mt: 1 }} />
                                <Typography variant="caption" color="text.secondary">
                                    Lower values produce more deterministic exam questions.
                                </Typography>
                            </Box>

                            {/* Content Generation Model */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>Content Generation Model</Typography>
                                <Select
                                    fullWidth
                                    size="small"
                                    value={contentModel}
                                    onChange={(e) => setContentModel(e.target.value)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value="GPT-4 (Recommended)">GPT-4 (Recommended)</MenuItem>
                                    <MenuItem value="GPT-3.5 Turbo">GPT-3.5 Turbo</MenuItem>
                                    <MenuItem value="Claude 3">Claude 3</MenuItem>
                                </Select>
                            </Box>

                            {/* Toggles */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">Auto-Remediation</Typography>
                                    <Typography variant="caption" color="text.secondary">Automatically assign remedial content</Typography>
                                </Box>
                                <Switch checked={autoRemediation} onChange={(e) => setAutoRemediation(e.target.checked)} color="primary" />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">Strict Proctoring AI</Typography>
                                    <Typography variant="caption" color="text.secondary">Enable gaze tracking & tab analysis</Typography>
                                </Box>
                                <Switch checked={strictProctoring} onChange={(e) => setStrictProctoring(e.target.checked)} />
                            </Box>

                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleApplyChanges}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, py: 1.2 }}
                            >
                                Apply Changes
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Alerts + Infrastructure */}
            <Grid container spacing={3}>
                {/* Alerts */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 2 }}>Recent Alerts</Typography>
                            {alerts.length > 0 ? alerts.map((alert: any) => {
                                const style = alertStyles[alert.severity as keyof typeof alertStyles] || alertStyles.info;
                                return (
                                    <Box key={alert.id} sx={{
                                        p: 2, borderRadius: 2, bgcolor: style.bgColor, mb: 2,
                                        '&:last-child': { mb: 0 },
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'transparent'}`,
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            {style.icon}
                                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: style.titleColor }}>
                                                {alert.title}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">{alert.message}</Typography>
                                        <Typography variant="caption" sx={{ color: style.titleColor, mt: 0.5, display: 'block' }}>
                                            {alert.time}
                                        </Typography>
                                    </Box>
                                );
                            }) : (
                                <Typography variant="body2" color="text.secondary">No recent alerts</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Infrastructure */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{
                        borderRadius: 3,
                        background: isDark
                            ? 'linear-gradient(135deg, #1e1145 0%, #0f0a2a 100%)'
                            : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                        color: 'white',
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Settings sx={{ color: '#a78bfa' }} />
                                <Typography variant="h6" fontWeight={700}>Infrastructure</Typography>
                            </Box>
                            {[
                                { label: 'Version', value: config?.appVersion || 'v2.4.0-beta' },
                                { label: 'Environment', value: config?.environment || 'Production', valueColor: '#34d399' },
                                { label: 'Region', value: config?.region || 'us-east-1' },
                            ].map((item, i) => (
                                <Box key={i} sx={{
                                    display: 'flex', justifyContent: 'space-between', py: 1,
                                    borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none'
                                }}>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>{item.label}</Typography>
                                    <Typography variant="body2" fontWeight={600}
                                        sx={{ color: item.valueColor || 'white' }}>{item.value}</Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
