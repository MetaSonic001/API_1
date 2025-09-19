from fastapi import FastAPI
from app.api.routes import travel, audio, moodboard, realtime, safety
from smart_travel_api.services.event_bus import start_event_bus

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    event_bus = start_event_bus()  # safe, loop exists now
    print("Event bus initialized:", event_bus)
    # You can store event_bus in app.state if needed
    app.state.event_bus = event_bus
    
    

# include routers
app.include_router(travel.router, prefix="/travel", tags=["Travel"])
app.include_router(audio.router, prefix="/audio", tags=["Audio"])
app.include_router(moodboard.router, prefix="/moodboard", tags=["Moodboard"])
app.include_router(realtime.router, prefix="/realtime", tags=["Realtime"])
app.include_router(safety.router, prefix="/safety", tags=["Safety"])



# When you run python run.py, this line inside it:

# uvicorn.run("app.main:app", host=host, port=port, reload=reload)


# tells Uvicorn to load your FastAPI app from app/main.py.
# This is where all the route files (travel.py, audio.py, etc.) are imported and mounted.

# Because Python executes imports recursively, loading main.py will also:

# Import all routers in app/api/routes/

# Import any services, agents, models, utils, etc. that those routes depend on.

# So essentially, all your modules in app/ get loaded automatically as soon as FastAPI starts.

# The only requirement is that your main.py has all the necessary imports and app.include_router(...) calls.