// src/types.ts
export interface IEvent {
    _id: string; // Ensure _id is included
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    registrations: { memberId: string; registeredAt: Date }[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface IMember {
    _id?: string;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    address: string;
    membership_type: string;
    status?: string;
    affiliated: string;
    joinedDate?: Date;
    attendanceRecord?: { date: Date; attended: boolean }[];
    tithes?: { date: Date; amount: number }[];
    offerings?: { date: Date; amount: number }[];
    smallGroups?: string[];
    ministries?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }