import React, { useState } from 'react';
import { useAppDispatch } from '../../app/store';
import { IEvent } from '../../types'; // Import from shared types
import { createEvent } from './eventSlice';

interface EventCreationFormProps {
  onEventCreated: (eventData: IEvent) => void;
}

const EventCreationForm: React.FC<EventCreationFormProps> = ({ onEventCreated }) => {
  const dispatch = useAppDispatch();

  const [eventData, setEventData] = useState<IEvent>({
    _id: '',
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    location: '',
    registrations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Function to format Date to string for input
  const formatDateToString = (date: Date) => {
    return date.toISOString().slice(0, 16); // Format to YYYY-MM-DDTHH:MM
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData((prevData) => ({
      ...prevData,
      [name]: name === 'startDate' || name === 'endDate' ? new Date(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onEventCreated(eventData);
    
    // Prepare the event data for dispatching
    const eventDataToDispatch: Omit<IEvent, "_id" | "createdAt" | "updatedAt"> = {
      title: eventData.title,
      description: eventData.description,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      location: eventData.location,
      registrations: [],
    };

    console.log('Event Created:', eventDataToDispatch);
    
    // Dispatch the createEvent action
    dispatch(createEvent(eventDataToDispatch)); // Should work without error now

    // Reset the form fields
    resetForm();
  };

  const resetForm = () => {
    setEventData({
      _id: '',
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      location: '',
      registrations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input type="text" name="title" value={eventData.title} onChange={handleChange} required />
      </div>
      <div>
        <label>Description:</label>
        <textarea name="description" value={eventData.description} onChange={handleChange} required />
      </div>
      <div>
        <label>Start Date:</label>
        <input type="datetime-local" name="startDate" value={formatDateToString(eventData.startDate)} onChange={handleChange} required />
      </div>
      <div>
        <label>End Date:</label>
        <input type="datetime-local" name="endDate" value={formatDateToString(eventData.endDate)} onChange={handleChange} required />
      </div>
      <div>
        <label>Location:</label>
        <input type="text" name="location" value={eventData.location} onChange={handleChange} required />
      </div>
      <button type="submit">Create Event</button>
    </form>
  );
};

export default EventCreationForm;






// import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { IEvent } from '../../types'; // Import from shared types
// import { createEvent } from './eventSlice';


// interface EventCreationFormProps {
//   onEventCreated: (eventData: IEvent) => void;
// }

// const EventCreationForm: React.FC<EventCreationFormProps> = ({ onEventCreated }) => {
//   const dispatch = useDispatch();

//   const [eventData, setEventData] = useState<IEvent>({
//     _id: '', 
//     title: '',
//     description: '',
//     startDate: new Date(),
//     endDate: new Date(),
//     location: '',
//     registrations: [],
//     createdAt: new Date(), 
//     updatedAt: new Date()
//   });

//   // Function to format Date to string for input
//   const formatDateToString = (date: Date) => {
//     return date.toISOString().slice(0, 16); // Format to YYYY-MM-DDTHH:MM
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setEventData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     onEventCreated(eventData);

//     // Prepare the event data for dispatching
//     const eventDataToDispatch: Omit<IEvent, "_id" | "createdAt" | "updatedAt"> = {
//       title: eventData.title,
//       description: eventData.description,
//       startDate: eventData.startDate,
//       endDate: eventData.endDate,
//       location: eventData.location,
//       registrations: [], // Start with no registrations
//     };

//     // Log the event data
//     console.log('Event Created:', eventDataToDispatch);
    
//     // Dispatch the createEvent action
//     dispatch(createEvent(eventDataToDispatch));

//     // Reset the form fields
//     resetForm();
//   };

// // Helper function to reset form fields
// const resetForm = () => {
//   setEventData({
//     _id: '',
//     title: '',
//     description: '',
//     startDate: new Date(),
//     endDate: new Date(),
//     location: '',
//     registrations: [],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   });
// };

//   return (
//     <form onSubmit={handleSubmit}>
//       <div>
//         <label>Title:</label>
//         <input type="text" name="title" value={eventData.title} onChange={handleChange} required />
//       </div>
//       <div>
//         <label>Description:</label>
//         <textarea name="description" value={eventData.description} onChange={handleChange} required />
//       </div>
//       <div>
//         <label>Start Date:</label>
//         <input type="datetime-local" name="startDate" value={formatDateToString(eventData.startDate)} onChange={handleChange} required />
//       </div>
//       <div>
//         <label>End Date:</label>
//         <input type="datetime-local" name="endDate" value={formatDateToString(eventData.endDate)} onChange={handleChange} required />
//       </div>
//       <div>
//         <label>Location:</label>
//         <input type="text" name="location" value={eventData.location} onChange={handleChange} required />
//       </div>
//       <button type="submit">Create Event</button>
//     </form>
//   );
// };

// export default EventCreationForm;