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
            <h2 className="card-title">새 에이전트 생성</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <TextField
                label="에이전트 이름"
                required
                placeholder="에이전트 이름을 입력하세요"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <TextArea
                label="설명"
                required
                placeholder="에이전트의 목적과 기능을 설명하세요"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate('/agents')}
                >
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
