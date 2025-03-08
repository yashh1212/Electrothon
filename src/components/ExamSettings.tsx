import React from "react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { EyeOff, Camera } from "lucide-react";

interface ExamSettings {
  negativeMarking: boolean;
  negativeMarkingValue: number;
  eyeTracking: boolean;
  faceDetection: boolean;
  displayResults: boolean;
}

interface ExamSettingsProps {
  settings: ExamSettings;
  onChange: (settings: ExamSettings) => void;
}

const ExamSettingsComponent: React.FC<ExamSettingsProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="space-y-4 p-4 border border-white/10 rounded-lg bg-white/5 mt-4">
      <h3 className="text-sm font-medium">Exam Settings</h3>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="negative-marking">Negative Marking</Label>
          <div className="text-xs text-gray-400">
            Apply penalty for incorrect MCQ answers
          </div>
        </div>
        <Switch
          id="negative-marking"
          checked={settings.negativeMarking}
          onCheckedChange={(checked) =>
            onChange({ ...settings, negativeMarking: checked })
          }
        />
      </div>

      {settings.negativeMarking && (
        <div className="pl-6 border-l border-white/10">
          <Label htmlFor="negative-value" className="mb-2 block text-sm">
            Penalty Value (0.1 - 1.0)
          </Label>
          <Input
            id="negative-value"
            type="number"
            min="0.1"
            max="1"
            step="0.1"
            value={settings.negativeMarkingValue}
            onChange={(e) =>
              onChange({
                ...settings,
                negativeMarkingValue: parseFloat(e.target.value) || 0.25,
              })
            }
            className="w-24 bg-white/5 border-white/10 text-white"
          />
        </div>
      )}

      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-0.5">
            <Label htmlFor="eye-tracking">
              <div className="flex items-center">
                <EyeOff className="h-4 w-4 mr-2" />
                Enable Eye Tracking
              </div>
            </Label>
            <div className="text-xs text-gray-400">
              Monitor student's eye movement to prevent cheating
            </div>
          </div>
          <Switch
            id="eye-tracking"
            checked={settings.eyeTracking}
            onCheckedChange={(checked) =>
              onChange({ ...settings, eyeTracking: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="space-y-0.5">
            <Label htmlFor="face-detection">
              <div className="flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                Face Detection
              </div>
            </Label>
            <div className="text-xs text-gray-400">
              Verify student identity and monitor presence
            </div>
          </div>
          <Switch
            id="face-detection"
            checked={settings.faceDetection}
            onCheckedChange={(checked) =>
              onChange({ ...settings, faceDetection: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="display-results">Display Results</Label>
            <div className="text-xs text-gray-400">
              Show results to students after submission
            </div>
          </div>
          <Switch
            id="display-results"
            checked={settings.displayResults}
            onCheckedChange={(checked) =>
              onChange({ ...settings, displayResults: checked })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ExamSettingsComponent;
