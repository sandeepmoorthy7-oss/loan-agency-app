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
import { MessageSquare, Plus, Send, Mail, MailOpen } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function Messages() {
  const [isSending, setIsSending] = useState(false);
  const { currentUser } = useAuth();
  const { messages, addMessage, markMessageAsRead, users } = useData();
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    content: '',
  });

  const otherUsers = users.filter((user) => user.id !== currentUser?.id);

  const receivedMessages = messages.filter((msg) => msg.to === currentUser?.id);
  const sentMessages = messages.filter((msg) => msg.from === currentUser?.id);
  const unreadCount = receivedMessages.filter((msg) => !msg.read).length;

  const handleComposeMessage = async () => {
    console.log('DEBUG: handleComposeMessage start');
    if (!currentUser) {
      console.log('DEBUG: No currentUser');
      toast.error('You must be logged in to send messages');
      return;
    }

    console.log('DEBUG: Form data:', formData);
    if (!formData.to || !formData.subject || !formData.content) {
      console.log('DEBUG: Missing fields');
      toast.error('Please fill in all required fields');
      return;
    }

    const recipient = users.find((u) => u.id === formData.to);
    console.log('DEBUG: Recipient:', recipient);
    if (!recipient) {
      console.log('DEBUG: Recipient not found in users list', users);
      toast.error('Recipient not found');
      return;
    }

    setIsSending(true);
    try {
      console.log('DEBUG: Sending message from', currentUser.id, 'to', formData.to);
      await addMessage({
        from: currentUser.id,
        fromName: currentUser.name,
        to: formData.to,
        toName: recipient.name,
        subject: formData.subject,
        content: formData.content,
        read: false,
      });

      console.log('DEBUG: addMessage success');
      toast.success('Message sent successfully!');
      setIsComposeDialogOpen(false);
      setFormData({
        to: '',
        subject: '',
        content: '',
      });
    } catch (error: any) {
      console.error('DEBUG: Failed to send message caught in UI:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleViewMessage = (messageId: string) => {
    console.log('Viewing message:', messageId);
    setSelectedMessage(messageId);
    const message = messages.find((m) => m.id === messageId);
    if (message && message.to === currentUser?.id && !message.read) {
      markMessageAsRead(messageId);
    }
  };

  const selectedMessageData = messages.find((m) => m.id === selectedMessage);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <MessageSquare className="size-8" />
              Messages
            </h2>
            <p className="text-white/90 text-lg">Inter-employee communication</p>
            {unreadCount > 0 && (
              <Badge className="mt-2 bg-white text-blue-600 font-semibold">
                {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-blue-600 hover:bg-white/90">
                <Plus className="size-4 mr-2" />
                Compose Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose New Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="to">To *</Label>
                  <Select value={formData.to} onValueChange={(val) => setFormData({ ...formData, to: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {otherUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Enter message subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Message *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter your message"
                    rows={6}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleComposeMessage}
                    disabled={!formData.to || !formData.subject || !formData.content || isSending}
                  >
                    {isSending ? (
                      <div className="size-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="size-4 mr-2" />
                    )}
                    {isSending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Inbox</CardTitle>
            <Mail className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{receivedMessages.length}</div>
            <p className="text-xs text-gray-500">{unreadCount} unread</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Sent</CardTitle>
            <Send className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{sentMessages.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Unread</CardTitle>
            <MailOpen className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{unreadCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Tabs */}
      <Card>
        <Tabs defaultValue="inbox">
          <CardHeader>
            <TabsList>
              <TabsTrigger value="inbox" className="flex items-center gap-2">
                <Mail className="size-4" />
                Inbox
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <Send className="size-4" />
                Sent
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="inbox" className="mt-0">
              <div className="space-y-2">
                {receivedMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="size-12 text-gray-300 mx-auto mb-4" />
                    <p>No messages in your inbox</p>
                  </div>
                ) : (
                  receivedMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        !message.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                      }`}
                      onClick={() => handleViewMessage(message.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {!message.read && <div className="size-2 bg-blue-600 rounded-full" />}
                            <p className={`text-sm ${!message.read ? 'font-semibold' : ''}`}>
                              {message.fromName}
                            </p>
                            <span className="text-xs text-gray-500">
                              {format(new Date(message.timestamp), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className={`text-sm ${!message.read ? 'font-semibold' : ''}`}>
                            {message.subject}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sent" className="mt-0">
              <div className="space-y-2">
                {sentMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="size-12 text-gray-300 mx-auto mb-4" />
                    <p>No sent messages</p>
                  </div>
                ) : (
                  sentMessages.map((message) => (
                    <div
                      key={message.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleViewMessage(message.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm">To: {message.toName}</p>
                            <span className="text-xs text-gray-500">
                              {format(new Date(message.timestamp), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm">{message.subject}</p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Message View Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessageData?.subject}</DialogTitle>
          </DialogHeader>
          {selectedMessageData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-sm">
                    <span className="text-gray-500">From:</span> {selectedMessageData.fromName}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">To:</span> {selectedMessageData.toName}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {format(new Date(selectedMessageData.timestamp), 'PPP, p')}
                </p>
              </div>
              <div className="whitespace-pre-wrap">{selectedMessageData.content}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
