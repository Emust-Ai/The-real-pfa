import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let prisma: any;

  const mockPrisma = {
    property: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated properties', async () => {
      const mockData = [{ id: 1, title: 'Test', price: 100000 }];
      mockPrisma.property.findMany.mockResolvedValue(mockData);
      mockPrisma.property.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 12 });

      expect(result).toEqual({
        data: mockData,
        meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
      });
      expect(mockPrisma.property.findMany).toHaveBeenCalled();
      expect(mockPrisma.property.count).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a property', async () => {
      const mockProperty = { id: 1, title: 'Test', price: 100000, retailer: {}, _count: { favorites: 0, inquiries: 0 } };
      mockPrisma.property.findUnique.mockResolvedValue(mockProperty);

      const result = await service.findOne(1);
      expect(result).toEqual(mockProperty);
    });

    it('should throw NotFoundException when property not found', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a property', async () => {
      const dto = { title: 'New Property', price: 200000 };
      const mockProperty = { id: 1, ...dto, retailerId: 1, retailer: {} };
      mockPrisma.property.create.mockResolvedValue(mockProperty);

      const result = await service.create(dto as any, 1);
      expect(result).toEqual(mockProperty);
      expect(mockPrisma.property.create).toHaveBeenCalledWith({
        data: { ...dto, price: dto.price, retailerId: 1 },
        include: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should update own property', async () => {
      const mockProperty = { id: 1, retailerId: 1, title: 'Old' };
      mockPrisma.property.findUnique.mockResolvedValue(mockProperty);
      mockPrisma.property.update.mockResolvedValue({ ...mockProperty, title: 'Updated' });

      const result = await service.update(1, { title: 'Updated' }, 1, 'RETAILER');
      expect(result.title).toBe('Updated');
    });

    it('should throw ForbiddenException for non-owner non-admin', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({ id: 1, retailerId: 1 });
      await expect(service.update(1, { title: 'Hack' }, 2, 'CLIENT')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete own property', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({ id: 1, retailerId: 1 });
      mockPrisma.property.delete.mockResolvedValue({ id: 1 });
      await expect(service.remove(1, 1, 'RETAILER')).resolves.toBeUndefined();
      expect(mockPrisma.property.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw ForbiddenException for non-owner non-admin', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({ id: 1, retailerId: 1 });
      await expect(service.remove(1, 2, 'CLIENT')).rejects.toThrow(ForbiddenException);
    });
  });
});
