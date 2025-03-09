import Breadcrumb from '@/components/Breadcrumb'
import Card from '@/components/Card'
import { api } from '@/services/api'
import { Connector } from '@agentfleet/types'
import { PlusIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type Category = Connector['category']

export default function Connectors() {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(
    'all',
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConnectors = async () => {
      try {
        const data = await api.getConnectors()
        setConnectors(data)
      } catch (err) {
        setError('커넥터 목록을 불러오는데 실패했습니다.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchConnectors()
  }, [])

  const categories: { value: Category | 'all'; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'communication', label: '커뮤니케이션' },
    { value: 'documentation', label: '문서' },
    { value: 'api', label: 'API' },
    { value: 'database', label: '데이터베이스' },
  ]

  const filteredConnectors = connectors.filter((connector) => {
    const matchesCategory =
      selectedCategory === 'all' || connector.category === selectedCategory
    const matchesSearch =
      connector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connector.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <div className="alert alert-error">
          <XCircleIcon className="stroke-current shrink-0 h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Breadcrumb items={[{ label: 'Connectors' }]} />
        </div>
        <Link to="/connectors/new" className="btn btn-primary btn-sm">
          <PlusIcon className="h-4 w-4 mr-1" />
          New Connector
        </Link>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="tabs tabs-boxed">
          {categories.map((category) => (
            <a
              key={category.value}
              className={`tab ${
                selectedCategory === category.value ? 'tab-active' : ''
              }`}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </a>
          ))}
        </div>
        <div className="form-control">
          <input
            type="text"
            placeholder="커넥터 검색..."
            className="input input-bordered w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConnectors.map((connector) => (
          <Card key={connector.id} hover>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{connector.icon}</span>
                <h2 className="card-title">{connector.name}</h2>
              </div>
              <div
                className={`badge badge-sm ${
                  connector.status === 'active'
                    ? 'badge-success'
                    : connector.status === 'inactive'
                      ? 'badge-ghost'
                      : 'badge-error'
                }`}
              >
                {connector.status}
              </div>
            </div>
            <p className="text-base-content/70">{connector.description}</p>
            {connector.lastSync && (
              <div className="text-sm text-base-content/60">
                마지막 동기화: {new Date(connector.lastSync).toLocaleString()}
              </div>
            )}
            <div className="card-actions justify-end mt-4">
              <Link
                to={`/connectors/${connector.id}/edit`}
                className="btn btn-sm btn-ghost"
              >
                설정
              </Link>
              <Link
                to={`/connectors/${connector.id}/test`}
                className="btn btn-sm btn-primary"
              >
                테스트
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
