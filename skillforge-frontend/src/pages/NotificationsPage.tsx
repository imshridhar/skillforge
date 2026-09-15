import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from '@mui/material';
import { notificationAPI, type NotificationItem } from '../api/courseAPI';

const severityMap: Record<string, { label: string; color: 'default' | 'info' | 'warning' | 'success' | 'error' }> = {
    INFO: { label: 'Info', color: 'info' },
    WARNING: { label: 'Warning', color: 'warning' },
    SUCCESS: { label: 'Success', color: 'success' },
    ERROR: { label: 'Error', color: 'error' },
};

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await notificationAPI.getNotifications();
                setNotifications(data);
            } catch (loadError: any) {
                setError(loadError.response?.data?.message || 'Failed to load notifications.');
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllRead();
            setNotifications((current) =>
                current.map((notification) => ({ ...notification, isRead: true }))
            );
        } catch (markError: any) {
            setError(markError.response?.data?.message || 'Failed to mark all as read.');
        }
    };

    const handleMarkRead = async (notificationId: string) => {
        try {
            const updated = await notificationAPI.markRead(notificationId);
            setNotifications((current) =>
                current.map((notification) =>
                    notification.notificationId === notificationId ? updated : notification
                )
            );
        } catch (markError: any) {
            setError(markError.response?.data?.message || 'Failed to mark notification as read.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Loading notifications...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight={800}>
                    Notifications
                </Typography>
                <Button variant="outlined" onClick={handleMarkAllRead}>
                    Mark All as Read
                </Button>
            </Stack>

            {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

            {notifications.length === 0 ? (
                <Alert severity="info">No notifications right now.</Alert>
            ) : (
                <Stack spacing={2}>
                    {notifications.map((notification) => {
                        const severity = severityMap[notification.severity] || severityMap.INFO;
                        return (
                            <Card key={notification.notificationId} sx={{ borderRadius: 3 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                                        <Box>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                <Typography variant="h6" fontWeight={700}>
                                                    {notification.title}
                                                </Typography>
                                                <Chip label={severity.label} color={severity.color} size="small" />
                                                {!notification.isRead ? <Chip label="New" size="small" color="primary" /> : null}
                                            </Stack>
                                            <Typography color="text.secondary" sx={{ mb: 1 }}>
                                                {notification.message || 'No additional details.'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </Typography>
                                        </Box>
                                        {!notification.isRead ? (
                                            <Button variant="contained" onClick={() => handleMarkRead(notification.notificationId)}>
                                                Mark Read
                                            </Button>
                                        ) : null}
                                    </Stack>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
};

export default NotificationsPage;
