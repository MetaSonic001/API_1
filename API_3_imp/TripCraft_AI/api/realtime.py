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

    async def connect(self, websocket: WebSocket, trip_id: str):
        await websocket.accept()
        self.active_connections[trip_id] = websocket

    def disconnect(self, trip_id: str):
        if trip_id in self.active_connections:
            del self.active_connections[trip_id]

    async def send_update(self, trip_id: str, update: dict):
        if trip_id in self.active_connections:
            try:
                await self.active_connections[trip_id].send_text(json.dumps(update))
            except:
                self.disconnect(trip_id)

manager = ConnectionManager()

@router.websocket("/ws/{trip_id}")
async def websocket_endpoint(websocket: WebSocket, trip_id: str):
    """WebSocket endpoint for real-time trip updates"""
    await manager.connect(websocket, trip_id)
    try:
        while True:
            # Listen for client messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "get_updates":
                updates = await realtime_service.get_updates(trip_id)
                await websocket.send_text(json.dumps({
                    "type": "updates",
                    "data": [update.dict() for update in updates]
                }))
            
            elif message.get("type") == "trigger_replan":
                result = await realtime_service.trigger_replanning(
                    trip_id, message.get("event_details", {})
                )
                await websocket.send_text(json.dumps({
                    "type": "replan_result",
                    "data": result
                }))
            
    except WebSocketDisconnect:
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