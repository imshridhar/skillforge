import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Link,
    InputAdornment,
    IconButton,
    Alert,
    Divider,
    useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/store';
import { login, clearError } from '../features/auth';

const Login: React.FC = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error } = useAppSelector((state) => state.auth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(clearError());
        const result = await dispatch(login({ email, password }));
        if (login.fulfilled.match(result)) {
            const user = result.payload.user;
            const redirectMap: Record<string, string> = {
                LEARNER: '/learner',
                INSTRUCTOR: '/instructor',
                ADMIN: '/admin',
            };
            navigate(redirectMap[user.role]);
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
            {/* Animated background elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                    opacity: 0.1,
                    filter: 'blur(80px)',
                    animation: 'float 6s ease-in-out infinite',
                    '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-20px)' },
                    },
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '10%',
                    width: 250,
                    height: 250,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                    opacity: 0.1,
                    filter: 'blur(80px)',
                    animation: 'float 6s ease-in-out infinite',
                    animationDelay: '3s',
                }}
            />

            <Card
                sx={{
                    maxWidth: 440,
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
                    {/* Logo and Title */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
                            }}
                        >
                            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                                S
                            </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sign in to continue your learning journey
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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

                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            sx={{ mb: 1.5 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Link
                                component={RouterLink}
                                to="/forgot-password"
                                sx={{ fontWeight: 600, color: 'primary.main', fontSize: 13 }}
                            >
                                Forgot password?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            sx={{ mb: 2, py: 1.5 }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <Divider sx={{ my: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                            or
                        </Typography>
                    </Divider>

                    <Typography variant="body2" align="center" color="text.secondary">
                        Don't have an account?{' '}
                        <Link
                            component={RouterLink}
                            to="/register"
                            sx={{ fontWeight: 600, color: 'primary.main' }}
                        >
                            Sign up for free
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Login;
