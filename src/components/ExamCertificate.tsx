import React from "react";
import { Award, FileText, Shield, Check } from "lucide-react";

interface ExamCertificateProps {
  studentName: string;
  examTitle: string;
  score: number;
  date: string;
  examCode: string;
}

const ExamCertificate: React.FC<ExamCertificateProps> = ({
  studentName,
  examTitle,
  score,
  date,
  examCode,
}) => {
  // Generate a unique verification code based on student name and exam code
  const verificationCode = btoa(`${studentName}-${examCode}-${date}`).substring(
    0,
    12
  );

  return (
    <div className="certificate-container w-full bg-white rounded-lg overflow-hidden shadow-2xl border border-gray-200">
      <div className="certificate-inner relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          ></div>
        </div>

        {/* Certificate border */}
        <div className="relative border-8 border-double border-gray-100 m-1">
          {/* Header */}
          <div className="py-10 px-12 text-center border-b border-gray-200">
            <div className="flex justify-center mb-4">
              <Award className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-wide">
              CERTIFICATE OF COMPLETION
            </h1>
            <p className="text-gray-600">This certifies that</p>
          </div>

          {/* Main content */}
          <div className="py-10 px-12 text-center">
            <h2 className="text-4xl font-serif italic text-blue-700 mb-6 border-b border-gray-200 pb-6 mx-auto max-w-lg">
              {studentName}
            </h2>

            <p className="text-gray-600 mb-6">
              has successfully completed the online examination
            </p>

            <h3 className="text-2xl font-bold text-gray-800 mb-6 max-w-2xl mx-auto leading-normal">
              {examTitle}
            </h3>

            <div className="flex justify-center items-center gap-2 text-gray-700 mb-8">
              <span>with a score of</span>
              <span className="text-xl font-bold text-blue-600">{score}%</span>
            </div>

            <div className="text-sm text-gray-500 mb-6">
              <p>Issued on {date}</p>
              <p>Exam Code: {examCode}</p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end max-w-2xl mx-auto mt-16 px-8">
              <div className="text-center">
                <div className="w-40 border-t border-gray-400 pt-2">
                  <p className="font-serif text-gray-600 italic">
                    Course Instructor
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <Shield className="h-16 w-16 text-blue-600 mb-2" />
                <div className="w-32 h-32 flex items-center justify-center">
                  <div className="w-24 h-24 border-4 border-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-20 h-20 border border-blue-200 rounded-full flex items-center justify-center">
                      <div className="text-blue-600 font-bold text-xs">
                        VERIFIED
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="w-40 border-t border-gray-400 pt-2">
                  <p className="font-serif text-gray-600 italic">Director</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-6 px-12 flex justify-between items-center">
            <div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xs">AEAI</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">AbsoluteExamAI</h4>
                  <p className="text-xs text-gray-500">Examination Network</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-1">
                <FileText className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-gray-600">Certificate ID:</p>
              </div>
              <div className="text-sm font-mono bg-white px-3 py-1 rounded border border-gray-200">
                {verificationCode}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Verify at:{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  absolute-exam-ai.org/verify
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCertificate;
