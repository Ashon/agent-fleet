import FormField from '@/components/form/FormField'
import TextArea from '@/components/form/TextArea'
import TextField from '@/components/form/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
    <div className="container-2xl mx-auto">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Create New Fleet</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <div className="flex items-center gap-3 p-3 border border-base-300 hover:bg-base-200 cursor-pointer transition-colors">
                      <Checkbox
                        id={agent.id}
                        className="checkbox checkbox-primary"
                        checked={formData.agents.includes(agent.id)}
                        onCheckedChange={(checked) => {
                          const newAgents = checked
                            ? [...formData.agents, agent.id]
                            : formData.agents.filter((id) => id !== agent.id)
                          setFormData({ ...formData, agents: newAgents })
                        }}
                      />
                      <Label htmlFor={agent.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{agent.name}</span>
                          <span className="text-sm text-foreground/70">
                            {agent.description}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </FormField>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  className="cursor-pointer"
                  variant="default"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  Create Fleet
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
