import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setUser } from '../features/auth/authSlice';
import { userAPI, type UserProfile } from '../api/courseAPI';

const ProfilePage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [form, setForm] = useState({ firstName: '', lastName: '', profilePictureUrl: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await userAPI.getProfile();
                setProfile(data);
                setForm({
                    firstName: data.firstName ?? '',
                    lastName: data.lastName ?? '',
                    profilePictureUrl: data.profilePictureUrl ?? '',
                });
            } catch (loadError: any) {
                setError(loadError.response?.data?.message || 'Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);
            const updated = await userAPI.updateProfile(form);
            setProfile(updated);
            dispatch(setUser({
                ...(user || updated),
                ...updated,
            }));
            setSuccess('Profile updated successfully.');
        } catch (saveError: any) {
            setError(saveError.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Loading profile...</Typography>
            </Box>
        );
    }

    if (!profile) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">{error || 'Profile not available.'}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
                Profile
            </Typography>

            {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
            {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

            <Card sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <TextField
                            label="First Name"
                            value={form.firstName}
                            onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="Last Name"
                            value={form.lastName}
                            onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="Profile Picture URL"
                            value={form.profilePictureUrl}
                            onChange={(event) => setForm((current) => ({ ...current, profilePictureUrl: event.target.value }))}
                            fullWidth
                        />
                        <TextField label="Email" value={profile.email} fullWidth disabled />
                        <TextField label="Role" value={profile.role} fullWidth disabled />
                        <Button variant="contained" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ProfilePage;
