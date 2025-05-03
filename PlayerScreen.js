import React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StyleSheet, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MusicView from "./components/MusicView";
import { DarkTheme } from "@react-navigation/native";

export default function App({ navigation, route }) {
  const { songName, songPhonePath } = route.params || {}; // Get the song name from route params
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={[styles.container]}
    >
      <ThemeProvider theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <NavigationContainer
          theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <View style={styles.container}>
            <MusicView songApiPath={songName} songPhonePath={songPhonePath} />
          </View>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "pink",
  },
});
