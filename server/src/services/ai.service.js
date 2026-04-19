import { GoogleGenAI } from "@google/genai";

const DEFAULT_AI_PROVIDER = (process.env.AI_PROVIDER || "ollama").toLowerCase();
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const DEFAULT_OLLAMA_MODEL = process.env.OLLAMA_MODEL || "phi";
const DEFAULT_OLLAMA_BASE_URL =
    process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";

const extractJson = (value) => {
    if (!value) {
        throw new Error("AI response was empty");
    }

    const directParse = (() => {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    })();

    if (directParse) {
        return directParse;
    }

    const fencedMatch = value.match(/```json\s*([\s\S]*?)```/i);

    if (fencedMatch?.[1]) {
        return JSON.parse(fencedMatch[1]);
    }

    const objectMatch = value.match(/\{[\s\S]*\}/);

    if (!objectMatch) {
        throw new Error("AI response did not contain valid JSON");
    }

    return JSON.parse(objectMatch[0]);
};

const normalizeGeminiError = (error) => {
    const rawMessage =
        error?.message ||
        error?.error?.message ||
        "Gemini request failed";

    if (
        rawMessage.includes("RESOURCE_EXHAUSTED") ||
        rawMessage.includes("Quota exceeded") ||
        rawMessage.includes('"code":429') ||
        rawMessage.includes("429")
    ) {
        const friendlyError = new Error(
            "Gemini quota is exhausted right now. Try again later or switch AI_PROVIDER=ollama."
        );
        friendlyError.code = "GEMINI_QUOTA_EXHAUSTED";
        throw friendlyError;
    }

    throw error;
};

const getGeminiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    return new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
};

const isGeminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);

const isOllamaConfigured = () =>
    Boolean(process.env.OLLAMA_BASE_URL || process.env.OLLAMA_MODEL);

const getProvider = () => DEFAULT_AI_PROVIDER;

const generateWithOllama = async (prompt, schema) => {
    const response = await fetch(`${DEFAULT_OLLAMA_BASE_URL}/api/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: DEFAULT_OLLAMA_MODEL,
            prompt,
            stream: false,
            format: schema || "json",
            options: {
                temperature: 0.2,
            },
        }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            payload?.error ||
                `Ollama request failed with status ${response.status}`
        );
    }

    return extractJson(payload?.response || "");
};

const generateWithGemini = async (prompt) => {
    try {
        const client = getGeminiClient();
        const response = await client.models.generateContent({
            model: DEFAULT_GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        return extractJson(response.text);
    } catch (error) {
        normalizeGeminiError(error);
    }
};

const generateJson = async (prompt, schema) => {
    const provider = getProvider();

    if (provider === "ollama") {
        return generateWithOllama(prompt, schema);
    }

    if (provider === "gemini") {
        return generateWithGemini(prompt);
    }

    throw new Error(
        `Unsupported AI_PROVIDER "${provider}". Use "ollama" or "gemini".`
    );
};

export const isAiConfigured = () => {
    const provider = getProvider();

    if (provider === "ollama") {
        return isOllamaConfigured();
    }

    if (provider === "gemini") {
        return isGeminiConfigured();
    }

    return false;
};

export const generateLectureSummary = async ({
    courseTitle,
    moduleTitle,
    lectureTitle,
    lectureText,
    transcriptText,
}) => {
    const parsed = await generateJson(`You are helping learners in low-connectivity environments.

Course: ${courseTitle}
Module: ${moduleTitle}
Lecture: ${lectureTitle}

Lecture text:
${lectureText || "N/A"}

Transcript:
${transcriptText || "N/A"}

Return strict JSON with this shape only:
{
  "summary": "2-4 sentence concise summary",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4"]
}

Rules:
- Be accurate to the provided lecture context only.
- Keep language student-friendly.
- Keep keyPoints practical and short.
- Do not include markdown.
- Return valid JSON only.`, {
        type: "object",
        properties: {
            summary: { type: "string" },
            keyPoints: {
                type: "array",
                items: { type: "string" },
            },
        },
        required: ["summary", "keyPoints"],
        additionalProperties: false,
    });

    return {
        summary: typeof parsed.summary === "string" ? parsed.summary.trim() : "",
        keyPoints: Array.isArray(parsed.keyPoints)
            ? parsed.keyPoints
                  .map((item) => String(item || "").trim())
                  .filter(Boolean)
                  .slice(0, 6)
            : [],
    };
};

export const generateLectureAssistantReply = async ({
    courseTitle,
    moduleTitle,
    lectureTitle,
    lectureText,
    transcriptText,
    messages,
}) => {
    const conversation = messages
        .slice(-6)
        .map(
            (message) =>
                `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`
        )
        .join("\n");

    const parsed = await generateJson(`You are an educational assistant for a lecture.

Course: ${courseTitle}
Module: ${moduleTitle}
Lecture: ${lectureTitle}

Grounding context:
Lecture text:
${lectureText || "N/A"}

Transcript:
${transcriptText || "N/A"}

Conversation so far:
${conversation || "User: Generate practice MCQs from this lecture."}

Return strict JSON with this shape only:
{
  "reply": "Short helpful answer grounded in the lecture",
  "mcqs": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why it is correct"
    }
  ]
}

