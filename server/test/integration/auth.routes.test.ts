import request from 'supertest';
import app from '../../src/server';
import { users } from '../../src/controllers/authController';
import bcrypt from 'bcryptjs';

describe('Auth Routes', () => {
  beforeEach(async () => {
    users.length = 0;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    users.push({
      id: 1,
      email: 'manager@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Manager',
      isManager: true,
      role: 'manager',
      createdAt: new Date()
    });
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
          isManager: false,
          managerId: 1,
          role: 'employee'
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      
      const newUser = users.find(u => u.email === 'newuser@example.com');
      expect(newUser).toBeDefined();
      expect(newUser?.firstName).toBe('New');
    });
    
    it('should return 400 for existing user', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          firstName: 'Duplicate',
          lastName: 'User',
          isManager: false,
          managerId: 1,
          role: 'employee'
        });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'newpassword',
          firstName: 'Another',
          lastName: 'User',
          isManager: false,
          managerId: 1,
          role: 'employee'
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });
  });
  
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      users.push({
        id: 2,
        email: 'testuser@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        isManager: false,
        managerId: 1,
        managerName: 'Test Manager',
        role: 'employee',
        createdAt: new Date()
      });
    });
    
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toHaveProperty('email', 'testuser@example.com');
    });
    
    it('should return 400 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongpassword'
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
  
  describe('GET /api/auth/me', () => {
    let token: string;
    
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      users.push({
        id: 2,
        email: 'testuser@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        isManager: false,
        managerId: 1,
        managerName: 'Test Manager',
        role: 'employee',
        createdAt: new Date()
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });
      
      token = response.body.accessToken;
    });
    
    it('should return the current user with a valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('email', 'testuser@example.com');
      expect(response.body).toHaveProperty('firstName', 'Test');
    });
    
    it('should return 401 with no token', async () => {
      const response = await request(app)
        .get('/api/auth/me');
      
      expect(response.statusCode).toBe(401);
    });
    
    it('should return 401 with an invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');
      
      expect(response.statusCode).toBe(401);
    });
  });
}); 