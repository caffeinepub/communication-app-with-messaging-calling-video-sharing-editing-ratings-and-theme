import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useCurrentUser } from './hooks/useCurrentUser';
import AppLayout from './components/layout/AppLayout';
import HandleOnboardingPage from './pages/HandleOnboardingPage';
import DirectoryPage from './pages/DirectoryPage';
import ChatsPage from './pages/ChatsPage';
import ChatThreadPage from './pages/ChatThreadPage';
import CallsPage from './pages/CallsPage';
import IncomingCallPage from './pages/IncomingCallPage';
import ActiveCallPage from './pages/ActiveCallPage';
import VideoStudioPage from './pages/VideoStudioPage';
import SettingsPage from './pages/SettingsPage';
import UserProfilePage from './pages/UserProfilePage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';

function RootLayout() {
  return (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <Toaster />
    </>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();

  useEffect(() => {
    if (!isInitializing && !isLoadingUser) {
      if (identity && currentUser === null) {
        // User is authenticated but has no profile - redirect to onboarding
        navigate({ to: '/onboarding' });
      }
    }
  }, [identity, currentUser, isInitializing, isLoadingUser, navigate]);

  if (isInitializing || (identity && isLoadingUser)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <AuthGate>
      <DirectoryPage />
    </AuthGate>
  ),
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: HandleOnboardingPage,
});

const directoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/directory',
  component: () => (
    <AuthGate>
      <DirectoryPage />
    </AuthGate>
  ),
});

const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user/$userId',
  component: () => (
    <AuthGate>
      <UserProfilePage />
    </AuthGate>
  ),
});

const chatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chats',
  component: () => (
    <AuthGate>
      <ChatsPage />
    </AuthGate>
  ),
});

const chatThreadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chats/$conversationId',
  component: () => (
    <AuthGate>
      <ChatThreadPage />
    </AuthGate>
  ),
});

const callsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calls',
  component: () => (
    <AuthGate>
      <CallsPage />
    </AuthGate>
  ),
});

const incomingCallRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calls/incoming/$callId',
  component: () => (
    <AuthGate>
      <IncomingCallPage />
    </AuthGate>
  ),
});

const activeCallRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calls/active/$callId',
  component: () => (
    <AuthGate>
      <ActiveCallPage />
    </AuthGate>
  ),
});

const videoStudioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/studio',
  component: () => (
    <AuthGate>
      <VideoStudioPage />
    </AuthGate>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <AuthGate>
      <SettingsPage />
    </AuthGate>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  onboardingRoute,
  directoryRoute,
  userProfileRoute,
  chatsRoute,
  chatThreadRoute,
  callsRoute,
  incomingCallRoute,
  activeCallRoute,
  videoStudioRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppContent />
    </ThemeProvider>
  );
}
