import React from "react";

const Certificate: React.FC = () => {
  // Retrieve stored student data
  const studentData = sessionStorage.getItem("current_student");
  const student = studentData ? JSON.parse(studentData) : null;

  if (!student) {
    return (
      <div className="text-center text-red-600 font-bold text-lg">
        No student data found. Please complete registration.
      </div>
    );
  }

  return (
    <div className="certificate-container w-full max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-300 text-center">
      <div className="border-8 border-gray-200 p-6 relative">
        {/* Certificate Header */}
        <h1 className="text-3xl font-bold uppercase text-gray-800">
          Certificate of Completion
        </h1>
        <p className="text-gray-600 mt-2">This is to certify that</p>

        {/* Student Name */}
        <h2 className="text-4xl font-semibold text-blue-700 mt-4">
          {student.fullName}
        </h2>

        <p className="text-gray-600 mt-4">
          has successfully completed the online examination
        </p>

        {/* Exam Code */}
        <h3 className="text-2xl font-bold text-gray-800 mt-4">
          Exam Code: {student.examCode}
        </h3>

        {/* Student Details */}
        <div className="text-sm text-gray-500 mt-6">
          <p>Email: {student.email}</p>
          {student.studentId && <p>Student ID: {student.studentId}</p>}
          <p>Institution: {student.institution || "N/A"}</p>
          {student.department && <p>Department: {student.department}</p>}
          {student.program && <p>Program: {student.program}</p>}
          <p>
            Registration Date:{" "}
            {new Date(student.registrationTime).toLocaleDateString()}
          </p>
        </div>

        {/* Signature & Verification */}
        <div className="flex justify-between items-center mt-8">
          <div>
            <p className="text-gray-600">Signature</p>
            <div className="w-32 h-1 bg-gray-500 mt-2"></div>
          </div>

          <div>
            <p className="text-gray-600">Verified by</p>
            <div className="w-32 h-1 bg-gray-500 mt-2"></div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-6">
          Verify this certificate at:{" "}
          <a href="#" className="text-blue-600 hover:underline">
            example.com/verify
          </a>
        </p>
      </div>
    </div>
  );
};

export default Certificate;
