import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { UserCheck, UserX, Eye, Search, Filter, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PendingUserApplication } from "../types";

export function MemberApplications() {
  const { currentUser } = useAuth();
  const { pendingUserApplications, reviewUserApplication, refreshData } = useData();
  const [selectedApp, setSelectedApp] = useState<PendingUserApplication | null>(null);

  console.log("DEBUG: MemberApplications component rendered", {
    userRole: currentUser?.role,
    applicationsCount: pendingUserApplications.length,
    allApplications: pendingUserApplications
  });
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Only owner can access this page
  if (currentUser?.role !== "owner") {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-semibold">Access Denied</p>
              <p className="text-sm text-gray-500">Only the owner can review member applications.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredApplications = pendingUserApplications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 text-white"><CheckCircle className="size-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 text-white"><XCircle className="size-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500 text-white"><Clock className="size-3 mr-1" />Pending</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge className="bg-purple-500 text-white">Owner</Badge>;
      case "sales":
        return <Badge className="bg-blue-500 text-white">Sales Team</Badge>;
      case "backend":
        return <Badge className="bg-green-500 text-white">Backend Staff</Badge>;
      case "bank_manager":
        return <Badge className="bg-orange-500 text-white">Bank Manager</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const handleApprove = async (app: PendingUserApplication) => {
    if (!currentUser) return;
    
    try {
      toast.loading(`Approving ${app.name}...`);
      await reviewUserApplication(app.id, true, currentUser.id, currentUser.name);
      toast.dismiss();
      toast.success(`${app.name}'s application approved! They can now log in.`);
      setSelectedApp(null);
      setIsViewDialogOpen(false);
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Approval failed: ${error.message || 'Check database permissions'}`);
    }
  };

  const handleReject = async () => {
    if (!currentUser || !selectedApp) return;
    
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    try {
      toast.loading(`Rejecting application...`);
      await reviewUserApplication(selectedApp.id, false, currentUser.id, currentUser.name, rejectionReason);
      toast.dismiss();
      toast.success(`${selectedApp.name}'s application rejected.`);
      setRejectionReason("");
      setSelectedApp(null);
      setIsRejectDialogOpen(false);
      setIsViewDialogOpen(false);
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Rejection failed: ${error.message}`);
    }
  };

  const pendingCount = pendingUserApplications.filter(app => app.status === "pending").length;
  const approvedCount = pendingUserApplications.filter(app => app.status === "approved").length;
  const rejectedCount = pendingUserApplications.filter(app => app.status === "rejected").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Member Applications</h2>
          <p className="text-gray-500">Review and approve new member registration requests</p>
        </div>
        <Button onClick={() => {
          console.log("DEBUG: Manual refresh triggered");
          refreshData();
        }} variant="outline" size="sm">
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="size-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle className="size-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="size-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Requested Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-sm">{app.id}</TableCell>
                      <TableCell className="font-medium">{app.name}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>{app.phone}</TableCell>
                      <TableCell>{getRoleBadge(app.requestedRole)}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(app.appliedAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="size-4" />
                          </Button>
                          {app.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(app)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <UserCheck className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setIsRejectDialogOpen(true);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <UserX className="size-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details - {selectedApp?.id}</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg border-2 ${
                selectedApp.status === "approved" 
                  ? "bg-green-50 border-green-500" 
                  : selectedApp.status === "rejected"
                  ? "bg-red-50 border-red-500"
                  : "bg-yellow-50 border-yellow-500"
              }`}>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedApp.status)}
                  <span className="text-sm font-medium">
                    {selectedApp.status === "pending" && "Awaiting your review"}
                    {selectedApp.status === "approved" && `Approved by ${selectedApp.reviewedByName} on ${selectedApp.reviewedAt && format(new Date(selectedApp.reviewedAt), "PPP")}`}
                    {selectedApp.status === "rejected" && `Rejected by ${selectedApp.reviewedByName} on ${selectedApp.reviewedAt && format(new Date(selectedApp.reviewedAt), "PPP")}`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Full Name</Label>
                  <p className="text-sm font-medium">{selectedApp.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Email</Label>
                  <p className="text-sm">{selectedApp.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Phone</Label>
                  <p className="text-sm">{selectedApp.phone}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Requested Role</Label>
                  <div>{getRoleBadge(selectedApp.requestedRole)}</div>
                </div>
                {selectedApp.bankId && (
                  <div>
                    <Label className="text-xs text-gray-500">Bank</Label>
                    <p className="text-sm">{selectedApp.bankId}</p>
                  </div>
                )}
                {selectedApp.department && (
                  <div>
                    <Label className="text-xs text-gray-500">Department</Label>
                    <p className="text-sm">{selectedApp.department}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-gray-500">Applied Date</Label>
                  <p className="text-sm">{format(new Date(selectedApp.appliedAt), "PPP")}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Reason for Joining</Label>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedApp.reason}</p>
              </div>

              {selectedApp.status === "rejected" && selectedApp.rejectionReason && (
                <div>
                  <Label className="text-xs text-red-500">Rejection Reason</Label>
                  <p className="text-sm mt-1 p-3 bg-red-50 rounded-md text-red-700">{selectedApp.rejectionReason}</p>
                </div>
              )}

              {selectedApp.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleApprove(selectedApp)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <UserCheck className="size-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setIsRejectDialogOpen(true);
                    }}
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                  >
                    <UserX className="size-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedApp?.name}'s application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this application is being rejected..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700 text-white">
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
