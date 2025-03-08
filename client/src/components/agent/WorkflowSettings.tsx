import { useState } from 'react'
import { useEffect } from 'react'
import { Agent } from '../../mocks/agents'
import WorkflowCanvas from '../WorkflowCanvas'
import { Workflow } from '../../mocks/workflows'
import { api } from '../../services/api'

interface WorkflowSettingsProps {
  agent: Agent
  onUpdate: (workflow: Workflow) => void
}

export default function WorkflowSettings({
  agent,
  onUpdate,
}: WorkflowSettingsProps) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null)

  useEffect(() => {
    api.getWorkflow(agent.id).then((workflows) => {
      const foundWorkflow = workflows.find((w) => w.agentId === agent.id)
      setWorkflow(foundWorkflow || null)
    })
  }, [agent])

  return (
    <div className="px-4">
      <h2 className="text-xl mb-4">워크플로우 설정</h2>
      <div className="h-[600px]">
        {workflow && (
          <WorkflowCanvas
            workflow={workflow}
            onUpdate={(workflow) => onUpdate(workflow)}
          />
        )}
      </div>
    </div>
  )
}
