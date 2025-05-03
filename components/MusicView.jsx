import React, { useEffect, useState } from "react";
import AudioVisualizer from "./AudioVisualizer";
import VibrationsHandler from "./VibrationsHandler";
import consts from "../utils/consts";

const MusicView = ({ songApiPath, songPhonePath }) => {
  const [songReady, setSongReady] = useState(false);
  const [songStartTimestamp, setSongStartTimestamp] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [barValues, setBarValues] = useState(null);
  const [vibrationValues, setVibrationValues] = useState(null);

  useEffect(() => {
    const fetchAllVisualizerData = async () => {
      try {
        const responses = await Promise.all([
          fetch(`${consts.api}/bars/${songApiPath}`),
          fetch(`${consts.api}/vibrations/${songApiPath}`),
        ]);

        const dataArray = await Promise.all(responses.map((res) => res.json()));
        const combinedResults = dataArray.map((data) => data.result);
        console.log(combinedResults);

        setBarValues(combinedResults[0]);
        setVibrationValues(combinedResults[1]);
      } catch (error) {
        console.error("Error fetching visualizer data:", error);
      }
    };

    fetchAllVisualizerData();
  }, []);

  const ready = barValues && vibrationValues;

  return (
    <>
      {ready && (
        <>
          <AudioVisualizer
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            barValues={barValues}
            audioPath={songPhonePath}
            setSongReady={setSongReady}
            setSongStartTimestamp={setSongStartTimestamp}
          />
          <VibrationsHandler
            isPlaying={isPlaying}
            pattern={vibrationValues[0]}
            amplitudes={vibrationValues[1]}
            songReady={songReady}
            songStartTimestamp={songStartTimestamp}
          />
        </>
      )}
    </>
  );
};

export default MusicView;
