import { Router } from 'express'
import { OllamaProvider } from '../clients/llm/OllamaProvider'
import { createS3Client } from '../clients/s3'
import config from '../config'
import { MockRepositoryDriver } from '../drivers/mockRepositoryDriver'
import { S3RepositoryDriver } from '../drivers/s3RepositoryDriver'
import { AgentRepository } from '../repositories/agent.repository'
import { ConnectorRepository } from '../repositories/connector.repository'
import { FleetRepository } from '../repositories/fleet.repository'
import { PipelineRepository } from '../repositories/pipeline.repository'
import { PipelineExecutionsRepository } from '../repositories/pipelineExecution.repository'
import { PromptTemplateRepository } from '../repositories/promptTemplate.repository'
import { AgentService } from '../services/agent.service'
import { ConnectorService } from '../services/connector.service'
import { ConnectorFactory } from '../services/connectors/ConnectorFactory'
import { KnowledgeBaseConnector } from '../services/connectors/KnowledgeBaseConnector'
import { MemoryConnector } from '../services/connectors/MemoryConnector'
import { WeatherConnector } from '../services/connectors/WeatherConnector'
import { FleetService } from '../services/fleet.service'
import { NodeExecutorFactory } from '../services/nodeExecutors/NodeExecutorFactory'
import { PromptNodeExecutor } from '../services/nodeExecutors/PromptNodeExecutor'
import { PipelineExecutionService } from '../services/pipelineExecution.service'
import { PromptService } from '../services/prompt.service'
import { PipelineService } from '../services/reasoningPipeline.service'
import { createAgentsRouter } from './agents.routes'
import { createConnectorsRouter } from './connectors.routes'
import { createFleetsRouter } from './fleets.routes'
import { createPipelineExecutionsRouter } from './pipelineJobs.routes'
import { createPromptsRouter } from './prompts.routes'
import { createReasoningPipelinesRouter } from './reasoningPipelines.routes'

const repositoryDriverType = process.env.REPOSITORY_DRIVER || 'mock'
const s3Client = createS3Client({
  endpoint: config.storage.endpoint,
  region: config.storage.region,
  accessKeyId: config.storage.accessKey,
  secretAccessKey: config.storage.secretKey,
  forcePathStyle: true,
})

const s3RepositoryDriver = new S3RepositoryDriver(
  s3Client,
  config.storage.bucket,
)
const repositoryDriver =
  repositoryDriverType === 's3'
    ? s3RepositoryDriver
    : new MockRepositoryDriver()

const agentRepository = new AgentRepository(repositoryDriver)
const connectorRepository = new ConnectorRepository(repositoryDriver)
const fleetRepository = new FleetRepository(repositoryDriver)
const pipelineRepository = new PipelineRepository(repositoryDriver)
const pipelineExecutionsRepository = new PipelineExecutionsRepository(
  repositoryDriver,
)

const promptTemplateRepository = new PromptTemplateRepository(repositoryDriver)
export const promptService = new PromptService(promptTemplateRepository)

const llmProvider = new OllamaProvider()

// 커넥터 팩토리 설정
const connectorFactory = new ConnectorFactory()
connectorFactory.registerConnector(new WeatherConnector())
connectorFactory.registerConnector(new MemoryConnector())
connectorFactory.registerConnector(new KnowledgeBaseConnector())

// 노드 실행기 팩토리 설정
const nodeExecutorFactory = new NodeExecutorFactory()
nodeExecutorFactory.registerExecutor(
  new PromptNodeExecutor(promptService, llmProvider, connectorFactory),
)

export const agentService = new AgentService(agentRepository)
export const connectorService = new ConnectorService(connectorRepository)
export const fleetService = new FleetService(fleetRepository)
export const pipelineService = new PipelineService(pipelineRepository)

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
  createReasoningPipelinesRouter(pipelineService, pipelineExecutionService),
)
router.use('/prompts', createPromptsRouter(promptService))

export default router
