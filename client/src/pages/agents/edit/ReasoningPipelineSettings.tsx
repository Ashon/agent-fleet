import { default as PipelineCanvas } from '@/components/PipelineCanvas'
import { api } from '@/services/api'
import { Agent, Pipeline } from '@agentfleet/types'
import { useEffect, useState } from 'react'

interface ReasoningPipelineSettingsProps {
  agent: Agent
}

export default function ReasoningPipelineSettings({
  agent,
}: ReasoningPipelineSettingsProps) {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)

  const onUpdate = (pipeline: Pipeline) => {
    setPipeline(pipeline)
  }

  useEffect(() => {
    api.getReasoningPipelines(agent.id).then((pipelines) => {
      const foundPipeline = pipelines.find((p) => p.agentId === agent.id)
      setPipeline(foundPipeline || null)
    })
  }, [agent])

  return (
    <div className="px-4">
      <div className="h-[600px]">
        {pipeline && (
          <PipelineCanvas
            pipeline={pipeline}
            onUpdate={(pipeline) => onUpdate(pipeline)}
          />
        )}
      </div>
    </div>
  )
}
