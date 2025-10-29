import { runSTT } from "./stt";
import { runTranslation } from "./translation";
import { runTTS } from "./tts";

export interface STSResult {
    originalText: string;
    translatedText: string;
    audioUri?: string; // for TTS output (if applicable)
}

export default async function runSTS(
    inputAudio: number,
    outAudio?: string
): Promise<STSResult> {
    try {
        // 1️⃣ Speech → Text
        const text = await runSTT(inputAudio);
        console.debug("🎙️ Transcribed:", text);

        // 2️⃣ Translate Text
        const translated = await runTranslation(text);
        console.debug("🌐 Translated:", translated);

        // 3️⃣ Text → Speech (if output requested)
        let audioUri: string | undefined;
        if (outAudio) {
            await runTTS(translated, outAudio);
            console.debug("🔊 TTS generated:", outAudio);
        }

        console.debug("✅ STS pipeline done");
        return { originalText: text, translatedText: translated, audioUri };
    } catch (error) {
        console.error("❌ STS pipeline failed:", error);
        throw error;
    }
}
