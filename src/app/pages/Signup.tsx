import { useState } from "react";
import { useNavigate } from "react-router";
import { useData } from "../context/DataContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { UserPlus, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BANKS } from "../constants";
import { UserRole } from "../types";
import { supabase } from "../../supabase";

export function Signup() {
  const navigate = useNavigate();
  const { submitUserApplication } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    requestedRole: "" as UserRole | "",
    bankId: "",
    department: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.requestedRole || !formData.reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.requestedRole === "bank_manager" && !formData.bankId) {
      toast.error("Please select a bank for Bank Manager role");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create Supabase Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          }
        }
      });

      let userId = authData.user?.id;

      // Handle the case where user already exists
      if (authError) {
        if (authError.message.toLowerCase().includes("already registered")) {
          toast.error("This email is already registered. If you already applied, please wait for admin approval. If not, try a different email.");
          setIsLoading(false);
          return;
        }
        throw authError;
      }

      if (!userId) throw new Error("Failed to create user account");

      // 2. Submit application with the Auth User ID
      try {
        const { error: dbError } = await supabase.from('member_applications').upsert([
          {
            id: userId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            requested_role: formData.requestedRole as UserRole,
            bank_id: formData.bankId || null,
            department: formData.department || null,
            reason: formData.reason,
            status: 'pending',
          },
        ]);

        if (dbError) throw dbError;
      } catch (dbError: any) {
        console.error("Database submission error:", dbError);
        if (dbError.message.includes("not find the table")) {
          toast.error("Database Error: 'member_applications' table is missing. Please run the SQL setup script.");
        } else {
          toast.error(`Database error: ${dbError.message}`);
        }
        setIsLoading(false);
        return;
      }

      toast.success("Application submitted successfully! Please wait for admin approval.");

      // Redirect to login page
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "An error occurred during signup");
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="mb-4"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Login
          </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <UserPlus className="size-6 text-indigo-600" />
              <CardTitle className="text-2xl">Join TFS Management</CardTitle>
            </div>
            <CardDescription>
              Submit your application to join our team. Your application will be reviewed by the admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestedRole">Requested Role *</Label>
                  <Select
                    value={formData.requestedRole}
                    onValueChange={(val) => setFormData({ ...formData, requestedRole: val as UserRole })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Team</SelectItem>
                      <SelectItem value="backend">Backend Staff</SelectItem>
                      <SelectItem value="bank_manager">Bank Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.requestedRole === "bank_manager" && (
                <div className="space-y-2">
                  <Label htmlFor="bankId">Bank *</Label>
                  <Select
                    value={formData.bankId}
                    onValueChange={(val) => setFormData({ ...formData, bankId: val })}
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
              )}

              <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Retail Loans, Commercial Banking"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Why do you want to join? *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Tell us about your experience and why you want to join our team..."
                  rows={4}
                  required
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Your application will be reviewed by the admin/owner. 
                  You will be able to log in only after your application is approved.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
