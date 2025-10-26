/*
  AST service: uses transformers.js to run an automatic-speech-recognition (Whisper tiny)
  model and then translate the transcribed English text to Hindi using an MT model.

  Notes:
  - This file dynamically imports `@xenova/transformers` at runtime. Ensure the
    package is installed and your runtime (web/native) has the required WASM
    / backend support for transformers.js.
  - The `transcribeAndTranslate` function accepts a Blob, ArrayBuffer or a URI
    (string). On native (Expo) we fetch the local file URI into an ArrayBuffer
    before passing to the ASR pipeline.
*/

let _asrPipeline: any = null;
let _translationPipeline: any = null;

async function initModels() {
    if (_asrPipeline) return;

    // Dynamically import transformers.js (package: @xenova/transformers)
    const transformers = await import('@huggingface/transformers');
    const { pipeline } = transformers;

    // Load Whisper Tiny for ASR
    // Model id: 'openai/whisper-tiny' (transformers.js will download/instantiate the model)
    _asrPipeline = await pipeline('automatic-speech-recognition', '');

    // Load a translation model from English -> Hindi
    // Helsinki-NLP/opus-mt-en-hi is a commonly used translation model for en->hi
    // _translationPipeline = await pipeline('translation', 'Helsinki-NLP/opus-mt-en-hi');
}

type ASTResult = {
    transcription?: string;
    translated?: string;
    raw?: any;
};

export async function transcribeAndTranslate(input: ArrayBuffer | Blob | string): Promise<ASTResult> {
    await initModels();

    let audioBuffer: ArrayBuffer | null = null;

    if (typeof input === 'string') {
        // treat as URI
        const res = await fetch(input);
        audioBuffer = await res.arrayBuffer();
    } else if (input instanceof Blob) {
        audioBuffer = await input.arrayBuffer();
    } else if (input instanceof ArrayBuffer) {
        audioBuffer = input;
    } else {
        throw new Error('Unsupported audio input type');
    }

    // Run ASR (whisper) - transformers.js accepts ArrayBuffer for audio on supported backends
    const asrResult = await _asrPipeline(audioBuffer);
    // asrResult may be an object with `text` or a string
    const transcription = (asrResult && (asrResult.text ?? asrResult)) || '';

    // Translate transcription to Hindi
    const translationResult = await _translationPipeline(transcription);
    // translationResult can be string or array/object depending on the pipeline
    let translated = '';
    if (Array.isArray(translationResult)) {
        translated = translationResult[0]?.translation_text ?? translationResult[0]?.generated_text ?? String(translationResult[0]);
    } else if (typeof translationResult === 'object') {
        translated = translationResult.translation_text ?? translationResult.generated_text ?? JSON.stringify(translationResult);
    } else {
        translated = String(translationResult ?? '');
    }

    return { transcription, translated, raw: { asrResult, translationResult } };
}

export default {
    transcribeAndTranslate,
};
