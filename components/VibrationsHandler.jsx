import { NativeModules } from "react-native";
import React, { useEffect } from "react";

const { CustomVibration } = NativeModules;

const INTENSITY_TO_DURATION_SCALE = 0.6;
const MIN_DURATION = 0.1;
const MAX_DURATION = 500;

const VibrationsHandler = ({
  pattern,
  amplitudes,
  isPlaying,
  songReady,
  songStartTimestamp, // this is a Date.now() value when song started
}) => {
  useEffect(() => {
    if (
      !songReady ||
      !pattern?.length ||
      !amplitudes?.length ||
      !isPlaying ||
      !songStartTimestamp
    )
      return;

    const now = Date.now();
    const currentSongTime = (now - songStartTimestamp) / 1000; // in seconds

    const timeouts = pattern.map((timestamp, index) => {
      const delay = Math.max(0, (timestamp - currentSongTime) * 1000); // ms
      const intensity = amplitudes[index] || 0;

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
        CustomVibration.vibrateWithIntensity(duration, intensity);
      }, delay);
    });

    return () => {
      timeouts.forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [pattern, amplitudes, isPlaying, songReady, songStartTimestamp]);

  return null;
};

export default VibrationsHandler;
