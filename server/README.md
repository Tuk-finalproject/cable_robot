# server — 클라우드와 Azure 인프라

인터넷 연결 후 사용할 클라우드 API와 배포 설정의 개발 공간입니다. `api/`에는 저장된 지도를 PostgreSQL에서 조회하고 Blob Storage의 지도 이미지를 전달하는 FastAPI 코드가 있습니다.

| 대상 | 구성 계획 | 현재 상태 |
| --- | --- | --- |
| 웹 | Azure Static Web Apps | GitHub Actions 배포 연결, React 모바일 화면 작성 |
| 클라우드 API | FastAPI | 지도 목록·이미지 조회 엔드포인트 작성, VM 설정·배포 대기 |
| 이력 데이터 | PostgreSQL | Azure 서버 생성, 지도 테이블 설정 대기 |
| 지도 백업 | Azure Blob Storage | 계정·마운트 구성, 실제 지도 파일 저장 대기 |

클라우드는 여러 작업 이력과 현장별 지도 백업을 담당합니다. 작업 중 인터넷 연결을 요구하지 않으며 현장 안전 판단은 로봇에 남깁니다.

일반 FastAPI와 지속 연결이 필요한 서버는 Azure App Service 또는 Container Apps 등 별도 호스팅을 검토합니다. SWA의 `api_location`에 FastAPI 폴더를 지정하는 것만으로 배포되지 않습니다. 현재 워크플로는 프론트만 배포합니다.

[Azure 설정 절차](AZURE_SETUP.md)를 통해 Free 정적 웹 리소스를 만들 수 있습니다. 유료 API·DB·스토리지 리소스는 이 템플릿에서 만들지 않습니다. 인증, 동기화 충돌 처리, CORS와 비밀 관리 방식은 실제 API 개발 시 정의합니다.
