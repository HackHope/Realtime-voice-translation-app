import { pipeline } from "@fugood/transformers";
import { Audio } from "expo-av";


/**
 * Records or transcribes a WAV/PCM file into text using Whisper-tiny.
 * If no file path is given, it will record 5 seconds of audio from mic.
 */
export async function runSTT(recordSeconds: number = 5): Promise<string> {
    const transcriber = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-tiny.en",
        { dtype: "fp16", cache_dir: "./assets/model/stt" }
    );

    try {
        // 🎙️ 1️⃣ Ask for mic permission
        const permission = await Audio.requestPermissionsAsync();
        if (!permission.granted) {
            throw new Error("Microphone permission not granted");
        }

        // 🎙️ 2️⃣ Prepare recorder
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        console.log("🎧 Recording started...");
        await recording.startAsync();

        // Record for N seconds
        await new Promise((resolve) => setTimeout(resolve, recordSeconds * 1000));

        console.log("🛑 Stopping recording...");
        await recording.stopAndUnloadAsync();

        const uri = recording.getURI();
        if (!uri) throw new Error("Recording failed: no URI");

        // 3️⃣ Load audio data
        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();
        const float32Audio = await decodeWavToFloat32(arrayBuffer);

        // 5️⃣ Run STT
        console.log("🧠 Running inference...");
        const result = await transcriber(float32Audio);

        console.log("✅ Transcription:", result.text);
        return result.text;
    } catch (error) {
        console.error("❌ Error in runSTT:", error);
        throw error;
    }
}

/**
 * Helper — Decode WAV ArrayBuffer → Float32Array (minimal)
 */
async function decodeWavToFloat32(arrayBuffer: ArrayBuffer): Promise<Float32Array> {
    const view = new DataView(arrayBuffer);
    const numChannels = view.getUint16(22, true);
    const sampleRate = view.getUint32(24, true);
    const bitsPerSample = view.getUint16(34, true);

    const dataOffset = 44;
    const bytesPerSample = bitsPerSample / 8;
    const numSamples = (view.byteLength - dataOffset) / bytesPerSample / numChannels;

    const float32 = new Float32Array(numSamples);
    for (let i = 0, offset = dataOffset; i < numSamples; i++, offset += bytesPerSample) {
        float32[i] = view.getInt16(offset, true) / 0x8000;
    }

    return float32;
}
