import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookOpen, LogOut, User, Calculator, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  student: {
    first_name: string;
    last_name: string;
    email: string;
    course: string;
    year_level: string;
  };
  onLogout: () => void;
}

export default function Dashboard({ student, onLogout }: Props) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Student Tracker
                </h1>
                <p className="text-sm text-muted-foreground">Academic Progress Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex gap-2">
                <Button
                  onClick={() => navigate('/subjects')}
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-primary/10"
                >
                  <Calculator className="h-4 w-4" />
                  Subjects
                </Button>
                <Button
                  onClick={() => navigate('/reminders')}
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-primary/10"
                >
                  <Clock className="h-4 w-4" />
                  Reminders
                </Button>
              </nav>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate('/admin')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-primary/10 border-primary/20 text-primary hover:text-primary"
                  title="Admin Dashboard"
                >
                  <User className="h-4 w-4" />
                  Admin
                </Button>
                <Button
                  onClick={onLogout}
                  variant="outline"
                  className="flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <Card className="mb-8 shadow-card border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Student Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                <p className="text-lg font-semibold">{student.first_name} {student.last_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-lg">{student.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Course</Label>
                <p className="text-lg">{student.course || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Year Level</Label>
                <Badge variant="secondary" className="text-sm">{student.year_level || 'Not specified'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="shadow-card border-0 bg-card/80 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-all group"
            onClick={() => navigate('/subjects')}
          >
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-gradient-primary rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Subject Calculations</h3>
              <p className="text-muted-foreground">
                Manage your subjects and calculate term percentages based on tests, assignments, and exams.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="shadow-card border-0 bg-card/80 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-all group"
            onClick={() => navigate('/reminders')}
          >
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-gradient-primary rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Reminders & Due Dates</h3>
              <p className="text-muted-foreground">
                Track assignment deadlines, exam dates, and submission due dates with countdown timers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}