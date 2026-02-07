/**
 * FleetRepository Unit Tests
 *
 * Tests for fleet database operations
 */

import { Test, TestingModule } from '@nestjs/testing';

import { FleetRepository } from './fleet.repository';
import type { Fleet, NewFleet } from '@repo/db';
import { eq, like } from 'drizzle-orm';

// Mock the db module
jest.mock('@repo/db', () => {
  const mockQueryBuilder = {
    from: jest.fn(function(this: any) { return this; }),
    where: jest.fn(function(this: any) { return this; }),
    values: jest.fn(function(this: any) { return this; }),
    set: jest.fn(function(this: any) { return this; }),
    limit: jest.fn(function(this: any) { return this; }),
    offset: jest.fn(function(this: any) { return this; }),
    returning: jest.fn(function(this: any) { return this; }),
    insert: jest.fn(function(this: any) { return this; }),
    update: jest.fn(function(this: any) { return this; }),
    delete: jest.fn(function(this: any) { return this; }),
    select: jest.fn(function(this: any) { return this; }),
  };

  // Make the query builder awaitable
  const makeAwaitable = (result: any) => {
    Object.defineProperty(mockQueryBuilder, 'then', {
      value: (resolve: (value: any) => void) => Promise.resolve(result).then(resolve),
    });
    return mockQueryBuilder;
  };

  const mockDb = {
    select: jest.fn(function(this: any) { return makeAwaitable([]); }),
    insert: jest.fn(function(this: any) { return makeAwaitable([]); }),
    update: jest.fn(function(this: any) { return makeAwaitable([]); }),
    delete: jest.fn(function(this: any) { return makeAwaitable(undefined); }),
  };

  const fleet = {
    id: 'mock_id',
    name: 'mock_name',
    code: 'mock_code',
    organization: 'mock_organization',
    description: 'mock_description',
    baseLocation: 'mock_baseLocation',
    contactInfo: 'mock_contactInfo',
    createdAt: 'mock_createdAt',
    updatedAt: 'mock_updatedAt',
  };

  return {
    db: mockDb,
    fleet,
  };
});

import { db, fleet } from '@repo/db';

describe('FleetRepository', () => {
  let repository: FleetRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [FleetRepository],
    }).compile();

    repository = module.get<FleetRepository>(FleetRepository);
  });

  describe('findById', () => {
    it('should return fleet when found', async () => {
      const mockFleet: Fleet = {
        id: 'fleet-1',
        name: 'Test Fleet',
        code: 'TF',
        organization: 'org-1',
        description: 'Test Description',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockFleet]),
        }),
      });

      const result = await repository.findById('fleet-1');

      expect(result).toEqual(mockFleet);
      expect(db.select).toHaveBeenCalled();
    });

    it('should return null when fleet not found', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByCode', () => {
    it('should return fleet when code matches', async () => {
      const mockFleet: Fleet = {
        id: 'fleet-1',
        name: 'Test Fleet',
        code: 'TF',
        organization: 'org-1',
        description: 'Test Description',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockFleet]),
        }),
      });

      const result = await repository.findByCode('TF');

      expect(result).toEqual(mockFleet);
    });

    it('should return null when code not found', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await repository.findByCode('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return new fleet', async () => {
      const newFleet: NewFleet = {
        name: 'New Fleet',
        code: 'NF',
        organization: 'org-1',
        description: 'New Description',
      };

      const createdFleet: Fleet = {
        id: 'fleet-2',
        name: newFleet.name,
        code: newFleet.code,
        organization: newFleet.organization,
        description: newFleet.description ?? null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdFleet]),
        }),
      });

      const result = await repository.create(newFleet);

      expect(result).toEqual(createdFleet);
      expect(db.insert).toHaveBeenCalledWith(fleet);
    });

    it('should throw error when creation fails', async () => {
      const newFleet: NewFleet = {
        name: 'New Fleet',
        code: 'NF',
        organization: 'org-1',
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(repository.create(newFleet)).rejects.toThrow('Failed to create fleet');
    });
  });

  describe('update', () => {
    it('should update and return fleet', async () => {
      const updateData = { name: 'Updated Fleet' };
      const updatedFleet: Fleet = {
        id: 'fleet-1',
        name: 'Updated Fleet',
        code: 'TF',
        organization: 'org-1',
        description: 'Test Description',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedFleet]),
          }),
        }),
      });

      const result = await repository.update('fleet-1', updateData);

      expect(result).toEqual(updatedFleet);
      expect(db.update).toHaveBeenCalledWith(fleet);
    });

    it('should throw error when fleet not found for update', async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(repository.update('non-existent', { name: 'Updated' }))
        .rejects.toThrow('Fleet with id non-existent not found');
    });
  });

  describe('delete', () => {
    it('should delete fleet', async () => {
      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });

      await expect(repository.delete('fleet-1')).resolves.toBeUndefined();
      expect(db.delete).toHaveBeenCalledWith(fleet);
    });
  });

  describe('list', () => {
    it('should return list of fleets with default pagination', async () => {
      const mockFleets: Fleet[] = [
        {
          id: 'fleet-1',
          name: 'Fleet 1',
          code: 'F1',
          organization: 'org-1',
          description: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'fleet-2',
          name: 'Fleet 2',
          code: 'F2',
          organization: 'org-1',
          description: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            offset: jest.fn().mockResolvedValue(mockFleets),
          }),
        }),
      });

      const result = await repository.list();

      expect(result).toEqual(mockFleets);
    });

    it('should use custom limit and offset', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            offset: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await repository.list(10, 5);

      expect(db.select).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should return fleets matching search query', async () => {
      const mockFleets: Fleet[] = [
        {
          id: 'fleet-1',
          name: 'Test Fleet',
          code: 'TF',
          organization: 'org-1',
          description: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockFleets),
          }),
        }),
      });

      const result = await repository.search('Test');

      expect(result).toEqual(mockFleets);
    });

    it('should use custom limit', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await repository.search('Test', 20);

      expect(db.select).toHaveBeenCalled();
    });
  });
});
