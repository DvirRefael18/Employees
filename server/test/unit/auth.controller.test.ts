import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { login, register, getCurrentUser, users } from '../../src/controllers/authController';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

describe('Auth Controller', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  
  beforeEach(() => {
    users.length = 0;
    
    users.push({
      id: 1,
      email: 'admin_prototype@employee.com',
      password: 'hashed_password',
      firstName: 'prototype',
      lastName: 'admin',
      isManager: true,
      role: 'prototype admin',
      createdAt: new Date(),
      isPrototype: true
    });
    
    req = {
      body: {},
      user: undefined
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis()
    };
    
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    
    (jwt.sign as jest.Mock).mockReturnValue('test_token');
  });
  
  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        isManager: false,
        managerId: 1,
        role: 'employee'
      };
      
      await register(req as Request, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'test_token',
          user: expect.objectContaining({
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User'
          })
        })
      );
      
      expect(users).toHaveLength(2);
      expect(users[1].email).toBe('test@example.com');
    });
    
    it('should return 400 if user already exists', async () => {
      users.push({
        id: 2,
        email: 'existing@example.com',
        password: 'hashed_password',
        firstName: 'Existing',
        lastName: 'User',
        isManager: false,
        managerId: 1,
        role: 'employee',
        createdAt: new Date()
      });
      
      req.body = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        isManager: false,
        managerId: 1,
        role: 'employee'
      };
      
      await register(req as Request, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User already exists'
        })
      );
    });
    
    it('should return 400 if managerId is not provided', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        isManager: false,
        role: 'employee'
      };
      
      await register(req as Request, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Manager ID is required'
        })
      );
    });
  });
  
  describe('login', () => {
    beforeEach(() => {
      users.push({
        id: 2,
        email: 'test@example.com',
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        isManager: false,
        managerId: 1,
        role: 'employee',
        createdAt: new Date()
      });
    });
    
    it('should login a user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      await login(req as Request, res as Response);
      
      expect(res.cookie).toHaveBeenCalled();
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: expect.any(String),
          user: expect.objectContaining({
            email: 'test@example.com'
          })
        })
      );
    });
    
    it('should return 400 for invalid credentials', async () => {
      req.body = {
        email: 'wrong@example.com',
        password: 'password123'
      };
      
      await login(req as Request, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid credentials'
        })
      );
    });
    
    it('should return 400 for incorrect password', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      
      await login(req as Request, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid credentials'
        })
      );
    });
  });
  
  describe('getCurrentUser', () => {
    beforeEach(() => {
      users.push({
        id: 2,
        email: 'test@example.com',
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        isManager: false,
        managerId: 1,
        managerName: 'Admin User',
        role: 'employee',
        createdAt: new Date()
      });
    });
    
    it('should return the current user', async () => {
      req.user = { id: 2, email: 'test@example.com' };
      
      await getCurrentUser(req as Request, res as Response);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 2,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        })
      );
    });
    
    it('should return 404 if user not found', async () => {
      req.user = { id: 999, email: 'nonexistent@example.com' };
      
      await getCurrentUser(req as Request, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found'
        })
      );
    });
  });
}); 