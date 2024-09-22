import React from 'react';
import { IUser } from './userSlice';

interface UserDetailProps {
    user: IUser | null;
}

const UserDetail: React.FC<UserDetailProps> = ({ user }) => {
    if (!user) {
        return <p>No user found</p>;
    }

    return (
        <div className="card mt-4">
        <div className="card-header">
          <h5>{user.username}</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
            <div className="col-md-4 text-center">
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt="User Photo"
                  className="img-thumbnail"
                  style={{ width: '100px', height: '100px' }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
};

export default UserDetail;