import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Platform,
  NativeModules,
  Alert,
} from "react-native";

const { CustomVibration } = NativeModules;

export default function App() {
  const [duration, setDuration] = useState("500"); // in ms
  const [intensity, setIntensity] = useState("128"); // 0–255

  const handleVibrate = () => {
    if (Platform.OS === "android") {
      const time = parseInt(duration, 10);
      const amp = parseInt(intensity, 10);

      if (isNaN(time) || isNaN(amp) || amp < 1 || amp > 255) {
        Alert.alert(
          "Invalid input",
          "Please enter valid time (ms) and intensity (1–255)"
        );
        return;
      }

      CustomVibration.vibrateWithIntensity(time, amp);
    } else {
      Alert.alert(
        "Not supported",
        "Custom vibration is only available on Android"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vibration Tester</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
        placeholder="Duration (ms)"
      />

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={intensity}
        onChangeText={setIntensity}
        placeholder="Intensity (1–255)"
      />

      <Button title="Vibrate" onPress={handleVibrate} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
});
