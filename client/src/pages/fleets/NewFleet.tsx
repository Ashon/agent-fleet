import Breadcrumb from '@/components/Breadcrumb'
import FormField from '@/components/form/FormField'
import TextArea from '@/components/form/TextArea'
import TextField from '@/components/form/TextField'
import { api } from '@/services/api'
import { Agent } from '@agentfleet/types'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function NewFleet() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    agents: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([])

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const agents = await api.getAgents()
        setAvailableAgents(agents)
      } catch (error) {
        console.error('Failed to load agents:', error)
      }
    }
    loadAgents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.createFleet(formData)
      navigate('/fleets')
    } catch (error) {
      console.error('Failed to create fleet:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/fleets')
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-4">
        <Breadcrumb
          items={[{ label: 'Fleets', path: '/fleets' }, { label: 'New Fleet' }]}
        />

        <div className="card bg-base-100">
          <div className="card-body">
            <h2 className="card-title">Create New Fleet</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <TextField
                label="Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter fleet name"
              />

              <TextArea
                label="Description"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter fleet description"
              />

              <FormField label="Agents" required>
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
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  Create Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
