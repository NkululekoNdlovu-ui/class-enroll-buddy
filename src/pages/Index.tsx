import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import Auth from "./Auth";
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
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetching with setTimeout to avoid callback issues
        if (session?.user) {
          setTimeout(() => {
            fetchStudentProfile(session.user.id);
          }, 0);
        } else {
          setStudent(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchStudentProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchStudentProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching student profile:', error);
        return;
      }

      if (data) {
        setStudent(data);
      } else {
        // Create student profile if it doesn't exist
        const userData = user?.user_metadata;
        if (userData && userData.first_name) {
          const { data: newStudent, error: insertError } = await supabase
            .from('students')
            .insert({
              user_id: userId,
              first_name: userData.first_name,
              last_name: userData.last_name,
              student_id: userData.student_id,
              email: user?.email || '',
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating student profile:', insertError);
          } else {
            setStudent(newStudent);
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchStudentProfile:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setStudent(null);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || !user) {
    return <Auth />;
  }

  // Route to appropriate component based on current path
  switch (location.pathname) {
    case '/subjects':
      return (
        <Subjects 
          student={student} 
          onLogout={handleLogout} 
          subjects={subjects}
          setSubjects={setSubjects}
        />
      );
    case '/reminders':
      return (
        <Reminders 
          student={student} 
          onLogout={handleLogout} 
          reminders={reminders}
          setReminders={setReminders}
          subjects={subjects}
        />
      );
    default:
      return <Dashboard student={student} onLogout={handleLogout} />;
  }
};

export default Index;
