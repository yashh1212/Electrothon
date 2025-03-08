import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStorageItem, STORAGE_KEYS } from "@/services/storage";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Archive,
  Award,
  Users,
  FileDown,
  AlertTriangle,
  Eye,
  Search,
  Hash,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import HexagonGrid from "@/components/HexagonGrid";
import { Input } from "@/components/ui/input";

// Define the ExamResult interface
interface ExamResult {
  studentId: string;
  studentName: string;
  examId: string;
  examCode: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  tabSwitches: number;
  completedAt: Date;
  passed: boolean;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
];

const AdminDashboard: React.FC = () => {
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<ExamResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [securityViolations, setSecurityViolations] = useState<ExamResult[]>(
    []
  );

  useEffect(() => {
    // Load exam results from localStorage
    const storedResults = getStorageItem<ExamResult[]>(
      STORAGE_KEYS.EXAM_RESULTS,
      []
    );

    // Convert string dates to Date objects if needed
    const formattedResults = storedResults.map((result) => ({
      ...result,
      completedAt:
        result.completedAt instanceof Date
          ? result.completedAt
          : new Date(result.completedAt),
    }));

    setExamResults(formattedResults);
    setFilteredResults(formattedResults);

    // Filter out results with security violations (tab switches >= 3)
    const violations = formattedResults.filter(
      (result) => result.tabSwitches >= 3
    );
    setSecurityViolations(violations);
  }, []);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredResults(examResults);
    } else {
      const filtered = examResults.filter(
        (result) =>
          result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.examCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.examTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResults(filtered);
    }
  }, [searchTerm, examResults]);

  // Calculate stats
  const totalStudents = new Set(examResults.map((r) => r.studentId)).size;
  const totalExams = new Set(examResults.map((r) => r.examId)).size;
  const avgScore =
    examResults.length > 0
      ? examResults.reduce((sum, result) => sum + result.score, 0) /
        examResults.length
      : 0;
  const passRate =
    examResults.length > 0
      ? (examResults.filter((r) => r.passed).length / examResults.length) * 100
      : 0;

  // Prepare chart data
  const scoreDistribution = [
    { name: "0-20%", count: examResults.filter((r) => r.score < 20).length },
    {
      name: "21-40%",
      count: examResults.filter((r) => r.score >= 20 && r.score < 40).length,
    },
    {
      name: "41-60%",
      count: examResults.filter((r) => r.score >= 40 && r.score < 60).length,
    },
    {
      name: "61-80%",
      count: examResults.filter((r) => r.score >= 60 && r.score < 80).length,
    },
    { name: "81-100%", count: examResults.filter((r) => r.score >= 80).length },
  ];

  const passFailData = [
    { name: "Passed", value: examResults.filter((r) => r.passed).length },
    { name: "Failed", value: examResults.filter((r) => !r.passed).length },
  ];

  const tabSwitchData = [
    {
      name: "0 switches",
      count: examResults.filter((r) => r.tabSwitches === 0).length,
    },
    {
      name: "1 switch",
      count: examResults.filter((r) => r.tabSwitches === 1).length,
    },
    {
      name: "2 switches",
      count: examResults.filter((r) => r.tabSwitches === 2).length,
    },
    {
      name: "3+ switches",
      count: examResults.filter((r) => r.tabSwitches >= 3).length,
    },
  ];

  // Export data to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "Student Name",
      "Exam Title",
      "Score",
      "Tab Switches",
      "Date",
      "Passed",
    ];
    const csvRows = [headers];

    // Add data rows
    examResults.forEach((result) => {
      const row = [
        result.studentName,
        result.examTitle,
        result.score.toString(),
        result.tabSwitches.toString(),
        new Date(result.completedAt).toLocaleDateString(),
        result.passed ? "Yes" : "No",
      ];
      csvRows.push(row);
    });

    // Convert to CSV string
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "exam_results.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <AnimatedBackground />
      <HexagonGrid />

      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-7xl mx-auto">
            <Card className="backdrop-blur-xl bg-black/30 border border-white/10 shadow-lg animate-fade-in mb-8">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-2xl font-bold text-white">
                  Administrator Dashboard
                </CardTitle>
                <CardDescription className="text-gray-300">
                  View and manage exam results and student performance
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {/* Dashboard Stats */}
                  <Card className="bg-violet-900/20 border border-violet-500/30">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">Total Students</p>
                        <h3 className="text-2xl font-bold text-white">
                          {totalStudents}
                        </h3>
                      </div>
                      <div className="w-10 h-10 bg-violet-600/30 rounded-full flex items-center justify-center">
                        <Users className="text-violet-300 w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-900/20 border border-blue-500/30">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">Total Exams</p>
                        <h3 className="text-2xl font-bold text-white">
                          {totalExams}
                        </h3>
                      </div>
                      <div className="w-10 h-10 bg-blue-600/30 rounded-full flex items-center justify-center">
                        <Archive className="text-blue-300 w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-900/20 border border-green-500/30">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">Average Score</p>
                        <h3 className="text-2xl font-bold text-white">
                          {avgScore.toFixed(1)}%
                        </h3>
                      </div>
                      <div className="w-10 h-10 bg-green-600/30 rounded-full flex items-center justify-center">
                        <Award className="text-green-300 w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-amber-900/20 border border-amber-500/30">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">Pass Rate</p>
                        <h3 className="text-2xl font-bold text-white">
                          {passRate.toFixed(1)}%
                        </h3>
                      </div>
                      <div className="w-10 h-10 bg-amber-600/30 rounded-full flex items-center justify-center">
                        <Hash className="text-amber-300 w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white/5 border border-white/10 mb-8">
                  <CardHeader className="border-b border-white/10">
                    <CardTitle className="text-xl font-bold text-white">
                      Security Violations
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Students with 3 or more tab switches detected
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {securityViolations.length > 0 ? (
                      <div className="space-y-3">
                        {securityViolations.map((violation, index) => (
                          <div
                            key={index}
                            className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg flex items-center justify-between"
                          >
                            <div>
                              <p className="text-white font-medium">
                                {violation.studentName}
                              </p>
                              <p className="text-sm text-gray-300">
                                {violation.examTitle}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="destructive"
                                className="bg-red-700"
                              >
                                {violation.tabSwitches} Tab Switches
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-gray-300 border-gray-600"
                              >
                                {violation.score}% Score
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <AlertTriangle className="mx-auto h-12 w-12 mb-3 text-gray-500 opacity-50" />
                        <p>No security violations detected</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Tabs defaultValue="table" className="w-full">
                  <TabsList className="bg-gray-800/50 border border-white/10 mb-6">
                    <TabsTrigger value="table">Data Table</TabsTrigger>
                    <TabsTrigger value="charts">Analytics Charts</TabsTrigger>
                  </TabsList>

                  <TabsContent value="table" className="mt-0">
                    <div className="mb-4 flex justify-between items-center">
                      <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by name, exam code or title..."
                          className="pl-8 bg-black/20 border-white/10 text-white"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={exportToCSV}
                        variant="outline"
                        className="border-white/20 text-gray-300 hover:bg-white/10"
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                    </div>

                    <div className="rounded-md border border-white/10 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-900/50">
                          <TableRow>
                            <TableHead className="text-white">
                              Student
                            </TableHead>
                            <TableHead className="text-white">Exam</TableHead>
                            <TableHead className="text-white">Score</TableHead>
                            <TableHead className="text-white">
                              Tab Switches
                            </TableHead>
                            <TableHead className="text-white">Date</TableHead>
                            <TableHead className="text-white">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredResults.length > 0 ? (
                            filteredResults.map((result, index) => (
                              <TableRow
                                key={index}
                                className="border-white/5 bg-white/5 hover:bg-white/10"
                              >
                                <TableCell className="font-medium text-white">
                                  {result.studentName}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-gray-200">
                                      {result.examTitle}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Code: {result.examCode}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      result.score >= 60
                                        ? "bg-green-700"
                                        : "bg-amber-700"
                                    }
                                  >
                                    {result.score}%
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      result.tabSwitches >= 3
                                        ? "border-red-500 text-red-400"
                                        : "border-gray-500 text-gray-400"
                                    }
                                  >
                                    {result.tabSwitches}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {formatDate(result.completedAt)}
                                </TableCell>
                                <TableCell>
                                  {result.passed ? (
                                    <Badge className="bg-green-700">
                                      Passed
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-red-700">Failed</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center py-8 text-gray-400"
                              >
                                No exam results found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="charts" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="bg-white/5 border border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white">
                            Score Distribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={scoreDistribution}>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#444"
                                />
                                <XAxis dataKey="name" tick={{ fill: "#ccc" }} />
                                <YAxis tick={{ fill: "#ccc" }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#333",
                                    border: "1px solid #555",
                                  }}
                                  labelStyle={{ color: "#fff" }}
                                />
                                <Bar dataKey="count" fill="#8884d8" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/5 border border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white">
                            Pass/Fail Ratio
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={passFailData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                  }
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {passFailData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#333",
                                    border: "1px solid #555",
                                  }}
                                  labelStyle={{ color: "#fff" }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/5 border border-white/10 lg:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-white">
                            Tab Switch Distribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={tabSwitchData}>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#444"
                                />
                                <XAxis dataKey="name" tick={{ fill: "#ccc" }} />
                                <YAxis tick={{ fill: "#ccc" }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#333",
                                    border: "1px solid #555",
                                  }}
                                  labelStyle={{ color: "#fff" }}
                                />
                                <Bar dataKey="count" fill="#82ca9d" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
