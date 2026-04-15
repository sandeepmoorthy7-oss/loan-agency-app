import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  Megaphone,
  DollarSign,
} from 'lucide-react';

export function Dashboard() {
  const { currentUser } = useAuth();
  const { loanApplications, announcements, messages } = useData();
  const navigate = useNavigate();

  // Filter data based on user role
  const getFilteredApplications = () => {
    if (currentUser?.role === 'owner' || currentUser?.role === 'backend') {
      return loanApplications;
    } else if (currentUser?.role === 'sales') {
      return loanApplications.filter((app) => app.createdBy === currentUser.id);
    } else if (currentUser?.role === 'bank_manager') {
      // If user has a bankId, filter by it, otherwise use the 'bank' string field
      return loanApplications.filter((app) =>
        (currentUser.bankId && app.bank === currentUser.bankId) ||
        (!currentUser.bankId && app.bank === currentUser.bankId)
      );
    }
    return [];
  };

  const filteredApplications = getFilteredApplications();
  const pendingApps = filteredApplications.filter((app) => app.status === 'pending').length;
  const underReviewApps = filteredApplications.filter((app) => app.status === 'under_review').length;
  const approvedApps = filteredApplications.filter((app) => app.status === 'approved').length;
  const rejectedApps = filteredApplications.filter((app) => app.status === 'rejected').length;

  // Unread messages for the current user
  const unreadMessagesCount = messages.filter((msg) =>
    msg.to === currentUser?.id && !msg.read
  ).length;

  // Announcements count
  const announcementsCount = announcements.length;

  const totalLoanAmount = filteredApplications
    .filter((app) => app.status === 'approved')
    .reduce((sum, app) => sum + (app.loanAmount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 size-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 tracking-tight">
            Welcome back, {currentUser?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-indigo-100 text-lg font-medium">Here's what's happening today</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Pending Card */}
        <Card
          className="bg-amber-50 border-0 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300"
          onClick={() => navigate('/applications', { state: { filter: 'pending' }})}
        >
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="w-full flex justify-end mb-2">
              <div className="bg-white/50 p-2 rounded-xl">
                <Clock className="size-5 text-amber-600" />
              </div>
            </div>
            <p className="text-xs font-bold text-amber-800/60 uppercase tracking-wider mb-1">Pending</p>
            <div className="text-4xl font-black text-amber-900 mb-2">{pendingApps}</div>
            <p className="text-[10px] font-bold text-amber-600/70 uppercase">Awaiting review</p>
          </CardContent>
          <div className="h-1 w-full bg-amber-400/30 rounded-b-xl"></div>
        </Card>

        {/* Under Review Card */}
        <Card
          className="bg-blue-50 border-0 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300"
          onClick={() => navigate('/applications', { state: { filter: 'under_review' }})}
        >
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="w-full flex justify-end mb-2">
              <div className="bg-white/50 p-2 rounded-xl">
                <FileText className="size-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs font-bold text-blue-800/60 uppercase tracking-wider mb-1">Under Review</p>
            <div className="text-4xl font-black text-blue-900 mb-2">{underReviewApps}</div>
            <p className="text-[10px] font-bold text-blue-600/70 uppercase">Being processed</p>
          </CardContent>
          <div className="h-1 w-full bg-blue-400/30 rounded-b-xl"></div>
        </Card>

        {/* Approved Card */}
        <Card
          className="bg-emerald-50 border-0 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300"
          onClick={() => navigate('/applications', { state: { filter: 'approved' }})}
        >
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="w-full flex justify-end mb-2">
              <div className="bg-white/50 p-2 rounded-xl">
                <CheckCircle className="size-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs font-bold text-emerald-800/60 uppercase tracking-wider mb-1">Approved</p>
            <div className="text-4xl font-black text-emerald-900 mb-2">{approvedApps}</div>
            <p className="text-[10px] font-bold text-emerald-600/70 uppercase">Successfully approved</p>
          </CardContent>
          <div className="h-1 w-full bg-emerald-400/30 rounded-b-xl"></div>
        </Card>

        {/* Rejected Card */}
        <Card
          className="bg-rose-50 border-0 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300"
          onClick={() => navigate('/applications', { state: { filter: 'rejected' }})}
        >
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="w-full flex justify-end mb-2">
              <div className="bg-white/50 p-2 rounded-xl">
                <XCircle className="size-5 text-rose-600" />
              </div>
            </div>
            <p className="text-xs font-bold text-rose-800/60 uppercase tracking-wider mb-1">Rejected</p>
            <div className="text-4xl font-black text-rose-900 mb-2">{rejectedApps}</div>
            <p className="text-[10px] font-bold text-rose-600/70 uppercase">Not approved</p>
          </CardContent>
          <div className="h-1 w-full bg-rose-400/30 rounded-b-xl"></div>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Value */}
        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-100">
              <DollarSign className="size-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Value</p>
              <div className="text-2xl font-black text-gray-900">
                ₹{(totalLoanAmount / 100000).toFixed(1)}L
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Total approved amount</p>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card
          className="bg-white border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden"
          onClick={() => navigate('/messages')}
        >
          <CardContent className="p-6 flex items-center gap-5">
            <div className="bg-pink-500 p-4 rounded-2xl shadow-lg shadow-pink-100">
              <MessageSquare className="size-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Messages</p>
              <div className="text-2xl font-black text-gray-900">{unreadMessagesCount}</div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Unread messages</p>
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card
          className="bg-white border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden"
          onClick={() => navigate('/announcements')}
        >
          <CardContent className="p-6 flex items-center gap-5">
            <div className="bg-teal-500 p-4 rounded-2xl shadow-lg shadow-teal-100">
              <Megaphone className="size-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Announcements</p>
              <div className="text-2xl font-black text-gray-900">{announcementsCount}</div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Latest updates</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
