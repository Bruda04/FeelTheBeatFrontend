import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import consts from "./utils/consts";
import { useNavigation } from "@react-navigation/native"; // Assuming you're using React Navigation
import colors from "./utils/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const UploadScreen = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation(); // Assuming you're using React Navigation

  const handleAddSong = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/mpeg",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      setLoading(true);

      const formData = new FormData();
      formData.append("audio", {
        uri: file.uri,
        name: file.name,
        type: "audio/mpeg",
      });

      const response = await fetch(`${consts.api}/upload-song/`, {
        method: "POST",
        body: formData,
      });

      console.log("Response:", response); // Log the response for debugging

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      const songName = data.file_path || "Unnamed Song";

      navigation.navigate("PlayerScreen", {
        songName,
        songPhonePath: file.uri,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={{
          fontSize: 40,
          fontWeight: "bold",
          marginBottom: 100,
          color: colors.primary,
          alignSelf: "center",
          flex: 0.2,
        }}
      >
        Feel the Beat
      </Text>

      {loading ? (
        <ActivityIndicator size="150" color={colors.primary} />
      ) : (
        <>
          <Text
            style={{
              fontSize: 15,
              textAlign: "center",
              marginBottom: 40,
              color: colors.text,
            }}
          >
            Upload your song to expirience music like you never could before!
          </Text>
          <TouchableOpacity
            onPress={handleAddSong}
            style={{
              padding: 20,
              borderRadius: 10,
              backgroundColor: colors.primary,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 20 }}>Add Song</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

export default UploadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});
