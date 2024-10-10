import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { findAllMembers, updateMember } from './memberSlice';
import { IMember } from './memberSlice';

// interface ChurchMember {
//   id?: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   address: string;
//   membership_type: string;
//   affiliated: string;
//   password: string;
//   role: string;
//   avatar?: File;
//   status: 'pending_approval' | 'approved' | 'rejected';
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface IMemberNew {
//   username: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   dob: string;
//   address: string;
//   membershipType: string;
//   affiliated: string;
//   password: string;
//   confirmPassword: string;
//   role: string;
//   avatar: string;
// }

// const password = (form.password as HTMLInputElement)?.value || '';
// const role = (form.role as HTMLInputElement | null)?.value || 'Member'; // Defaulting to 'Member'
// const confirmPassword = (form.confirmPassword as HTMLInputElement)?.value || '';
// const photo = form.photo as HTMLInputElement;

// interface MembeData extends Omit<ChurchMember, "_id" | "createdAt" | "updatedAt">, Omit<IMember, "_id" | "createdAt" | "updatedAt"> {
//   username: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   role: string;
//   phone: string;
//   address: string;
//   membership_type: string;
//   status: string;
//   affiliated: string; 
//   avatar: string
// }

const MemberProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  let [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  let [members, setMembers] = useState<IMember[] | null>(null);
  let [neededMember, setNeededMember] = useState<IMember | null>(null);
  let [passwordError, setPasswordError] = useState<string | null>(null);

  let [userName, setUserName] = useState<string>('');
  let [firstName, setFirstName] = useState<string>('');
  let [lastName, setLastName] = useState<string>('');
  let [email, setEmail] = useState<string>('');
  let [password, setPassword] = useState<string>('');
  let [phone, setPhone] = useState<string>('');
  let [address, setAddress] = useState<string>('');
  let [membershipType, setMembershipType] = useState<string>('');
  let [affiliated, setAffiliated] = useState<string>('');
  let formRef = useRef<HTMLFormElement>(null);

  // Function to seek member details
  const seekMember = () => {
    if (selectedMemberId) {
      const member = members?.find((member: IMember) => member._id === selectedMemberId);
      if (member) {
        userName = member.username || ''
        setUserName(userName);

        firstName = member.firstName || ''
        setFirstName(firstName);

        lastName = member.lastName || ''
        setLastName(lastName);

        email = member.email || ''
        setEmail(email);

        phone = member.phone || ''
        setPhone(phone);

        address = member.address || ''
        setAddress(address);

        membershipType = member.membership_type || ''
        setMembershipType(membershipType);

        affiliated = member.affiliated || ''
        setAffiliated(affiliated);

        password = member.password || ''
        setPassword(password);

        addAlert('success', `Selected member: ${member.email}`);
      } else {
        addAlert('error', 'Member not found');
      }
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        members = await dispatch(findAllMembers()).unwrap(); // Unwrap to catch errors
       
        setMembers(members);
      } catch (err) {
        addAlert('error', 'Failed to load users');
      }
    };

    fetchUsers();
  }, [dispatch]);

  useEffect(() => {
    if (selectedMemberId && Array.isArray(members)) {
      const member = members.find((member: IMember) => member._id === selectedMemberId);
      neededMember = member || null;
      setNeededMember(neededMember || null);
    } else {
      setNeededMember(null);
    }
  }, [selectedMemberId, members]);

  const addAlert = (type: 'success' | 'error', message: string) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    const username = (form.username as HTMLInputElement)?.value || '';
    const firstName = (form.firstName as HTMLInputElement)?.value || '';
    const lastName = (form.lastName as HTMLInputElement)?.value || '';
    const email = (form.email as HTMLInputElement)?.value || '';
    const phone = (form.phone as HTMLInputElement)?.value || '';
    const address = (form.address as HTMLInputElement)?.value || '';
    const membership_type = (form.membershipType as HTMLSelectElement)?.value || '';
    const affiliated = (form.affiliated as HTMLSelectElement)?.value || '';
    const password = (form.password as HTMLInputElement)?.value || '';
    const role = (form.role as HTMLInputElement | null)?.value || 'Member'; // Defaulting to 'Member'
    const confirmPassword = (form.confirmPassword as HTMLInputElement)?.value || '';

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

    const memberData: IMember = {
      username,
      firstName,
      lastName,
      email,
      phone,
      address,
      membership_type,
      affiliated,
      password,
      role,
    };

    if (!selectedMemberId) {
      console.error('Member ID is required');
      return; // Handle the error or show a message
    }
    try {
      const data = await dispatch(updateMember({ id: selectedMemberId, data: memberData }));

      if (updateMember.rejected.match(data)) {
        addAlert('error', data.payload as string);
        setPasswordError(data.payload as string);
      } else {
        addAlert('success', 'Church member updated successfully!');
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
        <h2 className="mb-3">Select User</h2>
        <div className="form-group mb-3">
          <label htmlFor="userSelect">Choose a member:</label>
          <select
            id="userSelect"
            className="form-control"
            value={selectedMemberId || ''}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            onBlur={seekMember} // Call seekMember on blur
          >
            <option value="">Select a member</option>
            {members && members.map((member: IMember) => (
              <option key={member._id} value={member._id}>
                {member.username}
              </option>
            ))}
          </select>
        </div>
        {/* username: string;
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        role: string;
        phone: string;
        address: string;
        membership_type: string;
        status: string;
        affiliated: string; 
        photo: string */}
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
          <input type="password" id="password" className="form-control" name="password" required autoComplete="" />
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword" className="form-control" name="confirmPassword" required autoComplete="" />
          {passwordError && <div style={{ color: 'red' }}>{passwordError}</div>}
        </div>

        <div className="mb-3">
          <input type="hidden" id="role" className="form-control" name="role" value="Member" required />
        </div>

        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Phone:</label>
          <input type="tel" id="phone" className="form-control" name="phone" required autoComplete="phone" />
        </div>
        
        <div className="mb-3">
          <label htmlFor="address" className="form-label">Address:</label>
          <input type="text" id="address" className="form-control" name="address" required autoComplete="address" />
        </div>

        <div className="mb-3">
          <label htmlFor="membershipType" className="form-label">Membership Type:</label>
          <select id="membershipType" className="form-select" name="membershipType" required>
            <option value="">Select membership type</option>
            <option value="Regular">Regular</option>
            <option value="Youth">Youth</option>
            <option value="Senior">Senior</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="affiliated" className="form-label">Church Branch:</label>
          <select id="affiliated" className="form-select" name="affiliated" required>
            <option value="">Select church branch</option>
            <option value="Location A">Location A</option>
            <option value="Location B">Location B</option>
            <option value="Location C">Location C</option>
          </select>
        </div>
      
        <button type="submit" className="btn btn-primary">Change Profile</button>
      </form>
    </div>
  );
};

export default MemberProfile;