import { CreateFleetData, Fleet } from '@agentfleet/types'
import { fleets } from '../mocks/fleets'

export class FleetService {
  private fleets: Fleet[] = []

  constructor(initialFleets: Fleet[] = []) {
    this.fleets = [...initialFleets]
  }

  getAllFleets(): Fleet[] {
    return this.fleets
  }

  getFleetById(id: string): Fleet | undefined {
    return this.fleets.find((f) => f.id === id)
  }

  createFleet(data: CreateFleetData): Fleet {
    const fleet: Fleet = {
      id: (this.fleets.length + 1).toString(),
      name: data.name,
      description: data.description,
      status: 'active',
      agents: data.agents || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.fleets.push(fleet)
    return fleet
  }

  updateFleet(id: string, data: Partial<CreateFleetData>): Fleet | undefined {
    const index = this.fleets.findIndex((f) => f.id === id)
    if (index === -1) {
      return undefined
    }
    this.fleets[index] = {
      ...this.fleets[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return this.fleets[index]
  }

  deleteFleet(id: string): boolean {
    const index = this.fleets.findIndex((f) => f.id === id)
    if (index === -1) {
      return false
    }
    this.fleets.splice(index, 1)
    return true
  }
}

// 실제 사용을 위한 인스턴스
export const fleetService = new FleetService(fleets)
