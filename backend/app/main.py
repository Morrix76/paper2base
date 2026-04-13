from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth as auth_v1
from app.api.v1 import extract as extract_v1
from app.core.config import get_settings
from app.db.database import init_db

import logging

logging.basicConfig(level=logging.DEBUG)
logging.getLogger(__name__).debug("Booting Paper2Base backend from %s (cwd=%s)", __file__, __import__("os").getcwd())

try:
    from app.api.v1 import auth as auth_v1_test

    print("AUTH IMPORT OK:", auth_v1_test.router.routes)
except Exception as e:
    print("AUTH IMPORT ERROR:", e)
    import traceback

    traceback.print_exc()

settings = get_settings()

app = FastAPI(
    title=settings["api_title"],
    version=settings["api_version"],
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings["cors_origins"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(extract_v1.router, prefix="/api/v1")
app.include_router(auth_v1.router, prefix="/api/v1")

@app.post("/api/v1/test-post")
async def test_post() -> dict:
    return {"ok": True}

@app.on_event("startup")
def _startup() -> None:
    init_db()
    try:
        route_paths = sorted({getattr(r, "path", "") for r in app.router.routes})
        logging.getLogger(__name__).debug("Registered routes: %s", route_paths)
    except Exception:
        logging.getLogger(__name__).exception("Failed to log registered routes")


@app.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok"}


@app.get("/debug/routes", tags=["debug"])
async def debug_routes() -> dict:
    routes = []
    for r in app.router.routes:
        path = getattr(r, "path", None)
        methods = getattr(r, "methods", None)
        if path:
            routes.append(
                {
                    "path": path,
                    "methods": sorted(list(methods)) if methods else [],
                    "name": getattr(r, "name", None),
                }
            )
    routes.sort(key=lambda x: x["path"])
    return {"count": len(routes), "routes": routes}


@app.get("/api/v1/debug/routes", tags=["debug"])
async def debug_routes_v1() -> dict:
    return await debug_routes()
