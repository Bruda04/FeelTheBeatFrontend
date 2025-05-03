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
import { FontAwesome } from "@expo/vector-icons"; // Assuming you're using FontAwesome for icons

const UploadScreen = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation(); // Assuming you're using React Navigation

  const handleAddSong = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/mpeg",
        copyToCacheDirectory: true,
        multiple: false,
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
          fontSize: 39,
          fontWeight: "bold",
          margin: 0,
          color: colors.primary,
          alignSelf: "center",
          marginBottom: 35,
        }}
      >
        Feel the Beat
        <View style={{ paddingLeft: 15 }}>
          <FontAwesome
            name="music"
            size={40}
            color={colors.primary}
            style={{ marginBottom: -6 }}
          />
        </View>
      </Text>

      {loading ? (
        <ActivityIndicator
          size="120"
          color={colors.primary}
          style={{ marginTop: "20" }}
        />
      ) : (
        <>
          <Text
            style={{
              fontSize: 16,
              textAlign: "center",
              marginBottom: 70,
              height: 100,
              lineHeight: 22,
              color: colors.text,
            }}
          >
            Upload your song to experience music like never before!
          </Text>
          <TouchableOpacity
            onPress={handleAddSong}
            style={{
              padding: 18,
              paddingTop: 12,
              paddingBottom: 12,
              borderRadius: 10,
              backgroundColor: "#d0543d",
            }}
          >
            <Text style={{ color: colors.text, fontSize: 18 }}>Add Song</Text>
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
    paddingRight: 30,
    paddingLeft: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
