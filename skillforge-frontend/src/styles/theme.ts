import { createTheme, alpha } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

// Premium Color Palette — Nebula & Glass
const primaryMain = '#6366F1';   // Vibrant Indigo
const primaryLight = '#A5B4FC';
const primaryDark = '#4F46E5';

const secondaryMain = '#06B6D4'; // Electric Cyan
const secondaryLight = '#67E8F9';
const secondaryDark = '#0891B2';

const successMain = '#10B981';   // Emerald
const warningMain = '#F59E0B';   // Amber
const errorMain = '#EF4444';     // Crimson
const infoMain = '#3B82F6';      // Azure

// Typography & Shape base
const baseThemeOptions: ThemeOptions = {
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 800, fontSize: '2.75rem', lineHeight: 1.15, letterSpacing: '-0.03em' },
        h2: { fontWeight: 800, fontSize: '2.25rem', lineHeight: 1.2, letterSpacing: '-0.02em' },
        h3: { fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.3, letterSpacing: '-0.01em' },
        h4: { fontWeight: 700, fontSize: '1.4rem', lineHeight: 1.4, letterSpacing: '-0.01em' },
        h5: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.5 },
        h6: { fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.5, letterSpacing: '0.01em' },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' },
        body1: { fontSize: '1rem', lineHeight: 1.6, letterSpacing: '0.01em' },
        body2: { fontSize: '0.875rem', lineHeight: 1.57, letterSpacing: '0.01em' },
    },
    shape: { borderRadius: 16 },
};

// ============================================
// LIGHT THEME (Off-White & Glass)
// ============================================
export const lightTheme = createTheme({
    ...baseThemeOptions,
    palette: {
        mode: 'light',
        primary: { main: primaryMain, light: primaryLight, dark: primaryDark, contrastText: '#ffffff' },
        secondary: { main: secondaryMain, light: secondaryLight, dark: secondaryDark, contrastText: '#ffffff' },
        success: { main: successMain },
        warning: { main: warningMain },
        error: { main: errorMain },
        info: { main: infoMain },
        background: {
            default: '#ECF4E5',
            paper: 'rgba(255, 255, 255, 0.85)', // Glassmorphism Paper
        },
        text: {
            primary: '#0F172A',
            secondary: '#475569',
        },
        divider: 'rgba(99, 102, 241, 0.1)',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: 'linear-gradient(135deg, #ECF4E5 0%, #E0EDDA 100%)',
                    backgroundAttachment: 'fixed',
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(12px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: '0 8px 32px rgba(15, 23, 42, 0.04), 0 2px 8px rgba(15, 23, 42, 0.02)',
                    transition: 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1), box-shadow 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(99, 102, 241, 0.08), 0 4px 12px rgba(15, 23, 42, 0.04)',
                    }
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(16px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
                    color: '#0F172A',
                }
            }
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backdropFilter: 'blur(16px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.5)',
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '10px 24px',
                    transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                },
                containedPrimary: {
                    background: `linear-gradient(135deg, ${primaryMain} 0%, ${secondaryMain} 100%)`,
                    boxShadow: `0 8px 20px ${alpha(primaryMain, 0.3)}`,
                    border: 'none',
                    '&:hover': {
                        background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`,
                        boxShadow: `0 12px 28px ${alpha(primaryMain, 0.4)}`,
                        transform: 'translateY(-2px)',
                    },
                },
                outlinedPrimary: {
                    borderWidth: '2px',
                    borderColor: primaryMain,
                    '&:hover': {
                        borderWidth: '2px',
                        backgroundColor: alpha(primaryMain, 0.05),
                        borderColor: primaryDark,
                    }
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600, borderRadius: 8 },
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        backgroundColor: 'rgba(248, 250, 252, 0.5)',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.2s',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: '#fff',
                            boxShadow: `0 0 0 3px ${alpha(primaryMain, 0.15)}`,
                        }
                    },
                },
            },
        },
    },
});

// ============================================
// DARK THEME (Nebula & Glass)
// ============================================
export const darkTheme = createTheme({
    ...baseThemeOptions,
    palette: {
        mode: 'dark',
        primary: { main: primaryLight, light: '#C7D2FE', dark: primaryMain, contrastText: '#0B0F19' },
        secondary: { main: secondaryLight, light: '#A5F3FC', dark: secondaryMain, contrastText: '#0B0F19' },
        success: { main: '#34D399' },
        warning: { main: '#FBBF24' },
        error: { main: '#F87171' },
        info: { main: '#60A5FA' },
        background: {
            default: '#0B0F19',
            paper: 'rgba(15, 23, 42, 0.65)', // Glassmorphism dark paper
        },
        text: {
            primary: '#F8FAFC',
            secondary: '#94A3B8',
        },
        divider: 'rgba(148, 163, 184, 0.15)',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: 'radial-gradient(circle at top right, #1E1B4B 0%, #0B0F19 40%, #020617 100%)',
                    backgroundAttachment: 'fixed',
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(16px)',
                    backgroundColor: 'rgba(15, 23, 42, 0.55)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                    transition: 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1), box-shadow 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                    }
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(20px)',
                    backgroundColor: 'rgba(11, 15, 25, 0.7)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }
            }
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backdropFilter: 'blur(20px)',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '10px 24px',
                    transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                },
                containedPrimary: {
                    background: `linear-gradient(135deg, ${primaryMain} 0%, ${secondaryMain} 100%)`,
                    color: '#ffffff',
                    boxShadow: `0 8px 20px ${alpha(primaryMain, 0.4)}`,
                    border: 'none',
                    '&:hover': {
                        background: `linear-gradient(135deg, ${primaryLight} 0%, ${primaryMain} 100%)`,
                        boxShadow: `0 12px 28px ${alpha(primaryLight, 0.5)}`,
                        transform: 'translateY(-2px)',
                    },
                },
                outlinedPrimary: {
                    borderWidth: '2px',
                    borderColor: alpha(primaryLight, 0.5),
                    color: primaryLight,
                    '&:hover': {
                        borderWidth: '2px',
                        backgroundColor: alpha(primaryLight, 0.1),
                        borderColor: primaryLight,
                    }
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600, borderRadius: 8 },
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        backgroundColor: 'rgba(15, 23, 42, 0.4)',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.2s',
                        '&:hover': {
                            backgroundColor: 'rgba(30, 41, 59, 0.6)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                            boxShadow: `0 0 0 3px ${alpha(primaryMain, 0.25)}`,
                        }
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
                },
            },
        },
    },
});
