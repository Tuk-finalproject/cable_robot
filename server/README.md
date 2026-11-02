# server — 클라우드와 Azure 인프라

인터넷 연결 후 사용할 클라우드 API와 배포 설정의 개발 공간입니다. 현재 클라우드 API 실행 코드는 없습니다.

| 대상 | 구성 계획 | 현재 상태 |
| --- | --- | --- |
| 웹 | Azure Static Web Apps | Bicep와 GitHub Actions 준비, Azure 연결 대기 |
| 클라우드 API | FastAPI | 구현·호스팅 방식 결정 예정 |
| 이력 데이터 | PostgreSQL | 생성 예정 |
| 지도 백업 | 별도 파일/오브젝트 저장소 | 설계 예정 |

클라우드는 여러 작업 이력과 현장별 지도 백업을 담당합니다. 작업 중 인터넷 연결을 요구하지 않으며 현장 안전 판단은 로봇에 남깁니다.

일반 FastAPI와 지속 연결이 필요한 서버는 Azure App Service 또는 Container Apps 등 별도 호스팅을 검토합니다. SWA의 `api_location`에 FastAPI 폴더를 지정하는 것만으로 배포되지 않습니다. 현재 워크플로는 프론트만 배포합니다.

[Azure 설정 절차](AZURE_SETUP.md)를 통해 Free 정적 웹 리소스를 만들 수 있습니다. 유료 API·DB·스토리지 리소스는 이 템플릿에서 만들지 않습니다. 인증, 동기화 충돌 처리, CORS와 비밀 관리 방식은 실제 API 개발 시 정의합니다.
