import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Svg, { Line, Circle } from "react-native-svg";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const SIZE = width * 1;

const CENTER = SIZE / 2;
const RADIUS = SIZE / 4;

const NUM_BARS = 45;
const BAR_WIDTH = 6;
const BAR_HEIGHT = 5;

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const AudioVisualizer = ({
  audioPath,
  barValues,
  isPlaying,
  setIsPlaying,
  setSongReady,
  setSongStartTimestamp,
}) => {
  const [sound, setSound] = useState(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadSound = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(audioPath, {
        shouldPlay: true,
      });

      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setSongReady(true);
        setDuration(status.durationMillis / 1000);
        setIsPlaying(status.isPlaying ?? false);
        setSongStartTimestamp(new Date().getTime());
      }

      setSound(sound);
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync(); // clean up
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!sound) return;

      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        const positionSec = status.positionMillis / 1000;
        setPosition(positionSec);
        const frameIndex = Math.floor(positionSec / 0.05); // 20 FPS
        setFrameIndex(frameIndex % barValues.length);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [sound]);

  const handlePlayPause = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
        setSongStartTimestamp(new Date().getTime()); // Update timestamp when playing
      }
    }
  };

  const toggleFavorite = () => setIsFavorite(!isFavorite);

  const frame = barValues[frameIndex];
  const progress = position / duration;

  return (
    <View
      style={{ position: "relative", backgroundColor: "pink", height: "100%" }}
    >
      {/* Favorite button */}
      <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteIcon}>
        <FontAwesome
          name={isFavorite ? "heart" : "heart-o"}
          size={26}
          color={isFavorite ? "#e43359" : "white"}
        />
      </TouchableOpacity>

      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS - 12}
          stroke="#ffffff33"
          strokeWidth={4}
          fill="transparent"
        />

        {/* Progress Ring */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS - 12}
          stroke="white"
          strokeWidth={5}
          fill="transparent"
          strokeDasharray={2 * Math.PI * (RADIUS - 11)}
          strokeDashoffset={(1 - progress) * 2 * Math.PI * (RADIUS - 11)}
          rotation={-90}
          originX={CENTER}
          originY={CENTER}
          strokeLinecap="round"
        />

        {frame.map((value, i) => {
          const angle = (2 * Math.PI * i) / NUM_BARS;
          const barLength = value * BAR_HEIGHT * 9 + 4;

          const x1 = CENTER + RADIUS * Math.cos(angle);
          const y1 = CENTER + RADIUS * Math.sin(angle);

          const x2 = CENTER + (RADIUS + barLength) * Math.cos(angle);
          const y2 = CENTER + (RADIUS + barLength) * Math.sin(angle);

          const third = Math.floor(NUM_BARS / 3);

          const color =
            i < third
              ? "#c8428b"
              : i < third * 2
              ? "#ffffff"
              : i < third * 3
              ? "#84d9f1"
              : "#c8428b";

          return (
            <Line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={BAR_WIDTH}
              strokeLinecap="round"
            />
          );
        })}
      </Svg>

      {/* Time & Controls */}
      <View style={styles.playerContainer}>
        <View style={styles.playerControls}>
          <Text style={styles.time}>{formatTime(position)}</Text>

          <View style={styles.controlButtons}>
            <TouchableOpacity>
              <Ionicons name="play-skip-back" size={27} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePlayPause}>
              <FontAwesome
                name={isPlaying ? "pause" : "play"}
                size={27}
                color="white"
                style={{
                  marginLeft: !isPlaying ? "1.7" : "0",
                  marginRight: !isPlaying ? "0.6" : "0",
                }}
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Ionicons name="play-skip-forward" size={27} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>

        {/* Linear progress bar */}
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>
      </View>
    </View>
  );
};

export default AudioVisualizer;

const styles = StyleSheet.create({
  playerContainer: {
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
    paddingBottom: 33,
  },
  playerControls: {
    width: "84%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  time: {
    color: "white",
    fontSize: 13.5,
  },
  controlButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 40,
  },
  progressBar: {
    marginTop: 20,
    width: "85%",
    height: 6,
    backgroundColor: "#ffffff33",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "white",
  },
  favoriteIcon: {
    width: "100%",
    alignItems: "flex-end",
    padding: "20",
    paddingRight: "25",
  },
});
