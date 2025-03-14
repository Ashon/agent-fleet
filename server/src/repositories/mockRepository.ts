import { Agent, Connector, Fleet, Pipeline } from '@agentfleet/types'
import { MockRepositoryDriver } from '../drivers/mockRepositoryDriver'
import { mockPipelines } from '../mocks/agentReasoningPipeline'
import { mockAgents } from '../mocks/agents'
import { mockConnectors } from '../mocks/connectors'
import { mockFleets } from '../mocks/fleets'
import { BaseRepository } from './baseRepository'

// Mock 데이터를 사용하는 리포지토리 클래스들
export class MockAgentRepository extends BaseRepository<Agent> {
  constructor() {
    const driver = new MockRepositoryDriver({ agents: mockAgents })
    super(driver, 'agents')
  }
}

export class MockFleetRepository extends BaseRepository<Fleet> {
  constructor() {
    // Fleet mock 데이터는 아직 구현되지 않았으므로 빈 배열 사용
    const driver = new MockRepositoryDriver({ fleets: mockFleets })
    super(driver, 'fleets')
  }
}

export class MockConnectorRepository extends BaseRepository<Connector> {
  constructor() {
    const driver = new MockRepositoryDriver({ connectors: mockConnectors })
    super(driver, 'connectors')
  }
}

export class MockPipelineRepository extends BaseRepository<Pipeline> {
  constructor() {
    const driver = new MockRepositoryDriver({ pipelines: mockPipelines })
    super(driver, 'pipelines')
  }
}
