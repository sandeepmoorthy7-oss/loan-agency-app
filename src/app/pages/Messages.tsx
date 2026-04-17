import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MessageSquare, Plus, Send, Mail, MailOpen, User, XCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useIsMobile } from '../components/ui/use-mobile';

export function Messages() {
  const [isSending, setIsSending] = useState(false);
  const { currentUser } = useAuth();
  const { messages, addMessage, markMessageAsRead, users } = useData();
  const isMobile = useIsMobile();
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    content: '',
  });

  const otherUsers = users.filter((user) => user.id !== currentUser?.id);

  const receivedMessages = messages.filter((msg) => msg.to === currentUser?.id)
    .filter(msg =>
      msg.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const sentMessages = messages.filter((msg) => msg.from === currentUser?.id)
    .filter(msg =>
      msg.toName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const unreadCount = messages.filter((msg) => msg.to === currentUser?.id && !msg.read).length;

  const handleComposeMessage = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to send messages');
      return;
    }

    if (!formData.to || !formData.subject || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    const recipient = users.find((u) => u.id === formData.to);
    if (!recipient) {
      toast.error('Recipient not found');
      return;
    }

    setIsSending(true);
    try {
      await addMessage({
        from: currentUser.id,
        fromName: currentUser.name,
        to: formData.to,
        toName: recipient.name,
        subject: formData.subject,
        content: formData.content,
        read: false,
      });

      toast.success('Message sent successfully!');
      setIsComposeDialogOpen(false);
      setFormData({
        to: '',
        subject: '',
        content: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleViewMessage = (messageId: string) => {
    setSelectedMessage(messageId);
    const message = messages.find((m) => m.id === messageId);
    if (message && message.to === currentUser?.id && !message.read) {
      markMessageAsRead(messageId);
    }
  };

  const selectedMessageData = messages.find((m) => m.id === selectedMessage);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px] font-black">
                {unreadCount} NEW
              </Badge>
            )}
          </h2>
          <p className="text-sm text-gray-500">Internal communication portal</p>
        </div>

        <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 h-11 sm:h-10">
              <Plus className="size-5 sm:size-4 mr-2" />
              Compose Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-[95vw] p-4 sm:p-6 rounded-2xl">
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipient</Label>
                <Select value={formData.to} onValueChange={(val) => setFormData({ ...formData, to: val })}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Choose colleague" />
                  </SelectTrigger>
                  <SelectContent>
                    {otherUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role.replace('_', ' ')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="What is this about?"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message Body</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Type your message here..."
                  rows={isMobile ? 8 : 6}
                  className="rounded-xl resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                <Button variant="ghost" className="h-11 sm:h-10 font-bold text-gray-500" onClick={() => setIsComposeDialogOpen(false)}>
                  Discard
                </Button>
                <Button
                  className="h-11 sm:h-10 bg-indigo-600 font-bold"
                  onClick={handleComposeMessage}
                  disabled={!formData.to || !formData.subject || !formData.content || isSending}
                >
                  {isSending ? (
                    <div className="size-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="size-4 mr-2" />
                  )}
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <Input
          placeholder="Search by name or subject..."
          className="pl-9 h-11 border-none shadow-sm bg-white rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats - Compact on Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Mail className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Inbox</p>
            <p className="text-xl font-black text-gray-900">{receivedMessages.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Send className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Sent</p>
            <p className="text-xl font-black text-gray-900">{sentMessages.length}</p>
          </div>
        </div>

        {!isMobile && (
          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3">
            <div className="size-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
              <MailOpen className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Unread</p>
              <p className="text-xl font-black text-red-600">{unreadCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-200/50 p-1 rounded-xl h-12 mb-4">
          <TabsTrigger value="inbox" className="rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <Mail className="size-4" />
            Received
          </TabsTrigger>
          <TabsTrigger value="sent" className="rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <Send className="size-4" />
            Outbox
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-0 space-y-3">
          {receivedMessages.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed flex flex-col items-center">
              <MessageSquare className="size-12 text-gray-100 mb-4" />
              <p className="text-sm font-bold text-gray-400 uppercase">No messages found</p>
            </div>
          ) : (
            receivedMessages.map((message) => (
              <Card
                key={message.id}
                className={`border-none shadow-sm active:scale-[0.98] transition-all cursor-pointer rounded-2xl overflow-hidden ${
                  !message.read ? 'ring-2 ring-indigo-500/20' : ''
                }`}
                onClick={() => handleViewMessage(message.id)}
              >
                <CardContent className="p-4 flex gap-4">
                   <div className="shrink-0">
                    <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      !message.read ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {message.fromName.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm truncate ${!message.read ? 'font-black text-gray-900' : 'font-semibold text-gray-600'}`}>
                        {message.fromName}
                      </p>
                      <span className="text-[10px] font-medium text-gray-400 shrink-0">
                        {format(new Date(message.timestamp), isMobile ? 'HH:mm' : 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${!message.read ? 'font-bold text-indigo-600' : 'text-gray-700'}`}>
                      {message.subject}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">
                      {message.content}
                    </p>
                  </div>
                  {!message.read && (
                    <div className="shrink-0 flex items-center">
                      <div className="size-2 bg-indigo-600 rounded-full animate-pulse" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-0 space-y-3">
          {sentMessages.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed flex flex-col items-center">
              <Send className="size-12 text-gray-100 mb-4" />
              <p className="text-sm font-bold text-gray-400 uppercase">No sent messages</p>
            </div>
          ) : (
            sentMessages.map((message) => (
              <Card
                key={message.id}
                className="border-none shadow-sm active:scale-[0.98] transition-all cursor-pointer rounded-2xl overflow-hidden"
                onClick={() => handleViewMessage(message.id)}
              >
                <CardContent className="p-4 flex gap-4">
                  <div className="shrink-0">
                    <div className="size-10 bg-gray-50 rounded-full flex items-center justify-center font-bold text-sm text-gray-400">
                      To
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {message.toName}
                      </p>
                      <span className="text-[10px] font-medium text-gray-400 shrink-0">
                        {format(new Date(message.timestamp), isMobile ? 'HH:mm' : 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 truncate mt-0.5">
                      {message.subject}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">
                      {message.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Message View Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl w-[95vw] p-0 rounded-2xl border-none overflow-hidden">
          <div className="bg-indigo-600 p-6 text-white relative">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10" onClick={() => setSelectedMessage(null)}>
              <XCircle className="size-6" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="size-12 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                <User className="size-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-1">Message from</p>
                <h2 className="text-xl font-black">{selectedMessageData?.fromName}</h2>
              </div>
            </div>
          </div>

          {selectedMessageData && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</p>
                  <p className="text-lg font-bold text-gray-900">{selectedMessageData.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Received</p>
                  <p className="text-xs font-bold text-gray-700">{format(new Date(selectedMessageData.timestamp), 'PPP')}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-sm leading-relaxed text-gray-700 min-h-[150px] whitespace-pre-wrap">
                {selectedMessageData.content}
              </div>

              <div className="flex justify-center pt-2">
                <Button className="w-full sm:w-auto h-11 px-8 rounded-xl bg-indigo-600 font-bold" onClick={() => setSelectedMessage(null)}>
                  Close Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

