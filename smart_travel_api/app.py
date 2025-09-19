from fastapi import FastAPI
from routers.plan import router as plan_router
from routers.audio_tour import router as audio_router
from routers.replan import router as replan_router
from routers.inputs import router as inputs_router
from routers.utils import router as utils_router

app = FastAPI(title="Smart Travel API")

app.include_router(plan_router, prefix="/plan")
app.include_router(audio_router, prefix="/audio")
app.include_router(replan_router, prefix="/replan")
app.include_router(inputs_router, prefix="/inputs")
app.include_router(utils_router, prefix="/utils")

@app.get("/")
async def root():
    return {"message": "Welcome to Smart Travel API"}