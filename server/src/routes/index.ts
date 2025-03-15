import { Router } from 'express'
import { MockRepositoryDriver } from '../drivers/mockRepositoryDriver'
import { AgentRepository } from '../repositories/agentRepository'
import { ConnectorRepository } from '../repositories/connectorRepository'
import { FleetRepository } from '../repositories/fleetRepository'
import { PipelineExecutionsRepository } from '../repositories/pipelineExecutionsRepository'
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
import { createAgentsRouter } from './agents.routes'
import { createConnectorsRouter } from './connectors.routes'
import { createFleetsRouter } from './fleets.routes'
import { createPipelineExecutionsRouter } from './pipelineJobs.routes'
import { createPromptsRouter } from './prompts.routes'

const repositoryDriver = new MockRepositoryDriver()

const agentRepository = new AgentRepository(repositoryDriver)
const connectorRepository = new ConnectorRepository(repositoryDriver)
const fleetRepository = new FleetRepository(repositoryDriver)
const pipelineRepository = new PipelineRepository(repositoryDriver)
const pipelineExecutionsRepository = new PipelineExecutionsRepository(
  repositoryDriver,
)
const promptTemplateRepository = new PromptTemplateRepository(repositoryDriver)

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

export const agentService = new AgentService(agentRepository)
export const connectorService = new ConnectorService(connectorRepository)
export const fleetService = new FleetService(fleetRepository)
export const pipelineService = new PipelineService(pipelineRepository)
export const promptService = new PromptService(promptTemplateRepository)
export const pipelineExecutionService = new PipelineExecutionService(
  pipelineExecutionsRepository,
  nodeExecutorFactory,
)

const router = Router()
router.use('/agents', createAgentsRouter(agentService))
router.use('/connectors', createConnectorsRouter(connectorService))
router.use('/fleets', createFleetsRouter(fleetService))
router.use(
  '/pipeline-executions',
  createPipelineExecutionsRouter(pipelineExecutionService),
)
router.use(
  '/reasoning-pipelines',
  createAgentReasoningPipelinesRouter(
    pipelineService,
    pipelineExecutionService,
  ),
)
router.use('/prompts', createPromptsRouter(promptService))

export default router
