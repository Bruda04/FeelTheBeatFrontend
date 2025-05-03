import React from "react";
import { StyleSheet, useColorScheme, Text } from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PlayerScreen from "./PlayerScreen";
import UploadScreen from "./UploadScreen";
import colors from "./utils/colors";

const Stack = createNativeStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
