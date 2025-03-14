import { Router } from 'express'
import agentsRouter from './agents'
import connectorsRouter from './connectors'
import fleetRouter from './fleets'
import pipelineJobsRouter from './pipelineJobs'
import reasoningPipelinesRouter from './reasoningPipelines'

const router = Router()

router.use('/agents', agentsRouter)
router.use('/fleets', fleetRouter)
router.use('/pipeline-jobs', pipelineJobsRouter)
router.use('/reasoning-pipelines', reasoningPipelinesRouter)
router.use('/connectors', connectorsRouter)

export default router
