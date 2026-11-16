# CableWorm 웹앱

React + TypeScript + Vite로 만든 CableWorm 현장 작업 화면입니다. 안드로이드와 아이폰의 모바일 브라우저에 맞춘 반응형 화면을 제공합니다.

## 현재 화면

- 대시보드: 저장된 지도 목록과 선택한 지도 이미지 표시

저장된 지도 목록은 `VITE_API_BASE_URL`을 설정하면 서비스 서버의 `/api/maps`에서 읽고, 선택한 지도 이미지는 Blob Storage를 사용하는 `/api/maps/{id}/image`에서 가져옵니다. 서버 주소가 없거나 HTTPS 웹에서 HTTP 서버를 가리키면 연결 대기 상태로 표시합니다. 이 버전은 API의 HTTP/HTTPS 설정을 변경하지 않습니다.

## 로컬 실행

```bash
cd front
npm ci
npm run dev
```

빌드는 `npm run build`로 확인합니다. 결과물은 `front/dist`에 생성되며 GitHub Actions가 Azure Static Web Apps로 배포합니다.

## 다음 연결

1. 서비스 서버의 데이터베이스와 Blob Storage에 지도를 등록하고 API를 HTTPS로 제공합니다.
2. 프론트엔드에 `VITE_API_BASE_URL`을 설정해 지도 목록과 이미지를 연결합니다.
3. 지도 좌표와 로봇 좌표를 맞추고 경로 보정 결과를 별도로 표시합니다.
4. 승인 요청 후 로봇의 저장 완료 응답을 받은 경로만 설치에 사용합니다.
5. 현장 접속을 위해 동일한 웹 빌드를 CM5에서도 제공합니다.

브라우저에 포함되는 환경변수에는 비밀키·DB 접속 정보·Azure 배포 토큰을 넣지 않습니다.
