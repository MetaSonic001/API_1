"""
api/multimodal.py - Multimodal Input API Endpoints
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Optional
from models.travel_request import VoiceInput, MoodboardInput, MultimodalInput, InputType
from services.multimodal_service import MultimodalService
from utils.logger import get_logger
import base64

logger = get_logger(__name__)
router = APIRouter()

multimodal_service = MultimodalService()

@router.post("/analyze-moodboard")
async def analyze_moodboard(
    images: List[UploadFile] = File(...),
    description: Optional[str] = Form(None)
) -> JSONResponse:
    """Analyze moodboard images for travel preferences"""
    try:
        # Convert uploaded files to base64
        image_data = []
        for image in images:
            content = await image.read()
            base64_data = base64.b64encode(content).decode('utf-8')
            image_data.append(base64_data)
        
        # Analyze images
        analysis = await multimodal_service.analyze_images(image_data)
        
        return JSONResponse(content={
            "analysis": analysis,
            "suggested_destinations": [],  # Could be enhanced with destination suggestions
            "confidence_score": 0.8
        })
        
    except Exception as e:
        logger.error(f"Error analyzing moodboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transcribe-voice")
async def transcribe_voice(
    audio: UploadFile = File(...),
    language: str = Form("en")
) -> JSONResponse:
    """Transcribe voice input to travel preferences"""
    try:
        # Read and encode audio
        audio_content = await audio.read()
        base64_audio = base64.b64encode(audio_content).decode('utf-8')
        
        # Transcribe audio
        transcription = await multimodal_service.transcribe_voice(base64_audio)
        
        # Extract travel intent from transcription
        # This would typically involve NLP processing
        travel_intent = {
            "transcription": transcription,
            "extracted_preferences": {
                "destination": None,
                "activities": [],
                "duration": None,
                "budget": None
            }
        }
        
        return JSONResponse(content=travel_intent)
        
    except Exception as e:
        logger.error(f"Error transcribing voice: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-multimodal")
async def process_multimodal_inputs(
    text_input: Optional[str] = Form(None),
    images: Optional[List[UploadFile]] = File(None),
    audio: Optional[UploadFile] = File(None)
) -> JSONResponse:
    """Process multiple input types simultaneously"""
    try:
        results = {
            "text_analysis": None,
            "image_analysis": None,
            "voice_analysis": None,
            "combined_preferences": {}
        }
        
        # Process text input
        if text_input:
            results["text_analysis"] = {"content": text_input}
        
        # Process images
        if images:
            image_data = []
            for image in images:
                content = await image.read()
                base64_data = base64.b64encode(content).decode('utf-8')
                image_data.append(base64_data)
            results["image_analysis"] = await multimodal_service.analyze_images(image_data)
        
        # Process voice
        if audio:
            audio_content = await audio.read()
            base64_audio = base64.b64encode(audio_content).decode('utf-8')
            results["voice_analysis"] = await multimodal_service.transcribe_voice(base64_audio)
        
        # Combine all insights
        results["combined_preferences"] = _combine_multimodal_insights(results)
        
        return JSONResponse(content=results)
        
    except Exception as e:
        logger.error(f"Error processing multimodal inputs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def _combine_multimodal_insights(results: dict) -> dict:
    """Combine insights from multiple input modalities"""
    combined = {
        "vibes": [],
        "activities": [],
        "destinations": [],
        "confidence": 0.7
    }
    
    # Extract from image analysis
    if results.get("image_analysis"):
        img_analysis = results["image_analysis"]
        combined["vibes"].extend(img_analysis.get("vibes", []))
        combined["activities"].extend(img_analysis.get("activities", []))
    
    # Extract from voice analysis
    if results.get("voice_analysis"):
        # Would extract structured data from transcription
        pass
    
    # Remove duplicates
    combined["vibes"] = list(set(combined["vibes"]))
    combined["activities"] = list(set(combined["activities"]))
    
    return combined