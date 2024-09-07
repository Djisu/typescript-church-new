import React, { useRef, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { createMember } from './memberSlice';

export interface IMember {
  username: string;
  _id?: string;
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
  smallGroups: string[];
  ministries: string[];
  createdAt: Date;
  updatedAt: Date;
  verificationToken: string;
}

const MemberRegister: React.FC = () => {
  const [step, setStep] = useState(1);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [userData, setUserData] = useState<Omit<IMember, '_id' | 'createdAt' | 'updatedAt'>>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    membership_type: '',
    status: '',
    affiliated: '',
    joinedDate: new Date(),
    attendanceRecord: [],
    tithes: [],
    offerings: [],
    smallGroups: [],
    ministries: [],
    verificationToken: ''
  });
  
  const dispatch = useAppDispatch();
  const formRef = useRef<HTMLFormElement>(null);

  const addAlert = (type: 'success' | 'error', message: string) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const handleInitialSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    // Set userData from form fields
    setUserData((prevData) => ({
      ...prevData,
      username: (form.username as HTMLInputElement).value,
      firstName: (form.firstName as HTMLInputElement).value,
      lastName: (form.lastName as HTMLInputElement).value,
      email: (form.email as HTMLInputElement).value,
      password: (form.password as HTMLInputElement).value,
    }));

    // Move to the next step
    setStep(2);
  };

  const handleCompleteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const phone = (form.phone as HTMLInputElement).value;
    const address = (form.address as HTMLInputElement).value;
    const membership_type = (form.membership_type as HTMLSelectElement).value;
    const affiliated = (form.affiliated as HTMLInputElement).value;

    const finalData = {
      ...userData,
      phone,
      address,
      membership_type,
      affiliated,
      status: 'pending_approval',
      joinedDate: new Date(),

    };

    try {
      const result = await dispatch(createMember(finalData));

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
      {step === 1 ? (
        <form onSubmit={handleInitialSubmit} ref={formRef}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">User Name:</label>
          <input type="text" id="username" className="form-control" name="username" required autoComplete="username" />
        </div>
          <div className="mb-3">
            <label htmlFor="firstName" className="form-label">First Name:</label>
            <input type="text" id="firstName" className="form-control" name="firstName" required autoComplete="firstName" />
          </div>
          <div className="mb-3">
            <label htmlFor="lastName" className="form-label">Last Name:</label>
            <input type="text" id="lastName" className="form-control" name="lastName" required autoComplete="lastName" />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email:</label>
            <input type="email" id="email" className="form-control" name="email" required autoComplete="email" />
          </div>
          <div className="mb-3">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" className="form-control" name="password" required autoComplete="password" />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input type="password" id="confirmPassword" className="form-control" name="confirmPassword" required autoComplete="confirmPassword" />
            {passwordError && <div style={{ color: 'red' }}>{passwordError}</div>}
          </div>
          <button type="submit" className="btn btn-primary">Next</button>
        </form>
      ) : (
        <form onSubmit={handleCompleteSubmit} ref={formRef}>
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">Phone:</label>
            <input type="text" id="phone" className="form-control" name="phone" required autoComplete="phone" />
          </div>
          <div className="mb-3">
            <label htmlFor="address" className="form-label">Address:</label>
            <input type="text" id="address" className="form-control" name="address" required autoComplete="address" />
          </div>
          <div className="mb-3">
            <label htmlFor="membership_type" className="form-label">Membership Type:</label>
            <select id="membership_type" className="form-control" name="membership_type" required>
              <option value="">Select Membership Type</option>
              <option value="regular member">Regular Member</option>
              <option value="youth member">Youth Member</option>
              <option value="senior member">Senior Member</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="affiliated" className="form-label">Affiliated:</label>
            <input type="text" id="affiliated" className="form-control" name="affiliated" required autoComplete="affiliated" />
          </div>
          <button type="submit" className="btn btn-primary">Complete Registration</button>
        </form>
      )}
    </div>
  );
};

export default MemberRegister;