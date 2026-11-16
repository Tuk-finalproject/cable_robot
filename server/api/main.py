"""CableWorm cloud API for listing saved maps and serving their Blob images."""

from __future__ import annotations

import os
from pathlib import Path
from uuid import UUID

import psycopg
from psycopg.rows import dict_row
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse


DATABASE_URL = os.getenv("DATABASE_URL", "")
BLOB_MOUNT_PATH = Path(os.getenv("BLOB_MOUNT_PATH", "/home/azureuser/blobmount")).resolve()
FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "https://wonderful-river-0e89b8100.5.azurestaticapps.net,http://localhost:5173",
    ).split(",")
    if origin.strip()
]

app = FastAPI(title="CableWorm 지도 API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def get_map_record(map_id: UUID):
    if not DATABASE_URL:
        raise HTTPException(status_code=503, detail="지도 데이터베이스 연결이 설정되지 않았습니다.")
    try:
        with psycopg.connect(DATABASE_URL, row_factory=dict_row, connect_timeout=5) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """SELECT id, name, version, blob_name, created_at, width, height
                       FROM maps WHERE id = %s""",
                    (map_id,),
                )
                return cursor.fetchone()
    except psycopg.Error as exc:
        raise HTTPException(status_code=503, detail="지도 데이터베이스에 연결할 수 없습니다.") from exc


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/maps")
def list_maps():
    if not DATABASE_URL:
        raise HTTPException(status_code=503, detail="지도 데이터베이스 연결이 설정되지 않았습니다.")
    try:
        with psycopg.connect(DATABASE_URL, row_factory=dict_row, connect_timeout=5) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """SELECT id, name, version, created_at, width, height
                       FROM maps ORDER BY created_at DESC LIMIT 100"""
                )
                rows = cursor.fetchall()
    except psycopg.Error as exc:
        raise HTTPException(status_code=503, detail="지도 데이터베이스에 연결할 수 없습니다.") from exc

    return [
        {
            "id": str(row["id"]),
            "name": row["name"],
            "version": row["version"],
            "created_at": row["created_at"].isoformat(),
            "width": row["width"],
            "height": row["height"],
            "image_url": f'/api/maps/{row["id"]}/image',
        }
        for row in rows
    ]


@app.get("/api/maps/{map_id}/image")
def map_image(map_id: UUID):
    record = get_map_record(map_id)
    if record is None:
        raise HTTPException(status_code=404, detail="지도를 찾을 수 없습니다.")
    relative_name = Path(record["blob_name"])
    image_path = (BLOB_MOUNT_PATH / relative_name).resolve()
    if not image_path.is_relative_to(BLOB_MOUNT_PATH):
        raise HTTPException(status_code=404, detail="지도 파일 경로가 올바르지 않습니다.")
    media_types = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}
    media_type = media_types.get(image_path.suffix.lower())
    if not media_type:
        raise HTTPException(status_code=415, detail="지원하지 않는 지도 이미지 형식입니다.")
    if not image_path.is_file():
        raise HTTPException(status_code=404, detail="Blob Storage에서 지도 파일을 찾을 수 없습니다.")
    return FileResponse(image_path, media_type=media_type)
