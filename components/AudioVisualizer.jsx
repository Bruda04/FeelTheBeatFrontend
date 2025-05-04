import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import Svg, { Line, Circle } from "react-native-svg";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import colors from "../utils/colors";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const SIZE = width * 1;

const CENTER = SIZE / 2;
const RADIUS = SIZE / 3.6;

const NUM_BARS = 45;
const BAR_WIDTH = 7;
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
  colorValues,
  pattern,
  amplitudes,
  songName,
}) => {
  const navigation = useNavigation();

  const [sound, setSound] = useState(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Raindrop State for animation
  const [raindrops, setRaindrops] = useState([]); // Holds active raindrops
  const [lastRaindropTime, setLastRaindropTime] = useState(0); // Timestamp for controlling raindrop appearance timing

  useEffect(() => {
    const loadSound = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
      });
      console.log("Loading Sound", audioPath);
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioPath },
        {
          shouldPlay: true,
        }
      );

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
  }, [sound, lastRaindropTime]);

  const THRESHOLD = 0.1; // seconds

  useEffect(() => {
    const match = pattern.find(
      (beat) =>
        Math.abs(beat - position) < THRESHOLD && lastRaindropTime !== beat
    );

    if (match !== undefined) {
      setLastRaindropTime(match);
      spawnRaindrop();
    }
  }, [position]);

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
        // setSongStartTimestamp(new Date().now()); // Update timestamp when playing
      }
    }
  };

  const stopSound = async () => {
    if (sound) {
      sound.stopAsync(); // Stop the sound when navigating back
    }
    setIsPlaying(false); // Reset the playing state
    setSongReady(false); // Reset the song ready state
    setSongStartTimestamp(null); // Reset the start timestamp
  };

  useEffect(() => {
    const onBackPress = () => {
      stopSound(); // Stop the sound
      navigation.goBack(); // Navigate back
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => backHandler.remove(); // Cleanup
  }, [sound]);

  const toggleFavorite = () => setIsFavorite(!isFavorite);

  const frame = barValues[frameIndex];
  const progress = position / duration;
  const amplitude = amplitudes[frameIndex] || 0;

  // Function to spawn a raindrop with color and animation
  const spawnRaindrop = () => {
    const colorTuple = colorValues[Math.floor(position)] || [255, 255, 255]; // Get color from colorValues array
    const color = `rgb(${colorTuple[0]}, ${colorTuple[1]}, ${colorTuple[2]})`;

    const newRaindrop = {
      x: Math.random() * width,
      y: Math.random() * height - 80, // To create random positions within the window
      radius: 10 + Math.random() * 55, // Random size of the raindrop
      opacity: 0.6, // Initial opacity
      color: color, // Color based on current position
    };

    setRaindrops((prevRaindrops) => {
      // Limit the number of raindrops to 10
      const updatedRaindrops = [...prevRaindrops, newRaindrop].slice(-15);
      return updatedRaindrops;
    });
  };

  const getSongTitleFromPath = (audioPath) => {
    const filename = decodeURI(audioPath)
      .replace(/^audio\//, "")
      .replace(/\.[^/.]+$/, "");
    const lastUnderscore = filename.lastIndexOf("_");
    const name =
      lastUnderscore !== -1 ? filename.substring(0, lastUnderscore) : filename;

    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Function to update raindrop size and opacity over time
  useEffect(() => {
    const fadeRaindrops = setInterval(() => {
      setRaindrops(
        (prevRaindrops) =>
          prevRaindrops
            .map((drop) => ({
              ...drop,
              radius: drop.radius + amplitude * 0.03, // Raindrop expands
              opacity: drop.opacity - 0.015, // Raindrop fades out
            }))
            .filter((drop) => drop.opacity > 0) // Keep only non-transparent drops
            .slice(-5) // Limit to 5 drops at once
      );
    }, 50);

    return () => clearInterval(fadeRaindrops);
  }, []);

  return (
    <View
      style={{
        position: "relative",
        backgroundColor: colors.background,
        height: "100%",
      }}
    >
      {/* Favorite button */}
      <View style={styles.topIcons}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
            stopSound();
          }}
        >
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteIcon}>
          <FontAwesome
            name={isFavorite ? "heart" : "heart-o"}
            size={26}
            color={isFavorite ? "#e43359" : "white"}
          />
        </TouchableOpacity>
      </View>

      {/* Raindrop SVG - Background effect */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 0,
          }}
        >
          <Svg
            width={width}
            height={height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 0,
            }}
          >
            {raindrops.map((drop, idx) => (
              <Circle
                key={idx}
                cx={drop.x}
                cy={drop.y}
                r={drop.radius}
                fill={drop.color}
                opacity={drop.opacity}
              />
            ))}
          </Svg>
        </View>

        <View
          style={{
            width: SIZE,
            height: SIZE,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            marginTop: 30,
            zIndex: 1,
          }}
        >
          <Text
            style={{
              position: "absolute",
              top: 0,
              color: "white",
              fontSize: 18,
              paddingLeft: 20,
              paddingRight: 20,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            {getSongTitleFromPath(songName) || "Song Title"}
          </Text>

          <Svg
            width={SIZE}
            height={SIZE}
            style={{ position: "absolute", top: 75, left: 0 }}
          >
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
              const barLength = value * BAR_HEIGHT * 10 + 4;

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
        </View>
      </View>

      {/* Time & Controls */}
      <View style={styles.playerContainer}>
        <View style={styles.playerControls}>
          <Text style={styles.time}>{formatTime(position)}</Text>

          <View style={styles.controlButtons}>
            <TouchableOpacity>
              <Ionicons name="play-skip-back" size={29} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePlayPause}>
              <FontAwesome
                name={isPlaying ? "pause" : "play"}
                size={29}
                color="white"
                style={{
                  marginLeft: !isPlaying ? "1.7" : "0",
                  marginRight: !isPlaying ? "0.6" : "0",
                }}
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Ionicons name="play-skip-forward" size={29} color="white" />
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
    paddingTop: 25,
    paddingBottom: 35,
    backgroundColor: "#6c6c6c",
    borderRadius: 15,
  },
  playerControls: {
    width: "84%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  time: {
    color: "white",
    fontSize: 14,
  },
  controlButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 40,
  },
  progressBar: {
    marginTop: 40,
    width: "85%",
    height: 7,
    backgroundColor: colors.secondary,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "white",
  },
  topIcons: {
    borderBottomColor: colors.secondary,
    borderBottomWidth: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 25,
    paddingTop: 22,
    paddingBottom: 15,
  },
});
