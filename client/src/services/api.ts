import {
  Agent,
  Connector,
  Fleet,
  Pipeline,
  PipelineTestRequest,
  PipelineTestResponse,
} from '@agentfleet/types'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  console.error('VITE_API_URL is not defined')
}

export interface CreateAgentRequest {
  name: string
  description: string
}

export interface CreateFleetRequest {
  name: string
  description: string
  agents?: string[]
}

export interface CreateConnectorRequest {
  name: string
  description: string
  category: Connector['category']
  icon: string
}

export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {
  status?: Agent['status']
}

export interface UpdateFleetRequest extends Partial<CreateFleetRequest> {
  status?: Fleet['status']
}

export interface UpdateConnectorRequest
  extends Partial<CreateConnectorRequest> {
  status?: Connector['status']
}

export const api = {
  // Agents API
  async getAgents(): Promise<Agent[]> {
    const response = await fetch(`${API_URL}/api/agents`)
    if (!response.ok) {
      throw new Error('Failed to fetch agents')
    }
    return response.json()
  },

  async getAgent(id: string): Promise<Agent> {
    const response = await fetch(`${API_URL}/api/agents/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch agent')
    }
    return response.json()
  },

  async createAgent(data: CreateAgentRequest): Promise<Agent> {
    const response = await fetch(`${API_URL}/api/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to create agent')
    }
    return response.json()
  },

  async updateAgent(id: string, data: UpdateAgentRequest): Promise<Agent> {
    const response = await fetch(`${API_URL}/api/agents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to update agent')
    }
    return response.json()
  },

  async deleteAgent(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/agents/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete agent')
    }
  },

  // Fleets API
  async getFleets(): Promise<Fleet[]> {
    const response = await fetch(`${API_URL}/api/fleets`)
    if (!response.ok) {
      throw new Error('Failed to fetch fleets')
    }
    return response.json()
  },

  async getFleet(id: string): Promise<Fleet> {
    const response = await fetch(`${API_URL}/api/fleets/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch fleet')
    }
    return response.json()
  },

  async createFleet(data: CreateFleetRequest): Promise<Fleet> {
    const response = await fetch(`${API_URL}/api/fleets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to create fleet')
    }
    return response.json()
  },

  async updateFleet(id: string, data: UpdateFleetRequest): Promise<Fleet> {
    const response = await fetch(`${API_URL}/api/fleets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to update fleet')
    }
    return response.json()
  },

  async deleteFleet(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/fleets/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete fleet')
    }
  },

  // Connectors API
  async getConnectors(): Promise<Connector[]> {
    const response = await fetch(`${API_URL}/api/connectors`)
    if (!response.ok) {
      throw new Error('Failed to fetch connectors')
    }
    return response.json()
  },

  async getConnector(id: string): Promise<Connector> {
    const response = await fetch(`${API_URL}/api/connectors/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch connector')
    }
    return response.json()
  },

  async createConnector(data: CreateConnectorRequest): Promise<Connector> {
    const response = await fetch(`${API_URL}/api/connectors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to create connector')
    }
    return response.json()
  },

  async updateConnector(
    id: string,
    data: UpdateConnectorRequest,
  ): Promise<Connector> {
    const response = await fetch(`${API_URL}/api/connectors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to update connector')
    }
    return response.json()
  },

  async deleteConnector(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/connectors/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete connector')
    }
  },

  async testConnector(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/api/connectors/${id}/test`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to test connector')
    }
    return response.json()
  },

  // Reasoning Pipeline API
  async getReasoningPipelines(agentId: string): Promise<Pipeline[]> {
    const response = await fetch(
      `${API_URL}/api/reasoning-pipelines?agentId=${agentId}`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch reasoning pipelines')
    }
    return response.json()
  },

  async createReasoningPipeline(
    pipeline: Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Pipeline> {
    const response = await fetch(`${API_URL}/api/reasoning-pipelines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipeline),
    })
    if (!response.ok) {
      throw new Error('Failed to create reasoning pipeline')
    }
    return response.json()
  },

  async updateReasoningPipeline(
    id: string,
    pipeline: Partial<Pipeline>,
  ): Promise<Pipeline> {
    const response = await fetch(`${API_URL}/api/reasoning-pipelines/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipeline),
    })
    if (!response.ok) {
      throw new Error('Failed to update reasoning pipeline')
    }
    return response.json()
  },

  async deleteReasoningPipeline(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/reasoning-pipelines/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete reasoning pipeline')
    }
  },

  async testReasoningPipeline(
    request: PipelineTestRequest,
  ): Promise<PipelineTestResponse> {
    const response = await fetch(`${API_URL}/api/reasoning-pipelines/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      throw new Error('Failed to test reasoning pipeline')
    }
    return response.json()
  },
}
