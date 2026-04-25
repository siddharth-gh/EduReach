import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import whisper
import uvicorn
import shutil
import tempfile

app = FastAPI()

# Load the model once at startup
# Options: "tiny", "base", "small", "medium", "large"
MODEL_NAME = os.getenv("WHISPER_MODEL", "base")
print(f"Loading Whisper model: {MODEL_NAME}...")
model = whisper.load_model(MODEL_NAME)
print("Model loaded successfully!")

@app.post("/v1/audio/transcriptions")
async def transcribe(
    file: UploadFile = File(...),
    model_name: str = Form("whisper-1"),
    language: str = Form(None),
    prompt: str = Form(None),
    response_format: str = Form("json"),
    temperature: float = Form(0.0)
):
    # Create a temporary file to store the upload
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1] or ".tmp") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # Transcribe using the loaded model
        result = model.transcribe(
            tmp_path,
            language=language,
            initial_prompt=prompt,
            temperature=temperature
        )
        
        return {"text": result["text"]}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        # Clean up the temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
