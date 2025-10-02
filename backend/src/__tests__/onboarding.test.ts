import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index';

describe('Onboarding API', () => {
  const testOnboarding = {
    employeeNumber: 'TEST001',
    fullName: 'Test User',
    department: 'Testing',
    startDate: '2024-01-01',
    softwareRequirements: ['email', 'teams'],
    otherSoftware: ''
  };

  describe('POST /api/onboardings', () => {
    it('should create a new onboarding', async () => {
      const response = await request(app)
        .post('/api/onboardings')
        .send(testOnboarding)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.employeeNumber).toBe(testOnboarding.employeeNumber);
      expect(response.body.data.fullName).toBe(testOnboarding.fullName);
    });

    it('should return error for invalid data', async () => {
      const invalidData = {
        employeeNumber: 'AB', // Too short
        fullName: '', // Empty
        department: 'Test',
        startDate: '2024-01-01',
        softwareRequirements: []
      };

      const response = await request(app)
        .post('/api/onboardings')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return error for duplicate employee number', async () => {
      // First create
      await request(app)
        .post('/api/onboardings')
        .send(testOnboarding);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/onboardings')
        .send(testOnboarding)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('GET /api/onboardings', () => {
    it('should return list of onboardings', async () => {
      const response = await request(app)
        .get('/api/onboardings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter by department', async () => {
      const response = await request(app)
        .get('/api/onboardings?department=Testing')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should only return Testing department onboardings
      response.body.data.forEach((onboarding: any) => {
        expect(onboarding.department).toBe('Testing');
      });
    });
  });

  describe('GET /api/onboardings/:employeeNumber', () => {
    it('should return specific onboarding', async () => {
      const response = await request(app)
        .get(`/api/onboardings/${testOnboarding.employeeNumber}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.employeeNumber).toBe(testOnboarding.employeeNumber);
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await request(app)
        .get('/api/onboardings/NONEXISTENT')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PUT /api/onboardings/:employeeNumber', () => {
    it('should update onboarding', async () => {
      const updateData = {
        fullName: 'Updated Test User',
        department: 'Updated Testing'
      };

      const response = await request(app)
        .put(`/api/onboardings/${testOnboarding.employeeNumber}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.fullName).toBe(updateData.fullName);
      expect(response.body.data.department).toBe(updateData.department);
    });
  });

  describe('DELETE /api/onboardings/:employeeNumber', () => {
    it('should delete onboarding', async () => {
      const response = await request(app)
        .delete(`/api/onboardings/${testOnboarding.employeeNumber}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });
  });

  describe('GET /api/software-catalog', () => {
    it('should return software catalog', async () => {
      const response = await request(app)
        .get('/api/software-catalog')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});






