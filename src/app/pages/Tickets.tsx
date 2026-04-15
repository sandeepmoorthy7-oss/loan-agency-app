import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertCircle, CheckCircle2, Clock, MessageSquare, Plus, Send, Ticket as TicketIcon } from 'lucide-react';
import { Ticket, TicketComment } from '../types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function Tickets() {
  const { currentUser } = useAuth();
  const { tickets, loanApplications, users, addTicket, updateTicket, addTicketComment } = useData();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newComment, setNewComment] = useState('');

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    applicationId: '',
    title: '',
    description: '',
    category: 'missing_documents' as const,
    priority: 'medium' as const,
  });

  // Filter tickets based on user role
  const getFilteredTickets = () => {
    if (currentUser?.role === 'owner') {
      return tickets;
    } else if (currentUser?.role === 'bank_manager') {
      return tickets.filter((t) => t.bankId === currentUser.bankId);
    } else {
      return tickets.filter((t) => t.createdBy === currentUser?.id);
    }
  };

  const filteredTickets = getFilteredTickets();

  const handleCreateTicket = () => {
    if (!newTicket.applicationId || !newTicket.title || !newTicket.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const application = loanApplications.find((app) => app.id === newTicket.applicationId);
    if (!application) {
      toast.error('Application not found');
      return;
    }

    // Find the bank manager for this application
    const bankManager = users.find(
      (u) => u.role === 'bank_manager' && u.bankId === application.bank
    );

    addTicket({
      ...newTicket,
      applicantName: application.applicantName,
      status: 'open',
      createdBy: currentUser?.id || '',
      createdByName: currentUser?.name || '',
      createdByRole: currentUser?.role || 'sales',
      assignedTo: bankManager?.id,
      assignedToName: bankManager?.name,
      bankId: application.bank,
      bankName: application.bank,
    });

    toast.success('Ticket created successfully');
    setIsCreateOpen(false);
    setNewTicket({
      applicationId: '',
      title: '',
      description: '',
      category: 'missing_documents',
      priority: 'medium',
    });
  };

  const handleAddComment = (ticketId: string) => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    addTicketComment(ticketId, {
      userId: currentUser?.id || '',
      userName: currentUser?.name || '',
      userRole: currentUser?.role || 'sales',
      comment: newComment,
    });

    setNewComment('');
    toast.success('Comment added');
  };

  const handleUpdateStatus = (ticketId: string, status: Ticket['status']) => {
    updateTicket(ticketId, { 
      status,
      resolvedAt: status === 'resolved' || status === 'closed' ? new Date().toISOString() : undefined
    });
    toast.success('Ticket status updated');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-purple-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="size-4" />;
      case 'in_progress': return <Clock className="size-4" />;
      case 'resolved': return <CheckCircle2 className="size-4" />;
      case 'closed': return <CheckCircle2 className="size-4" />;
      default: return <AlertCircle className="size-4" />;
    }
  };

  const groupedTickets = {
    open: filteredTickets.filter((t) => t.status === 'open'),
    in_progress: filteredTickets.filter((t) => t.status === 'in_progress'),
    resolved: filteredTickets.filter((t) => t.status === 'resolved'),
    closed: filteredTickets.filter((t) => t.status === 'closed'),
  };

  // Only allow sales and backend teams to create tickets
  const canCreateTicket = currentUser?.role === 'sales' || currentUser?.role === 'backend';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500 mt-1">
            Connect with bank managers for updates and document requests
          </p>
        </div>
        {canCreateTicket && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Plus className="size-4 mr-2" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogDescription>
                  Create a ticket to communicate with bank managers about missing documents or updates
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="application">Loan Application *</Label>
                  <Select
                    value={newTicket.applicationId}
                    onValueChange={(value) => setNewTicket({ ...newTicket, applicationId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select application" />
                    </SelectTrigger>
                    <SelectContent>
                      {loanApplications
                        .filter((app) => 
                          currentUser?.role === 'sales' ? app.createdBy === currentUser.id : true
                        )
                        .map((app) => (
                          <SelectItem key={app.id} value={app.id}>
                            {app.id} - {app.applicantName} ({app.bank})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newTicket.category}
                      onValueChange={(value: any) => setNewTicket({ ...newTicket, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="missing_documents">Missing Documents</SelectItem>
                        <SelectItem value="status_update">Status Update</SelectItem>
                        <SelectItem value="clarification">Clarification</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value: any) => setNewTicket({ ...newTicket, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the ticket..."
                    rows={5}
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTicket}>Create Ticket</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{groupedTickets.open.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{groupedTickets.in_progress.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{groupedTickets.resolved.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{filteredTickets.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>View and manage support tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All ({filteredTickets.length})</TabsTrigger>
              <TabsTrigger value="open">Open ({groupedTickets.open.length})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({groupedTickets.in_progress.length})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({groupedTickets.resolved.length})</TabsTrigger>
            </TabsList>

            {['all', 'open', 'in_progress', 'resolved'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {(tab === 'all' ? filteredTickets : groupedTickets[tab as keyof typeof groupedTickets]).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <TicketIcon className="size-12 mx-auto mb-4 text-gray-400" />
                    <p>No tickets found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(tab === 'all' ? filteredTickets : groupedTickets[tab as keyof typeof groupedTickets]).map((ticket) => (
                      <Dialog key={ticket.id}>
                        <DialogTrigger asChild>
                          <div className="border rounded-lg p-4 hover:border-indigo-300 cursor-pointer transition-colors bg-white">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                                    {getStatusIcon(ticket.status)}
                                    <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
                                  </Badge>
                                  <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
                                    {ticket.priority}
                                  </Badge>
                                  <Badge variant="outline">{ticket.category.replace('_', ' ')}</Badge>
                                </div>
                                <h4 className="font-semibold text-lg text-gray-900">{ticket.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  Application: {ticket.applicationId} - {ticket.applicantName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                              <div className="flex items-center gap-4">
                                <span>Created by: {ticket.createdByName}</span>
                                {ticket.assignedToName && <span>Assigned to: {ticket.assignedToName}</span>}
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="size-3" />
                                  {ticket.comments.length} comments
                                </span>
                              </div>
                              <span>{format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}</span>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                                {getStatusIcon(ticket.status)}
                                <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
                              </Badge>
                              <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
                                {ticket.priority}
                              </Badge>
                              <Badge variant="outline">{ticket.category.replace('_', ' ')}</Badge>
                            </div>
                            <DialogTitle>{ticket.title}</DialogTitle>
                            <DialogDescription>
                              Ticket ID: {ticket.id} | Application: {ticket.applicationId} - {ticket.applicantName}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            {/* Ticket Details */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-semibold mb-2">Description</h4>
                              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Created by:</span>
                                  <span className="ml-2 font-medium">{ticket.createdByName} ({ticket.createdByRole})</span>
                                </div>
                                {ticket.assignedToName && (
                                  <div>
                                    <span className="text-gray-600">Assigned to:</span>
                                    <span className="ml-2 font-medium">{ticket.assignedToName}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-600">Bank:</span>
                                  <span className="ml-2 font-medium">{ticket.bankName}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Created:</span>
                                  <span className="ml-2 font-medium">{format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}</span>
                                </div>
                              </div>
                            </div>

                            {/* Status Update Actions */}
                            {(currentUser?.role === 'bank_manager' || currentUser?.role === 'owner') && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                                  disabled={ticket.status === 'in_progress'}
                                >
                                  Mark In Progress
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(ticket.id, 'resolved')}
                                  disabled={ticket.status === 'resolved' || ticket.status === 'closed'}
                                >
                                  Mark Resolved
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(ticket.id, 'closed')}
                                  disabled={ticket.status === 'closed'}
                                >
                                  Close Ticket
                                </Button>
                              </div>
                            )}

                            {/* Comments Section */}
                            <div>
                              <h4 className="font-semibold mb-4">Comments ({ticket.comments.length})</h4>
                              <div className="space-y-3 mb-4">
                                {ticket.comments.map((comment) => (
                                  <div key={comment.id} className="bg-white border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <span className="font-medium text-gray-900">{comment.userName}</span>
                                        <Badge variant="outline" className="ml-2 text-xs">
                                          {comment.userRole}
                                        </Badge>
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {format(new Date(comment.timestamp), 'MMM d, yyyy h:mm a')}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                                  </div>
                                ))}
                              </div>

                              {/* Add Comment */}
                              <div className="flex gap-2">
                                <Textarea
                                  placeholder="Add a comment..."
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  rows={3}
                                  className="flex-1"
                                />
                                <Button
                                  onClick={() => handleAddComment(ticket.id)}
                                  className="self-end"
                                >
                                  <Send className="size-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
