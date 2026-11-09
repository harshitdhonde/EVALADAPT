from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router
from backend.service import ensure_data


@asynccontextmanager
async def lifespan(app):
    ensure_data()  # creates DB, generates data if missing, runs pipeline on first start
    yield


app = FastAPI(title="EVALADAPT API", lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(router)