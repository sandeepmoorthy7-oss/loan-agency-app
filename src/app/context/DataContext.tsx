import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from './AuthContext';
import {
  LoanApplication,
  Announcement,
  Message,
  AttendanceRecord,
  PerformanceMetrics,
  Ticket,
  PendingUserApplication,
  User,
} from '../types';

interface DataContextType {
  loanApplications: LoanApplication[];
  announcements: Announcement[];
  messages: Message[];
  attendanceRecords: AttendanceRecord[];
  tickets: Ticket[];
  pendingUserApplications: PendingUserApplication[];
  users: User[];
  addLoanApplication: (application: any) => void;
  updateLoanApplication: (id: string, updates: any) => void;
  addAnnouncement: (announcement: any) => void;
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  markMessageAsRead: (id: string) => Promise<void>;
  addAttendanceRecord: (record: any) => void;
  updateAttendanceRecord: (id: string, updates: any) => void;
  getPerformanceMetrics: () => PerformanceMetrics[];
  addTicket: (ticket: any) => void;
  updateTicket: (id: string, updates: any) => void;
  addTicketComment: (ticketId: string, comment: any) => void;
  requestUnlock: (applicationId: string, requestedBy: string, requestedByName: string, reason: string) => void;
  reviewUnlockRequest: (applicationId: string, requestId: string, approved: boolean, reviewedBy: string, reviewedByName: string) => void;
  unlockApplication: (applicationId: string) => void;
  submitUserApplication: (application: any) => Promise<void>;
  reviewUserApplication: (id: string, approved: boolean, reviewedBy: string, reviewedByName: string, rejectionReason?: string) => Promise<void>;
  uploadDocument: (applicationId: string, file: File) => Promise<void>;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pendingUserApplications, setPendingUserApplications] = useState<PendingUserApplication[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Refresh data when the user changes (e.g., on login)
  useEffect(() => {
    if (currentUser) {
      console.log("DEBUG: currentUser changed, refreshing all data...", currentUser.email);
      refreshData();
    }
  }, [currentUser?.id]);

  const fetchLoanApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*, unlock_requests(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Fetch applications failed:", error);
        setLoanApplications([]);
        return;
      }

      const mapped = (data || []).map((app: any) => ({
        id: String(app.id),
        applicantName: app.applicant_name,
        applicantEmail: app.applicant_email,
        applicantPhone: app.applicant_phone,
        loanAmount: app.loan_amount,
        loanType: app.loan_type,
        bank: app.bank,
        purpose: app.purpose,
        status: app.status,
        createdBy: app.created_by,
        createdByName: app.created_by_name,
        assignedTo: app.assigned_to,
        assignedToName: app.assigned_to_name,
        bankEmployeeId: app.bank_employee_id,
        bankEmployeeName: app.bank_employee_name,
        backendAssignedId: app.backend_assigned_id,
        backendAssignedName: app.backend_assigned_name,
        createdAt: app.created_at,
        updatedAt: app.updated_at,
        notes: app.notes,
        isLocked: app.is_locked,
        lockedUntil: app.locked_until,
        documents: app.documents || [],
        unlockRequests: (app.unlock_requests || []).map((ur: any) => ({
          id: String(ur.id),
          requestedBy: ur.requested_by,
          requestedByName: ur.requested_by_name,
          requestedAt: ur.created_at,
          reason: ur.reason,
          status: ur.status,
          reviewedBy: ur.reviewed_by,
          reviewedByName: ur.reviewed_by_name,
          reviewedAt: ur.reviewed_at,
        })),
      }));

      setLoanApplications(mapped);
    } catch (e) {
      console.error("Fetch applications failed", e);
      setLoanApplications([]);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setAnnouncements([]);
        return;
      }

      const mapped = (data || []).map((ann: any) => ({
        id: String(ann.id),
        title: ann.title,
        message: ann.message,
        createdBy: ann.created_by,
        createdByName: ann.created_by_name,
        createdAt: ann.created_at,
        priority: ann.priority,
        targetRoles: ann.target_roles,
      }));

      setAnnouncements(mapped);
    } catch (e) {
      setAnnouncements([]);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, ticket_comments(*)')
        .order('created_at', { ascending: false });

      if (error) {
        setTickets([]);
        return;
      }

      const mapped = (data || []).map((t: any) => ({
        id: String(t.id),
        applicationId: t.application_id,
        applicantName: t.applicant_name,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status,
        createdBy: t.created_by,
        createdByName: t.created_by_name,
        createdByRole: t.created_by_role,
        assignedTo: t.assigned_to,
        assignedToName: t.assigned_to_name,
        bankId: t.bank_id,
        bankName: t.bank_name,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        resolvedAt: t.resolved_at,
        comments: (t.ticket_comments || []).map((c: any) => ({
          id: String(c.id),
          ticketId: String(c.ticket_id),
          userId: c.user_id,
          userName: c.user_name,
          userRole: c.user_role,
          comment: c.comment,
          timestamp: c.created_at,
        })),
      }));

      setTickets(mapped);
    } catch (e) {
      setTickets([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) {
        setUsers([]);
        return;
      }

      setUsers(data || []);
    } catch (e) {
      setUsers([]);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setMessages([]);
        return;
      }

      const mapped = (data || []).map((m: any) => ({
        id: String(m.id),
        from: m.from_id,
        fromName: m.from_name,
        to: m.to_id,
        toName: m.to_name,
        subject: m.subject,
        content: m.message || m.content || '', // Handle both possibilities
        timestamp: m.created_at,
        read: m.read,
      }));

      setMessages(mapped);
    } catch (e) {
      setMessages([]);
    }
  };

  const fetchPendingUserApplications = async () => {
    try {
      console.log("DEBUG: Fetching pending user applications...");
      const { data, error } = await supabase
        .from('member_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("DEBUG: Fetch applications failed with error:", error);
        setPendingUserApplications([]);
        return;
      }

      console.log(`DEBUG: Fetched ${data?.length || 0} applications`);
      if (data && data.length > 0) {
        console.log("DEBUG: First few applications:", data.slice(0, 2).map(a => ({ id: a.id, email: a.email, status: a.status })));
      }
      const mapped = (data || []).map((app: any) => ({
        id: String(app.id),
        name: app.name,
        email: app.email,
        phone: app.phone,
        password: app.password,
        requestedRole: app.requested_role,
        bankId: app.bank_id,
        department: app.department,
        reason: app.reason,
        status: app.status,
        appliedAt: app.created_at,
        reviewedBy: app.reviewed_by,
        reviewedByName: app.reviewed_by_name,
        reviewedAt: app.reviewed_at,
        rejectionReason: app.rejection_reason,
      }));

      setPendingUserApplications(mapped);
    } catch (e) {
      setPendingUserApplications([]);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        setAttendanceRecords([]);
        return;
      }

      const mapped = (data || []).map((r: any) => ({
        id: String(r.id),
        userId: r.user_id,
        userName: r.user_name,
        date: r.date,
        checkIn: r.check_in,
        checkOut: r.check_out,
        status: r.status,
        notes: r.notes,
      }));

      setAttendanceRecords(mapped);
    } catch (e) {
      setAttendanceRecords([]);
    }
  };

  const refreshData = async () => {
    console.log("DEBUG: refreshData called - forcing full fetch");
    await Promise.all([
      fetchUsers(),
      fetchMessages(),
      fetchLoanApplications(),
      fetchAnnouncements(),
      fetchTickets(),
      fetchPendingUserApplications(),
      fetchAttendanceRecords()
    ]);
  };

  useEffect(() => {
    fetchUsers();
    fetchMessages();
    fetchLoanApplications();
    fetchAnnouncements();
    fetchTickets();
    fetchPendingUserApplications();
    fetchAttendanceRecords();

    // Real-time subscriptions
    const channels = [
      supabase.channel('public:messages').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchMessages),
      supabase.channel('public:loan_applications').on('postgres_changes', { event: '*', schema: 'public', table: 'loan_applications' }, fetchLoanApplications),
      supabase.channel('public:announcements').on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, fetchAnnouncements),
      supabase.channel('public:tickets').on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, fetchTickets),
      supabase.channel('public:ticket_comments').on('postgres_changes', { event: '*', schema: 'public', table: 'ticket_comments' }, fetchTickets),
      supabase.channel('public:attendance_records').on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, fetchAttendanceRecords),
      supabase.channel('public:member_applications').on('postgres_changes', { event: '*', schema: 'public', table: 'member_applications' }, fetchPendingUserApplications),
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  const addMessage = async (msg: Omit<Message, 'id' | 'timestamp'>) => {
    try {
      console.log("DEBUG: addMessage called", msg);
      const { error } = await supabase.from('messages').insert([
        {
          from_id: msg.from,
          from_name: msg.fromName,
          to_id: msg.to,
          to_name: msg.toName,
          subject: msg.subject,
          message: msg.content, // Using 'message' column instead of 'content'
          read: false,
        },
      ]);
      if (error) {
        console.error("DEBUG: Supabase insert error:", error);
        throw error;
      }
      await fetchMessages();
    } catch (err) {
      console.error("Add message failed:", err);
      throw err;
    }
  };

  const markMessageAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', id);
      if (error) throw error;
      fetchMessages();
    } catch (err) {
      console.error("Mark message as read failed:", err);
    }
  };

  const addLoanApplication = async (app: any) => {
    try {
      const { error } = await supabase.from('loan_applications').insert([
        {
          applicant_name: app.applicantName,
          applicant_email: app.applicantEmail,
          applicant_phone: app.applicantPhone,
          loan_amount: app.loanAmount,
          loan_type: app.loanType,
          bank: app.bank,
          purpose: app.purpose,
          status: app.status || 'pending',
          created_by: app.createdBy,
          created_by_name: app.createdByName,
          assigned_to: app.assignedTo,
          assigned_to_name: app.assignedToName,
          bank_employee_id: app.bankEmployeeId,
          bank_employee_name: app.bankEmployeeName,
          backend_assigned_id: app.backendAssignedId,
          backend_assigned_name: app.backendAssignedName,
          is_locked: app.isLocked || false,
          locked_until: app.lockedUntil,
        },
      ]);
      if (error) throw error;
      fetchLoanApplications();
    } catch (err) {
      console.error("Add application failed:", err);
    }
  };

  const updateLoanApplication = async (id: string, updates: any) => {
    try {
      const payload: any = {};
      if (updates.status) payload.status = updates.status;
      if (updates.notes) payload.notes = updates.notes;
      if (updates.isLocked !== undefined) payload.is_locked = updates.isLocked;
      if (updates.lockedUntil) payload.locked_until = updates.lockedUntil;
      if (updates.documents) payload.documents = updates.documents;

      const { error } = await supabase
        .from('loan_applications')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      fetchLoanApplications();
    } catch (err) {
      console.error("Update application failed:", err);
    }
  };

  const addAnnouncement = async (ann: any) => {
    try {
      const { error } = await supabase.from('announcements').insert([
        {
          title: ann.title,
          message: ann.message,
          created_by: ann.createdBy,
          created_by_name: ann.createdByName,
          priority: ann.priority,
          target_roles: ann.targetRoles,
        },
      ]);
      if (error) throw error;
      fetchAnnouncements();
    } catch (err) {
      console.error("Add announcement failed:", err);
    }
  };

  const addTicket = async (t: any) => {
    try {
      const { error } = await supabase.from('tickets').insert([
        {
          application_id: t.applicationId,
          applicant_name: t.applicantName,
          title: t.title,
          description: t.description,
          category: t.category,
          priority: t.priority,
          status: t.status || 'open',
          created_by: t.createdBy,
          created_by_name: t.createdByName,
          created_by_role: t.createdByRole,
          assigned_to: t.assignedTo,
          assigned_to_name: t.assignedToName,
          bank_id: t.bankId,
          bank_name: t.bankName,
        },
      ]);
      if (error) throw error;
      fetchTickets();
    } catch (err) {
      console.error("Add ticket failed:", err);
    }
  };

  const updateTicket = async (id: string, updates: any) => {
    try {
      const payload: any = {};
      if (updates.status) payload.status = updates.status;
      if (updates.resolvedAt) payload.resolved_at = updates.resolvedAt;

      const { error } = await supabase
        .from('tickets')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      fetchTickets();
    } catch (err) {
      console.error("Update ticket failed:", err);
    }
  };

  const addTicketComment = async (ticketId: string, comment: any) => {
    try {
      const { error } = await supabase.from('ticket_comments').insert([
        {
          ticket_id: ticketId,
          user_id: comment.userId,
          user_name: comment.userName,
          user_role: comment.userRole,
          comment: comment.comment,
        },
      ]);
      if (error) throw error;
      fetchTickets();
    } catch (err) {
      console.error("Add comment failed:", err);
    }
  };

  const addAttendanceRecord = async (record: any) => {
    try {
      const { error } = await supabase.from('attendance_records').insert([
        {
          user_id: record.userId,
          user_name: record.userName,
          date: record.date,
          check_in: record.checkIn,
          check_out: record.checkOut,
          status: record.status,
          notes: record.notes,
        },
      ]);
      if (error) throw error;
      fetchAttendanceRecords();
    } catch (err) {
      console.error("Add attendance record failed:", err);
    }
  };

  const updateAttendanceRecord = async (id: string, updates: any) => {
    try {
      const payload: any = {};
      if (updates.checkIn) payload.check_in = updates.checkIn;
      if (updates.checkOut) payload.check_out = updates.checkOut;
      if (updates.status) payload.status = updates.status;
      if (updates.notes) payload.notes = updates.notes;

      const { error } = await supabase
        .from('attendance_records')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      fetchAttendanceRecords();
    } catch (err) {
      console.error("Update attendance record failed:", err);
    }
  };

  const getPerformanceMetrics = (): PerformanceMetrics[] => {
    return users.map(user => {
      const userApps = loanApplications.filter(app => app.createdBy === user.id);
      const totalApplications = userApps.length;
      const approvedApplications = userApps.filter(app => app.status === 'approved').length;
      const rejectedApplications = userApps.filter(app => app.status === 'rejected').length;
      const pendingApplications = userApps.filter(app => app.status === 'pending').length;
      const totalLoanAmount = userApps.reduce((sum, app) => sum + (app.loanAmount || 0), 0);
      const conversionRate = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;

      return {
        userId: user.id,
        userName: user.name,
        totalApplications,
        approvedApplications,
        rejectedApplications,
        pendingApplications,
        conversionRate,
        totalLoanAmount,
      };
    });
  };
  const requestUnlock = async (applicationId: string, requestedBy: string, requestedByName: string, reason: string) => {
    try {
      const { error } = await supabase.from('unlock_requests').insert([
        {
          application_id: applicationId,
          requested_by: requestedBy,
          requested_by_name: requestedByName,
          reason: reason,
          status: 'pending',
        },
      ]);
      if (error) throw error;
      fetchLoanApplications();
    } catch (err) {
      console.error("Request unlock failed:", err);
    }
  };

  const reviewUnlockRequest = async (applicationId: string, requestId: string, approved: boolean, reviewedBy: string, reviewedByName: string) => {
    try {
      const status = approved ? 'approved' : 'rejected';
      const { error: requestError } = await supabase
        .from('unlock_requests')
        .update({
          status,
          reviewed_by: reviewedBy,
          reviewed_by_name: reviewedByName,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      if (approved) {
        await unlockApplication(applicationId);
      } else {
        fetchLoanApplications();
      }
    } catch (err) {
      console.error("Review unlock request failed:", err);
    }
  };

  const unlockApplication = async (applicationId: string) => {
    await updateLoanApplication(applicationId, { isLocked: false, lockedUntil: null });
  };

  const submitUserApplication = async (app: any) => {
    try {
      const { error } = await supabase.from('member_applications').insert([
        {
          id: app.id,
          name: app.name,
          email: app.email,
          phone: app.phone,
          requested_role: app.requestedRole,
          bank_id: app.bankId,
          department: app.department,
          reason: app.reason,
          status: 'pending',
        },
      ]);
      if (error) throw error;
      fetchPendingUserApplications();
    } catch (err) {
      console.error("Submit user application failed:", err);
      throw err;
    }
  };

  const reviewUserApplication = async (id: string, approved: boolean, reviewedBy: string, reviewedByName: string, rejectionReason?: string) => {
    try {
      console.log(`DEBUG: Reviewing user application ${id}, approved: ${approved}`);
      const status = approved ? 'approved' : 'rejected';

      // Use .select() to verify the update actually happened (RLS might block it silently)
      const { data: updatedApps, error } = await supabase
        .from('member_applications')
        .update({
          status,
          reviewed_by: reviewedBy,
          reviewed_by_name: reviewedByName,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error("DEBUG: Update 'member_applications' error:", error);
        throw error;
      }

      if (!updatedApps || updatedApps.length === 0) {
        console.error("DEBUG: No rows updated in 'member_applications'. Check RLS policies.");
        throw new Error("Permission denied: You do not have authority to approve applications. Please ensure your account is correctly set up as an Owner in the database.");
      }

      console.log("DEBUG: Successfully updated application status to", status);

      if (approved) {
        // If approved, create the user in the 'users' table
        const app = pendingUserApplications.find(a => a.id === id);
        if (app) {
          console.log(`DEBUG: Upserting user into 'users' table: ${app.email}`);
          const { error: userError } = await supabase.from('users').upsert([{
            id: app.id,
            name: app.name,
            email: app.email,
            role: app.requestedRole,
            bank_id: app.bankId,
            phone: app.phone,
            department: app.department
          }]);

          if (userError) {
            console.error("DEBUG: Upsert into 'users' error:", userError);
            throw new Error(`User was approved but profile creation failed: ${userError.message}`);
          }
        }
      }

      // Force fresh fetch for both tables to update global state
      console.log("DEBUG: Re-fetching pending applications and users...");
      await Promise.all([
        fetchPendingUserApplications(),
        fetchUsers()
      ]);
      console.log("DEBUG: Re-fetch complete");

    } catch (err) {
      console.error("Review user application failed:", err);
      throw err;
    }
  };

  const uploadDocument = async (applicationId: string, file: File) => {
    try {
      const fileName = `${applicationId}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('application-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('application-documents')
        .getPublicUrl(fileName);

      const application = loanApplications.find(a => a.id === applicationId);
      if (!application) return;

      const newDoc = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: publicUrl.publicUrl,
        type: file.type,
        status: 'pending',
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser?.id || 'unknown',
      };

      const updatedDocs = [...(application.documents || []), newDoc];
      await updateLoanApplication(applicationId, { documents: updatedDocs });
    } catch (err) {
      console.error("Upload document failed:", err);
      throw err;
    }
  };

  return (
    <DataContext.Provider
      value={{
        loanApplications, announcements, messages, attendanceRecords, tickets,
        pendingUserApplications, users, addLoanApplication, updateLoanApplication,
        addAnnouncement, addMessage, markMessageAsRead, addAttendanceRecord,
        updateAttendanceRecord, getPerformanceMetrics, addTicket, updateTicket,
        addTicketComment, requestUnlock, reviewUnlockRequest, unlockApplication,
        submitUserApplication, reviewUserApplication, uploadDocument, refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
