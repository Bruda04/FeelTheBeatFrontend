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

export default function App() {
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
            <MusicView />
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
