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
import { Plus, Search, Eye, Filter, Lock, Unlock, FileText, Upload, CheckCircle2, XCircle, ExternalLink, Calendar as CalendarIcon, Phone, Mail, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { BANKS, LOAN_TYPES } from "../constants";
import { toast } from "sonner";
import { useIsMobile } from "../components/ui/use-mobile";

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
  const isMobile = useIsMobile();
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

    // Sales and other Lead Generators can only see their own applications OR unlocked applications
    if (currentUser?.role === "sales" || currentUser?.role === "backend") {
      filtered = filtered.filter(
        (app) => {
          const isLocked = checkLockStatus(app);
          return app.createdBy === currentUser.id || !isLocked;
        }
      );
    } else if (currentUser?.role === "bank_manager") {
      // Bank managers only see applications assigned specifically to them
      filtered = filtered.filter(
        (app) => app.assignedTo === currentUser.id
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

    // Client Lock Logic: 15 days from now
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

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
      isLocked: true,
      lockedUntil: fifteenDaysFromNow.toISOString(),
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

  const canCreateApplication = currentUser?.role !== "bank_manager";
  const canUpdateStatus =
    currentUser?.role === "owner" ||
    currentUser?.role === "bank_manager" ||
    currentUser?.role === "backend";
  const canUnlock = currentUser?.role === "owner";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Applications
          </h2>
          <p className="text-sm text-gray-500">
            Track and manage loan requests
          </p>
        </div>
        {canCreateApplication && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 h-11 sm:h-10 text-base sm:text-sm">
                <Plus className="size-5 sm:size-4 mr-2" />
                New Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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
      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by name, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11 sm:h-10 text-base sm:text-sm border-gray-100 focus:border-indigo-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-11 sm:h-10 text-base sm:text-sm border-gray-100">
                  <div className="flex items-center gap-2">
                    <Filter className="size-4 text-gray-400" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table/List */}
      <div className="space-y-3">
        {filteredApplications.length === 0 ? (
          <Card className="p-8 text-center text-gray-500 border-dashed">
            No applications found
          </Card>
        ) : isMobile ? (
          // Mobile Card View
          filteredApplications.map((app) => (
            <Card
              key={app.id}
              className="border-none shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
              onClick={() => {
                setSelectedApp(app);
                setIsViewDialogOpen(true);
              }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">#{app.id.slice(0, 8)}</span>
                      <Badge className={`${getStatusColor(app.status)} text-[9px] font-bold px-1.5 h-4 uppercase tracking-tighter border-0 shadow-none`}>
                        {app.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-gray-900 leading-none pt-1">{app.applicantName}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600">₹{(app.loanAmount / 100000).toFixed(1)}L</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{app.loanType}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="size-3 text-gray-400" />
                      <span className="text-[10px] font-medium text-gray-500">{format(new Date(app.createdAt), "dd MMM")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">BANK:</span>
                      <span className="text-[10px] font-bold text-gray-700 truncate max-w-[80px]">{app.bank}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {checkLockStatus(app) ? (
                       <Lock className="size-3 text-red-500" />
                    ) : (
                      <Unlock className="size-3 text-emerald-500" />
                    )}
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{app.createdByName.split(' ')[0]}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Desktop Table View
          <Card className="border-none shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => {
                  const isLocked = checkLockStatus(app);
                  return (
                    <TableRow key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-mono text-xs text-gray-500">#{app.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{app.applicantName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-medium text-gray-500">{app.applicantPhone}</span>
                            {isLocked ? <Lock className="size-3 text-red-500" /> : <Unlock className="size-3 text-emerald-500" />}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs font-semibold text-gray-700">{app.loanType}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">{app.bank}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-black text-indigo-600">₹{(app.loanAmount / 100000).toFixed(1)}L</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(app.status)} text-[10px] font-bold border-0`}>
                          {app.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">{format(new Date(app.createdAt), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
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
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* View/Edit Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      >
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-none">
          <div className="bg-white sticky top-0 z-10 p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className={`p-2 rounded-xl ${selectedApp ? getStatusColor(selectedApp.status).replace('bg-gradient-to-r', 'bg-opacity-10') : 'bg-gray-100'}`}>
                <FileText className="size-5 text-indigo-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Application Details</DialogTitle>
                <p className="text-[10px] font-mono text-gray-400 uppercase">ID: {selectedApp?.id}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => setIsViewDialogOpen(false)}>
              <XCircle className="size-5 text-gray-400" />
            </Button>
          </div>

          {selectedApp && (
            <div className="p-4 sm:p-6 space-y-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl h-11">
                  <TabsTrigger value="details" className="rounded-lg text-xs font-bold uppercase tracking-wider">Info</TabsTrigger>
                  <TabsTrigger value="documents" className="rounded-lg text-xs font-bold uppercase tracking-wider">
                    Docs
                    {selectedApp.documents && (
                      <span className="ml-2 bg-white text-indigo-600 px-1.5 rounded-full text-[10px]">
                        {selectedApp.documents.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-5 pt-4">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border-2 flex items-start gap-3 ${checkLockStatus(selectedApp) ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    {checkLockStatus(selectedApp) ? <Lock className="size-5 text-red-600 shrink-0" /> : <Unlock className="size-5 text-emerald-600 shrink-0" />}
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-tight ${checkLockStatus(selectedApp) ? 'text-red-700' : 'text-emerald-700'}`}>
                        {checkLockStatus(selectedApp) ? `LOCKED (${getDaysRemaining(selectedApp.lockedUntil)} days left)` : 'OPEN APPLICATION'}
                      </p>
                      <p className={`text-[11px] mt-0.5 ${checkLockStatus(selectedApp) ? 'text-red-600' : 'text-emerald-600'}`}>
                        {checkLockStatus(selectedApp)
                          ? `Only ${selectedApp.createdByName} can edit this application.`
                          : "This application is available for processing."}
                      </p>
                    </div>
                  </div>

                  {/* Primary Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Applicant Profile</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="size-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                            {selectedApp.applicantName.slice(0, 1)}
                          </div>
                          <span className="font-bold text-gray-900">{selectedApp.applicantName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="size-3 text-gray-400" />
                          <span>{selectedApp.applicantPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="size-3 text-gray-400" />
                          <span className="truncate">{selectedApp.applicantEmail}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Loan Summary</Label>
                      <div className="space-y-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-indigo-600">₹{selectedApp.loanAmount.toLocaleString("en-IN")}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-white text-gray-600 font-bold text-[10px] uppercase border-gray-200">{selectedApp.loanType}</Badge>
                          <Badge variant="outline" className="bg-white text-indigo-600 font-bold text-[10px] uppercase border-indigo-100">{selectedApp.bank}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Case Description</Label>
                    <div className="bg-gray-50/50 p-4 rounded-2xl text-sm text-gray-700 leading-relaxed border border-gray-50 italic">
                      "{selectedApp.purpose}"
                    </div>
                  </div>

                  {/* Timeline & Assignment */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Staff</Label>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 bg-blue-500 rounded-full"></div>
                          <span className="text-xs font-bold text-gray-700 truncate">{selectedApp.backendAssignedName || "Unassigned"} (Back)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 bg-orange-500 rounded-full"></div>
                          <span className="text-xs font-bold text-gray-700 truncate">{selectedApp.bankEmployeeName || "Unassigned"} (Bank)</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Important Dates</Label>
                      <div className="flex flex-col gap-1 text-[11px] text-gray-500 font-medium">
                        <p>Opened: {format(new Date(selectedApp.createdAt), 'MMM d, yyyy')}</p>
                        <p>Updated: {format(new Date(selectedApp.updatedAt), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {(canUpdateStatus || (canUnlock && checkLockStatus(selectedApp))) && (
                    <div className="pt-4 border-t space-y-4">
                       {canUnlock && checkLockStatus(selectedApp) && (
                        <Button
                          onClick={() => handleUnlock(selectedApp.id)}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-orange-100"
                        >
                          <Unlock className="size-4 mr-2" />
                          ADMIN: FORCE UNLOCK
                        </Button>
                      )}

                      {canUpdateStatus && (
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center block">Change Application Status</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <Button
                              variant={selectedApp.status === "pending" ? "default" : "outline"}
                              size="sm"
                              className={`h-11 rounded-xl font-bold text-xs uppercase ${selectedApp.status === 'pending' ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                              onClick={() => handleUpdateStatus(selectedApp.id, "pending")}
                            >
                              Pending
                            </Button>
                            <Button
                              variant={selectedApp.status === "under_review" ? "default" : "outline"}
                              size="sm"
                              className={`h-11 rounded-xl font-bold text-xs uppercase ${selectedApp.status === 'under_review' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                              onClick={() => handleUpdateStatus(selectedApp.id, "under_review")}
                            >
                              In Review
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-11 rounded-xl font-bold text-xs uppercase text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                              onClick={() => handleUpdateStatus(selectedApp.id, "approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-11 rounded-xl font-bold text-xs uppercase text-red-600 border-red-100 hover:bg-red-50"
                              onClick={() => handleUpdateStatus(selectedApp.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="documents" className="pt-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Required Documents</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Verification Progress</p>
                    </div>
                    {(currentUser?.role === 'sales' || currentUser?.role === 'backend') && (
                      <Button size="sm" onClick={handleUploadDocument} className="bg-indigo-600 h-9 rounded-lg">
                        <Upload className="size-4 mr-2" />
                        Add New
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {!selectedApp.documents || selectedApp.documents.length === 0 ? (
                      <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed flex flex-col items-center">
                        <FileText className="size-8 text-gray-200 mb-2" />
                        <p className="text-xs font-bold text-gray-400 uppercase">No documents attached</p>
                      </div>
                    ) : (
                      selectedApp.documents.map((doc) => (
                        <div key={doc.id} className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="size-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                              <FileText className="size-5 text-indigo-500" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-gray-800 truncate">{doc.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className={`text-[8px] h-3.5 px-1 font-black uppercase border-0 ${
                                  doc.status === 'verified' ? 'text-emerald-600 bg-emerald-50' :
                                  doc.status === 'rejected' ? 'text-red-600 bg-red-50' :
                                  'text-amber-600 bg-amber-50'
                                }`}>
                                  {doc.status}
                                </Badge>
                                <span className="text-[9px] text-gray-400 font-medium">Added {format(new Date(doc.uploadedAt), 'MMM d')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                              <ExternalLink className="size-4 text-gray-400" />
                            </Button>
                            {(currentUser?.role === 'backend' || currentUser?.role === 'bank_manager') && doc.status === 'pending' && (
                              <div className="flex items-center gap-1 border-l pl-1 ml-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-emerald-600 hover:bg-emerald-50"
                                  onClick={() => handleUpdateDocumentStatus(doc.id, 'verified')}
                                >
                                  <CheckCircle2 className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-red-600 hover:bg-red-50"
                                  onClick={() => handleUpdateDocumentStatus(doc.id, 'rejected')}
                                >
                                  <XCircle className="size-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100/50">
                    <div className="flex gap-3">
                      <div className="bg-indigo-600 p-2 rounded-xl shrink-0 h-fit">
                        <CheckCircle2 className="size-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">Document Requirements</p>
                        <p className="text-[11px] text-indigo-700 mt-1 leading-relaxed">
                          Please ensure all documents are clear and original. Standard files include: PAN, Aadhaar, 6m Statements, and 3m Salary slips.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
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