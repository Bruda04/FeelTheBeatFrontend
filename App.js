import React from "react";
import { StyleSheet, useColorScheme, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PlayerScreen from "./PlayerScreen";
import UploadScreen from "./UploadScreen";
import MusicView from "./components/MusicView";

const Stack = createNativeStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={styles.container}
    >
      <NavigationContainer
        theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <Stack.Navigator
          initialRouteName="UploadScreen"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="UploadScreen" component={UploadScreen} />
          <Stack.Screen name="PlayerScreen" component={PlayerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "pink",
  },
});
