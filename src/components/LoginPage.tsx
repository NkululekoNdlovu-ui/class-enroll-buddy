import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  onAdminLogin: () => void;
  onStudentLogin: (student: any) => void;
}

export default function LoginPage({ onAdminLogin, onStudentLogin }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
  });

  const [studentForm, setStudentForm] = useState({
    email: "",
    password: "",
  });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: adminForm.email,
        password: adminForm.password,
      });

      if (authError) {
        toast({
          title: "Admin Login Failed",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (authData.user) {
        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authData.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleError) {
          toast({
            title: "Access Check Failed",
            description: "Error checking admin permissions",
            variant: "destructive",
          });
          return;
        }

        if (!roleData) {
          toast({
            title: "Access Denied",
            description: "You don't have admin permissions",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }

        toast({
          title: "Admin Login Successful!",
          description: "Welcome to the admin dashboard",
        });
        
        onAdminLogin();
      }
    } catch (error) {
      toast({
        title: "Admin Login Failed",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: studentForm.email,
        password: studentForm.password,
      });

      if (authError) {
        toast({
          title: "Student Login Failed",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (authData.user) {
        // Query for student profile
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (studentError) {
          toast({
            title: "Login Failed",
            description: "Error retrieving student profile: " + studentError.message,
            variant: "destructive",
          });
          return;
        }

        if (!studentData) {
          toast({
            title: "Profile Not Found",
            description: "No student profile found. Please contact support or try signing up again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Login Successful!",
          description: `Welcome back, ${studentData.first_name}!`,
        });
        
        onStudentLogin(studentData);
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-primary rounded-2xl shadow-elegant">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Student Tracker
          </h1>
          <p className="text-muted-foreground mt-2">
            Login to access your account
          </p>
        </div>

        <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="student" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                Student Login
              </TabsTrigger>
              <TabsTrigger value="admin" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                Admin Login
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Student Access
                </CardTitle>
                <CardDescription>
                  Enter your student credentials to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email</Label>
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="student@university.edu"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      required
                      className="transition-smooth focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <Input
                      id="student-password"
                      type="password"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      required
                      className="transition-smooth focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In as Student"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="admin">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Admin Access
                </CardTitle>
                <CardDescription>
                  Administrative access to oversee the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="1234567@gmail.com"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      required
                      className="transition-smooth focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Admin Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      required
                      className="transition-smooth focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In as Admin"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>New student? <a href="/register" className="text-primary hover:underline">Register here</a></p>
        </div>
      </div>
    </div>
  );
}