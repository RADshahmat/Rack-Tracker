import equipmentRepository, { IEquipmentRepository } from './equipment.repository';
import rackRepository from '../racks/rack.repository';
import { Equipment, CreateEquipmentInput, UpdateEquipmentInput } from './equipment.types';
import { AppError } from '../../shared/errorHandler';
import { PaginatedResult } from '../../shared/types';
import { equipmentCreatedTotal } from '../../metrics/registry';

class EquipmentService {
  private repository: IEquipmentRepository;

  constructor(repository: IEquipmentRepository) {
    this.repository = repository;
  }

  async getAllEquipment(page?: number, limit?: number): Promise<PaginatedResult<Equipment[]>> {
    return await this.repository.findAll(page, limit);
  }

  async getEquipmentById(id: number): Promise<Equipment> {
    const equipment = await this.repository.findById(id);
    if (!equipment) {
      throw new AppError(404, `Equipment with ID ${id} not found`);
    }
    return equipment;
  }

  async createEquipment(data: CreateEquipmentInput): Promise<Equipment> {
    // Check for duplicate tag
    const existing = await this.repository.findByTag(data.tag);
    if (existing) {
      throw new AppError(400, 'Tag already exists', [
        { field: 'tag', message: `Equipment with tag "${data.tag}" already exists` },
      ]);
    }

    // Validate rack exists if rack_id provided
    if (data.rack_id) {
      const rack = await rackRepository.findById(data.rack_id);
      if (!rack) {
        throw new AppError(400, 'Invalid rack ID', [
          { field: 'rack_id', message: `Rack with ID ${data.rack_id} does not exist` },
        ]);
      }
    }
    const equipment = await this.repository.create(data);

    // Increment counter
    equipmentCreatedTotal.inc();

    return equipment;
  }

  async updateEquipment(id: number, data: UpdateEquipmentInput): Promise<Equipment> {
    // Check if equipment exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError(404, `Equipment with ID ${id} not found`);
    }

    // Check for duplicate tag if updating tag
    if (data.tag && data.tag !== existing.tag) {
      const tagExists = await this.repository.findByTag(data.tag);
      if (tagExists) {
        throw new AppError(400, 'Tag already exists', [
          { field: 'tag', message: `Equipment with tag "${data.tag}" already exists` },
        ]);
      }
    }

    // Validate rack exists if rack_id provided
    if (data.rack_id) {
      const rack = await rackRepository.findById(data.rack_id);
      if (!rack) {
        throw new AppError(400, 'Invalid rack ID', [
          { field: 'rack_id', message: `Rack with ID ${data.rack_id} does not exist` },
        ]);
      }
    }

    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new AppError(500, 'Failed to update equipment');
    }
    return updated;
  }

  async deleteEquipment(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError(404, `Equipment with ID ${id} not found`);
    }

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new AppError(500, 'Failed to delete equipment');
    }
  }

  async getEquipmentByRackId(rackId: number): Promise<Equipment[]> {
    // Verify rack exists first
    const rack = await rackRepository.findById(rackId);
    if (!rack) {
      throw new AppError(404, `Rack with ID ${rackId} not found`);
    }

    return await this.repository.findByRackId(rackId);
  }
  
}

export default new EquipmentService(equipmentRepository);