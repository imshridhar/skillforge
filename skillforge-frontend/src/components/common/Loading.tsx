import React from 'react';
import { Box, Skeleton, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
    variant?: 'spinner' | 'skeleton' | 'page';
    message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ variant = 'spinner', message }) => {
    if (variant === 'page') {
        return (
            <Box
                sx={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                            '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                            '50%': { transform: 'scale(1.05)', opacity: 0.8 },
                        },
                    }}
                >
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                        S
                    </Typography>
                </Box>
                <CircularProgress size={24} thickness={4} sx={{ color: '#6366f1' }} />
                {message && (
                    <Typography variant="body2" color="text.secondary">
                        {message}
                    </Typography>
                )}
            </Box>
        );
    }

    if (variant === 'skeleton') {
        return (
            <Box sx={{ width: '100%' }}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 2 }} />
                <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
                <Skeleton variant="text" sx={{ width: '60%' }} />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Skeleton variant="rectangular" height={120} sx={{ flex: 1, borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={120} sx={{ flex: 1, borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={120} sx={{ flex: 1, borderRadius: 2 }} />
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
                gap: 1,
            }}
        >
            <CircularProgress size={32} thickness={4} sx={{ color: '#6366f1' }} />
            {message && (
                <Typography variant="body2" color="text.secondary">
                    {message}
                </Typography>
            )}
        </Box>
    );
};

export default Loading;
