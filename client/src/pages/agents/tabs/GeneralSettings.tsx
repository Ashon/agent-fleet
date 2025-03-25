import TextArea from '@/components/form/TextArea'
import TextField from '@/components/form/TextField'
import ToggleField from '@/components/form/ToggleField'
import { Agent } from '@agentfleet/types'

interface GeneralSettingsProps {
  agent: Agent
  onUpdate: (agent: Agent) => void
  onCancel: () => void
  onSave: () => void
}

export default function GeneralSettings({
  agent,
  onUpdate,
  onCancel,
  onSave,
}: GeneralSettingsProps) {
  return (
    <div className="px-4">
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault()
          onSave()
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField
            fieldId="name"
            label="Agent Name"
            required
            placeholder="Enter agent name"
            value={agent.name}
            onChange={(e) => onUpdate({ ...agent, name: e.target.value })}
          />

          <ToggleField
            label="Status"
            checked={agent.status === 'active'}
            onChange={(e) =>
              onUpdate({
                ...agent,
                status: e.target.checked ? 'active' : 'inactive',
              })
            }
          />
        </div>

        <TextArea
          fieldId="description"
          label="Description"
          required
          placeholder="Enter agent description"
          value={agent.description}
          onChange={(e) => onUpdate({ ...agent, description: e.target.value })}
        />

        <div className="flex justify-end gap-4">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
