import { PromptTemplate } from '@agentfleet/types'

export const mockPromptTemplates: PromptTemplate[] = [
  {
    id: 'template-1',
    name: '의도 파악 프롬프트',
    description: '사용자 입력의 의도를 파악하고 응답 계획을 수립하는 프롬프트',
    content: `당신은 사용자의 의도를 파악하고 적절한 응답 계획을 수립하는 전문가입니다.

입력: {{input}}

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
    variables: ['input'],
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
]
