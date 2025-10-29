import { pipeline } from "@fugood/transformers";


// Define input/output types
export async function runTranslation(text: string): Promise<string> {
    // Optional local model cache (works in dev / Node, ignored in mobile builds)
    const modelCache = "./assets/model_cache/translation";

    // Declare the pipeline instance
    const translator = await pipeline("translation", "Xenova/opus-mt-en-hi", {
        cache_dir: modelCache,
        dtype: "fp16", // Use fp32 if precision issues appear
    });;

    try {
        // Run translation
        const output = await translator(text);

        // Transformers.js returns an array of { translation_text: string }
        const translatedText = (output as Array<{ translation_text: string }>)[0]
            .translation_text;

        console.debug("🌐 Translation:", translatedText);
        return translatedText;
    } catch (error) {
        console.error("❌ Translation error:", error);
        throw error;
    }
}
