import  { useEffect, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { IUser, findAllUsers, findUser } from './userSlice';
import { Spinner } from '../../components/Spinner';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import useAlerts from '../../components/useAlerts';
import AlertContainer from '../../components/AlertContainer';
import { Link } from 'react-router-dom';
import UserDetail from './UserDetail'; // Import your new component

export const UserPage = () => {
    const dispatch = useAppDispatch();
    const { alerts, addAlert } = useAlerts();
    const { users, loading, error } = useSelector((state: RootState) => state.users);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [neededUser, setNeededUser] = useState<IUser | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                await dispatch(findAllUsers()).unwrap(); //Unwrap to catch errors
            } catch (err) {
                addAlert('error', 'Failed to load users');
            }
        };

        fetchUsers();
    }, [dispatch]);

    useEffect(() => {
        if (selectedUserId && Array.isArray(users)) {
            const user = users.find((user: IUser) => user._id === selectedUserId);
            setNeededUser(user || null);
        } else {
            setNeededUser(null);
        }
    }, [selectedUserId, users]);

    if (loading === 'pending') {
        return <Spinner />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!Array.isArray(users) || users.length === 0) {
        return <div>No users found!</div>;
    }

    const handleUserSelect = async () => {
      console.log('in handleUserSelect')
      if (selectedUserId) {
          try {
              await dispatch(findUser(selectedUserId)).unwrap();
          } catch (err) {
              addAlert('error', 'Failed to load user details');
          }
      }
    };

    return (
        <>
            <AlertContainer alerts={alerts} />
            <section className="container my-4">
                <h2 className="mb-3">Select User</h2>
                <div className="form-group mb-3">
                    <label htmlFor="userSelect">Choose a user:</label>
                    <select
                        id="userSelect"
                        className="form-control"
                        value={selectedUserId || ''}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                        <option value="">Select a user</option>
                        {users.map((user: IUser) => (
                            <option key={user._id} value={user._id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </div>
                <button style={{ display: 'none' }} onClick={handleUserSelect} className="btn btn-primary">
                    Load User Details
                </button>
                <p className="my-1">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
                <UserDetail user={neededUser} /> {/* Use the UserDetail component here */}
            </section>
        </>
    );
};