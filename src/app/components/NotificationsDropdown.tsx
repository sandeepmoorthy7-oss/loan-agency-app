import { useNavigate } from 'react-router';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Bell, MessageSquare, Ticket as TicketIcon, FileText, Megaphone } from 'lucide-react';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';

export function NotificationsDropdown() {
  const { messages, tickets, announcements, loanApplications } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  // Unread messages
  const unreadMessages = messages
    .filter((msg) => msg.to === currentUser.id && !msg.read)
    .map((msg) => ({
      id: msg.id,
      type: 'message' as const,
      title: 'New Message',
      description: `From ${msg.fromName}: ${msg.subject}`,
      timestamp: msg.timestamp,
      icon: MessageSquare,
      iconColor: 'text-blue-500',
      onClick: () => navigate('/messages'),
    }));

  // Recent tickets for bank managers or sales/backend
  const relevantTickets = tickets
    .filter((t) => {
      if (currentUser.role === 'bank_manager') return t.bankId === currentUser.bankId && t.status === 'open';
      if (currentUser.role === 'sales') return t.createdBy === currentUser.id && (t.status === 'resolved' || t.status === 'in_progress');
      if (currentUser.role === 'backend') return t.createdBy === currentUser.id || (t.status === 'open');
      return false;
    })
    .map((t) => ({
      id: t.id,
      type: 'ticket' as const,
      title: `Ticket ${t.status.replace('_', ' ')}`,
      description: t.title,
      timestamp: t.updatedAt || t.createdAt,
      icon: TicketIcon,
      iconColor: t.status === 'resolved' ? 'text-green-500' : 'text-purple-500',
      onClick: () => navigate('/tickets'),
    }));

  // Recent announcements (last 24h)
  const recentAnnouncements = announcements
    .filter((a) => {
      const isRecent = new Date(a.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000;
      const isForMe = !a.targetRoles || a.targetRoles.includes(currentUser.role);
      return isRecent && isForMe;
    })
    .map((a) => ({
      id: a.id,
      type: 'announcement' as const,
      title: 'New Announcement',
      description: a.title,
      timestamp: a.createdAt,
      icon: Megaphone,
      iconColor: 'text-orange-500',
      onClick: () => navigate('/announcements'),
    }));

  // Status updates for sales
  const statusUpdates = currentUser.role === 'sales' ? loanApplications
    .filter((app) => {
       const isRecent = new Date(app.updatedAt).getTime() > Date.now() - 12 * 60 * 60 * 1000;
       return app.createdBy === currentUser.id && isRecent && app.status !== 'pending';
    })
    .map((app) => ({
      id: app.id,
      type: 'status' as const,
      title: 'Application Update',
      description: `${app.applicantName}: ${app.status.replace('_', ' ')}`,
      timestamp: app.updatedAt,
      icon: FileText,
      iconColor: app.status === 'approved' ? 'text-green-600' : app.status === 'rejected' ? 'text-red-600' : 'text-blue-600',
      onClick: () => navigate('/applications'),
    })) : [];

  const allNotifications = [
    ...unreadMessages,
    ...relevantTickets,
    ...recentAnnouncements,
    ...statusUpdates,
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalCount = allNotifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-indigo-50"
        >
          <Bell className="size-5 text-gray-600" />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full size-5 flex items-center justify-center border-2 border-white">
              {totalCount > 9 ? '9+' : totalCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="p-4 flex items-center justify-between">
          <span className="font-bold text-gray-900">Notifications</span>
          {totalCount > 0 && (
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
              {totalCount} New
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[400px] overflow-y-auto">
          {allNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="size-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            allNotifications.map((notif, index) => {
              const Icon = notif.icon;
              return (
                <DropdownMenuItem
                  key={`${notif.type}-${notif.id}-${index}`}
                  className="p-4 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 border-b border-gray-100 last:border-0"
                  onClick={notif.onClick}
                >
                  <div className="flex gap-3">
                    <div className={`mt-1 ${notif.iconColor}`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{notif.description}</p>
                      <p className="text-[10px] text-gray-400">
                        {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            onClick={() => navigate('/dashboard')}
          >
            Clear all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
