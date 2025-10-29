import { pipeline } from "@fugood/transformers";
import fs from "react-native-fs";
import wavefile from "wavefile";

interface TTSOutput {
    audio: Float32Array;
    sampling_rate: number;
}


export async function runTTS(text: string, outPath: string): Promise<void> {
    const tts = await pipeline("text-to-speech", "Xenova/mms-tts-hin", {
        cache_dir: "./assets/model_cache/tts",
        dtype: "fp32",
    })
    const output = (await tts(text)) as TTSOutput;

    const wav = new wavefile.WaveFile();
    wav.fromScratch(1, output.sampling_rate, "32f", output.audio);

    await fs.writeFile(outPath, Buffer.from(wav.toBuffer()).toString('base64'), 'base64');
}

