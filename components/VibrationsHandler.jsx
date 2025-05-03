import { NativeModules } from "react-native";
import React, { useEffect } from "react";

const { CustomVibration } = NativeModules;

const INTENSITY_TO_DURATION_SCALE = 0.5; // change this to control duration
const MIN_DURATION = 0.1; // optional: minimum vibration time in ms
const MAX_DURATION = 500; // optional: cap duration to prevent overlong vibration

const VibrationsHandler = ({ pattern, amplitudes, isPlaying }) => {
  useEffect(() => {
    if (!pattern?.length || !amplitudes?.length) return;

    const startTime = Date.now();

    const timeouts = pattern.map((timestamp, index) => {
      const now = Date.now();
      const delay = Math.max(0, timestamp * 1000 - (now - startTime)); // ms delay
      const intensity = amplitudes[index] || 0; // get the corresponding amplitude

      if (intensity <= 0) {
        return null;
      }

      let duration;
      if (intensity >= 125) {
        // Scale duration with intensity
        duration = intensity * INTENSITY_TO_DURATION_SCALE;
        duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, duration));
      } else {
        // Default short duration
        duration = 100;
      }

      return setTimeout(() => {
        CustomVibration.vibrateWithIntensity(duration, intensity); // vibrate
      }, delay);
    });

    return () => {
      timeouts.forEach(clearTimeout); // cleanup on unmount
    };
  }, [pattern]);

  return null;
};

export default VibrationsHandler;
