import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import { Agent } from '../mocks/agents'
import WorkflowSettings from '../components/agent/WorkflowSettings'
import GeneralSettings from '../components/agent/GeneralSettings'
import ChatHistory from '../components/agent/ChatHistory'
import { api } from '../services/api'

type TabType = 'workflow' | 'settings' | 'history'

export default function EditAgent() {
  const navigate = useNavigate()
  const { id, tab = 'workflow' } = useParams<{ id: string; tab: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<Agent | null>(null)

  // 유효한 탭인지 확인
  const isValidTab = (tab: string): tab is TabType => {
    return ['workflow', 'settings', 'history'].includes(tab)
  }

  useEffect(() => {
    // TODO: API 연동 시 실제 데이터 조회 로직 구현
    if (id) {
      console.log('id', id)
      api.getAgent(id).then((agent) => {
        console.log('agent', agent)
        setFormData(agent)
        setIsLoading(false)
      })
    }
  }, [id])

  const handleCancel = () => {
    navigate('/agents')
  }

  const handleSave = () => {
    // TODO: API 연동 시 실제 데이터 저장 로직 구현
    console.log('Updated agent data:', formData)
    navigate('/agents')
  }

  // 잘못된 탭으로 접근한 경우 404로 리다이렉트
  if (!isValidTab(tab)) {
    return <Navigate to="/404" replace />
  }

  return isLoading ? (
    <></>
  ) : !formData ? (
    <Navigate to="/404" replace />
  ) : (
    <div className="container mx-auto">
      <div className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: 'Agents', path: '/agents' },
            { label: formData.name },
            { label: 'Edit' },
          ]}
        />
        <div className="tabs tabs-bordered">
          <Link
            to={`/agents/${id}/edit/workflow`}
            className={`tab ${tab === 'workflow' ? 'tab-active' : ''}`}
          >
            Workflow Settings
          </Link>
          <Link
            to={`/agents/${id}/edit/settings`}
            className={`tab ${tab === 'settings' ? 'tab-active' : ''}`}
          >
            General Settings
          </Link>
          <Link
            to={`/agents/${id}/edit/history`}
            className={`tab ${tab === 'history' ? 'tab-active' : ''}`}
          >
            Chat History
          </Link>
        </div>

        <div className="mt-4">
          {tab === 'workflow' && (
            <WorkflowSettings
              agent={formData}
              onUpdate={(workflow) => setFormData({ ...formData, workflow })}
            />
          )}
          {tab === 'settings' && (
            <GeneralSettings
              agent={formData}
              onUpdate={setFormData}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          )}
          {tab === 'history' && <ChatHistory agent={formData} />}
        </div>
      </div>
    </div>
  )
}
