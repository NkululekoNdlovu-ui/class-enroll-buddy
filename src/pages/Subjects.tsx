import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, BookOpen, LogOut, ArrowLeft, Calculator, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Subject {
  id: string;
  name: string;
  description: string;
  term1: number;
  term2: number;
  term3: number;
  term4: number;
}

interface TermDetail {
  test: number;
  assignment: number;
  exam: number;
  testWeight: number;
  assignmentWeight: number;
  examWeight: number;
}

interface Props {
  student: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    course: string;
    year_level: string;
  };
  onLogout: () => void;
}

export default function Subjects({ student, onLogout }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [termDetails, setTermDetails] = useState<TermDetail>({
    test: 0,
    assignment: 0,
    exam: 0,
    testWeight: 30,
    assignmentWeight: 30,
    examWeight: 40,
  });
  const [newSubject, setNewSubject] = useState({ name: "", description: "" });
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<'term1' | 'term2' | 'term3' | 'term4'>('term1');

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, [student.id]);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          title: "Error fetching subjects",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setSubjects(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSubject = async () => {
    if (subjects.length >= 10) {
      toast({
        title: "Maximum subjects reached",
        description: "You can only add up to 10 subjects.",
        variant: "destructive",
      });
      return;
    }

    if (!newSubject.name.trim()) {
      toast({
        title: "Subject name required",
        description: "Please enter a subject name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: newSubject.name,
          description: newSubject.description,
          student_id: student.id,
          term1: 0,
          term2: 0,
          term3: 0,
          term4: 0
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error adding subject",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setSubjects([...subjects, data]);
      setNewSubject({ name: "", description: "" });
      setIsAddingSubject(false);
      toast({
        title: "Subject added",
        description: `${newSubject.name} has been added to your subjects.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add subject",
        variant: "destructive",
      });
    }
  };

  const calculateTermPercentage = async () => {
    const { test, assignment, exam, testWeight, assignmentWeight, examWeight } = termDetails;
    
    if (testWeight + assignmentWeight + examWeight !== 100) {
      toast({
        title: "Invalid weights",
        description: "Weights must add up to 100%.",
        variant: "destructive",
      });
      return;
    }

    const percentage = (test * testWeight + assignment * assignmentWeight + exam * examWeight) / 100;
    
    if (selectedSubject) {
      try {
        const { error } = await supabase
          .from('subjects')
          .update({ [selectedTerm]: percentage })
          .eq('id', selectedSubject.id)
          .eq('student_id', student.id); // Additional security check

        if (error) {
          toast({
            title: "Error updating percentage",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        const updatedSubjects = subjects.map(subject => 
          subject.id === selectedSubject.id 
            ? { ...subject, [selectedTerm]: percentage }
            : subject
        );
        setSubjects(updatedSubjects);
        setSelectedSubject(null);
        toast({
          title: "Term percentage calculated",
          description: `${selectedTerm.toUpperCase()} percentage: ${percentage.toFixed(2)}%`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update percentage",
          variant: "destructive",
        });
      }
    }
  };

  const openTermModal = (subject: Subject, term: 'term1' | 'term2' | 'term3' | 'term4') => {
    setSelectedSubject(subject);
    setSelectedTerm(term);
    setTermDetails({
      test: 0,
      assignment: 0,
      exam: 0,
      testWeight: 30,
      assignmentWeight: 30,
      examWeight: 40,
    });
  };

  const getGradeColor = (percentage: number) => {
    if (percentage < 50) return "hsl(var(--grade-poor))";
    if (percentage <= 65) return "hsl(var(--grade-fair))";
    return "hsl(var(--grade-good))";
  };

  const getGradeVariant = (percentage: number): "destructive" | "secondary" | "default" => {
    if (percentage < 50) return "destructive";
    if (percentage <= 65) return "secondary"; 
    return "default";
  };

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
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Subject Calculations
                </h1>
                <p className="text-sm text-muted-foreground">Manage subjects and calculate term percentages</p>
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
        {/* Subjects Section */}
        <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                My Subjects ({subjects.length}/10)
              </CardTitle>
              <Dialog open={isAddingSubject} onOpenChange={setIsAddingSubject}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-primary hover:opacity-90 transition-smooth"
                    disabled={subjects.length >= 10}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subject-name">Subject Name</Label>
                      <Input
                        id="subject-name"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                        placeholder="e.g., Mathematics"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject-description">Description</Label>
                      <Textarea
                        id="subject-description"
                        value={newSubject.description}
                        onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                        placeholder="Brief description of the subject"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addSubject} className="flex-1 bg-gradient-primary hover:opacity-90">
                        Add Subject
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingSubject(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading subjects...</p>
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No subjects added yet. Click "Add Subject" to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject ID</TableHead>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Term 1 %</TableHead>
                      <TableHead className="text-center">Term 2 %</TableHead>
                      <TableHead className="text-center">Term 3 %</TableHead>
                      <TableHead className="text-center">Term 4 %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-mono text-sm">{subject.id}</TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
                            onClick={() => openTermModal(subject, 'term1')}
                          >
                            {subject.name}
                          </Button>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{subject.description}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={getGradeVariant(subject.term1)}
                            className="cursor-pointer hover:opacity-80 transition-smooth"
                            onClick={() => openTermModal(subject, 'term1')}
                            style={{ backgroundColor: getGradeColor(subject.term1) }}
                          >
                            {subject.term1.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={getGradeVariant(subject.term2)}
                            className="cursor-pointer hover:opacity-80 transition-smooth"
                            onClick={() => openTermModal(subject, 'term2')}
                            style={{ backgroundColor: getGradeColor(subject.term2) }}
                          >
                            {subject.term2.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={getGradeVariant(subject.term3)}
                            className="cursor-pointer hover:opacity-80 transition-smooth"
                            onClick={() => openTermModal(subject, 'term3')}
                            style={{ backgroundColor: getGradeColor(subject.term3) }}
                          >
                            {subject.term3.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={getGradeVariant(subject.term4)}
                            className="cursor-pointer hover:opacity-80 transition-smooth"
                            onClick={() => openTermModal(subject, 'term4')}
                            style={{ backgroundColor: getGradeColor(subject.term4) }}
                          >
                            {subject.term4.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Term Calculation Modal */}
        <Dialog open={selectedSubject !== null} onOpenChange={() => setSelectedSubject(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Calculate Term - {selectedSubject?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="term-select">Select Term</Label>
                <Select value={selectedTerm} onValueChange={(value) => setSelectedTerm(value as 'term1' | 'term2' | 'term3' | 'term4')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="term1">Term 1</SelectItem>
                    <SelectItem value="term2">Term 2</SelectItem>
                    <SelectItem value="term3">Term 3</SelectItem>
                    <SelectItem value="term4">Term 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test">Test Score (%)</Label>
                  <Input
                    id="test"
                    type="number"
                    min="0"
                    max="100"
                    value={termDetails.test}
                    onChange={(e) => setTermDetails({ ...termDetails, test: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="test-weight">Test Weight (%)</Label>
                  <Input
                    id="test-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={termDetails.testWeight}
                    onChange={(e) => setTermDetails({ ...termDetails, testWeight: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignment">Assignment Score (%)</Label>
                  <Input
                    id="assignment"
                    type="number"
                    min="0"
                    max="100"
                    value={termDetails.assignment}
                    onChange={(e) => setTermDetails({ ...termDetails, assignment: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="assignment-weight">Assignment Weight (%)</Label>
                  <Input
                    id="assignment-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={termDetails.assignmentWeight}
                    onChange={(e) => setTermDetails({ ...termDetails, assignmentWeight: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exam">Exam Score (%)</Label>
                  <Input
                    id="exam"
                    type="number"
                    min="0"
                    max="100"
                    value={termDetails.exam}
                    onChange={(e) => setTermDetails({ ...termDetails, exam: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="exam-weight">Exam Weight (%)</Label>
                  <Input
                    id="exam-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={termDetails.examWeight}
                    onChange={(e) => setTermDetails({ ...termDetails, examWeight: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Total Weight: {termDetails.testWeight + termDetails.assignmentWeight + termDetails.examWeight}% 
                {termDetails.testWeight + termDetails.assignmentWeight + termDetails.examWeight !== 100 && (
                  <span className="text-destructive ml-1">(Must equal 100%)</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={calculateTermPercentage} className="flex-1 bg-gradient-primary hover:opacity-90">
                  Calculate Percentage
                </Button>
                <Button variant="outline" onClick={() => setSelectedSubject(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}