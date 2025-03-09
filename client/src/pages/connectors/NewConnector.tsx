import Breadcrumb from '@/components/Breadcrumb'
import Select from '@/components/form/Select'
import TextArea from '@/components/form/TextArea'
import TextField from '@/components/form/TextField'
import { Connector } from '@agentfleet/types'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function NewConnector() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<Partial<Connector>>({
    name: '',
    description: '',
    category: 'communication',
    status: 'inactive',
    icon: '🔌',
  })

  const categories = [
    { value: 'communication', label: '커뮤니케이션' },
    { value: 'documentation', label: '문서' },
    { value: 'api', label: 'API' },
    { value: 'database', label: '데이터베이스' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API 연동 시 실제 데이터 저장 로직 구현
    console.log('New connector data:', formData)
    navigate('/connectors')
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Breadcrumb
            items={[
              { label: 'Connectors', path: '/connectors' },
              { label: 'New Connector' },
            ]}
          />
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">새 커넥터 생성</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <TextField
              label="Connector Name"
              required
              placeholder="Enter connector name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <TextArea
              label="Description"
              required
              placeholder="Enter connector description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Category"
                options={categories.map((category) => ({
                  value: category.value,
                  label: category.label,
                }))}
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as Connector['category'],
                  })
                }
              />

              <TextField
                label="Icon"
                required
                placeholder="Enter emoji icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/connectors')}
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
  )
}
