import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { LoanApplication, ApplicationDocument } from "../types";
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
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Search, Eye, Filter, Lock, Unlock, FileText, Upload, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { BANKS, LOAN_TYPES } from "../constants";
import { toast } from "sonner";

export function Applications() {
  const { currentUser } = useAuth();
  const {
    loanApplications,
    users,
    addLoanApplication,
    updateLoanApplication,
    requestUnlock,
    unlockApplication,
  } = useData();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<string>("all");
  const [selectedApp, setSelectedApp] =
    useState<LoanApplication | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] =
    useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] =
    useState(false);
  const [isUnlockDialogOpen, setIsUnlockDialogOpen] =
    useState(false);
  const [unlockReason, setUnlockReason] = useState("");

  // Handle filter from navigation state
  useEffect(() => {
    if (location.state && location.state.filter) {
      setStatusFilter(location.state.filter);
    }
  }, [location.state]);

  const handleUpdateDocumentStatus = (docId: string, status: ApplicationDocument['status']) => {
    if (!selectedApp) return;

    const updatedDocs = (selectedApp.documents || []).map(doc =>
      doc.id === docId ? { ...doc, status } : doc
    );

    updateLoanApplication(selectedApp.id, { documents: updatedDocs });
    toast.success(`Document ${status}`);

    // Update local state for immediate UI feedback
    setSelectedApp({
      ...selectedApp,
      documents: updatedDocs
    });
  };

  const handleUploadDocument = () => {
    if (!selectedApp || !currentUser) return;

    // In a real app, this would involve Supabase Storage
    const newDoc: ApplicationDocument = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Document.pdf",
      url: "#",
      type: "PDF",
      status: "pending",
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser.id,
    };

    const updatedDocs = [...(selectedApp.documents || []), newDoc];
    updateLoanApplication(selectedApp.id, { documents: updatedDocs });
    toast.success("Document uploaded successfully");

    setSelectedApp({
      ...selectedApp,
      documents: updatedDocs
    });
  };

  // Form state for new application
  const [formData, setFormData] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    loanAmount: "",
    loanType: "",
    bank: "",
    bankEmployeeId: "",
    backendAssignedId: "",
    purpose: "",
  });

  // Check if application is locked and auto-unlock if period has passed
  const checkLockStatus = (app: LoanApplication) => {
    if (!app.isLocked) return false;
    if (!app.lockedUntil) return false;
    
    const now = new Date();
    const lockUntil = new Date(app.lockedUntil);
    
    // If lock period has passed, auto-unlock
    if (now > lockUntil) {
      unlockApplication(app.id);
      return false;
    }
    
    return true;
  };

  // Calculate days remaining for lock
  const getDaysRemaining = (lockedUntil?: string) => {
    if (!lockedUntil) return 0;
    const now = new Date();
    const lockEnd = new Date(lockedUntil);
    const diffTime = lockEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Filter applications based on user role and lock status
  const getFilteredApplications = () => {
    let filtered = loanApplications;

    if (currentUser?.role === "sales") {
      // Sales can only see their own applications OR unlocked applications
      filtered = filtered.filter(
        (app) => {
          const isLocked = checkLockStatus(app);
          return app.createdBy === currentUser.id || !isLocked;
        }
      );
    } else if (currentUser?.role === "bank_manager") {
      filtered = filtered.filter(
        (app) => app.bank === currentUser.bankId,
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.applicantName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.id
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.bank
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (app) => app.status === statusFilter,
      );
    }

    return filtered;
  };

  const filteredApplications = getFilteredApplications();

  // Get bank employees for selected bank
  const bankEmployees = formData.bank
    ? users.filter(
        (user) =>
          user.role === "bank_manager" &&
          user.bankId === formData.bank,
      )
    : [];

  // Get backend staff
  const backendStaff = users.filter(
    (user) => user.role === "backend",
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
      case "rejected":
        return "bg-gradient-to-r from-red-500 to-rose-500 text-white";
      case "under_review":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
      default:
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
    }
  };

  const handleCreateApplication = () => {
    if (!currentUser) return;

    // Find selected bank employee details
    const selectedBankEmployee = users.find(
      (user) => user.id === formData.bankEmployeeId,
    );

    // Find selected backend staff details
    const selectedBackendStaff = users.find(
      (user) => user.id === formData.backendAssignedId,
    );

    addLoanApplication({
      applicantName: formData.applicantName,
      applicantEmail: formData.applicantEmail,
      applicantPhone: formData.applicantPhone,
      loanAmount: Number(formData.loanAmount),
      loanType: formData.loanType,
      bank: formData.bank,
      purpose: formData.purpose,
      status: "pending",
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      assignedTo:
        formData.bankEmployeeId || selectedBankEmployee?.id,
      assignedToName: selectedBankEmployee?.name,
      bankEmployeeId: formData.bankEmployeeId,
      bankEmployeeName: selectedBankEmployee?.name,
      backendAssignedId: formData.backendAssignedId,
      backendAssignedName: selectedBackendStaff?.name,
    });

    toast.success("Loan application created successfully!");
    setIsCreateDialogOpen(false);
    setFormData({
      applicantName: "",
      applicantEmail: "",
      applicantPhone: "",
      loanAmount: "",
      loanType: "",
      bank: "",
      bankEmployeeId: "",
      backendAssignedId: "",
      purpose: "",
    });
  };

  const handleUpdateStatus = (
    appId: string,
    newStatus: LoanApplication["status"],
  ) => {
    updateLoanApplication(appId, { status: newStatus });
    toast.success("Application status updated");
    setSelectedApp(null);
    setIsViewDialogOpen(false);
  };

  const handleRequestUnlock = () => {
    if (!currentUser || !selectedApp) return;
    
    requestUnlock(
      selectedApp.id,
      currentUser.id,
      currentUser.name,
      unlockReason
    );
    toast.success("Unlock request submitted to owner");
    setIsUnlockDialogOpen(false);
    setUnlockReason("");
  };

  const handleUnlock = (appId: string) => {
    unlockApplication(appId);
    toast.success("Application unlocked successfully");
  };

  const canCreateApplication = currentUser?.role === "sales";
  const canUpdateStatus =
    currentUser?.role === "owner" ||
    currentUser?.role === "bank_manager" ||
    currentUser?.role === "backend";
  const canUnlock = currentUser?.role === "owner";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Loan Applications
          </h2>
          <p className="text-gray-500">
            Manage and track all loan applications
          </p>
        </div>
        {canCreateApplication && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                New Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Create Loan Application
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="applicantName">
                      Applicant Name *
                    </Label>
                    <Input
                      id="applicantName"
                      value={formData.applicantName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          applicantName: e.target.value,
                        })
                      }
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicantEmail">
                      Email *
                    </Label>
                    <Input
                      id="applicantEmail"
                      type="email"
                      value={formData.applicantEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          applicantEmail: e.target.value,
                        })
                      }
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="applicantPhone">
                      Phone Number *
                    </Label>
                    <Input
                      id="applicantPhone"
                      value={formData.applicantPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          applicantPhone: e.target.value,
                        })
                      }
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">
                      Loan Amount (₹) *
                    </Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      value={formData.loanAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          loanAmount: e.target.value,
                        })
                      }
                      placeholder="500000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loanType">
                      Loan Type *
                    </Label>
                    <Select
                      value={formData.loanType}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          loanType: val,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan type" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOAN_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank">Bank *</Label>
                    <Select
                      value={formData.bank}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          bank: val,
                          bankEmployeeId: "",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {BANKS.map((bank) => (
                          <SelectItem key={bank} value={bank}>
                            {bank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose *</Label>
                  <Textarea
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purpose: e.target.value,
                      })
                    }
                    placeholder="Describe the purpose of the loan"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankEmployeeId">
                      Bank Employee *
                    </Label>
                    <Select
                      value={formData.bankEmployeeId}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          bankEmployeeId: val,
                        })
                      }
                      disabled={!formData.bank}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            formData.bank
                              ? "Select bank employee"
                              : "Select a bank first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {bankEmployees.map((employee) => (
                          <SelectItem
                            key={employee.id}
                            value={employee.id}
                          >
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backendAssignedId">
                      Backend Staff *
                    </Label>
                    <Select
                      value={formData.backendAssignedId}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          backendAssignedId: val,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select backend staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {backendStaff.map((staff) => (
                          <SelectItem
                            key={staff.id}
                            value={staff.id}
                          >
                            {staff.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateApplication}
                    disabled={
                      !formData.applicantName ||
                      !formData.applicantEmail ||
                      !formData.applicantPhone ||
                      !formData.loanAmount ||
                      !formData.loanType ||
                      !formData.bank ||
                      !formData.bankEmployeeId ||
                      !formData.backendAssignedId ||
                      !formData.purpose
                    }
                  >
                    Create Application
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by applicant name, ID, or bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-gray-400" />
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Status
                  </SelectItem>
                  <SelectItem value="pending">
                    Pending
                  </SelectItem>
                  <SelectItem value="under_review">
                    Under Review
                  </SelectItem>
                  <SelectItem value="approved">
                    Approved
                  </SelectItem>
                  <SelectItem value="rejected">
                    Rejected
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Applications ({filteredApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Lock Status</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Loan Type</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center text-gray-500 py-8"
                    >
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => {
                    const isLocked = checkLockStatus(app);
                    const daysRemaining = getDaysRemaining(app.lockedUntil);
                    
                    return (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-sm">
                        {app.id}
                      </TableCell>
                      <TableCell>
                        {isLocked ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 px-2 py-1 bg-red-100 border-2 border-red-500 rounded-md">
                              <Lock className="size-4 text-red-600" />
                              <span className="text-xs font-bold text-red-700">
                                LOCKED
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs bg-orange-50 border-orange-300 text-orange-700">
                              {daysRemaining}d left
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 border-2 border-green-500 rounded-md">
                            <Unlock className="size-4 text-green-600" />
                            <span className="text-xs font-bold text-green-700">
                              UNLOCKED
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {app.applicantName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {app.applicantEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{app.loanType}</TableCell>
                      <TableCell>{app.bank}</TableCell>
                      <TableCell>
                        ₹{(app.loanAmount / 100000).toFixed(1)}L
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(app.status)}
                          variant="secondary"
                        >
                          {app.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{app.createdByName}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(
                          new Date(app.createdAt),
                          "MMM dd, yyyy",
                        )}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View/Edit Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Application Details - {selectedApp?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Information</TabsTrigger>
                <TabsTrigger value="documents">
                  Documents
                  {selectedApp.documents && (
                    <Badge variant="secondary" className="ml-2 bg-indigo-100">
                      {selectedApp.documents.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-4">
                {/* Existing details content */}
                <div className="space-y-4">
                  {/* Lock Status Banner */}
                  {checkLockStatus(selectedApp) ? (
                    <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Lock className="size-6 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-red-900">🔒 APPLICATION LOCKED</h4>
                            <Badge className="bg-red-600 text-white">
                              {getDaysRemaining(selectedApp.lockedUntil)} days remaining
                            </Badge>
                          </div>
                          <p className="text-sm text-red-700 mt-1">
                            This application is locked to {selectedApp.createdByName} until{' '}
                            {selectedApp.lockedUntil && format(new Date(selectedApp.lockedUntil), 'PPP')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Unlock className="size-6 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-bold text-green-900">🔓 APPLICATION UNLOCKED</h4>
                          <p className="text-sm text-green-700 mt-1">
                            This application is available for all sales team members.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Applicant</Label>
                      <p className="text-base font-semibold text-gray-900">{selectedApp.applicantName}</p>
                      <p className="text-xs text-gray-500">{selectedApp.applicantEmail}</p>
                      <p className="text-xs text-gray-500">{selectedApp.applicantPhone}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loan Details</Label>
                      <p className="text-base font-semibold text-indigo-700">₹{selectedApp.loanAmount.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-gray-500 font-medium">{selectedApp.loanType}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Current Status</Label>
                      <div className="mt-1">
                        <Badge className={`${getStatusColor(selectedApp.status)} shadow-sm`}>
                          {selectedApp.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-2">
                    <div>
                      <Label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Bank Assignment</Label>
                      <p className="text-sm font-semibold text-gray-800">{selectedApp.bank}</p>
                      <p className="text-xs text-gray-600">Employee: {selectedApp.bankEmployeeName || "Unassigned"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Internal Assignment</Label>
                      <p className="text-sm font-semibold text-gray-800">Sales: {selectedApp.createdByName}</p>
                      <p className="text-xs text-gray-600">Backend: {selectedApp.backendAssignedName || "Unassigned"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Timeline</Label>
                      <p className="text-xs text-gray-600">Created: {format(new Date(selectedApp.createdAt), 'MMM d, yyyy')}</p>
                      <p className="text-xs text-gray-600">Updated: {format(new Date(selectedApp.updatedAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <Label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Purpose</Label>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{selectedApp.purpose}</p>
                  </div>

                  {/* Owner Unlock Button */}
                  {canUnlock && checkLockStatus(selectedApp) && (
                    <div className="pt-4 border-t">
                      <Label className="text-sm mb-2 block text-orange-700">🔓 Owner Controls</Label>
                      <Button
                        onClick={() => handleUnlock(selectedApp.id)}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Unlock className="size-4 mr-2" />
                        Unlock Application (Override 15-Day Lock)
                      </Button>
                    </div>
                  )}

                  {canUpdateStatus && (
                    <div className="pt-4 border-t">
                      <Label className="text-sm font-bold mb-3 block">Application Actions</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={selectedApp.status === "pending" ? "default" : "outline"}
                          onClick={() => handleUpdateStatus(selectedApp.id, "pending")}
                        >
                          Pending
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedApp.status === "under_review" ? "default" : "outline"}
                          onClick={() => handleUpdateStatus(selectedApp.id, "under_review")}
                        >
                          Under Review
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(selectedApp.id, "approved")}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(selectedApp.id, "rejected")}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Verification Documents</h3>
                  {(currentUser?.role === 'sales' || currentUser?.role === 'backend') && (
                    <Button size="sm" onClick={handleUploadDocument} className="bg-indigo-600">
                      <Upload className="size-4 mr-2" />
                      Upload Document
                    </Button>
                  )}
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!selectedApp.documents || selectedApp.documents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No documents uploaded yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedApp.documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="size-4 text-indigo-500" />
                                <span className="font-medium text-sm">{doc.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                doc.status === 'verified' ? 'text-green-700 bg-green-50 border-green-200' :
                                doc.status === 'rejected' ? 'text-red-700 bg-red-50 border-red-200' :
                                'text-yellow-700 bg-yellow-50 border-yellow-200'
                              }>
                                {doc.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {users.find(u => u.id === doc.uploadedBy)?.name || doc.uploadedBy}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500">
                              {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="size-8">
                                  <ExternalLink className="size-4" />
                                </Button>
                                {(currentUser?.role === 'backend' || currentUser?.role === 'bank_manager') && doc.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 text-green-600 hover:text-green-700"
                                      onClick={() => handleUpdateDocumentStatus(doc.id, 'verified')}
                                    >
                                      <CheckCircle2 className="size-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 text-red-600 hover:text-red-700"
                                      onClick={() => handleUpdateDocumentStatus(doc.id, 'rejected')}
                                    >
                                      <XCircle className="size-4" />
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

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                  <div className="bg-blue-100 p-2 rounded-full h-fit">
                    <FileText className="size-5 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900">Document Checklist</p>
                    <ul className="list-disc list-inside text-blue-700 mt-1 space-y-1">
                      <li>PAN Card & Aadhaar Card</li>
                      <li>Last 6 months Bank Statement</li>
                      <li>Salary Slips (3 months) / ITR (2 years)</li>
                      <li>Address Proof (Voter ID/Utility Bill)</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Unlock Dialog */}
      <Dialog
        open={isUnlockDialogOpen}
        onOpenChange={setIsUnlockDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Unlock Application - {selectedApp?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">
                    Applicant Name
                  </Label>
                  <p className="text-sm">
                    {selectedApp.applicantName}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Email
                  </Label>
                  <p className="text-sm">
                    {selectedApp.applicantEmail}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Phone
                  </Label>
                  <p className="text-sm">
                    {selectedApp.applicantPhone}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Loan Amount
                  </Label>
                  <p className="text-sm">
                    ₹
                    {selectedApp.loanAmount.toLocaleString(
                      "en-IN",
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Loan Type
                  </Label>
                  <p className="text-sm">
                    {selectedApp.loanType}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Bank
                  </Label>
                  <p className="text-sm">{selectedApp.bank}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Status
                  </Label>
                  <Badge
                    className={getStatusColor(
                      selectedApp.status,
                    )}
                    variant="secondary"
                  >
                    {selectedApp.status.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Created By
                  </Label>
                  <p className="text-sm">
                    {selectedApp.createdByName}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Bank Employee
                  </Label>
                  <p className="text-sm">
                    {selectedApp.bankEmployeeName ||
                      "Not assigned"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Backend Staff
                  </Label>
                  <p className="text-sm">
                    {selectedApp.backendAssignedName ||
                      "Not assigned"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Created Date
                  </Label>
                  <p className="text-sm">
                    {format(
                      new Date(selectedApp.createdAt),
                      "PPP",
                    )}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">
                  Purpose
                </Label>
                <p className="text-sm mt-1">
                  {selectedApp.purpose}
                </p>
              </div>
              {selectedApp.notes && (
                <div>
                  <Label className="text-xs text-gray-500">
                    Notes
                  </Label>
                  <p className="text-sm mt-1">
                    {selectedApp.notes}
                  </p>
                </div>
              )}

              {canUpdateStatus && (
                <div className="pt-4 border-t">
                  <Label className="text-sm mb-2 block">
                    Update Status
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleUpdateStatus(
                          selectedApp.id,
                          "pending",
                        )
                      }
                      disabled={
                        selectedApp.status === "pending"
                      }
                    >
                      Pending
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleUpdateStatus(
                          selectedApp.id,
                          "under_review",
                        )
                      }
                      disabled={
                        selectedApp.status === "under_review"
                      }
                    >
                      Under Review
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleUpdateStatus(
                          selectedApp.id,
                          "approved",
                        )
                      }
                      disabled={
                        selectedApp.status === "approved"
                      }
                      className="text-green-600 hover:text-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleUpdateStatus(
                          selectedApp.id,
                          "rejected",
                        )
                      }
                      disabled={
                        selectedApp.status === "rejected"
                      }
                      className="text-red-600 hover:text-red-700"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}