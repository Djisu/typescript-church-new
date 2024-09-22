import React, { useRef, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { IMember, createMember } from './memberSlice';

interface ChurchMember {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  membershipType: string;
  churchLocation: string;
  password: string;
  avatar?: File;
  status: 'pending_approval' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

interface MembeData extends Omit<ChurchMember, "_id" | "createdAt" | "updatedAt">, Omit<IMember, "_id" | "createdAt" | "updatedAt"> {
  joinedDate: Date;
  attendanceRecord: { date: Date; attended: boolean }[];
  tithes: { date: Date; amount: number }[];
  offerings: { date: Date; amount: number }[];
  smallGroups: string[]; // Changed to string[]
  ministries: string[]; // Changed to string[]
}

const MemberProfile: React.FC = () => {
  let [passwordError, setPasswordError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const addAlert = (type: 'success' | 'error', message: string) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const dispatch = useAppDispatch();

    const form = e.target as HTMLFormElement;

    const firstName = (form.firstName as HTMLInputElement)?.value;
    const lastName = (form.lastName as HTMLInputElement)?.value;
    const email = (form.email as HTMLInputElement)?.value;
    const phone = (form.phone as HTMLInputElement)?.value;
    const dob = (form.dob as HTMLInputElement)?.value;
    const address = (form.address as HTMLInputElement)?.value;
    const membershipType = (form.membershipType as HTMLSelectElement)?.value;
    const churchLocation = (form.churchLocation as HTMLSelectElement)?.value;
    const password = (form.password as HTMLInputElement)?.value;
    const confirmPassword = (form.confirmPassword as HTMLInputElement)?.value;
    const photo = form.photo as HTMLInputElement;

    // Compare passwords
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

    const userData: MembeData = {
      firstName,
      lastName,
      email,
      phone,
      dob,
      address,
      membershipType,
      churchLocation,
      password,
      avatar: photo.files?.[0],
      status: 'pending_approval',
      joinedDate: new Date('2023-01-01'),
      attendanceRecord: [
        { date: new Date('2023-01-01'), attended: true },
        { date: new Date('2023-01-08'), attended: false },
        { date: new Date('2023-01-15'), attended: true }
      ],
      tithes: [
        { date: new Date('2023-01-01'), amount: 100 },
        { date: new Date('2023-02-01'), amount: 200 },
        { date: new Date('2023-03-01'), amount: 300 }
      ],
      offerings: [
        { date: new Date('2023-01-15'), amount: 50 },
        { date: new Date('2023-02-15'), amount: 75 },
        { date: new Date('2023-03-15'), amount: 100 }
      ],
      smallGroups: ['6145f0b8c9e4d40e18c9e4d4', '6145f0b8c9e4d40e18c9e4d5'], // Changed to string[]
      ministries: ['6145f0b8c9e4d40e18c9e4d6', '6145f0b8c9e4d40e18c9e4d7'] // Changed to string[]
    };

    try {
      const data = await dispatch(createMember(userData));

      if (createMember.rejected.match(data)) {
        addAlert('error', data.payload as string);
        setPasswordError(data.payload as string);
      } else {
        addAlert('success', 'Church member registered successfully!');
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
      <h1>Church Member Registration</h1>
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className="mb-3">
          <label htmlFor="firstName" className="form-label">First Name:</label>
          <input type="text" id="firstName"  className="form-control"  name="firstName" required autoComplete="firstName"  />
        </div>
        <div className="mb-3">
          <label htmlFor="lastName" className="form-label">Last Name:</label>
          <input type="text" id="lastName"  className="form-control"   name="lastName" required autoComplete="lastName"   />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email:</label>
          <input type="email" id="email"  className="form-control"   name="email" required autoComplete="email"   />
        </div>
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Phone:</label>
          <input type="tel" id="phone"  className="form-control"   name="phone" required autoComplete="phone"   />
        </div>
        <div className="mb-3">
          <label htmlFor="dob" className="form-label">Date of Birth:</label>
          <input type="date" id="dob"  className="form-control"   name="dob" required autoComplete="dob"   />
        </div>
        <div className="mb-3">
          <label htmlFor="address" className="form-label">Address:</label>
          <input type="text" id="address"  className="form-control"   name="address" required autoComplete="address"   />
        </div>
        <div className="mb-3">
          <label htmlFor="membershipType" className="form-label">Membership Type:</label>
          <select id="membershipType" className="form-select"  name="membershipType" required>
            <option value="">Select membership type</option>
            <option value="Regular">Regular</option>
            <option value="Youth">Youth</option>
            <option value="Senior">Senior</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="churchLocation" className="form-label">Church Location:</label>
          <select id="churchLocation" className="form-select"  name="churchLocation" required autoComplete=""  >
            <option value="">Select church location</option>
            <option value="Location A">Location A</option>
            <option value="Location B">Location B</option>
            <option value="Location C">Location C</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password"  className="form-control"   name="password" required autoComplete=""   />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword"  className="form-control"   name="confirmPassword" required autoComplete=""   />
          {passwordError && <div style={{ color: 'red' }}>{passwordError}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="photo">Profile Picture:</label>
          <input type="file" id="photo"  className="form-control"   name="photo" accept="image/*" />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  );
};

export default MemberProfile;