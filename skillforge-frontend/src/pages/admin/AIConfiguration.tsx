import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Slider,
    Switch,
    Select,
    MenuItem,
    Button,
    Chip,
    Alert,
    Snackbar,
    Skeleton,
    useTheme,
} from '@mui/material';
import {
    Tune,
    Save,
    RestartAlt,
    SmartToy,
    Psychology,
    Speed,
    AutoFixHigh,
    Visibility,
} from '@mui/icons-material';
import { systemAPI, type SystemConfigData } from '../../api/courseAPI';

const AIConfiguration: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [config, setConfig] = useState<SystemConfigData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success',
    });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await systemAPI.getConfig();
            setConfig(data);
            setHasChanges(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load AI configuration');
            // Fallback defaults
            setConfig({
                adaptationSensitivity: 0.75,
                llmTemperature: 0.4,
                contentModel: 'GPT-4 (Recommended)',
                autoRemediation: true,
                strictProctoring: false,
                appVersion: 'v2.4.0-beta',
                environment: 'Production',
                region: 'us-east-1',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;
        try {
            setSaving(true);
            const updated = await systemAPI.updateConfig(config);
            setConfig(updated);
            setHasChanges(false);
            setSnackbar({ open: true, message: 'AI configuration saved successfully!', severity: 'success' });
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to save configuration', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setConfig({
            ...config!,
            adaptationSensitivity: 0.75,
            llmTemperature: 0.4,
            contentModel: 'GPT-4 (Recommended)',
            autoRemediation: true,
            strictProctoring: false,
        });
        setHasChanges(true);
    };

    const updateField = <K extends keyof SystemConfigData>(key: K, value: SystemConfigData[K]) => {
        setConfig((prev) => prev ? { ...prev, [key]: value } : prev);
        setHasChanges(true);
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Skeleton variant="text" width={300} height={48} />
                <Skeleton variant="text" width={400} height={24} sx={{ mb: 3 }} />
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rounded" height={200} sx={{ mb: 3, borderRadius: 3 }} />
                ))}
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <SmartToy sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                        <Typography variant="h4" fontWeight={700} color="text.primary">AI Configuration</Typography>
                    </Box>
                    <Typography color="text.secondary">
                        Fine-tune AI parameters for content generation, adaptive learning, and exam proctoring.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" startIcon={<RestartAlt />} onClick={handleReset}
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}>
                        Reset Defaults
                    </Button>
                    <Button variant="contained" startIcon={<Save />} onClick={handleSave}
                        disabled={!hasChanges || saving}
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                    {error} — Showing default values
                </Alert>
            )}

            {hasChanges && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    You have unsaved changes. Click "Save Changes" to apply.
                </Alert>
            )}

            {config && (
                <>
                    {/* Adaptive Learning Parameters */}
                    <Card sx={{ borderRadius: 3, mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <Psychology sx={{ color: theme.palette.primary.main }} />
                                <Typography variant="h6" fontWeight={700} color="text.primary">Adaptive Learning Engine</Typography>
                                <Chip label="LIVE" size="small" sx={{
                                    bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ecfdf5',
                                    color: theme.palette.success.main, fontWeight: 700, fontSize: '0.65rem',
                                }} />
                            </Box>

                            {/* Adaptation Sensitivity */}
                            <Box sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                            Adaptation Sensitivity
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Controls how quickly the difficulty adjusts based on learner errors.
                                        </Typography>
                                    </Box>
                                    <Chip label={config.adaptationSensitivity.toFixed(2)} color="primary" sx={{ fontWeight: 700 }} />
                                </Box>
                                <Slider
                                    value={config.adaptationSensitivity}
                                    onChange={(_, v) => updateField('adaptationSensitivity', v as number)}
                                    min={0} max={1} step={0.05}
                                    marks={[
                                        { value: 0, label: 'Conservative' },
                                        { value: 0.5, label: 'Balanced' },
                                        { value: 1, label: 'Aggressive' },
                                    ]}
                                    sx={{ mx: 1 }}
                                />
                            </Box>

                            {/* LLM Temperature */}
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                            LLM Temperature
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Lower values produce more deterministic exam questions. Higher values increase creativity.
                                        </Typography>
                                    </Box>
                                    <Chip label={config.llmTemperature.toFixed(2)} color="primary" sx={{ fontWeight: 700 }} />
                                </Box>
                                <Slider
                                    value={config.llmTemperature}
                                    onChange={(_, v) => updateField('llmTemperature', v as number)}
                                    min={0} max={1} step={0.05}
                                    marks={[
                                        { value: 0, label: 'Deterministic' },
                                        { value: 0.5, label: 'Balanced' },
                                        { value: 1, label: 'Creative' },
                                    ]}
                                    sx={{ mx: 1 }}
                                />
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Content Generation */}
                    <Card sx={{ borderRadius: 3, mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <Speed sx={{ color: theme.palette.secondary.main }} />
                                <Typography variant="h6" fontWeight={700} color="text.primary">Content Generation</Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                                    AI Model
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                    Select the AI model used for generating course content and exam questions.
                                </Typography>
                                <Select
                                    fullWidth
                                    value={config.contentModel}
                                    onChange={(e) => updateField('contentModel', e.target.value)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value="GPT-4 (Recommended)">GPT-4 (Recommended)</MenuItem>
                                    <MenuItem value="GPT-3.5 Turbo">GPT-3.5 Turbo</MenuItem>
                                    <MenuItem value="Claude 3">Claude 3</MenuItem>
                                    <MenuItem value="Gemini Pro">Gemini Pro</MenuItem>
                                </Select>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Feature Toggles */}
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <Tune sx={{ color: theme.palette.warning.main }} />
                                <Typography variant="h6" fontWeight={700} color="text.primary">Feature Toggles</Typography>
                            </Box>

                            <Box sx={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                p: 2, borderRadius: 2, mb: 2,
                                bgcolor: isDark ? 'rgba(167,139,250,0.04)' : 'rgba(124,58,237,0.02)',
                                border: `1px solid ${theme.palette.divider}`,
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <AutoFixHigh sx={{ color: theme.palette.success.main }} />
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                            Auto-Remediation
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Automatically assign remedial content when learners score below threshold.
                                        </Typography>
                                    </Box>
                                </Box>
                                <Switch
                                    checked={config.autoRemediation}
                                    onChange={(e) => updateField('autoRemediation', e.target.checked)}
                                    color="primary"
                                />
                            </Box>

                            <Box sx={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                p: 2, borderRadius: 2,
                                bgcolor: isDark ? 'rgba(167,139,250,0.04)' : 'rgba(124,58,237,0.02)',
                                border: `1px solid ${theme.palette.divider}`,
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Visibility sx={{ color: theme.palette.error.main }} />
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                            Strict Proctoring AI
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Enable gaze tracking, tab switching detection, and AI-based anomaly analysis during exams.
                                        </Typography>
                                    </Box>
                                </Box>
                                <Switch
                                    checked={config.strictProctoring}
                                    onChange={(e) => updateField('strictProctoring', e.target.checked)}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AIConfiguration;
