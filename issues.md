# Agent Fleet 개발 이슈 목록

## 완료된 작업 ✅

### 파이프라인 실행 엔진

- [x] `PipelineExecutionService` 구현
  - [x] 노드 실행 결과 저장 및 관리
  - [x] 에러 처리 및 실행 기록 저장
  - [x] 스트리밍 응답 구현
- [x] `MockNodeExecutor` 구현
  - [x] 다양한 노드 타입 지원 (input, process, plan, action, decision, aggregator, analysis)
  - [x] 실행 결과 메타데이터 포함

### API 엔드포인트

- [x] 파이프라인 CRUD API 구현
  - [x] 목록 조회 (GET /api/reasoning-pipelines)
  - [x] 개별 조회 (GET /api/reasoning-pipelines/:id)
  - [x] 생성 (POST /api/reasoning-pipelines)
  - [x] 수정 (PUT /api/reasoning-pipelines/:id)
  - [x] 삭제 (DELETE /api/reasoning-pipelines/:id)
- [x] 파이프라인 실행 API 구현
  - [x] 실행 (POST /api/reasoning-pipelines/:id/execute)
  - [x] 테스트 실행 (GET /api/reasoning-pipelines/test/stream)
- [x] 파이프라인 구성 관리 API
  - [x] 노드 업데이트 (PUT /api/reasoning-pipelines/:id/nodes)
  - [x] 엣지 업데이트 (PUT /api/reasoning-pipelines/:id/edges)

### 테스트

- [x] 파이프라인 실행 서비스 테스트
- [x] API 엔드포인트 테스트
- [x] Mock 구현체 테스트

## 진행해야 할 작업 🚀

### 실제 구현체 개발

- [ ] 실제 LLM 프로바이더 구현
  - [ ] OpenAI 프로바이더
  - [ ] Anthropic 프로바이더
- [ ] 실제 노드 실행기 구현
  - [ ] 각 노드 타입별 구체적인 실행 로직 구현
  - [ ] 노드 간 데이터 흐름 관리

### 데이터 영속성

- [ ] 실제 데이터베이스 연동
  - [ ] Repository 구현체 개발
  - [ ] 데이터 마이그레이션 계획

### 보안

- [ ] 인증/인가 구현
  - [ ] API 엔드포인트 보안
  - [ ] 사용자/에이전트 권한 관리
- [ ] API 키 관리
  - [ ] LLM 프로바이더 API 키 안전한 저장 및 관리

### 모니터링 및 로깅

- [ ] 실행 로그 관리
  - [ ] 상세 로그 저장
  - [ ] 로그 조회 API
- [ ] 성능 모니터링
  - [ ] 실행 시간 측정
  - [ ] 리소스 사용량 모니터링

### UI/UX

- [ ] 파이프라인 에디터
  - [ ] 노드 드래그 앤 드롭
  - [ ] 엣지 연결 관리
- [ ] 실행 모니터링 대시보드
  - [ ] 실시간 실행 상태 표시
  - [ ] 실행 결과 시각화

### 문서화

- [ ] API 문서 작성
  - [ ] OpenAPI/Swagger 명세
  - [ ] API 사용 예제
- [ ] 개발자 가이드
  - [ ] 설치 및 설정 가이드
  - [ ] 커스텀 노드 개발 가이드

## 기술 부채 💭

- [ ] 테스트 커버리지 개선
- [ ] 에러 처리 고도화
- [ ] 성능 최적화
- [ ] 코드 리팩토링
  - [ ] 중복 코드 제거
  - [ ] 디자인 패턴 적용

## 향후 고려사항 🤔

- [ ] 멀티 테넌시 지원
- [ ] 분산 실행 환경 지원
- [ ] 버전 관리
- [ ] 롤백 기능
- [ ] 실행 이력 분석 도구
