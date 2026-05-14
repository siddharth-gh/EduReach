import "../config/env.js";
import fs from "fs";
import OpenAI from "openai";

const MAX_TRANSCRIPTION_BYTES = 25 * 1024 * 1024;
const DEFAULT_WHISPER_MODEL = process.env.WHISPER_MODEL || "whisper-1";
const ENABLE_WHISPER_TRANSCRIPTION =
    process.env.ENABLE_WHISPER_TRANSCRIPTION === "true";
const WHISPER_API_URL = process.env.WHISPER_API_URL || "https://api.openai.com/v1";
const WHISPER_API_KEY = process.env.WHISPER_API_KEY || process.env.OPENAI_API_KEY;
const MOCK_AI_TRANSCRIPT = `Artificial Intelligence (AI), while a powerful tool, comes with several significant disadvantages that must be considered. One major concern is the potential for bias and discrimination; AI systems are only as objective as the data they are trained on, meaning they can inadvertently perpetuate and even amplify existing societal prejudices. Additionally, there is the risk of over-reliance on AI, which may lead to a degradation of human skills and critical thinking as tasks are increasingly automated. The "black box" nature of some AI models also poses a challenge, as it can be difficult to understand how these systems arrive at their decisions, raising issues of accountability and transparency. Furthermore, the widespread deployment of AI could exacerbate economic inequality through job displacement, and the massive computational power required to train large models has a considerable environmental footprint.`;

const getOpenAiClient = () => {
    if (!WHISPER_API_KEY) {
        throw new Error("WHISPER_API_KEY is not configured");
    }

    return new OpenAI({
        apiKey: WHISPER_API_KEY,
        baseURL: WHISPER_API_URL,
    });
};

export const isTranscriptionConfigured = () =>
    ENABLE_WHISPER_TRANSCRIPTION && Boolean(WHISPER_API_KEY);

export const getMockTranscription = () => ({
    text: MOCK_AI_TRANSCRIPT,
    model: "testing-fallback",
});

export const transcribeAudioFile = async ({
    audioPath,
    audioBytes,
    prompt,
}) => {
    if (!isTranscriptionConfigured()) {
        throw new Error("OPENAI_API_KEY is not configured");
    }

    if (audioBytes > MAX_TRANSCRIPTION_BYTES) {
        throw new Error(
            "Audio is larger than 25 MB. Shorten the video or lower the audio bitrate before transcription."
        );
    }

    const client = getOpenAiClient();
    const request = {
        file: fs.createReadStream(audioPath),
        model: DEFAULT_WHISPER_MODEL,
        response_format: "json",
        temperature: 0,
    };

    if (process.env.OPENAI_TRANSCRIPTION_LANGUAGE) {
        request.language = process.env.OPENAI_TRANSCRIPTION_LANGUAGE;
    }

    if (prompt) {
        request.prompt = prompt;
    }

    const transcription = await client.audio.transcriptions.create(request);
    const text = String(transcription?.text || "").trim();

    if (!text) {
        throw new Error("Whisper did not return transcript text");
    }

    return {
        text,
        model: DEFAULT_WHISPER_MODEL,
    };
};
