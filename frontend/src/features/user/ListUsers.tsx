//import React from 'react'
import {  useEffect } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { useSelector } from 'react-redux'
import useAlerts from '../../components/useAlerts';
import AlertContainer from '../../components/AlertContainer';
import { findAllUsers } from './userSlice'
import { RootState } from '../../app/store'
import { Spinner } from '../../components/Spinner';


export const ListUsers = () => {
  const dispatch = useAppDispatch()
  const { alerts, addAlert } = useAlerts();
  const { users, loading, error } = useSelector((state: RootState) => state.users);

  console.log('in listusers!!!')

  useEffect(() => {
    const fetchUsers = async () => {
        try {
            await dispatch(findAllUsers()).unwrap(); //Unwrap to catch errors
        } catch (err) {
            addAlert('error', 'Failed to load users');
        }
    };

    fetchUsers();
}, [dispatch])

if (loading === 'pending') {
  return <Spinner />;
}

if (error) {
  return <div>Error: {error}</div>;
}

  if (!users.length) {
    return <div>No users found!</div>
  }

  return (
    <div>
    <AlertContainer alerts={alerts} />
    <table className="table table-success table-striped">
      <thead>
        <tr>
          <th scope="col">User Name</th>
          <th scope="col">Email</th>
          <th scope="col">Role</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user._id} className="table-active">
            <td>{user.username}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  )
}
