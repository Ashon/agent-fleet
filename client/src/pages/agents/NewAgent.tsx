import TextArea from '@/components/form/TextArea'
import TextField from '@/components/form/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="container-2xl mx-auto">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Create New Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <TextField
                fieldId="name"
                label="Agent Name"
                required
                placeholder="Enter agent name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <TextArea
                fieldId="description"
                label="Description"
                required
                placeholder="Enter agent description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <div className="flex justify-end gap-4">
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  onClick={() => navigate('/agents')}
                >
                  Cancel
                </Button>
                <Button className="cursor-pointer" type="submit">
                  Create
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
