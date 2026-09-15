import React, { useEffect, useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Avatar,
    Menu,
    MenuItem,
    Tooltip,
    Badge,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Brightness4,
    Brightness7,
    Notifications,
    Logout,
    Person,
    Menu as MenuIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { logout } from '../../features/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { notificationAPI } from '../../api/courseAPI';

interface HeaderProps {
    darkMode: boolean;
    onToggleTheme: () => void;
    onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, onToggleTheme, onToggleSidebar }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAppSelector((state) => state.auth);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        const loadCount = async () => {
            try {
                const response = await notificationAPI.getUnreadCount();
                setUnreadCount(Number(response.count) || 0);
            } catch {
                setUnreadCount(0);
            }
        };

        void loadCount();
    }, [user, location.pathname]);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        handleClose();
    };

    const handleProfile = () => {
        navigate('/profile');
        handleClose();
    };

    return (
        <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                {isMobile && user && (
                    <IconButton
                        color="inherit"
                        aria-label="open sidebar"
                        edge="start"
                        onClick={onToggleSidebar}
                        sx={{ mr: 1.5, backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.02)' }
                    }}
                    onClick={() => navigate('/')}
                >
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, letterSpacing: '-0.05em' }}>
                            S
                        </Typography>
                    </Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        SkillForge
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                    <IconButton onClick={onToggleTheme} color="inherit" sx={{ mr: 1, backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                        {darkMode ? (
                            <Brightness7 sx={{ color: '#FBBF24' }} />
                        ) : (
                            <Brightness4 sx={{ color: '#4F46E5' }} />
                        )}
                    </IconButton>
                </Tooltip>

                {user && (
                    <>
                        <Tooltip title="Notifications">
                            <IconButton
                                color="inherit"
                                onClick={() => navigate('/notifications')}
                                sx={{ mr: 2, backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                            >
                                <Badge badgeContent={unreadCount} color="error">
                                    <Notifications sx={{ color: darkMode ? '#A5B4FC' : '#475569' }} />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Account settings">
                            <IconButton onClick={handleMenu} sx={{ p: 0, border: '2px solid transparent', transition: 'border 0.2s', '&:hover': { borderColor: '#6366F1' } }}>
                                <Avatar
                                    src={user.profilePictureUrl}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
                                        boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
                                    }}
                                >
                                    {user.firstName?.[0]}
                                    {user.lastName?.[0]}
                                </Avatar>
                            </IconButton>
                        </Tooltip>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    mt: 1.5,
                                    minWidth: 200,
                                    borderRadius: 3,
                                    backdropFilter: 'blur(20px)',
                                    backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
                                },
                            }}
                        >
                            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                    {user.firstName} {user.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    {user.role}
                                </Typography>
                            </Box>
                            <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                                <Person sx={{ mr: 1.5, fontSize: 20, color: theme.palette.primary.main }} /> Profile
                            </MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: theme.palette.error.main }}>
                                <Logout sx={{ mr: 1.5, fontSize: 20 }} /> Logout
                            </MenuItem>
                        </Menu>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
