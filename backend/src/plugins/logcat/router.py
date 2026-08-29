from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from plugins.logcat.service import LogcatService

router = APIRouter(prefix="/logcat", tags=["logcat"])
logcat_service = LogcatService()

@router.get("")
async def stream_logcat(device: str = Query(..., description="Device serial number to stream logcat from")):
    return StreamingResponse(
        logcat_service.stream_logcat(device),
        media_type="text/plain"
    )
