import { PDFParse } from "pdf-parse";

const MAX_EXTRACTED_TEXT_LENGTH = 25000;

const normalizeExtractedText = (value) =>
    String(value || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, MAX_EXTRACTED_TEXT_LENGTH);

export const extractResourceText = async ({ buffer, mimeType }) => {
    if (!buffer || !mimeType) {
        return "";
    }

    if (mimeType === "application/pdf") {
        const parser = new PDFParse({ data: buffer });
        try {
            const parsed = await parser.getText();
            return normalizeExtractedText(parsed?.text || "");
        } finally {
            await parser.destroy().catch(() => null);
        }
    }

    if (mimeType === "text/plain") {
        return normalizeExtractedText(buffer.toString("utf8"));
    }

    return "";
};
