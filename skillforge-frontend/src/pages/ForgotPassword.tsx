import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import { ContentCopy, Email } from '@mui/icons-material';
import { authAPI } from '../features/auth/authAPI';

const ForgotPassword: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [resetToken, setResetToken] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        setResetToken(null);
        setExpiresAt(null);

        try {
            setLoading(true);
            const response = await authAPI.requestPasswordReset(email);
            setMessage(response.message);
            if (response.resetToken) {
                setResetToken(response.resetToken);
            }
            if (response.expiresAt) {
                setExpiresAt(response.expiresAt);
            }
        } catch (requestError: any) {
            setError(requestError.response?.data?.message || requestError.message || 'Failed to request reset.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!resetToken) {
            return;
        }
        try {
            await navigator.clipboard.writeText(resetToken);
            setMessage('Reset token copied to clipboard.');
        } catch {
            setMessage('Unable to copy token. Please copy it manually.');
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
                            Forgot password
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Enter your email to receive a reset token. Use the token to set a new password.
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
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            sx={{ mb: 2.5 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email sx={{ color: 'text.secondary' }} />
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
                            {loading ? 'Sending...' : 'Send reset token'}
                        </Button>
                    </form>

                    {resetToken ? (
                        <Box sx={{ mt: 2.5 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                Development reset token
                            </Typography>
                            <TextField
                                fullWidth
                                value={resetToken}
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleCopy} edge="end" aria-label="Copy reset token">
                                                <ContentCopy />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            {expiresAt ? (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Expires at: {new Date(expiresAt).toLocaleString()}
                                </Typography>
                            ) : null}
                            <Button
                                variant="outlined"
                                fullWidth
                                sx={{ mt: 2 }}
                                onClick={() => navigate(`/reset-password?token=${resetToken}`)}
                            >
                                Continue to reset
                            </Button>
                        </Box>
                    ) : null}

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="body2" align="center" color="text.secondary">
                        Remembered your password?{' '}
                        <Link component={RouterLink} to="/login" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            Back to login
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ForgotPassword;
