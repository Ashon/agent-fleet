import WorkflowCanvas from '@/components/WorkflowCanvas'
import { api } from '@/services/api'
import { Agent, Workflow } from '@agentfleet/types'
import { useEffect, useState } from 'react'

interface WorkflowSettingsProps {
  agent: Agent
}

export default function WorkflowSettings({ agent }: WorkflowSettingsProps) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null)

  const onUpdate = (workflow: Workflow) => {
    setWorkflow(workflow)
  }

  useEffect(() => {
    api.getWorkflow(agent.id).then((workflows) => {
      const foundWorkflow = workflows.find((w) => w.agentId === agent.id)
      setWorkflow(foundWorkflow || null)
    })
  }, [agent])

  return (
    <div className="px-4">
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
