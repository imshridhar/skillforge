import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    Chip,
    Alert,
    Snackbar,
    Skeleton,
    Divider,
    useTheme,
} from '@mui/material';
import {
    Settings,
    Save,
    Cloud,
    Public,
    Info,
    Security,
} from '@mui/icons-material';
import { systemAPI, type SystemConfigData } from '../../api/courseAPI';

const AdminSettings: React.FC = () => {
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
            setError(err.response?.data?.message || 'Failed to load settings');
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
            setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to save settings', severity: 'error' });
        } finally {
            setSaving(false);
        }
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
                    <Skeleton key={i} variant="rounded" height={180} sx={{ mb: 3, borderRadius: 3 }} />
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
                        <Settings sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                        <Typography variant="h4" fontWeight={700} color="text.primary">Platform Settings</Typography>
                    </Box>
                    <Typography color="text.secondary">
                        Manage platform information, deployment configuration, and general settings.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Save />} onClick={handleSave}
                    disabled={!hasChanges || saving}
                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
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
                    {/* Platform Information */}
                    <Card sx={{ borderRadius: 3, mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <Info sx={{ color: theme.palette.primary.main }} />
                                <Typography variant="h6" fontWeight={700} color="text.primary">Platform Information</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Application Version"
                                    value={config.appVersion}
                                    onChange={(e) => updateField('appVersion', e.target.value)}
                                    helperText="Current version of the SkillForge platform"
                                    InputProps={{
                                        startAdornment: (
                                            <Chip label="v" size="small" sx={{ mr: 1, fontSize: '0.75rem' }} />
                                        ),
                                    }}
                                />

                                {config.updatedAt && (
                                    <Box sx={{
                                        p: 2, borderRadius: 2,
                                        bgcolor: isDark ? 'rgba(167,139,250,0.04)' : 'rgba(124,58,237,0.02)',
                                        border: `1px solid ${theme.palette.divider}`,
                                    }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Last updated: <strong style={{ color: theme.palette.text.primary }}>
                                                {new Date(config.updatedAt).toLocaleString()}
                                            </strong>
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Deployment Configuration */}
                    <Card sx={{ borderRadius: 3, mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <Cloud sx={{ color: theme.palette.secondary.main }} />
                                <Typography variant="h6" fontWeight={700} color="text.primary">Deployment Configuration</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                                        Environment
                                    </Typography>
                                    <Select
                                        fullWidth
                                        value={config.environment}
                                        onChange={(e) => updateField('environment', e.target.value)}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        <MenuItem value="Development">Development</MenuItem>
                                        <MenuItem value="Staging">Staging</MenuItem>
                                        <MenuItem value="Production">Production</MenuItem>
                                    </Select>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                                        Deployment Region
                                    </Typography>
                                    <Select
                                        fullWidth
                                        value={config.region}
                                        onChange={(e) => updateField('region', e.target.value)}
                                        sx={{ borderRadius: 2 }}
                                        startAdornment={<Public sx={{ mr: 1, color: 'text.secondary' }} />}
                                    >
                                        <MenuItem value="us-east-1">US East (N. Virginia)</MenuItem>
                                        <MenuItem value="us-west-2">US West (Oregon)</MenuItem>
                                        <MenuItem value="eu-west-1">Europe (Ireland)</MenuItem>
                                        <MenuItem value="ap-south-1">Asia Pacific (Mumbai)</MenuItem>
                                        <MenuItem value="ap-southeast-1">Asia Pacific (Singapore)</MenuItem>
                                    </Select>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Security & Access */}
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <Security sx={{ color: theme.palette.warning.main }} />
                                <Typography variant="h6" fontWeight={700} color="text.primary">Security & Access</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {[
                                    { label: 'Authentication', value: 'JWT (JSON Web Token)', status: 'Active' },
                                    { label: 'Password Hashing', value: 'BCrypt (10 rounds)', status: 'Active' },
                                    { label: 'CORS Policy', value: 'Strict (whitelisted origins)', status: 'Active' },
                                    { label: 'Session Management', value: 'Stateless', status: 'Active' },
                                ].map((item, i) => (
                                    <React.Fragment key={i}>
                                        <Box sx={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            p: 2, borderRadius: 2,
                                            bgcolor: isDark ? 'rgba(167,139,250,0.04)' : 'rgba(124,58,237,0.02)',
                                        }}>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                                                    {item.label}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">{item.value}</Typography>
                                            </Box>
                                            <Chip label={item.status} size="small" sx={{
                                                bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ecfdf5',
                                                color: theme.palette.success.main, fontWeight: 600,
                                            }} />
                                        </Box>
                                        {i < 3 && <Divider />}
                                    </React.Fragment>
                                ))}
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

export default AdminSettings;
