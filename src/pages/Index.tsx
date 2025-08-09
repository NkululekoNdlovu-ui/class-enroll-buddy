import { useState } from "react";
import { useLocation } from "react-router-dom";
import AuthForm from "@/components/AuthForm";
import Dashboard from "./Dashboard";
import Subjects from "./Subjects";
import Reminders from "./Reminders";

interface Subject {
  id: string;
  name: string;
  description: string;
  term1: number;
  term2: number;
  term3: number;
  term4: number;
}

interface Reminder {
  id: string;
  subjectId: string;
  subjectName: string;
  type: 'assignment' | 'submission' | 'exam';
  title: string;
  dueDate: string;
  description?: string;
}

const Index = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [student, setStudent] = useState(null);

  const handleLogin = (studentData: any) => {
    setStudent(studentData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setStudent(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated || !student) {
    return <AuthForm onLogin={handleLogin} />;
  }

  // Route to appropriate component based on current path
  switch (location.pathname) {
    case '/subjects':
      return (
        <Subjects 
          student={student} 
          onLogout={handleLogout} 
        />
      );
    case '/reminders':
      return (
        <Reminders 
          student={student} 
          onLogout={handleLogout} 
        />
      );
    default:
      return <Dashboard student={student} onLogout={handleLogout} />;
  }
};

export default Index;
