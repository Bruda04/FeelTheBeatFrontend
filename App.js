import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import consts from "./utils/consts";

const UploadScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

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

      const response = await fetch(`${consts.api}/upload-song`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      const songName = data.file_path || "Unnamed Song";

      navigation.navigate("MusicView", {
        songName,
        songPhonePath: file.uri,
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <Button title="Add Song" onPress={handleAddSong} />
      )}
    </View>
  );
};

export default UploadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "pink",
    justifyContent: "center",
    alignItems: "center",
  },
});
