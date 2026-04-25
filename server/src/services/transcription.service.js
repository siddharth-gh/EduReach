import "../config/env.js";
import fs from "fs";
import OpenAI from "openai";

const MAX_TRANSCRIPTION_BYTES = 25 * 1024 * 1024;
const DEFAULT_WHISPER_MODEL = process.env.WHISPER_MODEL || "whisper-1";
const ENABLE_WHISPER_TRANSCRIPTION =
    process.env.ENABLE_WHISPER_TRANSCRIPTION === "true";
const MOCK_AI_TRANSCRIPT = `Automatic video transcription is not available yet in testing mode.

This sample transcript is provided so the lecture summary, MCQ generation, and text-only reading mode can be tested without using a paid transcription API.

In this lecture, the teacher introduces artificial intelligence as the ability of computer systems to perform tasks that usually require human intelligence. The lesson explains how AI can recognize patterns, make predictions, answer questions, and support learning platforms with features such as personalized recommendations, automated summaries, and practice questions.

The lecture also discusses responsible use of AI. Students should understand that AI tools are helpful assistants, but their output should be checked for accuracy, fairness, and relevance to the learning material.`;

const getOpenAiClient = () => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured");
    }

    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
};

export const isTranscriptionConfigured = () =>
    ENABLE_WHISPER_TRANSCRIPTION && Boolean(process.env.OPENAI_API_KEY);

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
