import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/store';
import { Loading } from '../components/common';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

// Lazy load pages
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const LearnerDashboard = lazy(() => import('../pages/LearnerDashboard'));
const InstructorDashboard = lazy(() => import('../pages/InstructorDashboard'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));

// Learner pages
const CourseCatalog = lazy(() => import('../pages/learner/CourseCatalog'));
const CourseDetail = lazy(() => import('../pages/learner/CourseDetail'));
const MyLearning = lazy(() => import('../pages/learner/MyLearning'));
const CoursePlayer = lazy(() => import('../pages/learner/CoursePlayer'));
const ExamTaking = lazy(() => import('../pages/learner/ExamTaking'));
const LearnerAssessments = lazy(() => import('../pages/learner/LearnerAssessments'));
const LearnerProgress = lazy(() => import('../pages/learner/LearnerProgress'));
const ExamReview = lazy(() => import('../pages/learner/ExamReviewPage'));
const LearnerPracticeSetup = lazy(() => import('../pages/learner/LearnerPracticeSetup'));

// Instructor pages
const InstructorCourses = lazy(() => import('../pages/instructor/InstructorCourses'));
const CreateCourse = lazy(() => import('../pages/instructor/CreateCourse'));
const EditCourse = lazy(() => import('../pages/instructor/EditCourse'));
const StudentAnalytics = lazy(() => import('../pages/instructor/StudentAnalytics'));
const ExamGeneration = lazy(() => import('../pages/instructor/ExamGeneration'));

// Admin pages
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const CourseOversight = lazy(() => import('../pages/admin/CourseOversight'));
const AIConfiguration = lazy(() => import('../pages/admin/AIConfiguration'));
const SystemMonitorPage = lazy(() => import('../pages/admin/SystemMonitor'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));

const AppRoutes: React.FC = () => {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    // Determine where to redirect after login
    const getDefaultRoute = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'ADMIN':
                return '/admin';
            case 'INSTRUCTOR':
                return '/instructor';
            default:
                return '/learner';
        }
    };

    return (
        <Suspense fallback={<Loading variant="page" message="Loading..." />}>
            <Routes>
                {/* Public routes */}
                <Route
                    path="/login"
                    element={
                        (isAuthenticated && user) ? <Navigate to={getDefaultRoute()} replace /> : <Login />
                    }
                />
                <Route
                    path="/register"
                    element={
                        (isAuthenticated && user) ? <Navigate to={getDefaultRoute()} replace /> : <Register />
                    }
                />
                <Route
                    path="/forgot-password"
                    element={
                        (isAuthenticated && user) ? <Navigate to={getDefaultRoute()} replace /> : <ForgotPassword />
                    }
                />
                <Route
                    path="/reset-password"
                    element={
                        (isAuthenticated && user) ? <Navigate to={getDefaultRoute()} replace /> : <ResetPassword />
                    }
                />

                {/* Learner routes */}
                <Route
                    path="/learner"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['LEARNER']}>
                                <LearnerDashboard />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/learner/courses"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['LEARNER']}>
                                <CourseCatalog />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/learner/courses/:id"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['LEARNER']}>
                                <CourseDetail />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/learner/my-learning"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['LEARNER']}>
                                <MyLearning />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/learner/course/:id/learn"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['LEARNER']}>
                                <CoursePlayer />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/learner/exams/:id"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['LEARNER']}>
                                <ExamTaking />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/learner/exams/attempts/:attemptId/review"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['LEARNER']}>
                                <ExamReview />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/learner/practice"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['LEARNER']}>
                                <LearnerPracticeSetup />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/learner/practice/new"
                    element={<Navigate to="/learner/practice" replace />}
                />
                <Route
                    path="/learner/assessments"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['LEARNER']}>
                                <LearnerAssessments />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/learner/progress"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['LEARNER']}>
                                <LearnerProgress />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />

                {/* Shared routes */}
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['LEARNER', 'INSTRUCTOR', 'ADMIN']}>
                                <ProfilePage />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/notifications"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['LEARNER', 'INSTRUCTOR', 'ADMIN']}>
                                <NotificationsPage />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />

                {/* Instructor routes */}
                <Route
                    path="/instructor"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['INSTRUCTOR']}>
                                <InstructorDashboard />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/instructor/courses"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['INSTRUCTOR']}>
                                <InstructorCourses />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/instructor/courses/new"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['INSTRUCTOR']}>
                                <CreateCourse />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/instructor/courses/:id"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['INSTRUCTOR']}>
                                <CourseDetail />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/instructor/courses/:id/edit"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['INSTRUCTOR']}>
                                <EditCourse />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/instructor/course/:id/learn"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['INSTRUCTOR']}>
                                <CoursePlayer />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/instructor/analytics"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['INSTRUCTOR']}>
                                <StudentAnalytics />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/instructor/exams/:id"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['INSTRUCTOR']}>
                                <ExamGeneration />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/instructor/exams"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['INSTRUCTOR']}>
                                <ExamGeneration />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />

                {/* Admin routes */}
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['ADMIN']}>
                                <AdminDashboard />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['ADMIN']}>
                                <UserManagement />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/courses"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['ADMIN']}>
                                <CourseOversight />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/courses/:id"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['ADMIN']}>
                                <CourseDetail />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/course/:id/learn"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['ADMIN']}>
                                <CoursePlayer />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin/ai-config"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['ADMIN']}>
                                <AIConfiguration />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/monitor"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['ADMIN']}>
                                <SystemMonitorPage />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/settings"
                    element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['ADMIN']}>
                                <AdminSettings />
                            </RoleRoute>
                        </PrivateRoute>
                    }
                />
                {/* Default redirect */}
                <Route
                    path="/"
                    element={
                        (isAuthenticated && user) ? (
                            <Navigate to={getDefaultRoute()} replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;

