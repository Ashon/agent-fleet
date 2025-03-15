import { CreateFleetData, Fleet, FleetStatus } from '@agentfleet/types'
import { FleetRepository } from '../repositories/fleetRepository'

export class FleetService {
  constructor(private readonly fleetRepository: FleetRepository) {}

  async getAllFleets(): Promise<Fleet[]> {
    return await this.fleetRepository.findAll()
  }

  async getFleetById(id: string): Promise<Fleet | undefined> {
    const fleet = await this.fleetRepository.findById(id)
    return fleet || undefined
  }

  async createFleet(data: CreateFleetData): Promise<Fleet> {
    const fleet = {
      name: data.name,
      description: data.description,
      status: 'active' as FleetStatus,
      agents: data.agents || [],
    }

    return await this.fleetRepository.create(fleet)
  }

  async updateFleet(
    id: string,
    data: Partial<CreateFleetData>,
  ): Promise<Fleet | undefined> {
    const fleet = await this.fleetRepository.findById(id)
    if (!fleet) return undefined

    const updatedFleet = {
      ...fleet,
      ...data,
      id, // ID는 변경 불가
    }

    return this.fleetRepository.save(updatedFleet)
  }

  async deleteFleet(id: string): Promise<boolean> {
    try {
      await this.fleetRepository.delete(id)
      return true
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return false
      }
      throw error
    }
  }
}
