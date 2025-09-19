from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from loguru import logger

from app.models.responses import AudioResponse
from app.services.voice_processor import VoiceProcessor
from app.core.security import get_current_user

router = APIRouter()


@router.post("/generate", response_model=AudioResponse)
async def generate_audio_guide(
    text: str,
    user_id: Optional[str] = Depends(get_current_user)
):
    """Generate audio guide from text"""
    try:
        voice_processor = VoiceProcessor()
        audio_summary = await voice_processor.generate_voice_summary(text)

        return AudioResponse(audio_summary=audio_summary)

    except Exception as e:
        logger.error(f"Error generating audio guide: {str(e)}")
        raise HTTPException(status_code=500, detail="Audio generation failed")
