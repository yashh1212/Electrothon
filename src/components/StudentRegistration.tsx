import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "./ui/form";
import { toast } from "sonner";
import {
  ArrowRight,
  User,
  Mail,
  School,
  Award,
  GraduationCap,
  Building,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  fullName: z.string().min(3, {
    message: "Full name must be at least 3 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  studentId: z.string().optional(),
  institution: z.string().min(2, {
    message: "Institution name must be at least 2 characters",
  }),
  department: z.string().optional(),
  program: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface StudentRegistrationProps {
  examCode: string;
  onBack: () => void;
}

const StudentRegistration: React.FC<StudentRegistrationProps> = ({
  examCode,
  onBack,
}) => {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      studentId: "",
      institution: "",
      department: "",
      program: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    try {
      // Store student information in sessionStorage instead of localStorage
      const studentInfo = {
        ...data,
        examCode,
        registrationTime: new Date().toISOString(),
      };

      // Use sessionStorage instead of localStorage
      sessionStorage.setItem("current_student", JSON.stringify(studentInfo));

      toast.success("Registration successful", {
        description: "You will now be redirected to the exam",
      });

      // Navigate to exam page after registration
      setTimeout(() => {
        navigate(`/exam/${examCode}`);
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed", {
        description: "Please try again",
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-scale-in">
      <div className="text-center mb-8">
        <div className="inline-block px-4 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium tracking-wider uppercase mb-3 backdrop-blur-sm">
          Student Registration
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">
          Register for Exam
        </h2>
        <p className="text-gray-300">
          Please provide your information to continue to exam{" "}
          <span className="font-mono text-blue-300">{examCode}</span>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Full Name</FormLabel>
                  <FormDescription className="text-gray-400 text-xs">
                    Enter your name as you would like it to appear on the
                    certificate
                  </FormDescription>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Enter your full name"
                        className="pl-10 h-12 border-none bg-black/20 text-white placeholder:text-gray-400"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Enter your email address"
                        className="pl-10 h-12 border-none bg-black/20 text-white placeholder:text-gray-400"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Student ID (Optional)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Award className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Enter your student ID if applicable"
                        className="pl-10 h-12 border-none bg-black/20 text-white placeholder:text-gray-400"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Institution</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Enter your school or institution name"
                        className="pl-10 h-12 border-none bg-black/20 text-white placeholder:text-gray-400"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Department (Optional)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <School className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Enter your department"
                        className="pl-10 h-12 border-none bg-black/20 text-white placeholder:text-gray-400"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="program"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Program of Study (Optional)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Enter your program of study"
                        className="pl-10 h-12 border-none bg-black/20 text-white placeholder:text-gray-400"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-1/3 h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              Back
            </Button>

            <Button
              type="submit"
              className="w-2/3 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-medium"
            >
              Continue to Exam <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StudentRegistration;
