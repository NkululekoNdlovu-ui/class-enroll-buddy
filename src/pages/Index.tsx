import { useState } from "react";
import AuthForm from "@/components/AuthForm";
import HomePage from "@/components/HomePage";

const Index = () => {
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

  if (isAuthenticated && student) {
    return <HomePage student={student} onLogout={handleLogout} />;
  }

  return <AuthForm onLogin={handleLogin} />;
};

export default Index;
