import { Fleet } from '@agentfleet/types'

const mockDate = '2025-03-08T06:50:43.331Z'

export const fleets: Fleet[] = [
  {
    id: '1',
    name: '고객 서비스 Fleet',
    description: '고객 문의 응대를 위한 에이전트 그룹입니다.',
    status: 'active',
    agents: ['1', '2', '3', '4', '5'],
    createdAt: mockDate,
    updatedAt: mockDate,
  },
  {
    id: '2',
    name: '데이터 분석 Fleet',
    description: '데이터 처리와 분석을 위한 에이전트 그룹입니다.',
    status: 'active',
    agents: ['6', '7', '8'],
    createdAt: mockDate,
    updatedAt: mockDate,
  },
]
