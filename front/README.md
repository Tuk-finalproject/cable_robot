# front — 웹 프론트엔드

## 현재 구성

`public/`에는 배포 확인용 정적 소개 페이지만 있습니다. 지도 편집·승인·로봇 제어 기능은 아직 없습니다. `public/index.html`을 브라우저에서 열어 확인할 수 있습니다.

Azure 워크플로는 `front/public`을 빌드 없이 배포하므로 별도 패키지 설치가 필요하지 않습니다. 이 폴더에는 공개할 파일만 넣습니다.

## 예정 구성

React + TypeScript + Vite를 기반으로 react-konva 지도 레이어와 경로·경유점을 구현합니다. Zustand는 편집 상태를, TanStack Query는 API 요청을 관리하고 WebSocket으로 상태를 받습니다.

지도 확대·이동 후에도 화면 좌표를 지도 미터 좌표로 정확히 변환해야 합니다. 원본 경로와 보정 경로를 구분하고 승인 후에는 현장 API의 저장 완료 응답을 확인합니다.

## React 전환 시

1. 이 폴더에 Vite 앱과 잠금 파일을 추가하고 로컬 빌드가 성공하는지 확인합니다.
2. 소개용 `public/index.html`, `public/styles.css`를 제거하거나 앱으로 옮깁니다. Vite의 앱 진입점은 `front/index.html`입니다.
3. `public/staticwebapp.config.json`은 유지해 빌드 결과 루트에 복사되게 합니다.
4. 워크플로의 `app_location`을 `front`, `output_location`을 `dist`로 바꾸고 `skip_app_build`를 제거합니다. 검증 단계도 새 빌드 구조에 맞게 변경합니다.
5. SPA 경로를 도입할 때 navigationFallback을 추가하되 `/api/*`와 정적 자산은 제외합니다.
6. 같은 빌드 결과를 CM5에서도 제공해 오프라인 현장 접속을 지원합니다.

클라우드 API URL은 나중에 공개 설정으로 추가합니다. 브라우저 빌드에 들어가는 환경변수는 사용자에게 노출되므로 비밀키·DB 접속 정보·Azure 배포 토큰을 넣지 않습니다.
