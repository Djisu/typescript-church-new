import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../app/hooks';
import '../../features/auth/Login.css'
import './Landing.css'


interface IProps {
  isAuthenticated: boolean;
}

const Landing: React.FC<IProps> = ({ isAuthenticated }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');

    if (isAuthenticated === 'true') {
      dispatch(logout());
    }
  }, [dispatch, isAuthenticated]);

  // if (isAuthenticated) {
  //   return <Navigate to="/dashboard" />;
  // }

  return (
    <section className="login-container landing-container">
      <div className="dark-overlay">
        <div className="landing-inner">
          <h1 className="x-large">ChurchSoft</h1>
          <p className="lead">Follow Jesus.</p>
          <div className="buttons">
            <Link to="/register" className="btn btn-primary">
              Sign Up
            </Link>
          </div>
          <div className="buttons">  
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const mapStateToProps = (state: { auth: { isAuthenticated: boolean } }) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(Landing);







