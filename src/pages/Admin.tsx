import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, Bell, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  course: string;
  year_level: string;
  student_id: string;
  created_at: string;
}

interface Subject {
  id: string;
  name: string;
  description: string;
  student_id: string;
  term1: number;
  term2: number;
  term3: number;
  term4: number;
  students: {
    first_name: string;
    last_name: string;
  };
}

interface Reminder {
  id: string;
  title: string;
  description: string;
  type: string;
  due_date: string;
  student_id: string;
  students: {
    first_name: string;
    last_name: string;
  };
}

export default function Admin() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      // Fetch subjects with student info
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select(`
          *,
          students:student_id (first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);

      // Fetch reminders with student info
      const { data: remindersData, error: remindersError } = await supabase
        .from('reminders')
        .select(`
          *,
          students:student_id (first_name, last_name)
        `)
        .order('due_date', { ascending: true });

      if (remindersError) throw remindersError;
      setReminders(remindersData || []);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch data: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
      
      fetchAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete student: " + error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage students, subjects, and reminders</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reminders.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Students Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Year Level</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.student_id}</TableCell>
                        <TableCell>{student.first_name} {student.last_name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.course || 'Not specified'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{student.year_level || 'Not specified'}</Badge>
                        </TableCell>
                        <TableCell>{new Date(student.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteStudent(student.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle>Subjects Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Term 1</TableHead>
                      <TableHead>Term 2</TableHead>
                      <TableHead>Term 3</TableHead>
                      <TableHead>Term 4</TableHead>
                      <TableHead>Average</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject) => {
                      const average = (
                        (subject.term1 + subject.term2 + subject.term3 + subject.term4) / 4
                      ).toFixed(1);
                      
                      return (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.name}</TableCell>
                          <TableCell>
                            {subject.students.first_name} {subject.students.last_name}
                          </TableCell>
                          <TableCell>{subject.term1}%</TableCell>
                          <TableCell>{subject.term2}%</TableCell>
                          <TableCell>{subject.term3}%</TableCell>
                          <TableCell>{subject.term4}%</TableCell>
                          <TableCell>
                            <Badge variant={parseFloat(average) >= 50 ? "default" : "destructive"}>
                              {average}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders">
            <Card>
              <CardHeader>
                <CardTitle>Reminders Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reminders.map((reminder) => {
                      const dueDate = new Date(reminder.due_date);
                      const isOverdue = dueDate < new Date();
                      
                      return (
                        <TableRow key={reminder.id}>
                          <TableCell className="font-medium">{reminder.title}</TableCell>
                          <TableCell>
                            {reminder.students.first_name} {reminder.students.last_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{reminder.type}</Badge>
                          </TableCell>
                          <TableCell>{dueDate.toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={isOverdue ? "destructive" : "default"}>
                              {isOverdue ? "Overdue" : "Active"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}