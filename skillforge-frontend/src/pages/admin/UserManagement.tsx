import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Avatar,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Menu,
    Alert,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Snackbar,
    Switch,
    FormControlLabel,
    Divider,
} from '@mui/material';
import {
    Search,
    MoreVert,
    PersonOff,
    VerifiedUser,
    Delete,
    People,
    School,
    AdminPanelSettings,
    PersonAdd,
    Visibility,
    Edit,
} from '@mui/icons-material';
import { adminAPI } from '../../api/courseAPI';

interface User {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'INSTRUCTOR' | 'LEARNER';
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
}

const roleColors: Record<string, string> = {
    ADMIN: '#ef4444',
    INSTRUCTOR: '#f59e0b',
    LEARNER: '#10b981',
};

const roleIcons: Record<string, React.ReactElement> = {
    ADMIN: <AdminPanelSettings fontSize="small" />,
    INSTRUCTOR: <School fontSize="small" />,
    LEARNER: <People fontSize="small" />,
};

const emptyCreateForm = { email: '', password: '', firstName: '', lastName: '', role: 'LEARNER' as string };
const emptyEditForm = { firstName: '', lastName: '', role: 'LEARNER' as string, isActive: true, isVerified: false };

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form states
    const [createForm, setCreateForm] = useState(emptyCreateForm);
    const [editForm, setEditForm] = useState(emptyEditForm);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getUsers();
            setUsers(data);
            setError(null);
        } catch (err: any) {
            setError('Failed to load users');
            setUsers([
                { userId: '1', email: 'admin@skillforge.com', firstName: 'Admin', lastName: 'User', role: 'ADMIN', isActive: true, isVerified: true, createdAt: new Date().toISOString() },
                { userId: '2', email: 'instructor@skillforge.com', firstName: 'Shridhar', lastName: 'Havinal', role: 'INSTRUCTOR', isActive: true, isVerified: true, createdAt: new Date().toISOString() },
                { userId: '3', email: 'learner@skillforge.com', firstName: 'Spoorti', lastName: 'Arakeri', role: 'LEARNER', isActive: true, isVerified: true, createdAt: new Date().toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // ─── Create User ──────────────────────────────────────────────────
    const handleOpenCreate = () => {
        setCreateForm(emptyCreateForm);
        setCreateDialogOpen(true);
    };

    const handleCreateUser = async () => {
        if (!createForm.email || !createForm.password || !createForm.firstName || !createForm.lastName) {
            setSnackbar({ open: true, message: 'Please fill all fields', severity: 'error' });
            return;
        }
        try {
            setSaving(true);
            await adminAPI.createUser(createForm);
            setSnackbar({ open: true, message: 'User created successfully!', severity: 'success' });
            setCreateDialogOpen(false);
            fetchUsers();
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to create user';
            setSnackbar({ open: true, message: msg, severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // ─── View User ────────────────────────────────────────────────────
    const handleOpenView = () => {
        setViewDialogOpen(true);
        handleMenuClose();
    };

    // ─── Edit User ────────────────────────────────────────────────────
    const handleOpenEdit = () => {
        if (selectedUser) {
            setEditForm({
                firstName: selectedUser.firstName,
                lastName: selectedUser.lastName,
                role: selectedUser.role,
                isActive: selectedUser.isActive,
                isVerified: selectedUser.isVerified,
            });
        }
        setEditDialogOpen(true);
        handleMenuClose();
    };

    const handleSaveEdit = async () => {
        if (!selectedUser) return;
        try {
            setSaving(true);
            await adminAPI.updateUser(selectedUser.userId, editForm);
            setSnackbar({ open: true, message: 'User updated successfully!', severity: 'success' });
            setEditDialogOpen(false);
            fetchUsers();
        } catch {
            setSnackbar({ open: true, message: 'Failed to update user', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // ─── Toggle Status ────────────────────────────────────────────────
    const handleUpdateStatus = async () => {
        if (!selectedUser) return;
        try {
            await adminAPI.updateUserStatus(
                selectedUser.userId,
                !selectedUser.isActive,
                selectedUser.isVerified
            );
            setUsers((prev) =>
                prev.map((u) =>
                    u.userId === selectedUser.userId ? { ...u, isActive: !u.isActive } : u
                )
            );
            setSnackbar({ open: true, message: 'User status updated!', severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: 'Failed to update user', severity: 'error' });
        }
        setStatusDialogOpen(false);
        handleMenuClose();
    };

    // ─── Delete ───────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!selectedUser) return;
        try {
            await adminAPI.deleteUser(selectedUser.userId);
            setUsers((prev) => prev.filter((u) => u.userId !== selectedUser.userId));
            setSnackbar({ open: true, message: 'User deleted!', severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' });
        }
        setDeleteDialogOpen(false);
        handleMenuClose();
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        admins: users.filter((u) => u.role === 'ADMIN').length,
        instructors: users.filter((u) => u.role === 'INSTRUCTOR').length,
        learners: users.filter((u) => u.role === 'LEARNER').length,
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        User Management 👥
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage user accounts, roles, and permissions
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={handleOpenCreate}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                    Create User
                </Button>
            </Box>

            {error && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {error} - Showing demo data
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" fontWeight={700}>
                                {stats.total}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Users
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                    <Card sx={{ borderLeft: `4px solid ${roleColors.ADMIN}` }}>
                        <CardContent>
                            <Typography variant="h4" fontWeight={700} color="error">
                                {stats.admins}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Admins
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                    <Card sx={{ borderLeft: `4px solid ${roleColors.INSTRUCTOR}` }}>
                        <CardContent>
                            <Typography variant="h4" fontWeight={700} sx={{ color: '#f59e0b' }}>
                                {stats.instructors}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Instructors
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                    <Card sx={{ borderLeft: `4px solid ${roleColors.LEARNER}` }}>
                        <CardContent>
                            <Typography variant="h4" fontWeight={700} sx={{ color: '#10b981' }}>
                                {stats.learners}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Learners
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ flexGrow: 1, maxWidth: 400 }}
                />
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Role</InputLabel>
                    <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
                        <MenuItem value="ALL">All Roles</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                        <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
                        <MenuItem value="LEARNER">Learner</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Users Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Verified</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton width={80} /></TableCell>
                                    <TableCell><Skeleton width={60} /></TableCell>
                                    <TableCell><Skeleton width={60} /></TableCell>
                                    <TableCell><Skeleton width={40} /></TableCell>
                                </TableRow>
                            ))
                            : filteredUsers.map((user) => (
                                <TableRow key={user.userId} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: roleColors[user.role] }}>
                                                {user.firstName[0]}{user.lastName[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {user.firstName} {user.lastName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={roleIcons[user.role]}
                                            label={user.role}
                                            size="small"
                                            sx={{
                                                backgroundColor: `${roleColors[user.role]}20`,
                                                color: roleColors[user.role],
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.isActive ? 'Active' : 'Inactive'}
                                            size="small"
                                            color={user.isActive ? 'success' : 'default'}
                                            variant={user.isActive ? 'filled' : 'outlined'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {user.isVerified ? (
                                            <VerifiedUser color="primary" fontSize="small" />
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">
                                                Pending
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                                            <MoreVert />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ── Actions Menu ── */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleOpenView}>
                    <Visibility sx={{ mr: 1, fontSize: 20 }} /> View Details
                </MenuItem>
                <MenuItem onClick={handleOpenEdit}>
                    <Edit sx={{ mr: 1, fontSize: 20 }} /> Edit User
                </MenuItem>
                <MenuItem onClick={() => { setStatusDialogOpen(true); handleMenuClose(); }}>
                    <PersonOff sx={{ mr: 1, fontSize: 20 }} />
                    {selectedUser?.isActive ? 'Deactivate' : 'Activate'}
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { setDeleteDialogOpen(true); handleMenuClose(); }} sx={{ color: 'error.main' }}>
                    <Delete sx={{ mr: 1, fontSize: 20 }} /> Delete
                </MenuItem>
            </Menu>

            {/* ══════════════════════════════════════════════════════════════
                CREATE USER DIALOG
               ══════════════════════════════════════════════════════════════ */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Create New User</DialogTitle>
                <DialogContent sx={{ pt: '16px !important' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            label="Email Address"
                            type="email"
                            value={createForm.email}
                            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={createForm.password}
                            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                            fullWidth
                            required
                            helperText="Minimum 6 characters"
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="First Name"
                                value={createForm.firstName}
                                onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Last Name"
                                value={createForm.lastName}
                                onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                                fullWidth
                                required
                            />
                        </Box>
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={createForm.role}
                                label="Role"
                                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                            >
                                <MenuItem value="LEARNER">Learner</MenuItem>
                                <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
                                <MenuItem value="ADMIN">Admin</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateUser} variant="contained" disabled={saving}>
                        {saving ? 'Creating...' : 'Create User'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ══════════════════════════════════════════════════════════════
                VIEW USER DIALOG
               ══════════════════════════════════════════════════════════════ */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>User Details</DialogTitle>
                {selectedUser && (
                    <DialogContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Avatar
                                sx={{
                                    bgcolor: roleColors[selectedUser.role],
                                    width: 56,
                                    height: 56,
                                    fontSize: 20,
                                    fontWeight: 700,
                                }}
                            >
                                {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedUser.email}
                                </Typography>
                            </Box>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <DetailRow label="User ID" value={selectedUser.userId} />
                            <DetailRow label="Role">
                                <Chip
                                    icon={roleIcons[selectedUser.role]}
                                    label={selectedUser.role}
                                    size="small"
                                    sx={{
                                        backgroundColor: `${roleColors[selectedUser.role]}20`,
                                        color: roleColors[selectedUser.role],
                                    }}
                                />
                            </DetailRow>
                            <DetailRow label="Status">
                                <Chip
                                    label={selectedUser.isActive ? 'Active' : 'Inactive'}
                                    size="small"
                                    color={selectedUser.isActive ? 'success' : 'default'}
                                    variant={selectedUser.isActive ? 'filled' : 'outlined'}
                                />
                            </DetailRow>
                            <DetailRow label="Email Verified">
                                {selectedUser.isVerified ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <VerifiedUser color="primary" fontSize="small" />
                                        <Typography variant="body2" color="primary">Verified</Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">Pending</Typography>
                                )}
                            </DetailRow>
                            <DetailRow label="Created" value={selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'} />
                        </Box>
                    </DialogContent>
                )}
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                    <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => { setViewDialogOpen(false); handleOpenEdit(); }}
                    >
                        Edit User
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ══════════════════════════════════════════════════════════════
                EDIT USER DIALOG
               ══════════════════════════════════════════════════════════════ */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Edit User — {selectedUser?.firstName} {selectedUser?.lastName}
                </DialogTitle>
                <DialogContent sx={{ pt: '16px !important' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="First Name"
                                value={editForm.firstName}
                                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Last Name"
                                value={editForm.lastName}
                                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                fullWidth
                                required
                            />
                        </Box>
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={editForm.role}
                                label="Role"
                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            >
                                <MenuItem value="LEARNER">Learner</MenuItem>
                                <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
                                <MenuItem value="ADMIN">Admin</MenuItem>
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editForm.isActive}
                                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                        color="success"
                                    />
                                }
                                label="Active"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editForm.isVerified}
                                        onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                                        color="primary"
                                    />
                                }
                                label="Verified"
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveEdit} variant="contained" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Status Toggle Dialog ── */}
            <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
                <DialogTitle>
                    {selectedUser?.isActive ? 'Deactivate' : 'Activate'} User
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to {selectedUser?.isActive ? 'deactivate' : 'activate'}{' '}
                        {selectedUser?.firstName} {selectedUser?.lastName}?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdateStatus} variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Delete Dialog ── */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete User</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Snackbar ── */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

// Helper component for View dialog rows
const DetailRow: React.FC<{ label: string; value?: string; children?: React.ReactNode }> = ({ label, value, children }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {label}
        </Typography>
        {children || (
            <Typography variant="body2" fontWeight={500} sx={{ maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>
                {value}
            </Typography>
        )}
    </Box>
);

export default UserManagement;
