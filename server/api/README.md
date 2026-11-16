# 저장된 지도 조회 API

서비스 서버의 PostgreSQL에 지도 메타데이터를 저장하고, Azure Blob Storage에 지도 이미지(PNG, JPG, WebP)를 저장합니다. VM에서는 Blobfuse2가 해당 컨테이너를 `BLOB_MOUNT_PATH`에 마운트합니다.

| 요청 | 동작 |
| --- | --- |
| `GET /health` | FastAPI 실행 상태 |
| `GET /api/maps` | PostgreSQL의 최근 지도 100개 조회 |
| `GET /api/maps/{id}/image` | DB의 `blob_name`에 해당하는 Blob 이미지 반환 |

`schema.sql`을 DB에 적용한 뒤, 지도 이미지를 Blob에 올리고 같은 `blob_name`으로 `maps` 행을 등록해야 목록에 나타납니다. 지금 Blob에는 `test.txt`만 있으므로 표시할 지도는 없습니다.

## VM 설정

```bash
cd server/api
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
export DATABASE_URL='postgresql://database:...@web-database.postgres.database.azure.com:5432/postgres?sslmode=require'
export BLOB_MOUNT_PATH='/home/azureuser/blobmount'
.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
```

비밀번호는 저장소에 올리지 말고 VM의 비밀 환경설정에 보관합니다. 현재 Azure Static Web Apps는 HTTPS이므로, 브라우저에서 이 API를 호출하려면 서비스 서버의 HTTPS 주소와 프론트엔드 빌드 변수 `VITE_API_BASE_URL`이 필요합니다. 실제 지도 접근 권한도 API를 공개하기 전에 정해야 합니다.
