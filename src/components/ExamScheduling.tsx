import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface ExamScheduling {
  date: Date;
  startTime: string;
  duration: number;
  timeZone: string;
}

interface ExamSchedulingProps {
  scheduling: ExamScheduling;
  schedulingTab: string;
  onSchedulingChange: (scheduling: ExamScheduling) => void;
  onTabChange: (tab: string) => void;
}

const ExamSchedulingComponent: React.FC<ExamSchedulingProps> = ({
  scheduling,
  schedulingTab,
  onSchedulingChange,
  onTabChange,
}) => {
  return (
    <div className="border border-white/10 rounded-lg p-4 bg-white/5 mt-6">
      <h3 className="text-sm font-medium mb-4">Exam Scheduling</h3>

      <Tabs value={schedulingTab} onValueChange={onTabChange} className="mb-4">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-black/30">
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-white/10"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Exam
          </TabsTrigger>
          <TabsTrigger
            value="unscheduled"
            className="data-[state=active]:bg-white/10"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            No Schedule (On Demand)
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {schedulingTab === "schedule" && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="examDate">Exam Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white/5 border-white/10",
                      !scheduling.date && "text-gray-400"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {scheduling.date ? (
                      format(scheduling.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-black/90 border-white/10 pointer-events-auto">
                  <CalendarComponent
                    mode="single"
                    selected={scheduling.date}
                    onSelect={(date) =>
                      onSchedulingChange({
                        ...scheduling,
                        date: date || new Date(),
                      })
                    }
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={scheduling.startTime}
                onChange={(e) =>
                  onSchedulingChange({
                    ...scheduling,
                    startTime: e.target.value,
                  })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="5"
                max="300"
                value={scheduling.duration}
                onChange={(e) =>
                  onSchedulingChange({
                    ...scheduling,
                    duration: parseInt(e.target.value) || 60,
                  })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <div className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm">
                {scheduling.timeZone}
              </div>
            </div>
          </div>

          <div className="mt-2 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <div className="flex">
              <div className="mr-3 text-blue-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-blue-300 font-medium">Scheduled Exam</p>
                <p className="text-xs text-blue-300/80 mt-1">
                  Students will only be able to access this exam at the
                  scheduled time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {schedulingTab === "unscheduled" && (
        <div className="p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
          <div className="flex">
            <div className="mr-3 text-yellow-400">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-yellow-300 font-medium">On-Demand Exam</p>
              <p className="text-xs text-yellow-300/80 mt-1">
                Students can take this exam at any time by entering the exam
                code. No scheduling will be created.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSchedulingComponent;
