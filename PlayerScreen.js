import React from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import MusicView from "./components/MusicView";
import colors from "./utils/colors";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App({ navigation, route }) {
  const { songName, songPhonePath } = route.params || {}; // Get the song name from route params

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={styles.container}
    >
      <MusicView songApiPath={songName} songPhonePath={songPhonePath} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
