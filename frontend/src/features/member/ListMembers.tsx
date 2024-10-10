import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { findAllMembers } from "./memberSlice";
import { RootState } from '../../app/store';
import { useAppDispatch } from '../../app/hooks';
import { Spinner } from '../../components/Spinner';

const ListMembers = () => {
  const dispatch = useAppDispatch();
  const { members, loading, error } = useSelector((state: RootState) => state.members);
  const [message, setMessage] = useState<string | null>(null);
  const [errorx, setErrorx] = useState<string | null>(null);

  useEffect(() => {
    setMessage(null);

    const fetchMembers = async () => {
      try {
        await dispatch(findAllMembers()).unwrap();
        
        setMessage('Members fetched');
      } catch (error: any) {
        setErrorx('Failed to load users');
      }
    };
    fetchMembers();
  }, [dispatch]);

  useEffect(() => {
    if (!loading && members.length === 0) {
      setMessage('No members found!');
    }
  }, [loading, members.length]);

  if (loading === 'pending') {
    return <Spinner />;
  }

  if (errorx) {
    return <div>Error: {errorx}</div>;
  }

  return (
    <div>
      List Members
      <table className="table table-success table-striped">
        <thead>
          <tr>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">Email</th>
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr key={member._id} className="table-active">
              <td>{member.firstName}</td>
              <td>{member.lastName}</td>
              <td>{member.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ListMembers;