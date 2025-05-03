import React, { useState } from "react";
import { NavigationContainer, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StyleSheet, NativeModules, useColorScheme, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AudioVisualizer from "./components/AudioVisualizer";
import MusicView from "./components/MusicView";

const { CustomVibration } = NativeModules;

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style = {[styles.container]} >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>   
        <MusicView/>
      </ThemeProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'pink',
 },
});
