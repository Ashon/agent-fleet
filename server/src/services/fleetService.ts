import { CreateFleetData, Fleet } from '@agentfleet/types'
import { v4 } from 'uuid'
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
    const fleet: Fleet = {
      id: v4(),
      name: data.name,
      description: data.description,
      status: 'active',
      agents: data.agents || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return await this.fleetRepository.save(fleet)
  }

  async updateFleet(
    id: string,
    data: Partial<CreateFleetData>,
  ): Promise<Fleet | undefined> {
    const existingFleet = await this.fleetRepository.findById(id)
    if (!existingFleet) {
      return undefined
    }

    const updatedFleet: Fleet = {
      ...existingFleet,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    return await this.fleetRepository.save(updatedFleet)
  }

  async deleteFleet(id: string): Promise<boolean> {
    const existingFleet = await this.fleetRepository.findById(id)
    if (!existingFleet) {
      return false
    }

    await this.fleetRepository.delete(id)
    return true
  }
}
