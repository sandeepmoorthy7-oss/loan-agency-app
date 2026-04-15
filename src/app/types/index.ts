export type UserRole = 'owner' | 'sales' | 'backend' | 'bank_manager';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  bankId?: string; // For bank managers
  phone?: string;
  department?: string;
}

export interface PendingUserApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  requestedRole: UserRole;
  bankId?: string;
  department?: string;
  reason: string; // Why they want to join
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface LoanApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  loanAmount: number;
  loanType: string;
  bank: string;
  purpose: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  createdBy: string; // Sales person ID
  createdByName: string;
  assignedTo?: string; // Bank manager ID
  assignedToName?: string;
  bankEmployeeId?: string; // Specific bank employee to deal with
  bankEmployeeName?: string;
  backendAssignedId?: string; // Backend team member assigned
  backendAssignedName?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  documents?: ApplicationDocument[];
  // Lock fields for client theft prevention
  isLocked: boolean;
  lockedUntil?: string; // ISO date string - auto-unlock after 15 days
  unlockRequests?: UnlockRequest[];
}

export interface ApplicationDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  uploadedBy: string;
}

export interface UnlockRequest {
  id: string;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  targetRoles?: UserRole[];
}

export interface Message {
  id: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  notes?: string;
}

export interface PerformanceMetrics {
  userId: string;
  userName: string;
  totalApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  pendingApplications: number;
  conversionRate: number;
  totalLoanAmount: number;
}

export interface Ticket {
  id: string;
  applicationId: string;
  applicantName: string;
  title: string;
  description: string;
  category: 'missing_documents' | 'status_update' | 'clarification' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdBy: string;
  createdByName: string;
  createdByRole: UserRole;
  assignedTo?: string;
  assignedToName?: string;
  bankId?: string;
  bankName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  comments: TicketComment[];
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  comment: string;
  timestamp: string;
}