import React, { useState } from 'react';
import { useAppDispatch } from '../../app/store';
import { IEvent, IMember } from '../../types'; // Import from shared 
import { registerMember } from './eventSlice';

interface MemberRegistrationFormProps {
  events: IEvent[];
  members: IMember[];
  onMemberRegistered: (registrationData: { memberId: string; eventId: string; registeredAt: string }) => void;
}

const MemberRegistrationForm: React.FC<MemberRegistrationFormProps> = ({ events, members, onMemberRegistered }) => {
  const dispatch = useAppDispatch();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [error, setError] = useState<string | null>(null); // To handle any errors

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEvent(e.target.value);
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMember(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const registrationData = {
      memberId: selectedMember,
      eventId: selectedEvent,
      registeredAt: new Date().toISOString(), // Set registeredAt to current date/time
    };

    try {
      // Dispatch the registerMember action
      const resultAction = await dispatch(registerMember(registrationData));

      if (registerMember.fulfilled.match(resultAction)) {
        // Call the onMemberRegistered prop function if the registration was successful
        onMemberRegistered(registrationData);
        // Reset form
        setSelectedEvent('');
        setSelectedMember('');
      } else {
        // Handle any errors here
        setError(resultAction.payload as string); // Assuming payload contains error message
      }
    } catch (err) {
      setError('Failed to register member.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register a Member for an Event</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error if any */}
      <div>
        <label>Select Event:</label>
        <select value={selectedEvent} onChange={handleEventChange} required>
          <option value="">--Select an Event--</option>
          {events.map((event) => (
            <option key={event._id} value={event._id}>{event.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Select Member:</label>
        <select value={selectedMember} onChange={handleMemberChange} required>
          <option value="">--Select a Member--</option>
          {members.map((member) => (
            <option key={member._id} value={member._id}>{member.userName}</option>
          ))}
        </select>
      </div>

      <button type="submit">Register Member</button>
    </form>
  );
};

export default MemberRegistrationForm;