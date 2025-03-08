# Agent Fleet

Agent Fleet은 AI 에이전트를 관리하고 모니터링하기 위한 웹 애플리케이션입니다.

## 프로젝트 구조

이 프로젝트는 모노레포로 구성되어 있으며, 다음과 같은 구조를 가지고 있습니다:

- `client/`: React + TypeScript 기반의 프론트엔드 애플리케이션
- `server/`: 백엔드 서버
- `types/`: 클라이언트와 서버가 공유하는 타입 정의

## 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 9.0.0 이상

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

이 명령어는 다음 작업을 수행합니다:

- 타입 정의 빌드
- 프론트엔드 개발 서버 실행 (HMR 지원)
- 백엔드 서버 실행

### 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
npm start
```

## 개발 스크립트

- `npm run dev`: 개발 모드로 전체 애플리케이션 실행
- `npm run build`: 프로덕션용 빌드
- `npm run lint`: 코드 린팅
- `npm run lint:fix`: 코드 린팅 및 자동 수정

## 환경 설정

프로젝트 루트에 `.env` 파일을 생성하고 필요한 환경 변수를 설정하세요:

```env
PORT=3000
# 기타 필요한 환경 변수
```

## 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다
