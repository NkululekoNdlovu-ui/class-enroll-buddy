import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  onRegister: (student: any) => void;
  onBackToLogin: () => void;
}

export default function RegisterPage({ onRegister, onBackToLogin }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [signupForm, setSignupForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    course: "",
    yearLevel: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Sign up the user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        toast({
          title: "Registration Failed",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (authData.user) {
        // Check if user needs email confirmation
        if (!authData.session) {
          toast({
            title: "Check Your Email",
            description: "Please check your email and click the confirmation link to complete registration.",
          });
          return;
        }
        
        // Create student record with user_id
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .insert({
            user_id: authData.user.id,
            first_name: signupForm.name,
            last_name: signupForm.surname,
            student_id: `STU${Date.now()}`,
            email: signupForm.email,
            course: signupForm.course,
            year_level: signupForm.yearLevel,
          })
          .select()
          .single();

        if (studentError) {
          toast({
            title: "Registration Failed",
            description: "Failed to create student profile: " + studentError.message,
            variant: "destructive",
          });
          return;
        }

        // Assign student role
        await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'student'
          });

        toast({
          title: "Registration Successful!",
          description: `Welcome to Student Tracker, ${signupForm.name}!`,
        });
        
        onRegister(studentData);
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
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
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Student Registration
          </h1>
          <p className="text-muted-foreground mt-2">
            Create your student account
          </p>
        </div>

        <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Create Account
            </CardTitle>
            <CardDescription>
              Join Student Tracker to manage your academic progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">First Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    required
                    className="transition-smooth focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-surname">Last Name</Label>
                  <Input
                    id="signup-surname"
                    type="text"
                    placeholder="Doe"
                    value={signupForm.surname}
                    onChange={(e) => setSignupForm({ ...signupForm, surname: e.target.value })}
                    required
                    className="transition-smooth focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="student@university.edu"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  required
                  className="transition-smooth focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a strong password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  required
                  className="transition-smooth focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-course">Course Name</Label>
                <Input
                  id="signup-course"
                  type="text"
                  placeholder="Computer Science"
                  value={signupForm.course}
                  onChange={(e) => setSignupForm({ ...signupForm, course: e.target.value })}
                  required
                  className="transition-smooth focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-year">Year Level</Label>
                <Select
                  value={signupForm.yearLevel}
                  onValueChange={(value) => setSignupForm({ ...signupForm, yearLevel: value })}
                  required
                >
                  <SelectTrigger className="transition-smooth focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select your year level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st-year">1st Year</SelectItem>
                    <SelectItem value="2nd-year">2nd Year</SelectItem>
                    <SelectItem value="3rd-year">3rd Year</SelectItem>
                    <SelectItem value="4th-year">4th Year</SelectItem>
                    <SelectItem value="5th-year">5th Year</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Already have an account? 
            <button 
              onClick={onBackToLogin}
              className="text-primary hover:underline ml-1"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}