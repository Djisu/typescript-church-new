import React from 'react';
// import { Link } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { ThunkDispatch } from 'redux-thunk';

// interface IUser {
//   email: string;
//   isAdmin: boolean;
// }

// interface IProfile {
//   user: string
//   name: string
//   email: string
// }

// interface DashboardProps {
//   getCurrentProfile: () => void;
//   auth: AuthState;
//   profile: ProfileState;
// }

// Destructure props
const Dashboard: React.FC = () => {
  const username = localStorage.getItem('username')

  //console.log('username: ', username)

  // if (username) {
  //   return <div>Welcome {username}</div>
  // }
  //const dispatch: ThunkDispatch<RootState, unknown, any> = useDispatch();

  //const {profile, loading, error} = useSelector((state: RootState) => state.profile as ProfileState) 
  // const fetchUniqueSubjects = useSelector(
  //   (state: RootState) => state.fetchUniqueSubjects as FetchUniqueSubject[]
  // );

  // useEffect, call the action to run once
  // useEffect(() => {
  //   //console.log('in useEffect getCurrentProfile')

  //  // dispatch(getCurrentProfile());
  // }, []);

 

  // console.log('in dashboard')  profile.user ||
  //const userName = localStorage.getItem('name');

  //console.log('Fetched profile:; ', profile)

  // if (!profile){
  //   return <div>Profile not found!</div>
  // }

  // if (error){
  //   return <div>Error: error</div>
  // }

  // return loading && profile === null ? (
  //   <Spinner />
  // ) : (
  //   <Fragment>
  //     <h1 className="large text-primary" style={{ marginTop: '80px' }}>
  //       Dashboard
  //     </h1>
  //     <p className="lead">
  //       <i className="fas fa-user"></i>
  //       Welcome {userName}
  //     </p>
  //     {profile !== null ? (
  //       <Fragment>
  //         <DashboardActions />
  //       </Fragment>
  //     ) : (
  //       <Fragment>
  //         <p>You have not setup a profile, please add some info</p>
  //         <Link to="/create-profile" className="btn btn-primary my-1">
  //           Create Profile
  //         </Link>
  //       </Fragment>
  //     )}
  //   </Fragment>
  // );
  return (
    <div>
     {username}
    </div>
  )
};

export default Dashboard