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
  Menu,
  X,
} from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';
import { useIsMobile } from './ui/use-mobile';
import { useState } from 'react';

import logo from '../../assets/logo.png';

export function Layout() {
  const { currentUser, logout } = useAuth();
  const { messages, pendingUserApplications } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const unreadMessagesCount = messages.filter((msg) => {
    return msg.to === currentUser.id && msg.read === false;
  }).length;

  const pendingMemberApps = pendingUserApplications.filter(app => app.status === 'pending').length;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'sales', 'backend', 'bank_manager'] },
    { path: '/applications', label: 'Applications', icon: FileText, roles: ['owner', 'sales', 'backend', 'bank_manager'] },
    { path: '/member-applications', label: 'Members', icon: UserCheck, roles: ['owner'], badge: pendingMemberApps },
    { path: '/tickets', label: 'Tickets', icon: TicketIcon, roles: ['owner', 'sales', 'backend', 'bank_manager'] },
    { path: '/messages', label: 'Messages', icon: MessageSquare, roles: ['owner', 'sales', 'backend', 'bank_manager'], badge: unreadMessagesCount },
    { path: '/calculators', label: 'Calcs', icon: Calculator, roles: ['owner', 'sales', 'backend', 'bank_manager'] },
    { path: '/performance', label: 'Growth', icon: TrendingUp, roles: ['owner'] },
    { path: '/attendance', label: 'Attend', icon: Calendar, roles: ['owner'] },
    { path: '/announcements', label: 'Alerts', icon: Megaphone, roles: ['owner', 'sales', 'backend', 'bank_manager'] },
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

  // Main navigation for mobile (Bottom bar)
  const mobileMainItems = filteredNavItems.slice(0, 4);
  const mobileMoreItems = filteredNavItems.slice(4);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Definitive Safe Area Support for iOS */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 pt-[calc(env(safe-area-inset-top,44px)+4px)] pb-3 shadow-sm">
        <div className="px-4">
          <div className="flex items-center justify-between h-10 sm:h-12">
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <img src={logo} alt="TFS Logo" className="h-8 sm:h-10 w-auto" />
              <div className="flex flex-col">
                <h1 className="text-[12px] sm:text-xl font-bold text-gray-900 leading-none">TFS HOSUR LOANS</h1>
                <p className="text-[8px] sm:text-xs font-semibold text-indigo-600 uppercase tracking-widest mt-0.5">{getRoleLabel(currentUser?.role || '')}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-4">
              <div className="p-1">
                <NotificationsDropdown />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-1 sm:px-2 hover:bg-gray-50 focus:ring-0">
                    <Avatar className="size-8 sm:size-9 border-2 border-indigo-100">
                      <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                        {currentUser?.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {!isMobile && (
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-700 leading-none">{currentUser?.name}</p>
                      </div>
                    )}
                    <ChevronDown className="size-4 text-gray-400 hidden sm:block" />
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

      {/* Desktop Navigation */}
      {!isMobile && (
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
      )}

      {/* Main Content - Added massive top padding for mobile to clear notch/header */}
      <main className={`flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full ${isMobile ? 'pt-16 pb-24' : ''}`}>
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation with Safe Area Support */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {mobileMainItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center p-2 min-w-[64px] rounded-xl transition-all active:scale-95
                    ${isActive ? 'text-indigo-600 bg-indigo-50/70' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <div className="relative">
                    <Icon className={`size-5 mb-1 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full size-4 flex items-center justify-center border-2 border-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'text-indigo-700' : 'text-gray-500'}`}>{item.label}</span>
                </button>
              );
            })}

            {/* More Menu for Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center justify-center p-2 min-w-[64px] rounded-xl text-gray-500">
                  <Menu className="size-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">More</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-56 mb-4 p-2 shadow-xl border-indigo-50">
                {mobileMoreItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-1
                        ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600'}`}
                    >
                      <Icon className={`size-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className="text-sm">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge variant="destructive" className="ml-auto text-[10px] h-5 min-w-5">
                          {item.badge}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
}

