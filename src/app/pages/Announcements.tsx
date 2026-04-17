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
import { Megaphone, Plus, AlertCircle, Info, AlertTriangle, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useIsMobile } from '../components/ui/use-mobile';

export function Announcements() {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  const { announcements, addAnnouncement } = useData();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const handleCreateAnnouncement = () => {
    if (!currentUser) return;

    addAnnouncement({
      title: formData.title,
      message: formData.message,
      priority: formData.priority,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
    });

    toast.success('Announcement created successfully!');
    setIsCreateDialogOpen(false);
    setFormData({
      title: '',
      message: '',
      priority: 'medium',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-red-300';
      case 'medium':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-300';
      default:
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="size-5 text-white" />;
      case 'medium':
        return <AlertTriangle className="size-5 text-white" />;
      default:
        return <Info className="size-5 text-white" />;
    }
  };

  const isOwner = currentUser?.role === 'owner';

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-3">
              <Megaphone className="size-6 md:size-8" />
              Announcements
            </h2>
            <p className="text-white/90 text-sm md:text-lg">Important updates and notifications</p>
          </div>
          {isOwner && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-purple-600 hover:bg-white/90 w-full md:w-auto h-11 md:h-10 rounded-xl font-semibold">
                  <Plus className="size-4 mr-2" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] md:max-w-lg rounded-2xl p-4 md:p-6">
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Announcement title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Type your announcement message..."
                      rows={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(val: any) => setFormData({ ...formData, priority: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateAnnouncement}
                      disabled={!formData.title || !formData.message}
                    >
                      Create Announcement
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:gap-6">
        {announcements.length === 0 ? (
          <Card className="border-2 border-dashed rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Megaphone className="size-12 mb-4 text-gray-400" />
              <p>No announcements yet</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className="hover:shadow-md transition-all border-none shadow-sm rounded-2xl overflow-hidden"
            >
              <div
                className="h-1.5 w-full"
                style={{
                  backgroundColor:
                    announcement.priority === 'high'
                      ? '#ef4444'
                      : announcement.priority === 'medium'
                      ? '#f59e0b'
                      : '#10b981',
                }}
              />
              <CardHeader className="p-4 md:p-6 pb-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge className={`${getPriorityColor(announcement.priority)} border-none text-[10px] md:text-xs px-2 py-0.5`}>
                      <span className="flex items-center gap-1">
                        {getPriorityIcon(announcement.priority)}
                        {announcement.priority.toUpperCase()}
                      </span>
                    </Badge>
                    <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="size-3" />
                      {format(new Date(announcement.createdAt), isMobile ? 'MMM d, h:mm a' : 'PPP p')}
                    </span>
                  </div>
                  <CardTitle className="text-lg md:text-xl font-bold text-gray-900">{announcement.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-gray-600 mb-4 whitespace-pre-wrap text-sm md:text-base leading-relaxed">{announcement.message}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 border-t pt-3">
                  <User className="size-3.5" />
                  <span>Posted by:</span>
                  <span className="font-semibold text-gray-600">{announcement.createdByName}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}