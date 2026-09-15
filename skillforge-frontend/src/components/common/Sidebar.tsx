import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    Chip,
    useTheme,
    useMediaQuery,
    alpha,
} from '@mui/material';
import {
    Dashboard,
    School,
    Quiz,
    Assessment,
    People,
    Settings,
    Analytics,
    Create,
    Monitor,
    SmartToy,
    TrendingUp,
    PlayLesson,
} from '@mui/icons-material';
import { useAppSelector } from '../../store/store';

export const DRAWER_WIDTH = 280; // slightly wider for premium feel

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    roles: string[];
}

const navItems: NavItem[] = [
    // Learner items
    { label: 'Dashboard', path: '/learner', icon: <Dashboard />, roles: ['LEARNER'] },
    { label: 'Browse Courses', path: '/learner/courses', icon: <School />, roles: ['LEARNER'] },
    { label: 'My Learning', path: '/learner/my-learning', icon: <PlayLesson />, roles: ['LEARNER'] },
    { label: 'Assessments', path: '/learner/assessments', icon: <Quiz />, roles: ['LEARNER'] },
    { label: 'Practice Exams', path: '/learner/practice', icon: <SmartToy />, roles: ['LEARNER'] },
    { label: 'Progress', path: '/learner/progress', icon: <TrendingUp />, roles: ['LEARNER'] },

    // Instructor items
    { label: 'Dashboard', path: '/instructor', icon: <Dashboard />, roles: ['INSTRUCTOR'] },
    { label: 'My Courses', path: '/instructor/courses', icon: <School />, roles: ['INSTRUCTOR'] },
    { label: 'Create Course', path: '/instructor/courses/new', icon: <Create />, roles: ['INSTRUCTOR'] },
    { label: 'Analytics', path: '/instructor/analytics', icon: <Analytics />, roles: ['INSTRUCTOR'] },
    { label: 'Exam Templates', path: '/instructor/exams', icon: <Assessment />, roles: ['INSTRUCTOR'] },

    // Admin items
    { label: 'Dashboard', path: '/admin', icon: <Dashboard />, roles: ['ADMIN'] },
    { label: 'User Management', path: '/admin/users', icon: <People />, roles: ['ADMIN'] },
    { label: 'Course Oversight', path: '/admin/courses', icon: <School />, roles: ['ADMIN'] },
    { label: 'AI Configuration', path: '/admin/ai-config', icon: <SmartToy />, roles: ['ADMIN'] },
    { label: 'System Monitor', path: '/admin/monitor', icon: <Monitor />, roles: ['ADMIN'] },
    { label: 'Settings', path: '/admin/settings', icon: <Settings />, roles: ['ADMIN'] },
];

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);

    const handleNavClick = (path: string) => {
        navigate(path);
        if (isMobile) {
            onClose();
        }
    };

    const filteredItems = navItems.filter(
        (item) => user && item.roles.includes(user.role)
    );

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'error';
            case 'INSTRUCTOR':
                return 'warning';
            default:
                return 'primary';
        }
    };

    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={isMobile ? open : true}
            onClose={onClose}
            ModalProps={{ keepMounted: true }}
            sx={{
                width: isMobile ? 0 : DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    borderRight: `1px solid ${theme.palette.divider}`,
                    pt: '72px', // Below header
                },
            }}
        >
            {user && (
                <Box sx={{ p: 3 }}>
                    <Box
                        sx={{
                            p: 2.5,
                            borderRadius: '16px',
                            background: theme.palette.mode === 'dark'
                                ? `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`
                                : `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha('#fff', 0.8)} 100%)`,
                            border: '1px solid',
                            borderColor: theme.palette.mode === 'dark'
                                ? alpha(theme.palette.primary.light, 0.1)
                                : alpha(theme.palette.primary.main, 0.15),
                            boxShadow: theme.palette.mode === 'dark'
                                ? `0 8px 24px ${alpha('#000', 0.2)}`
                                : `0 8px 24px ${alpha(theme.palette.primary.main, 0.05)}`,
                            backdropFilter: 'blur(10px)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Decorative background glow */}
                        <Box sx={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: alpha(theme.palette.primary.main, 0.2),
                            filter: 'blur(20px)'
                        }} />

                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom sx={{ letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            Welcome back
                        </Typography>
                        <Typography variant="body1" fontWeight={800} color="text.primary" sx={{ mb: 1.5, letterSpacing: '-0.02em', fontSize: '1.1rem' }}>
                            {user.firstName} {user.lastName}
                        </Typography>
                        <Chip
                            label={user.role}
                            size="small"
                            color={getRoleColor(user.role)}
                            sx={{ fontWeight: 700, fontSize: '0.7rem', height: 24, letterSpacing: '0.05em' }}
                        />
                    </Box>
                </Box>
            )}

            <List sx={{ px: 2, py: 1 }}>
                <Typography variant="overline" color="text.secondary" sx={{ px: 2, mb: 1, display: 'block', fontWeight: 700, letterSpacing: '0.1em' }}>
                    Menu
                </Typography>
                {filteredItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 0.8 }}>
                            <ListItemButton
                                onClick={() => handleNavClick(item.path)}
                                sx={{
                                    borderRadius: '12px',
                                    py: 1.2,
                                    px: 2,
                                    position: 'relative',
                                    backgroundColor: isActive
                                        ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)
                                        : 'transparent',
                                    color: isActive
                                        ? theme.palette.primary.main
                                        : theme.palette.text.secondary,
                                    '&:hover': {
                                        backgroundColor: isActive
                                            ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.15)
                                            : alpha(theme.palette.text.primary, 0.04),
                                        color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                                        '& .MuiListItemIcon-root': {
                                            color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                                        }
                                    },
                                }}
                            >
                                {isActive && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            left: 0,
                                            top: '10%',
                                            bottom: '10%',
                                            width: 4,
                                            borderRadius: '0 4px 4px 0',
                                            backgroundColor: theme.palette.primary.main,
                                            boxShadow: `0 0 10px ${theme.palette.primary.main}`
                                        }}
                                    />
                                )}
                                <ListItemIcon
                                    sx={{
                                        minWidth: 44,
                                        color: 'inherit',
                                        transition: 'color 0.2s',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 700 : 600,
                                        fontSize: '0.9rem',
                                        letterSpacing: '0.01em',
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Drawer>
    );
};

export default Sidebar;
