import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="sm">
                    <Box
                        sx={{
                            minHeight: '100vh',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            py: 4,
                        }}
                    >
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                backgroundColor: 'error.lighter',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 3,
                            }}
                        >
                            <ErrorOutline sx={{ fontSize: 40, color: 'error.main' }} />
                        </Box>

                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Oops! Something went wrong
                        </Typography>

                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
                            We're sorry, but something unexpected happened. Please try refreshing the page
                            or contact support if the problem persists.
                        </Typography>

                        {this.state.error && (
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    backgroundColor: 'action.hover',
                                    mb: 3,
                                    maxWidth: '100%',
                                    overflow: 'auto',
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    component="pre"
                                    sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
                                >
                                    {this.state.error.message}
                                </Typography>
                            </Box>
                        )}

                        <Button
                            variant="contained"
                            startIcon={<Refresh />}
                            onClick={this.handleRetry}
                            size="large"
                        >
                            Try Again
                        </Button>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
