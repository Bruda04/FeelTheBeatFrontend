import React, { useEffect, useState } from "react";
import AudioVisualizer from "./AudioVisualizer";
import VibrationsHandler from "./VibrationsHandler";
import colors from "../utils/colors";
import { View, ActivityIndicator, Text } from "react-native";

const MusicView = ({ songApiPath, songPhonePath }) => {
  const [songReady, setSongReady] = useState(false);
  const [songStartTimestamp, setSongStartTimestamp] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [barValues, setBarValues] = useState(null);
  const [vibrationValues, setVibrationValues] = useState(null);
  const [colorValues, setColorValues] = useState(null);

  useEffect(() => {
    const fetchAllVisualizerData = async () => {
      try {
        const responses = await Promise.all([
          fetch(`${consts.api}/bars/${encodeURI(songApiPath)}`),
          fetch(`${consts.api}/vibrations/${encodeURI(songApiPath)}`),
          fetch(`${consts.api}/colors/${encodeURI(songApiPath)}`),
        ]);

        const dataArray = await Promise.all(responses.map((res) => res.json()));
        const combinedResults = dataArray.map((data) => data.result);

        setBarValues(combinedResults[0]);
        setVibrationValues(combinedResults[1]);
        setColorValues(combinedResults[2]);
      } catch (error) {
        console.error("Error fetching visualizer data:", error);
      }
    };

    fetchAllVisualizerData();
  }, []);

  const ready = barValues && vibrationValues;

  return (
    <>
      {ready ? (
        <>
          <AudioVisualizer
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            barValues={barValues}
            audioPath={songPhonePath}
            setSongReady={setSongReady}
            setSongStartTimestamp={setSongStartTimestamp}
            colorValues={colorValues}
            pattern={vibrationValues[0]}
            songName={songApiPath}
          />
          <VibrationsHandler
            isPlaying={isPlaying}
            pattern={vibrationValues[0]}
            amplitudes={vibrationValues[1]}
            songReady={songReady}
            songStartTimestamp={songStartTimestamp}
          />
        </>
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{ color: colors.primary, fontSize: 20, marginBottom: 35 }}
          >
            Preparing your song...
          </Text>
          <ActivityIndicator size="110" color={colors.primary} />
        </View>
      )}
    </>
  );
};

export default MusicView;
