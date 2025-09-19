from fastapi import APIRouter, Body
from models.schemas import AudioTourRequest
from agents.history import history_agent
from agents.architecture import architecture_agent
from agents.culture import culture_agent
from agents.culinary import culinary_agent
from agents.orchestrator import orchestrate
import asyncio
import io
import base64
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
from scipy.io.wavfile import write as write_wav
from config import HF_TOKEN

router = APIRouter()

# Load TTS model once
processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts")
vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan")

@router.post("/generate")
async def generate_audio(request: AudioTourRequest = Body(...)):
    specialists = await asyncio.gather(
        *(agent.run(request.location + " for audio tour") for agent in [history_agent, architecture_agent, culture_agent, culinary_agent] if agent.name.lower() in [i.lower() for i in request.interests])
    )
    final_text = orchestrate({"specialists": [s for s in specialists if s], "duration": request.duration})
    tour_text = final_text['audio']  # Extract text

    # Generate audio with SpeechT5
    inputs = processor(text=tour_text, return_tensors="pt")
    speech = model.generate_speech(inputs["input_ids"], speaker_embeddings=inputs["speaker_embeddings"], vocoder=vocoder)
    # Save to bytes
    buffer = io.BytesIO()
    write_wav(buffer, 16000, speech.numpy())  # 16kHz sample rate
    audio_base64 = base64.b64encode(buffer.getvalue()).decode()

    return {"tour_text": tour_text, "audio_base64": audio_base64}  # Frontend: <audio src="data:audio/wav;base64,{audio_base64}"></audio>