import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../app/store'; 
import { IEvent, createEvent } from './eventSlice'; // Adjust the import path as necessary
import styled from 'styled-components';
import { RootState } from '../../app/store'; // Adjust the import path for RootState
import { useAppDispatch } from '../../app/hooks';

const FormContainer = styled.div`
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  text-align: center;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

interface EventData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
}

const EventForm: React.FC = () => {
  //const dispatch = useDispatch();
  const dispatch = useAppDispatch();

  const { loading, error } = useSelector((state: RootState) => state.events); // Access loading and error from the state

  const [eventData, setEventData] = useState<EventData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData({
      ...eventData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prepare new event data, ensuring startDate and endDate are Date objects
    const newEventData: Omit<IEvent, '_id' | 'createdAt' | 'updatedAt'> = {
      title: eventData.title || 'Untitled Event',
      description: eventData.description || '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 3600 * 1000),
      location: eventData.location || 'TBD',
      registrations: [],
    };
    
    // Dispatch the action
    try {
      await dispatch(createEvent(newEventData)).unwrap(); // Use unwrap to handle the result
    } catch (error) {
      console.error("Failed to create event:", error);
    }
    
    
    // Reset form after dispatch
    setEventData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
    });
  };

  return (
    <FormContainer>
      <FormTitle>Create Event</FormTitle>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error if any */}
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Title</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={eventData.title}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="description">Description</Label>
          <TextArea
            id="description"
            name="description"
            value={eventData.description}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            type="datetime-local"
            id="startDate"
            name="startDate"
            value={eventData.startDate}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            type="datetime-local"
            id="endDate"
            name="endDate"
            value={eventData.endDate}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="location">Location</Label>
          <Input
            type="text"
            id="location"
            name="location"
            value={eventData.location}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Event'}
        </Button>
      </form>
    </FormContainer>
  );
};

export default EventForm;