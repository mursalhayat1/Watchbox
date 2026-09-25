import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Film, Tv2, User2, Database, BarChart3,
  Activity, Settings, FileText, ShieldCheck, Menu, LogOut,
  ChevronRight, Clapperboard, LayoutList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, getDisplayName, getAvatarUrl, getNameInitial } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ── Nav items ─────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard',   path: '/admin/dashboard',   icon: LayoutDashboard },
      { label: 'Analytics',   path: '/admin/analytics',   icon: BarChart3 },
    ],
  },
  {
    title: 'Users',
    items: [
      { label: 'All Users',   path: '/admin/users',       icon: Users },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Movies',      path: '/admin/movies',      icon: Film },
      { label: 'TV Shows',    path: '/admin/tv',          icon: Tv2 },
      { label: 'Actors',      path: '/admin/actors',      icon: User2 },
    ],
  },
  {
    title: 'Homepage',
    items: [
      { label: 'Sections',    path: '/admin/sections',    icon: LayoutList },
    ],
  },
  {
    title: 'Data',
    items: [
      { label: 'Watch Data',  path: '/admin/watch-data',  icon: Database },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Audit Logs',  path: '/admin/logs',        icon: FileText },
      { label: 'System',      path: '/admin/system',      icon: Activity },
      { label: 'Settings',    path: '/admin/settings',    icon: Settings },
    ],
  },
];

// ── Sidebar nav link ──────────────────────────────────────────────────────────

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === item.path ||
    (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));

  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
        isActive
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
      )}
    >
      <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
      <span className="flex-1 min-w-0 truncate">{item.label}</span>
      {item.badge && (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

// ── Sidebar content (shared between desktop + mobile) ─────────────────────────

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/login');
  };

  const displayName = getDisplayName(profile);
  const avatarUrl   = getAvatarUrl(profile);
  const initial     = getNameInitial(profile);

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Clapperboard className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground truncate">WatchBox</p>
          <p className="text-[10px] text-primary/80 font-medium uppercase tracking-wider">Admin</p>
        </div>
        <Link
          to="/"
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          title="Back to WatchBox"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
        </Link>
      </div>

      <Separator className="mx-0 bg-sidebar-border" />

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 min-h-0">
        {NAV_GROUPS.map(group => (
          <div key={group.title}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavLink key={item.path} item={item} onClick={onNavClick} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <Separator className="mx-0 bg-sidebar-border" />

      {/* Admin profile footer */}
      <div className="px-3 py-3 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors text-left">
              <Avatar className="w-7 h-7 shrink-0">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                <AvatarFallback className="text-[11px] bg-primary/20 text-primary font-semibold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{profile?.email ?? ''}</p>
              </div>
              <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-52">
            <DropdownMenuItem asChild>
              <Link to="/">← Back to WatchBox</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ── Admin Layout ──────────────────────────────────────────────────────────────

interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  title?: string;
  actions?: React.ReactNode;
}

export default function AdminLayout({ children, breadcrumbs, title, actions }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-60 bg-sidebar">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        {/* Top header */}
        <header className="h-14 flex items-center gap-3 px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 shrink-0">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0 h-8 w-8"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-4 h-4" />
            <span className="sr-only">Open menu</span>
          </Button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 flex-1 min-w-0 text-sm overflow-hidden">
            <Link to="/admin/dashboard" className="text-muted-foreground hover:text-foreground transition-colors shrink-0 text-xs">
              Admin
            </Link>
            {breadcrumbs?.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1 min-w-0">
                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                {crumb.href ? (
                  <Link to={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors truncate text-xs">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground truncate text-xs font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          {/* Right actions */}
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>

        {/* Page header */}
        {title && (
          <div className="px-4 md:px-6 pt-5 pb-2 flex items-start justify-between gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground text-balance">{title}</h1>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 px-4 md:px-6 py-4 md:py-6 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
