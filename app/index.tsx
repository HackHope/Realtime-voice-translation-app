import React from "react";
import { Button, View, Text } from "react-native";
// import { runSTT } from "@/components/models/stt";

export default function IndexPage() {
  const [text, setText] = React.useState<string>("");

  const handleSTT = async () => {
    // const result = await runSTT(5); // record 5 seconds
    setText("is it working?");
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {/* <Button title="🎙️ Record & Transcribe" onPress={handleSTT} /> */}
      <Text style={{ marginTop: 20, fontSize: 16 }}>{text}</Text>
    </View>
  );
}
