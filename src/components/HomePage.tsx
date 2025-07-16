import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, User, BookOpen, LogOut, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    name: string;
    surname: string;
    email: string;
    course: string;
    yearLevel: string;
  };
  onLogout: () => void;
}

export default function HomePage({ student, onLogout }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
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
  const { toast } = useToast();

  const addSubject = () => {
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

    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubject.name,
      description: newSubject.description,
      term1: 0,
      term2: 0,
      term3: 0,
      term4: 0,
    };

    setSubjects([...subjects, subject]);
    setNewSubject({ name: "", description: "" });
    setIsAddingSubject(false);
    toast({
      title: "Subject added",
      description: `${newSubject.name} has been added to your subjects.`,
    });
  };

  const calculateTermPercentage = () => {
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
                <p className="text-lg font-semibold">{student.name} {student.surname}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-lg">{student.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Course</Label>
                <p className="text-lg">{student.course}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Year Level</Label>
                <Badge variant="secondary" className="text-sm">{student.yearLevel}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

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
            {subjects.length === 0 ? (
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTermModal(subject, 'term1')}
                            className="hover:bg-primary/10"
                          >
                            {subject.term1.toFixed(1)}%
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTermModal(subject, 'term2')}
                            className="hover:bg-primary/10"
                          >
                            {subject.term2.toFixed(1)}%
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTermModal(subject, 'term3')}
                            className="hover:bg-primary/10"
                          >
                            {subject.term3.toFixed(1)}%
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTermModal(subject, 'term4')}
                            className="hover:bg-primary/10"
                          >
                            {subject.term4.toFixed(1)}%
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Term Details Modal */}
      <Dialog open={selectedSubject !== null} onOpenChange={() => setSelectedSubject(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              {selectedTerm?.toUpperCase()} Details - {selectedSubject?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test-score">Test Score</Label>
                <Input
                  id="test-score"
                  type="number"
                  min="0"
                  max="100"
                  value={termDetails.test}
                  onChange={(e) => setTermDetails({ ...termDetails, test: Number(e.target.value) })}
                  placeholder="0-100"
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
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignment-score">Assignment Score</Label>
                <Input
                  id="assignment-score"
                  type="number"
                  min="0"
                  max="100"
                  value={termDetails.assignment}
                  onChange={(e) => setTermDetails({ ...termDetails, assignment: Number(e.target.value) })}
                  placeholder="0-100"
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
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exam-score">Exam Score</Label>
                <Input
                  id="exam-score"
                  type="number"
                  min="0"
                  max="100"
                  value={termDetails.exam}
                  onChange={(e) => setTermDetails({ ...termDetails, exam: Number(e.target.value) })}
                  placeholder="0-100"
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
                />
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Total Weight: {termDetails.testWeight + termDetails.assignmentWeight + termDetails.examWeight}%
              </p>
              <p className="text-sm font-medium">
                Calculated Percentage: {((termDetails.test * termDetails.testWeight + termDetails.assignment * termDetails.assignmentWeight + termDetails.exam * termDetails.examWeight) / 100).toFixed(2)}%
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={calculateTermPercentage} 
                className="flex-1 bg-gradient-primary hover:opacity-90"
              >
                Calculate & Save
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedSubject(null)} 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}