Rules:
- Keep replies grounded in the lecture context only.
- If the user asks for MCQs, generate 3 or 4 good ones.
- If the user asks a normal doubt, still include 1 or 2 MCQs when useful.
- Do not use markdown.
- Make options plausible and non-duplicative.
- Return valid JSON only.`, {
        type: "object",
        properties: {
            reply: { type: "string" },
            mcqs: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        question: { type: "string" },
                        options: {
                            type: "array",
                            items: { type: "string" },
                        },
                        correctAnswer: { type: "number" },
                        explanation: { type: "string" },
                    },
                    required: ["question", "options", "correctAnswer", "explanation"],
                    additionalProperties: false,
                },
            },
        },
        required: ["reply", "mcqs"],
        additionalProperties: false,
    });

    return {
        reply: typeof parsed.reply === "string" ? parsed.reply.trim() : "",
        mcqs: Array.isArray(parsed.mcqs)
            ? parsed.mcqs
                  .map((mcq) => ({
                      question: String(mcq?.question || "").trim(),
                      options: Array.isArray(mcq?.options)
                          ? mcq.options
                                .map((option) => String(option || "").trim())
                                .filter(Boolean)
                                .slice(0, 4)
                          : [],
                      correctAnswer:
                          typeof mcq?.correctAnswer === "number"
                              ? mcq.correctAnswer
                              : 0,
                      explanation: String(mcq?.explanation || "").trim(),
                  }))
                  .filter((mcq) => mcq.question && mcq.options.length >= 2)
                  .slice(0, 4)
            : [],
    };
};

export const generateLectureMcqSet = async ({
    courseTitle,
    moduleTitle,
    lectureTitle,
    lectureText,
    transcriptText,
}) => {
    const parsed = await generateJson(`You are an educational assessment assistant.

Course: ${courseTitle}
Module: ${moduleTitle}
Lecture: ${lectureTitle}

Grounding context:
Lecture text:
${lectureText || "N/A"}

Transcript:
${transcriptText || "N/A"}

Return strict JSON with this shape only:
{
  "mcqs": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why it is correct"
    }
  ]
}

Rules:
- Generate exactly 5 MCQs.
- Keep questions grounded in the context only.
- Each question must have exactly 4 options.
- correctAnswer must be 0, 1, 2 or 3.
- Keep explanations concise and clear.
- Do not include markdown.
- Return valid JSON only.`, {
        type: "object",
        properties: {
            mcqs: {
                type: "array",
                minItems: 5,
                maxItems: 5,
                items: {
                    type: "object",
                    properties: {
                        question: { type: "string" },
                        options: {
                            type: "array",
                            minItems: 4,
                            maxItems: 4,
                            items: { type: "string" },
                        },
                        correctAnswer: { type: "number" },
                        explanation: { type: "string" },
                    },
                    required: ["question", "options", "correctAnswer", "explanation"],
                    additionalProperties: false,
                },
            },
        },
        required: ["mcqs"],
        additionalProperties: false,
    });

    const normalized = Array.isArray(parsed.mcqs)
        ? parsed.mcqs
              .map((mcq) => ({
                  question: String(mcq?.question || "").trim(),
                  options: Array.isArray(mcq?.options)
                      ? mcq.options
                            .map((option) => String(option || "").trim())
                            .filter(Boolean)
                            .slice(0, 4)
                      : [],
                  correctAnswer:
                      typeof mcq?.correctAnswer === "number"
                          ? Math.max(0, Math.min(3, Math.trunc(mcq.correctAnswer)))
                          : 0,
                  explanation: String(mcq?.explanation || "").trim(),
              }))
              .filter((mcq) => mcq.question && mcq.options.length === 4)
              .slice(0, 5)
        : [];

    if (normalized.length < 5) {
        throw new Error("AI did not return 5 valid MCQs");
    }

    return normalized;
};
