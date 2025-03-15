import { Router } from 'express'
import { MockRepositoryDriver } from '../drivers/mockRepositoryDriver'
import { AgentRepository } from '../repositories/agentRepository'
import { ConnectorRepository } from '../repositories/connectorRepository'
import { FleetRepository } from '../repositories/fleetRepository'
import { PipelineJobsRepository } from '../repositories/pipelineJobsRepository'
import { PipelineRepository } from '../repositories/pipelineRepository'
import { PromptTemplateRepository } from '../repositories/promptTemplateRepository'
import { AgentService } from '../services/agent.service'
import { PipelineService } from '../services/agentReasoningPipeline.service'
import { ConnectorService } from '../services/connector.service'
import { FleetService } from '../services/fleet.service'
import { NodeExecutorFactory } from '../services/nodeExecutors/NodeExecutorFactory'
import { MockNodeExecutor } from '../services/nodeExecutors/NoopNodeExecutor'
import { PipelineExecutionService } from '../services/pipelineExecution.service'
import { PromptService } from '../services/prompt.service'
import { createAgentReasoningPipelinesRouter } from './agentReasoningPipelines.routes'
import { createAgentsRouter } from './agents'
import { createConnectorsRouter } from './connectors'
import { createFleetsRouter } from './fleets.routes'
import { createPipelineJobsRouter } from './pipelineJobs.routes'
import { createPromptsRouter } from './prompts.routes'

const router = Router()

const mockRepositoryDriver = new MockRepositoryDriver()

export const agentService = new AgentService(
  new AgentRepository(mockRepositoryDriver),
)

export const connectorService = new ConnectorService(
  new ConnectorRepository(mockRepositoryDriver),
)

export const fleetService = new FleetService(
  new FleetRepository(mockRepositoryDriver),
)

export const pipelineExecutionService = new PipelineExecutionService(
  new PipelineJobsRepository(mockRepositoryDriver),
  new NodeExecutorFactory(),
)

export const pipelineService = new PipelineService(
  new PipelineRepository(mockRepositoryDriver),
)

// 노드 실행기 팩토리 설정
const nodeExecutorFactory = new NodeExecutorFactory()
;[
  'input',
  'process',
  'plan',
  'action',
  'decision',
  'aggregator',
  'analysis',
].forEach((nodeType) => {
  nodeExecutorFactory.registerExecutor(new MockNodeExecutor(nodeType))
})

const promptService = new PromptService(
  new PromptTemplateRepository(mockRepositoryDriver),
)

router.use('/agents', createAgentsRouter(agentService))
router.use('/connectors', createConnectorsRouter(connectorService))
router.use('/fleets', createFleetsRouter(fleetService))
router.use('/pipeline-jobs', createPipelineJobsRouter(pipelineExecutionService))
router.use(
  '/reasoning-pipelines',
  createAgentReasoningPipelinesRouter(
    pipelineService,
    pipelineExecutionService,
  ),
)
router.use('/prompts', createPromptsRouter(promptService))

export default router
