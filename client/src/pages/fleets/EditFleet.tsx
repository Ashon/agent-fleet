import Breadcrumb from '@/components/Breadcrumb'
import FormField from '@/components/form/FormField'
import TextArea from '@/components/form/TextArea'
import TextField from '@/components/form/TextField'
import { api } from '@/services/api'
import { Agent, Fleet } from '@agentfleet/types'
import { XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function EditFleet() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fleet, setFleet] = useState<Fleet | null>(null)
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    agents: [] as string[],
  })

  useEffect(() => {
    const loadData = async () => {
      if (!id) return

      try {
        const [fleetData, agentsData] = await Promise.all([
          api.getFleet(id),
          api.getAgents(),
        ])

        setFleet(fleetData)
        setAvailableAgents(agentsData)
        setFormData({
          name: fleetData.name,
          description: fleetData.description,
          agents: fleetData.agents || [],
        })
      } catch (error) {
        console.error('Failed to load fleet data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setSaving(true)
    try {
      await api.updateFleet(id, formData)
      navigate('/fleets')
    } catch (error) {
      console.error('Failed to update fleet:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/fleets')
  }

  if (loading) {
    return (
      <div className="container-2xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    )
  }

  if (!fleet) {
    return (
      <div className="container-2xl mx-auto">
        <div className="alert alert-error">
          <XCircle className="stroke-current shrink-0 h-6 w-6" />
          <span>Fleet not found</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-2xl mx-auto">
      <div className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: 'Fleets', path: '/fleets' },
            { label: fleet.name },
            { label: 'Edit' },
          ]}
        />

        <div className="card bg-base-100">
          <div className="card-body">
            <h2 className="card-title">Edit Fleet</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <TextField
                fieldId="name"
                label="Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter fleet name"
              />

              <TextArea
                fieldId="description"
                label="Description"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter fleet description"
              />

              <FormField label="Agents" required htmlFor="agents">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {availableAgents.map((agent) => (
                    <label
                      key={agent.id}
                      className="flex items-center gap-3 p-3 border border-base-300 hover:bg-base-200 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={formData.agents.includes(agent.id)}
                        onChange={(e) => {
                          const newAgents = e.target.checked
                            ? [...formData.agents, agent.id]
                            : formData.agents.filter((id) => id !== agent.id)
                          setFormData({ ...formData, agents: newAgents })
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{agent.name}</span>
                        <span className="text-sm text-base-content/70">
                          {agent.description}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </FormField>

              <div className="card-actions justify-end pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${saving ? 'loading' : ''}`}
                  disabled={saving}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
