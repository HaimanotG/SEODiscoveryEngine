import { Domain } from '../../../domain/entities/domain.entity';

export interface DomainRepository {
  findById(id: number): Promise<Domain | null>;
  findByName(name: string): Promise<Domain | null>;
  findByZoneId(zoneId: string): Promise<Domain | null>;
  findByUserId(userId: number): Promise<Domain[]>;
  save(domain: Omit<Domain, 'id' | 'createdAt' | 'updatedAt'>): Promise<Domain>;
  update(id: number, updates: Partial<Domain>): Promise<Domain>;
  delete(id: number): Promise<void>;
}