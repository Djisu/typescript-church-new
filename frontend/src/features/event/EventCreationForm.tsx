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
  <form onSubmit={handleSubmit} className="container mt-4">
    <h2>Create Event</h2>
    <div className="mb-3">
      <label htmlFor="title" className="form-label">Title:</label>
      <input
        type="text"
        name="title"
        id="title"
        className="form-control"
        value={eventData.title}
        onChange={handleChange}
        required
      />
    </div>
    <div className="mb-3">
      <label htmlFor="description" className="form-label">Description:</label>
      <textarea
        name="description"
        id="description"
        className="form-control"
        value={eventData.description}
        onChange={handleChange}
        required
      />
    </div>
    <div className="mb-3">
      <label htmlFor="startDate" className="form-label">Start Date:</label>
      <input
        type="datetime-local"
        name="startDate"
        id="startDate"
        className="form-control"
        value={formatDateToString(eventData.startDate)}
        onChange={handleChange}
        required
      />
    </div>
    <div className="mb-3">
      <label htmlFor="endDate" className="form-label">End Date:</label>
      <input
        type="datetime-local"
        name="endDate"
        id="endDate"
        className="form-control"
        value={formatDateToString(eventData.endDate)}
        onChange={handleChange}
        required
      />
    </div>
    <div className="mb-3">
      <label htmlFor="location" className="form-label">Location:</label>
      <input
        type="text"
        name="location"
        id="location"
        className="form-control"
        value={eventData.location}
        onChange={handleChange}
        required
      />
    </div>
    <button type="submit" className="btn btn-primary">Create Event</button>
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