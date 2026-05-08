import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  Megaphone,
  DollarSign,
  Unlock,
  ShieldAlert,
  User,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function Dashboard() {
  const { currentUser } = useAuth();
  const { loanApplications, announcements, messages, reviewUnlockRequest } = useData();
  const navigate = useNavigate();

  // Get all pending unlock requests for the owner
  const pendingUnlockRequests = loanApplications.flatMap(app =>
    (app.unlockRequests || [])
      .filter(req => req.status === 'pending')
      .map(req => ({
        ...req,
        applicationId: app.id,
        applicantName: app.applicantName,
        loanAmount: app.loanAmount
      }))
  ).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  const handleReviewUnlock = (appId: string, requestId: string, approved: boolean) => {
    if (!currentUser) return;
    reviewUnlockRequest(appId, requestId, approved, currentUser.id, currentUser.name);
    toast.success(`Unlock request ${approved ? 'approved' : 'rejected'}`);
  };

  // Filter data based on user role
  const getFilteredApplications = () => {
    if (currentUser?.role === 'owner' || currentUser?.role === 'backend') {
      return loanApplications;
    } else if (currentUser?.role === 'sales') {
      return loanApplications.filter((app) => app.createdBy === currentUser.id);
    } else if (currentUser?.role === 'bank_manager') {
      // Bank managers only see applications assigned specifically to them
      return loanApplications.filter((app) => app.assignedTo === currentUser.id);
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
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 size-48 sm:size-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-black mb-1 sm:mb-2 tracking-tight">
            Hi, {currentUser?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-indigo-100 text-sm sm:text-lg font-medium">Dashboard Overview</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Pending Card */}
        <Card
          className="bg-white border-none shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden"
          onClick={() => navigate('/applications', { state: { filter: 'pending' }})}
        >
          <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center">
            <div className="w-full flex justify-between items-start mb-2">
               <div className="bg-amber-100 p-2 rounded-xl">
                <Clock className="size-4 sm:size-5 text-amber-600" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">PENDING</Badge>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-gray-900 mb-1">{pendingApps}</div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Applications</p>
          </CardContent>
          <div className="h-1.5 w-full bg-amber-400"></div>
        </Card>

        {/* Under Review Card */}
        <Card
          className="bg-white border-none shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden"
          onClick={() => navigate('/applications', { state: { filter: 'under_review' }})}
        >
          <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center">
            <div className="w-full flex justify-between items-start mb-2">
               <div className="bg-blue-100 p-2 rounded-xl">
                <FileText className="size-4 sm:size-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">REVIEW</Badge>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-gray-900 mb-1">{underReviewApps}</div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">In Process</p>
          </CardContent>
          <div className="h-1.5 w-full bg-blue-500"></div>
        </Card>

        {/* Approved Card */}
        <Card
          className="bg-white border-none shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden"
          onClick={() => navigate('/applications', { state: { filter: 'approved' }})}
        >
          <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center">
            <div className="w-full flex justify-between items-start mb-2">
               <div className="bg-emerald-100 p-2 rounded-xl">
                <CheckCircle className="size-4 sm:size-5 text-emerald-600" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">DONE</Badge>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-gray-900 mb-1">{approvedApps}</div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Approved</p>
          </CardContent>
          <div className="h-1.5 w-full bg-emerald-500"></div>
        </Card>

        {/* Rejected Card */}
        <Card
          className="bg-white border-none shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden"
          onClick={() => navigate('/applications', { state: { filter: 'rejected' }})}
        >
          <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center">
            <div className="w-full flex justify-between items-start mb-2">
               <div className="bg-rose-100 p-2 rounded-xl">
                <XCircle className="size-4 sm:size-5 text-rose-600" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200">FAILED</Badge>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-gray-900 mb-1">{rejectedApps}</div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rejected</p>
          </CardContent>
          <div className="h-1.5 w-full bg-rose-500"></div>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Value */}
        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
          <CardContent className="p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
            <div className="bg-indigo-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-100">
              <DollarSign className="size-6 sm:size-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Disbursed Amount</p>
              <div className="text-xl sm:text-2xl font-black text-gray-900">
                ₹{(totalLoanAmount / 100000).toFixed(1)}L
              </div>
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

      {/* Owner-only: Pending Unlock Requests */}
      {currentUser?.role === 'owner' && pendingUnlockRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-orange-100 p-1.5 rounded-lg">
                <ShieldAlert className="size-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Pending Unlock Requests</h3>
            </div>
            <Badge className="bg-orange-500 hover:bg-orange-600 border-none px-3">
              {pendingUnlockRequests.length} ACTION REQUIRED
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingUnlockRequests.map((request) => (
              <Card key={request.id} className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-stretch">
                    <div className="p-4 sm:p-5 flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="size-10 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
                          <User className="size-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{request.requestedByName}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Requesting Access</p>
                        </div>
                      </div>

                      <div className="hidden sm:block w-px h-8 bg-gray-100"></div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 uppercase">APP #{request.applicationId.slice(0, 8)}</span>
                          <span className="text-xs font-bold text-gray-700">For {request.applicantName}</span>
                        </div>
                        <p className="text-sm text-gray-600 italic line-clamp-1">"{request.reason}"</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(new Date(request.requestedAt), 'MMM dd, HH:mm')}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 sm:p-5 flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
                        onClick={() => handleReviewUnlock(request.applicationId, request.id, false)}
                      >
                        <XCircle className="size-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        onClick={() => handleReviewUnlock(request.applicationId, request.id, true)}
                      >
                        <Unlock className="size-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
