"""
TripCraft AI - Main FastAPI Application
======================================
"""
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from api.travel import router as travel_router
from api.multimodal import router as multimodal_router  
from api.realtime import router as realtime_router
from config.settings import get_settings
from utils.logger import setup_logger

# Setup logger
logger = setup_logger()

import sys
import asyncio

# Fix for Playwright / subprocess issues on Windows asyncio
if sys.platform.startswith("win"):
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    except Exception:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""
    logger.info("Starting TripCraft AI Application...")
    
    # Initialize services on startup with error handling
    try:
        # Try to initialize core services but don't fail if they're not available
        try:
            from tools.vector_store import VectorStore
            vector_store = VectorStore()
            await vector_store.initialize()
            logger.info("Vector store initialized successfully")
        except Exception as e:
            logger.warning(f"Vector store initialization failed (non-critical): {e}")
        
        try:
            from services.travel_service import TravelPlanningService
            travel_service = TravelPlanningService()
            logger.info("Travel service initialized successfully")
        except Exception as e:
            logger.warning(f"Travel service initialization failed (non-critical): {e}")
        
        logger.info("Application startup completed (some services may be in fallback mode)")
        
        yield
        
    except Exception as e:
        logger.error(f"Critical error during startup: {e}")
        # Don't raise - allow app to start in degraded mode
        yield
    finally:
        logger.info("Shutting down TripCraft AI Application...")

# Create FastAPI app
app = FastAPI(
    title="TripCraft AI",
    description="Comprehensive AI-powered travel planning system with multimodal inputs and immersive experiences",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(travel_router, prefix="/api/v1/travel", tags=["Travel Planning"])
app.include_router(multimodal_router, prefix="/api/v1/multimodal", tags=["Multimodal Input"])
app.include_router(realtime_router, prefix="/api/v1/realtime", tags=["Real-time Updates"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to TripCraft AI",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        settings = get_settings()
        return {
            "status": "healthy",
            "environment": settings.ENVIRONMENT,
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Service unhealthy")

if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "main:app" if settings.DEBUG else app,
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
