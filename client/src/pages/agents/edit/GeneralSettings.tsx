import TextArea from '@/components/form/TextArea'
import TextField from '@/components/form/TextField'
import { Agent } from '@agentfleet/types'
import Select from '../../../components/form/Select'

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
        <TextField
          label="에이전트 이름"
          required
          placeholder="에이전트 이름을 입력하세요"
          value={agent.name}
          onChange={(e) => onUpdate({ ...agent, name: e.target.value })}
        />

        <TextArea
          label="설명"
          required
          placeholder="에이전트의 목적과 기능을 설명하세요"
          value={agent.description}
          onChange={(e) => onUpdate({ ...agent, description: e.target.value })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="상태"
            options={[
              { value: 'inactive', label: '비활성' },
              { value: 'active', label: '활성' },
            ]}
            value={agent.status}
            onChange={(e) =>
              onUpdate({
                ...agent,
                status: e.target.value as 'active' | 'inactive',
              })
            }
          />
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            취소
          </button>
          <button type="submit" className="btn btn-primary">
            변경사항 저장
          </button>
        </div>
      </form>
    </div>
  )
}
