import {
  PipelineNode,
  PromptNodeConfig,
  PromptTemplate,
} from '@agentfleet/types'
import { useState } from 'react'

interface ReasoningPipelineConfigProps {
  selectedNode: PipelineNode | null
}

export function ReasoningPipelineConfig({
  selectedNode,
}: ReasoningPipelineConfigProps) {
  const [template, setTemplate] = useState<PromptTemplate | null>(null)
  const [config, setConfig] = useState<PromptNodeConfig>(
    selectedNode?.data.config as PromptNodeConfig,
  )

  return (
    <div className="h-full pt-2">
      <h3 className="text-lg font-bold">Node Config</h3>
      <pre>{JSON.stringify(selectedNode, null, 2)}</pre>
      <pre>{JSON.stringify(config, null, 2)}</pre>
    </div>
  )
}
