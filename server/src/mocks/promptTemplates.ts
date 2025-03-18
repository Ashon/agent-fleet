import { PromptTemplate } from '@agentfleet/types'

export const mockPromptTemplates: PromptTemplate[] = [
  {
    id: 'template-1',
    name: '의도 파악 프롬프트',
    description: '사용자 입력의 의도를 파악하고 응답 계획을 수립하는 프롬프트',
    content: `당신은 사용자의 의도를 파악하고 적절한 응답 계획을 수립하는 전문가입니다.

입력: {{__input__}}

다음 단계를 수행하세요:
1. 사용자 입력의 주요 의도 파악
2. 필요한 정보나 도구 식별
3. 응답 계획 수립

응답 형식:
{
  "intent": "주요 의도",
  "requiredTools": ["필요한 도구 목록"],
  "plan": ["단계별 계획"]
}`,
    variables: ['__input__'],
    createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  },
  {
    id: 'template-2',
    name: '검색 키워드 추출 프롬프트',
    description:
      '사용자 질문에서 검색에 필요한 핵심 키워드를 추출하는 프롬프트',
    content: `다음 질문에서 웹 검색에 사용할 핵심 키워드를 추출하세요.

질문: {{question}}

응답 형식:
{
  "keywords": ["키워드1", "키워드2", ...],
  "filters": ["필터1", "필터2", ...],
  "excludeTerms": ["제외어1", "제외어2", ...]
}`,
    variables: ['question'],
    createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  },
  {
    id: 'template-3',
    name: '이미지 분석 프롬프트',
    description: '이미지의 주요 특징과 내용을 분석하는 프롬프트',
    content: `주어진 이미지를 자세히 분석하고 다음 정보를 추출하세요.

이미지 URL: {{imageUrl}}
분석 수준: {{detailLevel}}

다음 항목을 분석하세요:
1. 주요 객체와 요소
2. 장면 설명
3. 텍스트 내용 (있는 경우)
4. 감정과 분위기
5. 특이사항

응답 형식:
{
  "objects": ["객체1", "객체2", ...],
  "sceneDescription": "장면 설명",
  "extractedText": "추출된 텍스트",
  "mood": "감정/분위기",
  "specialNotes": ["특이사항1", "특이사항2", ...]
}`,
    variables: ['imageUrl', 'detailLevel'],
    createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  },
  {
    id: 'template-4',
    name: '결과 통합 프롬프트',
    description: '여러 소스의 정보를 통합하여 일관된 응답을 생성하는 프롬프트',
    content: `다음 정보들을 통합하여 일관되고 종합적인 응답을 생성하세요.

검색 결과: {{searchResults}}
분석 결과: {{analysisResults}}
컨텍스트: {{context}}

응답 요구사항:
1. 정보의 일관성 확인
2. 중요도에 따른 우선순위 부여
3. 논리적 구조화
4. 출처 인용 (필요시)

응답 형식:
{
  "summary": "핵심 요약",
  "details": ["상세 내용1", "상세 내용2", ...],
  "sources": ["출처1", "출처2", ...],
  "confidence": 0.95
}`,
    variables: ['searchResults', 'analysisResults', 'context'],
    createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  },
  {
    id: 'template-5',
    name: '최종 응답 생성 프롬프트',
    description: '사용자 친화적인 최종 응답을 생성하는 프롬프트',
    content: `다음 정보를 바탕으로 사용자 친화적인 최종 응답을 생성하세요.

통합 결과: {{integratedResults}}
응답 형식: {{responseFormat}}
톤: {{tone}}

응답 지침:
1. 명확하고 간결한 표현 사용
2. 전문 용어는 적절히 설명
3. 논리적 흐름 유지
4. 사용자 레벨에 맞는 설명 제공

응답 형식:
{
  "title": "응답 제목",
  "mainContent": "주요 내용",
  "additionalInfo": ["추가 정보1", "추가 정보2", ...],
  "nextSteps": ["다음 단계1", "다음 단계2", ...],
  "references": ["참조1", "참조2", ...]
}`,
    variables: ['integratedResults', 'responseFormat', 'tone'],
    createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  },
  {
    id: 'knowledge-base-search',
    name: '지식 베이스 검색 프롬프트',
    description: '지식 베이스에서 관련 정보를 검색하는 프롬프트',
    content: `주어진 입력과 관련된 정보를 지식 베이스에서 검색하세요.

입력: {{__input__}}

검색 기준:
1. 관련성 점수 계산
2. 최신성 고려
3. 신뢰도 평가

응답 형식:
{
  "documents": ["문서1", "문서2", ...],
  "relevanceScores": [0.95, 0.85, ...],
  "metadata": {
    "totalFound": 10,
    "avgRelevance": 0.9
  }
}`,
    variables: ['__input__'],
    createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  },
  {
    id: 'intent-analysis',
    name: '의도 분석 프롬프트',
    description: '사용자 입력과 컨텍스트를 바탕으로 의도를 분석하는 프롬프트',
    content: `사용자의 입력과 관련 문서를 분석하여 의도를 파악하세요.

입력: {{text}}
관련 문서: {{documents}}

분석 기준:
1. 주요 의도 파악
2. 세부 의도 분류
3. 신뢰도 평가

응답 형식:
{
  "mainIntent": "주요 의도",
  "subIntents": ["세부 의도1", "세부 의도2", ...],
  "confidence": 0.95,
  "supportingEvidence": ["근거1", "근거2", ...]
}`,
    variables: ['text', 'documents'],
    createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  },
  {
    id: 'template-6',
    name: '최종 응답 포맷팅 프롬프트',
    description: '분석 결과를 최종 응답 형식으로 변환하는 프롬프트',
    content: `분석 결과를 사용자 친화적인 최종 응답으로 변환하세요.

분석 결과: {{conclusions}}
신뢰도: {{confidence}}
데이터 소스: {{dataSources}}

응답 요구사항:
1. 명확하고 간결한 표현
2. 주요 포인트 강조
3. 필요시 추가 설명 제공
4. 출처 인용

응답 형식:
{
  "title": "응답 제목",
  "summary": "핵심 요약",
  "details": ["상세 내용1", "상세 내용2", ...],
  "references": ["참조1", "참조2", ...],
  "nextSteps": ["추천 행동1", "추천 행동2", ...]
}`,
    variables: ['conclusions', 'confidence', 'dataSources'],
    createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  },
  {
    id: 'weather-intent',
    name: '날씨 의도 분석',
    description: '사용자의 날씨 관련 질문 의도를 분석하는 프롬프트',
    content: `당신은 사용자의 날씨 관련 질문을 분석하는 전문가입니다.

입력: {{__input__}}

다음 단계를 수행하세요:
1. 사용자 질문에서 날씨 정보 요청의 유형 파악 (current/today/tomorrow/dayAfterTomorrow)
2. 위치 정보 추출 (기본값: 서울)
3. 필요한 날씨 정보 유형 식별 (기온/강수/습도/바람 등)

응답은 반드시 다음과 같은 JSON 형식으로 작성하세요:
{
  "type": "current",  // current/today/tomorrow/dayAfterTomorrow 중 하나
  "location": "서울", // 도시 이름, 명시되지 않은 경우 "서울"
  "requiredInfo": ["temperature", "humidity", "precipitation", "wind"]  // 필요한 정보 목록
}

주의사항:
- type은 반드시 current/today/tomorrow/dayAfterTomorrow 중 하나여야 합니다
- location은 반드시 문자열 형태의 도시 이름이어야 합니다
- 위치가 명시되지 않은 경우 "서울"을 기본값으로 사용하세요
- 단순 인사만 있는 경우 current 타입과 서울 위치로 처리하세요`,
    variables: ['__input__'],
    createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  },
  {
    id: 'weather-response',
    name: '날씨 정보 응답',
    description: '날씨 정보를 사용자 친화적으로 설명하는 프롬프트',
    content: `당신은 날씨 정보를 이해하기 쉽게 설명하는 전문가입니다.

날씨 데이터: {{weatherData}}
위치: {{location}}
요청 유형: {{type}}

다음 형식으로 응답을 생성하세요:
1. 간단한 날씨 요약
2. 상세 날씨 정보 (기온, 강수, 습도, 바람 등)
3. 필요한 경우 주의사항이나 추천사항

응답은 자연스러운 대화체로 작성하되, 정확한 수치 정보를 포함해야 합니다.

응답 형식:
{
  "summary": "간단한 날씨 요약",
  "details": {
    "temperature": "기온 정보",
    "precipitation": "강수 정보",
    "humidity": "습도 정보",
    "wind": "바람 정보"
  },
  "recommendations": ["추천사항1", "추천사항2"]
}`,
    variables: ['weatherData', 'location', 'type'],
    createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  },
]
