import Breadcrumb from '@/components/Breadcrumb'
import TextArea from '@/components/form/TextArea'
import TextField from '@/components/form/TextField'
import { api, CreateAgentRequest } from '@/services/api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function NewAgent() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState<CreateAgentRequest>({
    name: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API 연동 시 실제 데이터 생성 로직 구현
    console.log('New agent data:', formData)
    api.createAgent(formData)
    navigate('/agents')
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-4">
        <Breadcrumb
          items={[{ label: 'Agents', path: '/agents' }, { label: 'New Agent' }]}
        />

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Create New Agent</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <TextField
                label="Agent Name"
                required
                placeholder="Enter agent name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <TextArea
                label="Description"
                required
                placeholder="Enter agent description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate('/agents')}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
