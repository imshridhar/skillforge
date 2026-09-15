import React, { useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    IconButton,
    InputAdornment,
    Link,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { authAPI } from '../features/auth/authAPI';

const ResetPassword: React.FC = () => {
    const theme = useTheme();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(searchParams.get('token') ?? '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        if (!token.trim()) {
            setError('Reset token is required.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            setLoading(true);
            const response = await authAPI.resetPassword(token.trim(), newPassword);
            setMessage(response.message || 'Password reset successful.');
            setNewPassword('');
            setConfirmPassword('');
        } catch (resetError: any) {
            setError(resetError.response?.data?.message || resetError.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
                        : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f8fafc 100%)',
                p: 2,
            }}
        >
            <Card
                sx={{
                    maxWidth: 520,
                    width: '100%',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow:
                        theme.palette.mode === 'dark'
                            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={1} sx={{ mb: 3 }}>
                        <Typography variant="h4" fontWeight={700}>
                            Reset password
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Enter your reset token and choose a new password.
                        </Typography>
                    </Stack>

                    {error ? (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    ) : null}

                    {message ? (
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                            {message}
                        </Alert>
                    ) : null}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Reset Token"
                            value={token}
                            onChange={(event) => setToken(event.target.value)}
                            required
                            sx={{ mb: 2.5 }}
                        />

                        <TextField
                            fullWidth
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            required
                            sx={{ mb: 2.5 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Confirm Password"
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end">
                                            {showConfirm ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            sx={{ mb: 2, py: 1.5 }}
                        >
                            {loading ? 'Resetting...' : 'Reset password'}
                        </Button>
                    </form>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="body2" align="center" color="text.secondary">
                        Back to{' '}
                        <Link component={RouterLink} to="/login" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            login
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ResetPassword;
