import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
const jwt = require('jsonwebtoken');
import { User } from '../models/User';

export let users: User[] = [];

const initRootUser = async () => {
  if (users.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const rootUser: User = {
      id: 1,
      email: 'admin_prototype@employee.com',
      password: hashedPassword,
      firstName: 'prototype',
      lastName: 'admin',
      isManager: true,
      role: 'prototype admin',
      createdAt: new Date(),
      isPrototype: true
    };

    users.push(rootUser);
    console.log('Root user created');
  }
};

initRootUser();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1d';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, isManager, managerId, role } = req.body;

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (!managerId) {
      return res.status(400).json({ message: 'Manager ID is required' });
    }

    const manager = users.find(u => u.id === managerId);
    if (!manager) {
      return res.status(400).json({ message: 'Invalid manager ID' });
    }

    if (!manager.isManager) {
      return res.status(400).json({ message: 'Selected user is not a manager' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isManager: isManager || false,
      managerId,
      managerName: `${manager.firstName} ${manager.lastName}`,
      role,
      createdAt: new Date()
    };

    users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isManager: newUser.isManager,
        managerId: newUser.managerId,
        managerName: newUser.managerName,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isManager: user.isManager,
        managerId: user.managerId,
        managerName: user.managerName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCurrentUser = (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isManager: user.isManager,
      managerId: user.managerId,
      managerName: user.managerName,
      role: user.role,
      isPrototype: user.isPrototype
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getManagers = (req: Request, res: Response) => {
  try {
    const managers = users
      .filter(user => user.isManager)
      .map(manager => ({
        id: manager.id,
        name: `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || manager.email,
        email: manager.email
      }));

    res.json(managers);
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 