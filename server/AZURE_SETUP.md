# Azure Static Web Apps 연결

## 준비된 항목 / 남은 항목

- 준비 완료: 정적 웹 파일, SWA 설정, main push·수동 배포 워크플로, Free 리소스 Bicep
- 연결 필요: Azure 구독 로그인, Static Web App 생성, GitHub 배포 토큰 등록
- 아직 없음: 클라우드 API, PostgreSQL, 지도 백업 저장소, 실제 서비스 URL

현재 저장소 구성만으로 Azure 리소스가 생기거나 배포가 완료되지는 않습니다.

## 1. Azure 리소스 만들기

Azure Portal에서 **Static Web App**을 만듭니다. 리소스 이름 예시는 `cableworm-web`, 플랜은 `Free`입니다. 구독에서 지원하는 리전을 선택합니다. 기존 워크플로를 쓰려면 배포 소스는 **Other/기타**로 선택하고, 배포 인증 정책은 **Deployment token**으로 선택합니다. GitHub 연결 자동 생성을 함께 쓰면 중복 워크플로가 생길 수 있으므로 기존 워크플로 하나로 통일합니다.

또는 Azure CLI가 설치된 터미널이나 Azure Cloud Shell에서 저장소를 받은 후 다음을 실행합니다. 구독과 리전은 자신의 환경으로 확인합니다. 예시 리소스 그룹 위치와 SWA 위치는 서로 다를 수 있습니다.

```powershell
az login
az account show --output table
# 구독이 여러 개면 선택
az account set --subscription "<구독 ID>"
az group create --name rg-cableworm --location koreacentral
az deployment group create --resource-group rg-cableworm --template-file server/infra/static-web-app.bicep --parameters staticSiteName=cableworm-web location=westus2
```

템플릿은 Free Static Web App만 만듭니다. 이 환경에서는 Azure CLI·구독 세션이 없어 실행하지 않았으며 Azure 측 생성 검증은 연결 후 진행해야 합니다.

## 2. GitHub Secret 등록

1. Azure Static Web App의 **Overview → Manage deployment token**에서 토큰을 복사합니다. 배포 인증 정책은 Deployment token이어야 합니다.
2. [저장소 Actions Secrets](https://github.com/Tuk-finalproject/cable_robot/settings/secrets/actions)에서 **New repository secret**을 선택합니다.
3. 이름을 정확히 `AZURE_STATIC_WEB_APPS_API_TOKEN`으로 입력하고 값에 토큰을 저장합니다.

토큰은 채팅이나 커밋에 넣지 말고 GitHub Secret 입력란에만 저장합니다. 토큰 재발급 시 이 Secret도 갱신합니다.

## 3. 첫 배포

[Actions](https://github.com/Tuk-finalproject/cable_robot/actions)에서 **Azure Static Web Apps → Run workflow → main**을 선택합니다.

- 토큰이 없으면 정적 파일 검증 후 요약에 **Deployment pending**을 표시하고 배포를 건너뜁니다. 녹색 검증 결과만으로 배포 완료를 의미하지 않습니다.
- 토큰이 있으면 Azure 배포 단계를 실행합니다. Azure Portal Overview의 URL을 열어 CableWorm 페이지를 확인합니다.
- 이후 `front/**` 또는 해당 워크플로를 수정해 `main`에 push하면 자동 배포합니다.
- 현재 PR 미리보기 배포는 구성하지 않았습니다. 수동 실행은 main에서만 배포합니다.

## 배포 경로

| 항목 | 현재 값 |
| --- | --- |
| app_location | `front/public` |
| api_location | 빈 값 — API 미배포 |
| output_location | 빈 값 — 빌드 없음 |
| skip_app_build | `true` |
| production_branch | `main` |

React/Vite 앱을 추가하면 [프론트 전환 안내](../front/README.md)에 따라 경로를 수정합니다. 정적 페이지가 공개되어도 로봇 연결·승인·설치 기능이 동작하는 것은 아닙니다.

## 배포 오류 확인

- 배포 단계가 없음: Secret 등록 여부와 Actions 요약 확인 후 main 수동 실행
- 토큰 오류: 해당 SWA의 토큰인지, 배포 인증 정책이 Deployment token인지 확인
- 첫 페이지 404: `app_location` 폴더의 `index.html` 확인
- Actions 실행 차단: 조직·저장소 정책에서 GitHub Actions와 사용하는 액션 허용 여부 확인
- 리소스 생성 실패: 구독 상태, Microsoft.Web 등록 및 SWA 지원 리전 확인
- 화면은 열리지만 API 없음: 현재 API는 미구현. back은 CM5용, server 클라우드 API는 별도 서비스

## 공식 문서

- [빌드와 GitHub Actions 설정](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration)
- [배포 토큰 관리](https://learn.microsoft.com/en-us/azure/static-web-apps/deployment-token-management)
- [SWA 설정 파일](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)
- [Bicep staticSites 리소스](https://learn.microsoft.com/en-us/azure/templates/microsoft.web/staticsites)
