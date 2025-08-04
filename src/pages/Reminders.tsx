import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, LogOut, ArrowLeft, Calendar, AlertCircle, BookOpen, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Reminder {
  id: string;
  subjectId: string;
  subjectName: string;
  type: 'assignment' | 'submission' | 'exam';
  title: string;
  dueDate: string;
  description?: string;
}

interface Props {
  student: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    student_id: string;
  } | null;
  onLogout: () => void;
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  subjects: { id: string; name: string; description: string; term1: number; term2: number; term3: number; term4: number; }[];
}

export default function Reminders({ student, onLogout, reminders, setReminders, subjects }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle case when student data is not yet loaded
  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({
    subjectId: '',
    type: 'assignment' as 'assignment' | 'submission' | 'exam',
    title: '',
    dueDate: '',
    description: ''
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const addReminder = () => {
    if (!newReminder.subjectId || !newReminder.title || !newReminder.dueDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const selectedSubject = subjects.find(s => s.id === newReminder.subjectId);
    const reminder: Reminder = {
      id: Date.now().toString(),
      subjectId: newReminder.subjectId,
      subjectName: selectedSubject?.name || 'Unknown Subject',
      type: newReminder.type,
      title: newReminder.title,
      dueDate: newReminder.dueDate,
      description: newReminder.description,
    };

    setReminders([...reminders, reminder]);
    setNewReminder({
      subjectId: '',
      type: 'assignment',
      title: '',
      dueDate: '',
      description: ''
    });
    setIsAddingReminder(false);
    toast({
      title: "Reminder added",
      description: `${newReminder.title} has been added to your reminders.`,
    });
  };

  const getCountdown = (dueDate: string) => {
    const now = currentTime.getTime();
    const due = new Date(dueDate).getTime();
    const diff = due - now;

    if (diff < 0) {
      return { days: 0, hours: 0, minutes: 0, overdue: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, overdue: false };
  };

  const sortedReminders = reminders.sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="p-2 bg-gradient-primary rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Reminders & Due Dates
                </h1>
                <p className="text-sm text-muted-foreground">Track deadlines with countdown timers</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="flex items-center gap-2 hover:bg-primary/10"
              >
                <User className="h-4 w-4" />
                Dashboard
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
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Reminders Section */}
        <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                All Reminders ({reminders.length})
              </CardTitle>
              <Dialog open={isAddingReminder} onOpenChange={setIsAddingReminder}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:opacity-90 transition-smooth">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Reminder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Reminder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reminder-subject">Subject</Label>
                      <select
                        id="reminder-subject"
                        value={newReminder.subjectId}
                        onChange={(e) => setNewReminder({ ...newReminder, subjectId: e.target.value })}
                        className="w-full mt-1 p-2 border rounded-md bg-background"
                      >
                        <option value="">Select a subject</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="reminder-type">Type</Label>
                      <select
                        id="reminder-type"
                        value={newReminder.type}
                        onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value as 'assignment' | 'submission' | 'exam' })}
                        className="w-full mt-1 p-2 border rounded-md bg-background"
                      >
                        <option value="assignment">Assignment</option>
                        <option value="submission">Submission</option>
                        <option value="exam">Exam</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="reminder-title">Title</Label>
                      <Input
                        id="reminder-title"
                        value={newReminder.title}
                        onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                        placeholder="e.g., Math Assignment 1"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reminder-date">Due Date & Time</Label>
                      <Input
                        id="reminder-date"
                        type="datetime-local"
                        value={newReminder.dueDate}
                        onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reminder-description">Description (Optional)</Label>
                      <Textarea
                        id="reminder-description"
                        value={newReminder.description}
                        onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                        placeholder="Additional details about the reminder"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addReminder} className="flex-1 bg-gradient-primary hover:opacity-90">
                        Add Reminder
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingReminder(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {reminders.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No reminders set. Click "Add Reminder" to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedReminders.map((reminder) => {
                  const countdown = getCountdown(reminder.dueDate);
                  return (
                    <div key={reminder.id} className="flex items-center justify-between p-6 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          {reminder.type === 'assignment' && <BookOpen className="h-5 w-5 text-primary" />}
                          {reminder.type === 'submission' && <Calendar className="h-5 w-5 text-primary" />}
                          {reminder.type === 'exam' && <AlertCircle className="h-5 w-5 text-primary" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{reminder.title}</h4>
                          <p className="text-muted-foreground">{reminder.subjectName} • {reminder.type}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(reminder.dueDate).toLocaleDateString()} at {new Date(reminder.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {reminder.description && (
                            <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {countdown.overdue ? (
                          <Badge variant="destructive" className="text-sm px-3 py-1">Overdue</Badge>
                        ) : (
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {countdown.days}d {countdown.hours}h {countdown.minutes}m
                            </div>
                            <div className="text-sm text-muted-foreground">remaining</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}