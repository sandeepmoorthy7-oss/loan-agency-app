import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Calendar,
  Megaphone,
  MessageSquare,
  LogOut,
  Users,
  Bell,
  ChevronDown,
  Ticket as TicketIcon,
  Calculator,
  UserCheck,
} from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';

import logo from '../../assets/logo.png';

export function Layout() {
  const { currentUser, logout } = useAuth();
  const { messages, pendingUserApplications } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      navigate('/login', { replace: true });
    }
  };

  // ✅ FIXED: Standardized filtering to use ID
  const unreadMessagesCount = messages.filter((msg) => {
    return msg.to === currentUser.id && msg.read === false;
  }).length;

  const pendingMemberApps = pendingUserApplications.filter(app => app.status === 'pending').length;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'sales', 'backend', 'bank_manager'] },
    { path: '/applications', label: 'Applications', icon: FileText, roles: ['owner', 'sales', 'backend', 'bank_manager'] },
    { path: '/member-applications', label: 'Member Applications', icon: UserCheck, roles: ['owner'], badge: pendingMemberApps },
    { path: '/tickets', label: 'Tickets', icon: TicketIcon, roles: ['owner', 'sales', 'backend', 'bank_manager'] },
    { path: '/calculators', label: 'Calculators', icon: Calculator, roles: ['owner', 'sales', 'backend', 'bank_manager'] },
    { path: '/performance', label: 'Performance', icon: TrendingUp, roles: ['owner'] },
    { path: '/attendance', label: 'Attendance', icon: Calendar, roles: ['owner'] },
    { path: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['owner', 'sales', 'backend', 'bank_manager'] },
    { path: '/messages', label: 'Messages', icon: MessageSquare, roles: ['owner', 'sales', 'backend', 'bank_manager'], badge: unreadMessagesCount },
    { path: '/users', label: 'Users', icon: Users, roles: ['owner'] },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(currentUser?.role || '')
  );

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      owner: 'Owner',
      sales: 'Sales Team',
      backend: 'Backend Staff',
      bank_manager: 'Bank Manager',
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <img src={logo} alt="TFS Logo" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">TFS HOSUR LOANS</h1>
                <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">{getRoleLabel(currentUser?.role || '')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notifications */}
              <NotificationsDropdown />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 pl-2 hover:bg-gray-50">
                    <Avatar className="size-8 border border-indigo-100">
                      <AvatarFallback className="bg-indigo-600 text-white text-xs">
                        {currentUser?.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-gray-700 leading-none">{currentUser?.name}</p>
                    </div>
                    <ChevronDown className="size-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="p-3 text-red-600 focus:text-red-600 cursor-pointer" onClick={handleLogout}>
                    <LogOut className="size-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-[65px] z-40 overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap
                    ${isActive
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent'
                    }`}
                >
                  <Icon className={`size-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="destructive" className="ml-1.5 px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
