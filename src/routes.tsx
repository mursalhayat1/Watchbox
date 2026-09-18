import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import AdminGuard from '@/components/admin/AdminGuard';

// ── Public / user pages ───────────────────────────────────────────────────────
const HomePage          = lazy(() => import('./pages/HomePage'));
const DetailPage        = lazy(() => import('./pages/DetailPage'));
const DiscoverPage      = lazy(() => import('./pages/DiscoverPage'));
const ForYouPage        = lazy(() => import('./pages/ForYouPage'));
const SearchPage        = lazy(() => import('./pages/SearchPage'));
const PersonPage        = lazy(() => import('./pages/PersonPage'));
const LibraryPage       = lazy(() => import('./pages/LibraryPage'));
const LoginPage         = lazy(() => import('./pages/LoginPage'));
const AuthCallbackPage  = lazy(() => import('./pages/AuthCallbackPage'));
const StatsPage         = lazy(() => import('./pages/StatsPage'));
const OnboardingPage    = lazy(() => import('./pages/OnboardingPage'));

// ── Admin pages (lazy — not bundled with user-facing code) ────────────────────
const AdminSectionsPage   = lazy(() => import('./pages/admin/AdminSectionsPage'));
const AdminSectionCreate  = lazy(() => import('./pages/admin/SectionCreatePage'));
const AdminSectionEdit    = lazy(() => import('./pages/admin/SectionEditPage'));
const AdminSectionPreview = lazy(() => import('./pages/admin/SectionPreviewPanel'));
const AdminDashboardPage  = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage      = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminUserDetailPage = lazy(() => import('./pages/admin/AdminUserDetailPage'));
const AdminMoviesPage     = lazy(() =>
  import('./pages/admin/AdminContentPages').then(m => ({ default: m.AdminMoviesPage }))
);
const AdminTVPage         = lazy(() =>
  import('./pages/admin/AdminContentPages').then(m => ({ default: m.AdminTVPage }))
);
const AdminActorsPage     = lazy(() =>
  import('./pages/admin/AdminContentPages').then(m => ({ default: m.AdminActorsPage }))
);
const AdminWatchDataPage  = lazy(() => import('./pages/admin/AdminWatchDataPage'));
const AdminAnalyticsPage  = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminSystemPage     = lazy(() => import('./pages/admin/AdminSystemPage'));
const AdminLogsPage       = lazy(() => import('./pages/admin/AdminLogsPage'));
const AdminSettingsPage   = lazy(() => import('./pages/admin/AdminSettingsPage'));

function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'hsl(189,80%,4%)' }}>
      <div className="w-9 h-9 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
    </div>
  );
}

function Page({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

/** Wrap an element in both AdminGuard (auth check) and Suspense */
function AdminPage({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </AdminGuard>
  );
}

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  // ── Public / user routes ────────────────────────────────────────────────────
  { name: 'Home',         path: '/',                 element: <Page><HomePage /></Page>,          public: true },
  { name: 'Detail',       path: '/detail/:type/:id', element: <Page><DetailPage /></Page>,        public: true },
  { name: 'Person',       path: '/person/:id',       element: <Page><PersonPage /></Page>,        public: true },
  { name: 'Library',      path: '/library',          element: <Page><LibraryPage /></Page>,       public: true },
  { name: 'Discover',     path: '/discover',         element: <Page><DiscoverPage /></Page>,      public: true },
  { name: 'For You',      path: '/for-you',          element: <Page><ForYouPage /></Page>,        public: true },
  { name: 'Search',       path: '/search',           element: <Page><SearchPage /></Page>,        public: true },
  { name: 'Login',        path: '/login',            element: <Page><LoginPage /></Page>,         public: true },
  { name: 'AuthCallback', path: '/auth/callback',    element: <Page><AuthCallbackPage /></Page>,  public: true },
  { name: 'Onboarding',   path: '/onboarding',       element: <Page><OnboardingPage /></Page>,    public: true },
  { name: 'Stats',        path: '/stats',            element: <Page><StatsPage /></Page>,         public: true },
  // Legacy redirects
  { name: 'BrowseMovieRedirect', path: '/browse/movie', element: <Page><DiscoverPage /></Page>, public: true },
  { name: 'BrowseTVRedirect',    path: '/browse/tv',    element: <Page><ForYouPage /></Page>,   public: true },

  // ── Admin routes — ALL protected by AdminGuard (server role check) ──────────
  // /admin redirects to /admin/dashboard
  {
    name: 'AdminRoot',
    path: '/admin',
    element: <AdminPage><Navigate to="/admin/dashboard" replace /></AdminPage>,
  },
  {
    name: 'AdminDashboard',
    path: '/admin/dashboard',
    element: <AdminPage><AdminDashboardPage /></AdminPage>,
  },
  {
    name: 'AdminUsers',
    path: '/admin/users',
    element: <AdminPage><AdminUsersPage /></AdminPage>,
  },
  {
    name: 'AdminUserDetail',
    path: '/admin/users/:id',
    element: <AdminPage><AdminUserDetailPage /></AdminPage>,
  },
  // /admin/content → redirect to movies
  {
    name: 'AdminContent',
    path: '/admin/content',
    element: <AdminPage><Navigate to="/admin/movies" replace /></AdminPage>,
  },
  {
    name: 'AdminMovies',
    path: '/admin/movies',
    element: <AdminPage><AdminMoviesPage /></AdminPage>,
  },
  {
    name: 'AdminTV',
    path: '/admin/tv',
    element: <AdminPage><AdminTVPage /></AdminPage>,
  },
  {
    name: 'AdminActors',
    path: '/admin/actors',
    element: <AdminPage><AdminActorsPage /></AdminPage>,
  },
  {
    name: 'AdminWatchData',
    path: '/admin/watch-data',
    element: <AdminPage><AdminWatchDataPage /></AdminPage>,
  },
  {
    name: 'AdminAnalytics',
    path: '/admin/analytics',
    element: <AdminPage><AdminAnalyticsPage /></AdminPage>,
  },
  {
    name: 'AdminSystem',
    path: '/admin/system',
    element: <AdminPage><AdminSystemPage /></AdminPage>,
  },
  {
    name: 'AdminLogs',
    path: '/admin/logs',
    element: <AdminPage><AdminLogsPage /></AdminPage>,
  },
  {
    name: 'AdminSettings',
    path: '/admin/settings',
    element: <AdminPage><AdminSettingsPage /></AdminPage>,
  },
  // ── Sections management ─────────────────────────────────────────────────────
  {
    name: 'AdminSections',
    path: '/admin/sections',
    element: <AdminPage><AdminSectionsPage /></AdminPage>,
  },
  {
    name: 'AdminSectionCreate',
    path: '/admin/sections/create',
    element: <AdminPage><AdminSectionCreate /></AdminPage>,
  },
  {
    name: 'AdminSectionEdit',
    path: '/admin/sections/:id/edit',
    element: <AdminPage><AdminSectionEdit /></AdminPage>,
  },
  {
    name: 'AdminSectionPreview',
    path: '/admin/sections/:id/preview',
    element: <AdminPage><AdminSectionPreview /></AdminPage>,
  },
];
