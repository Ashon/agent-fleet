import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import { Connector } from '../mocks/connectors'

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
          <div className="badge badge-sm badge-primary">New</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">커넥터 이름</span>
              <span className="badge badge-sm badge-primary badge-outline">
                필수
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full mt-1"
              placeholder="커넥터 이름을 입력하세요"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">설명</span>
              <span className="badge badge-sm badge-primary badge-outline">
                필수
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full mt-1 h-32 resize-none"
              placeholder="커넥터의 용도와 기능을 설명하세요"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">카테고리</span>
              </label>
              <select
                className="select select-bordered w-full mt-1"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as Connector['category'],
                  })
                }
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">아이콘</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full mt-1 text-2xl"
                placeholder="이모지 아이콘"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/connectors')}
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
  )
}
