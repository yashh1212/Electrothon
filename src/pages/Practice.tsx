import React from "react";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import HexagonGrid from "@/components/HexagonGrid";
import PracticeForm from "@/components/PracticeForm";

const Practice: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AnimatedBackground />
      </div>
      <div className="absolute inset-0 z-[1]">
        <HexagonGrid />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-3xl mx-auto">
            <PracticeForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
