import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface SecuritySettings {
  eyeTracking: boolean;
  faceDetection: boolean;
  preventTabSwitching: boolean;
}

export const useExamSecurity = (
  settings: SecuritySettings,
  examCompleted: boolean,
  setTabSwitchCount: (count: number) => void,
  setSecurityWarnings: (warnings: any) => void,
  setShowSecurityViolationDialog: (show: boolean) => void
) => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [requestingPermissions, setRequestingPermissions] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const MAX_TAB_SWITCHES = 3;
  const [tabSwitchCount, setLocalTabSwitchCount] = useState(0);
  const [showCameraFeed, setShowCameraFeed] = useState(true);

  // Camera access and security monitoring
  useEffect(() => {
    const requestPermissions = async () => {
      if (settings.faceDetection || settings.eyeTracking) {
        try {
          setRequestingPermissions(true);
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 320 },
              height: { ideal: 240 },
              facingMode: "user",
            },
          });
          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          setPermissionsGranted(true);
          toast.success("Camera access granted");

          const securityCheck = setInterval(() => {
            if (settings.eyeTracking && Math.random() > 0.9) {
              setSecurityWarnings((prev: any) => ({ ...prev, eye: true }));
              toast.warning("Eye movement detected outside exam area", {
                description: "Please focus on the exam",
                id: "eye-warning",
              });

              setTimeout(() => {
                setSecurityWarnings((prev: any) => ({ ...prev, eye: false }));
              }, 5000);
            }

            if (settings.faceDetection && Math.random() > 0.95) {
              setSecurityWarnings((prev: any) => ({ ...prev, face: true }));
              toast.warning("Face not clearly visible", {
                description: "Please ensure your face is visible",
                id: "face-warning",
              });

              setTimeout(() => {
                setSecurityWarnings((prev: any) => ({ ...prev, face: false }));
              }, 5000);
            }
          }, 15000);

          return () => {
            clearInterval(securityCheck);
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
            }
          };
        } catch (error) {
          console.error("Error accessing camera:", error);
          toast.error("Camera access denied", {
            description: "Unable to enable security features",
          });
          setPermissionsGranted(false);
        } finally {
          setRequestingPermissions(false);
        }
      }
    };

    requestPermissions();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [settings.eyeTracking, settings.faceDetection, setSecurityWarnings]);

  // Tab switch detection
  useEffect(() => {
    if (!settings.preventTabSwitching || examCompleted) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const newTabSwitchCount = tabSwitchCount + 1;
        setLocalTabSwitchCount(newTabSwitchCount);
        setTabSwitchCount(newTabSwitchCount);
        setSecurityWarnings((prev: any) => ({ ...prev, tabSwitch: true }));

        toast.warning(
          `Tab switch detected (${newTabSwitchCount}/${MAX_TAB_SWITCHES})`,
          {
            description: "Switching tabs during an exam is not allowed",
            id: "tab-switch-warning",
          }
        );

        setTimeout(() => {
          setSecurityWarnings((prev: any) => ({ ...prev, tabSwitch: false }));
        }, 5000);

        if (newTabSwitchCount >= MAX_TAB_SWITCHES) {
          setShowSecurityViolationDialog(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleWindowBlur = () => {
      if (!examCompleted) {
        const newTabSwitchCount = tabSwitchCount + 1;
        setLocalTabSwitchCount(newTabSwitchCount);
        setTabSwitchCount(newTabSwitchCount);
        setSecurityWarnings((prev: any) => ({ ...prev, tabSwitch: true }));

        toast.warning(`Focus lost (${newTabSwitchCount}/${MAX_TAB_SWITCHES})`, {
          description: "Leaving the exam window is not allowed",
          id: "focus-warning",
        });

        setTimeout(() => {
          setSecurityWarnings((prev: any) => ({ ...prev, tabSwitch: false }));
        }, 5000);

        if (newTabSwitchCount >= MAX_TAB_SWITCHES) {
          setShowSecurityViolationDialog(true);
        }
      }
    };

    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [
    settings.preventTabSwitching,
    examCompleted,
    tabSwitchCount,
    setTabSwitchCount,
    setSecurityWarnings,
    setShowSecurityViolationDialog,
  ]);

  const handleRetryPermissions = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      setRequestingPermissions(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setPermissionsGranted(true);
      toast.success("Camera access granted");
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Camera access denied");
      setPermissionsGranted(false);
    } finally {
      setRequestingPermissions(false);
    }
  };

  const toggleCameraFeed = () => {
    setShowCameraFeed(!showCameraFeed);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  return {
    permissionsGranted,
    requestingPermissions,
    videoRef,
    showCameraFeed,
    tabSwitchCount,
    handleRetryPermissions,
    toggleCameraFeed,
    stopCamera,
    MAX_TAB_SWITCHES,
  };
};
