import { User } from '../../../domain/entities/user.entity';

export interface UserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: number, updates: Partial<User>): Promise<User>;
  delete(id: number): Promise<void>;
}