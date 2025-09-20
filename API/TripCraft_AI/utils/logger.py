"""
utils/logger.py - Logging Configuration
"""
import sys
from loguru import logger
from config.settings import get_settings

def setup_logger():
    """Setup application logging"""
    settings = get_settings()
    
    # Remove default handler
    logger.remove()
    
    # Add console handler
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="DEBUG" if settings.DEBUG else "INFO",
        colorize=True
    )
    
    # Add file handler for production
    if not settings.DEBUG:
        logger.add(
            "logs/tripcraft.log",
            rotation="1 day",
            retention="30 days",
            level="INFO",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}"
        )
    
    return logger

def get_logger(name: str):
    """Get logger instance"""
    return logger.bind(name=name)
