export interface PipelineJob {
  id: string
  pipelineName: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime: string
  endTime?: string
}
