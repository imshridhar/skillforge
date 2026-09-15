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
    Stepper,
    Step,
    StepLabel,
    ToggleButtonGroup,
    ToggleButton,
    LinearProgress,
    useTheme,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email,
    Lock,
    Person,
    School,
    MenuBook,
    ArrowBack,
    ArrowForward,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/store';
import { register, clearError } from '../features/auth';

const steps = ['Account', 'Role', 'Profile'];

const Register: React.FC = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error } = useAppSelector((state) => state.auth);

    const [activeStep, setActiveStep] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<'LEARNER' | 'INSTRUCTOR'>('LEARNER');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [formError, setFormError] = useState('');

    const getPasswordStrength = () => {
        if (password.length === 0) return 0;
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9!@#$%^&*]/.test(password)) strength += 25;
        return strength;
    };

    const getStrengthColor = () => {
        const strength = getPasswordStrength();
        if (strength <= 25) return 'error';
        if (strength <= 50) return 'warning';
        if (strength <= 75) return 'info';
        return 'success';
    };

    const handleNext = () => {
        setFormError('');
        dispatch(clearError());

        if (activeStep === 0) {
            if (!email || !password || !confirmPassword) {
                setFormError('Please fill in all fields');
                return;
            }
            if (password !== confirmPassword) {
                setFormError('Passwords do not match');
                return;
            }
            if (password.length < 6) {
                setFormError('Password must be at least 6 characters');
                return;
            }
        }

        if (activeStep === 2) {
            if (!firstName || !lastName) {
                setFormError('Please fill in your name');
                return;
            }
            handleSubmit();
            return;
        }

        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        const result = await dispatch(
            register({ email, password, firstName, lastName, role })
        );
        if (register.fulfilled.match(result)) {
            navigate(role === 'INSTRUCTOR' ? '/instructor' : '/learner');
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
            {/* Background elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '15%',
                    right: '15%',
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    opacity: 0.1,
                    filter: 'blur(80px)',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '15%',
                    left: '15%',
                    width: 250,
                    height: 250,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                    opacity: 0.1,
                    filter: 'blur(80px)',
                }}
            />

            <Card
                sx={{
                    maxWidth: 500,
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
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                            }}
                        >
                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                                S
                            </Typography>
                        </Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            Create Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Start your personalized learning journey
                        </Typography>
                    </Box>

                    {/* Stepper */}
                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {(error || formError) && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error || formError}
                        </Alert>
                    )}

                    {/* Step 1: Account */}
                    {activeStep === 0 && (
                        <Box>
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
                                sx={{ mb: 1 }}
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

                            {password && (
                                <Box sx={{ mb: 2.5 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={getPasswordStrength()}
                                        color={getStrengthColor()}
                                        sx={{ height: 6, borderRadius: 3 }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        Password strength: {getPasswordStrength()}%
                                    </Typography>
                                </Box>
                            )}

                            <TextField
                                fullWidth
                                label="Confirm Password"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                sx={{ mb: 3 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    )}

                    {/* Step 2: Role Selection */}
                    {activeStep === 1 && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                How will you use SkillForge?
                            </Typography>

                            <ToggleButtonGroup
                                value={role}
                                exclusive
                                onChange={(_, value) => value && setRole(value)}
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    mb: 3,
                                    '& .MuiToggleButton-root': {
                                        flex: 1,
                                        py: 3,
                                        px: 3,
                                        borderRadius: '12px !important',
                                        border: '2px solid',
                                        borderColor: 'divider',
                                        '&.Mui-selected': {
                                            borderColor: 'primary.main',
                                            backgroundColor: 'rgba(99, 102, 241, 0.08)',
                                        },
                                    },
                                }}
                            >
                                <ToggleButton value="LEARNER">
                                    <Box sx={{ textAlign: 'center' }}>
                                        <School sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                                        <Typography variant="subtitle2" display="block">
                                            Learner
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            I want to learn new skills
                                        </Typography>
                                    </Box>
                                </ToggleButton>
                                <ToggleButton value="INSTRUCTOR">
                                    <Box sx={{ textAlign: 'center' }}>
                                        <MenuBook sx={{ fontSize: 40, mb: 1, color: 'secondary.main' }} />
                                        <Typography variant="subtitle2" display="block">
                                            Instructor
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            I want to create courses
                                        </Typography>
                                    </Box>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    )}

                    {/* Step 3: Profile */}
                    {activeStep === 2 && (
                        <Box>
                            <TextField
                                fullWidth
                                label="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                sx={{ mb: 2.5 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                sx={{ mb: 3 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    )}

                    {/* Navigation Buttons */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {activeStep > 0 && (
                            <Button
                                variant="outlined"
                                onClick={handleBack}
                                startIcon={<ArrowBack />}
                                sx={{ flex: 1 }}
                            >
                                Back
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            endIcon={activeStep < 2 ? <ArrowForward /> : null}
                            disabled={loading}
                            sx={{ flex: 1 }}
                        >
                            {activeStep === 2
                                ? loading
                                    ? 'Creating...'
                                    : 'Create Account'
                                : 'Continue'}
                        </Button>
                    </Box>

                    <Typography
                        variant="body2"
                        align="center"
                        color="text.secondary"
                        sx={{ mt: 3 }}
                    >
                        Already have an account?{' '}
                        <Link
                            component={RouterLink}
                            to="/login"
                            sx={{ fontWeight: 600, color: 'primary.main' }}
                        >
                            Sign in
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Register;
