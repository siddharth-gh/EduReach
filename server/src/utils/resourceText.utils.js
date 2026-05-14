import { PDFParse } from "pdf-parse";
import { parseOffice } from "officeparser";
import mammoth from "mammoth";

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

    try {
        // PDF Handling
        if (mimeType === "application/pdf") {
            try {
                const parser = new PDFParse({ data: buffer });
                const result = await parser.getText();
                return normalizeExtractedText(result?.text || "");
            } catch (err) {
                console.error("[Extraction] PDFParse failed:", err.message);
                return "";
            }
        }

        // Word Handling (DOCX) - Mammoth is preferred for better structure
        if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            try {
                const result = await mammoth.extractRawText({ buffer });
                return normalizeExtractedText(result.value || "");
            } catch (err) {
                console.warn("[Extraction] Mammoth failed, falling back to officeparser:", err.message);
                // fallback to officeparser
            }
        }

        // PowerPoint / Generic Office Handling (PPTX, XLSX, etc.)
        const isOfficeType = 
            mimeType.includes("officedocument") || 
            mimeType.includes("powerpoint") || 
            mimeType.includes("presentation") ||
            mimeType.includes("word") ||
            mimeType.includes("msword");

        if (isOfficeType) {
            try {
                console.log(`[Extraction] Processing Office file (MimeType: ${mimeType}, Size: ${buffer.length} bytes)`);
                
                // Set a safety timeout for the parser
                const extractionPromise = parseOffice(buffer);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Extraction timed out after 30 seconds")), 30000)
                );

                const ast = await Promise.race([extractionPromise, timeoutPromise]);
                
                if (!ast) {
                    console.warn("[Extraction] OfficeParser returned null/undefined result");
                    return "";
                }

                // officeParser 6.1.0 returns a structured AST; call toText() for plain text
                const text = typeof ast.toText === 'function' ? ast.toText() : String(ast || "");
                console.log(`[Extraction] OfficeParser success. Extracted ${text.length} characters.`);
                return normalizeExtractedText(text);
            } catch (err) {
                console.error("[Extraction] OfficeParser failed or timed out:", err.message);
                return "";
            }
        }

        // Plain Text
        if (mimeType === "text/plain") {
            return normalizeExtractedText(buffer.toString("utf8"));
        }

        return "";
    } catch (error) {
        console.error("[Extraction Error]", error.message);
        return "";
    }
};
