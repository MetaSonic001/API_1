"""
api/realtime.py - Real-time Updates API Endpoints
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Any
from services.realtime_service import RealtimeService
from models.travel_response import ReplanningRequest, RealtimeUpdate
from utils.logger import get_logger
import json
import asyncio

logger = get_logger(__name__)
router = APIRouter()

realtime_service = RealtimeService()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_count = 0
        self.max_connections_per_trip = 1  # Limit connections per trip

    async def connect(self, websocket: WebSocket, trip_id: str):
        # Check if there's already a connection for this trip
        if trip_id in self.active_connections:
            logger.warning(f"Connection already exists for trip {trip_id}, closing old connection")
            try:
                await self.active_connections[trip_id].close()
            except:
                pass
            
        await websocket.accept()
        self.active_connections[trip_id] = websocket
        self.connection_count += 1
        logger.info(f"WebSocket connected for trip {trip_id}. Total connections: {self.connection_count}")

    def disconnect(self, trip_id: str):
        if trip_id in self.active_connections:
            del self.active_connections[trip_id]
            self.connection_count = max(0, self.connection_count - 1)
            logger.info(f"WebSocket disconnected for trip {trip_id}. Total connections: {self.connection_count}")

    async def send_update(self, trip_id: str, update: dict):
        if trip_id in self.active_connections:
            try:
                await self.active_connections[trip_id].send_text(json.dumps(update))
            except Exception as e:
                logger.warning(f"Failed to send update to {trip_id}: {e}")
                self.disconnect(trip_id)

    def get_connection_stats(self):
        return {
            "total_connections": self.connection_count,
            "active_trips": list(self.active_connections.keys())
        }

manager = ConnectionManager()

@router.websocket("/ws/{trip_id}")
async def websocket_endpoint(websocket: WebSocket, trip_id: str):
    """WebSocket endpoint for real-time trip updates"""
    logger.info(f"WebSocket connection attempt for trip: {trip_id}")
    
    # Check connection limit
    if len(manager.active_connections) >= 50:  # Global limit
        await websocket.close(code=1008, reason="Too many connections")
        logger.warning(f"WebSocket connection rejected for {trip_id}: too many connections")
        return
    
    await manager.connect(websocket, trip_id)
    
    try:
        # Send initial connection confirmation
        await websocket.send_text(json.dumps({
            "type": "connected",
            "trip_id": trip_id,
            "message": "WebSocket connection established"
        }))
        
        # Send any existing updates
        try:
            updates = await realtime_service.get_updates(trip_id)
            if updates:
                await websocket.send_text(json.dumps({
                    "type": "initial_updates",
                    "data": [update.dict() for update in updates]
                }))
        except Exception as e:
            logger.warning(f"Failed to send initial updates for {trip_id}: {e}")
        
        # Keep connection alive and handle messages
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                
            elif message.get("type") == "get_updates":
                try:
                    updates = await realtime_service.get_updates(trip_id)
                    await websocket.send_text(json.dumps({
                        "type": "updates",
                        "data": [update.dict() for update in updates]
                    }))
                except Exception as e:
                    logger.error(f"Error getting updates for {trip_id}: {e}")
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Failed to get updates"
                    }))
            
            elif message.get("type") == "trigger_replan":
                try:
                    result = await realtime_service.trigger_replanning(
                        trip_id, message.get("event_details", {})
                    )
                    await websocket.send_text(json.dumps({
                        "type": "replan_result",
                        "data": result
                    }))
                except Exception as e:
                    logger.error(f"Error triggering replan for {trip_id}: {e}")
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Failed to trigger replan"
                    }))
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for trip: {trip_id}")
        manager.disconnect(trip_id)
    except Exception as e:
        logger.error(f"WebSocket error for trip {trip_id}: {e}")
        manager.disconnect(trip_id)

@router.post("/events/{trip_id}")
async def handle_external_event(trip_id: str, event: Dict[str, Any]) -> JSONResponse:
    """Handle external events (weather, closures, etc.)"""
    try:
        # Process the event
        update = RealtimeUpdate(
            trip_id=trip_id,
            update_type=event.get("type", "general"),
            message=event.get("message", "External event occurred"),
            severity=event.get("severity", "info")
        )
        
        # Send to connected clients
        await manager.send_update(trip_id, update.dict())
        
        return JSONResponse(content={"status": "event_processed"})
        
    except Exception as e:
        logger.error(f"Error handling external event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health/{trip_id}")
async def get_trip_health(trip_id: str) -> JSONResponse:
    """Get health status of trip monitoring"""
    try:
        if trip_id in realtime_service.monitored_trips:
            trip_data = realtime_service.monitored_trips[trip_id]
            return JSONResponse(content={
                "trip_id": trip_id,
                "status": "monitored",
                "last_update": trip_data["last_update"].isoformat(),
                "websocket_connected": trip_id in manager.active_connections
            })
        else:
            return JSONResponse(content={
                "trip_id": trip_id,
                "status": "not_monitored"
            })
    except Exception as e:
        logger.error(f"Error getting trip health: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_connection_stats() -> JSONResponse:
    """Get WebSocket connection statistics"""
    stats = manager.get_connection_stats()
    return JSONResponse(content=stats)