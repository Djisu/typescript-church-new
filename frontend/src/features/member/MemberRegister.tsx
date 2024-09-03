import React, { useRef, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { createMember } from './memberSlice';

export interface IMember {
  _id?: string; // Changed from ObjectId to string
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  membership_type: string;
  status: string;
  affiliated: string;
  joinedDate: Date;
  attendanceRecord: { date: Date; attended: boolean }[];
  tithes: { date: Date; amount: number }[];
  offerings: { date: Date; amount: number }[];
  smallGroups: string[]; // Changed from mongoose.Types.ObjectId[] to string[]
  ministries: string[]; // Changed from mongoose.Types.ObjectId[] to string[]
  createdAt: Date;
  updatedAt: Date;
}

const MemberRegister: React.FC = () => {
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useAppDispatch();

  const addAlert = (type: 'success' | 'error', message: string) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const firstName = (form.firstName as HTMLInputElement).value;
    const lastName = (form.lastName as HTMLInputElement).value;
    const email = (form.email as HTMLInputElement).value;
    const password = (form.password as HTMLInputElement).value;
    const confirmPassword = (form.confirmPassword as HTMLInputElement).value;

    // Validate passwords
    if (password !== confirmPassword) {
      addAlert('error', 'Passwords do not match');
      setPasswordError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      addAlert('error', 'Password must be at least 6 characters');
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    const userData:  Omit<IMember, '_id' | 'createdAt' | 'updatedAt'> = {
      firstName,
      lastName,
      email,
      password,
      status: 'pending_approval',
      phone: '',
      address: '',
      membership_type: '',
      affiliated: '',
      joinedDate: new Date(),
      attendanceRecord: [],
      tithes: [],
      offerings: [],
      smallGroups: [],
      ministries: []
    };

    try {
      const result = await dispatch(createMember(userData));

      if (createMember.rejected.match(result)) {
        addAlert('error', result.payload as string);
        setPasswordError(result.payload as string);
      } else {
        addAlert('success', 'Member registered successfully!');
        setPasswordError(null);
        formRef.current?.reset();
      }
    } catch (error) {
      addAlert('error', 'An error occurred during registration');
      setPasswordError('An error occurred during registration');
    }
  };

  return (
    <div>
      <h1>Member Registration</h1>
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className="mb-3">
          <label htmlFor="firstName" className="form-label">First Name:</label>
          <input type="text" id="firstName" className="form-control" name="firstName" required autoComplete="firstName" />
        </div>
        <div className="mb-3">
          <label htmlFor="lastName" className="form-label">Last Name:</label>
          <input type="text" id="lastName" className="form-control" name="lastName" required autoComplete="lastName"  />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email:</label>
          <input type="email" id="email" className="form-control" name="email" required autoComplete="email"  />
        </div>
        <div className="mb-3">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" className="form-control" name="password" required autoComplete="password"  />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword" className="form-control" name="confirmPassword" required autoComplete="confirmPassword"  />
          {passwordError && <div style={{ color: 'red' }}>{passwordError}</div>}
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  );
};

export default MemberRegister;