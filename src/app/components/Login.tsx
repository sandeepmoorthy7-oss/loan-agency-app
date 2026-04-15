import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, Mail, Shield, Users, TrendingUp, Building2, UserPlus } from 'lucide-react';

import logo from '../../assets/logo.png';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isPendingApproval, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated and approved
  useEffect(() => {
    if (currentUser && currentUser.isApproved) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        console.log("DEBUG: Login successful, profile:", result.profile);
        // If approved, the useEffect above will handle navigation.
        // If not approved, we need to stop submitting to show the message.
        if (!result.profile?.isApproved) {
          console.log("DEBUG: User not approved, showing pending message");
          setIsSubmitting(false);
        } else {
          console.log("DEBUG: User approved, navigating to dashboard");
          navigate('/dashboard');
        }
      } else {
        setError(result.message || 'Invalid email or password. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: Shield, title: 'Secure Access', description: 'Role-based authentication', color: 'bg-blue-500' },
    { icon: Users, title: 'Team Collaboration', description: 'Seamless communication', color: 'bg-purple-500' },
    { icon: TrendingUp, title: 'Performance Tracking', description: 'Real-time analytics', color: 'bg-green-500' },
    { icon: Building2, title: 'Bank Integration', description: 'Multi-bank support', color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <img src={logo} alt="TFS Logo" className="h-12 w-auto" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">TFS HOSUR LOANS</h1>
              <p className="text-indigo-200 font-medium tracking-widest uppercase text-xs">Management System</p>
            </div>
          </div>
          <p className="text-xl text-white/90 mb-12">
            Streamline your loan agency operations with powerful management tools
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="size-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/80 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="text-white/70 text-sm">
          © 2026 TFS HOSUR LOANS. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="flex justify-center mb-6 lg:hidden">
               <img src={logo} alt="TFS Logo" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base font-medium text-gray-500">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@loanagency.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                    required
                  />
                </div>
              </div>

              {isPendingApproval && (
                <Alert className="border-amber-200 bg-amber-50">
                  <Shield className="size-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 font-medium ml-2">
                    Your account is pending approval by an administrator. Please wait for confirmation.
                  </AlertDescription>
                </Alert>
              )}

              {error && !isPendingApproval && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
                </Alert>
              )}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all active:scale-[0.98]"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500 font-semibold">New to TFS?</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/signup')}
                className="w-full h-12 text-base font-semibold border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
              >
                <UserPlus className="size-5 mr-2" />
                Create New Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
