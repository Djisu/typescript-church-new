import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../app/store';
import { RootState } from '../../app/store';
import { IEvent } from '../../types';
import { deleteEvent, searchEvents } from './eventSlice';

export const ListEvents: React.FC = () => {
  console.log('in ListEvents');

  const dispatch = useAppDispatch();
  const events = useSelector((state: RootState) => state.events.events);
  const [localEvents, setLocalEvents] = useState<IEvent[]>([]);

  // Fetch events on initial mount
  useEffect(() => {
    console.log('Fetching events');
    dispatch(searchEvents());
  }, [dispatch]); // Only run on mount

  // Update local events when Redux state changes
  useEffect(() => {
    if (events) {
      setLocalEvents(events);
    }
  }, [events]); // This is fine to run when events change

  const handleDelete = async (eventId: string) => {
    try {
      await dispatch(deleteEvent(eventId)).unwrap(); // Use unwrap for better error handling
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString(); // Format date to a readable string
  };

  return (
    <div>
      <table className="table table-success table-striped">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Start Date</th>
            <th scope="col">End Date</th>
            <th scope="col">Location</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {localEvents.length > 0 ? (
            localEvents.map(event => (
              <tr key={event._id} className="table-active">
                <td>{event.title}</td>
                <td>{formatDate(event.startDate)}</td>
                <td>{formatDate(event.endDate)}</td>
                <td>{event.location}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(event._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">No events found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};