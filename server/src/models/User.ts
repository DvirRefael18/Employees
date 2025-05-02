export interface User {
  id: number;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isManager?: boolean;
  managerId?: number; 
  managerName?: string;
  role?: string;
  createdAt: Date;
} 