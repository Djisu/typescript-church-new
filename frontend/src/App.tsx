import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { NavigationBar } from './components/layout/NavigationBar';
import Dashboard from './components/layout/Dashboard';
import { Login } from './features/auth/Login';
import { UserPage } from './features/user/UserPage';
import { ListUsers } from './features/user/ListUsers';
import Landing from './components/layout/Landing';
import Register from './features/auth/Register';
import NoPage from './components/layout/NoPage';

import Users from './features/user/Users';
import EventCreationForm from './features/event/EventCreationForm';
import MemberRegistrationForm from './features/event/MemberRegistrationForm';

import MemberRegister from './features/member/MemberRegister';
import MemberProfile from './features/member/MemberProfile';
import ListMembers from './features/member/ListMembers';
import {ListEvents} from './features/event/ListEvents';
import MemberDetail from './features/member/MemberDetail';
import { MemberLogin } from './features/member/MemberLogin';
import { MemberRequestPasswordReset } from './features/member/MemberRequestPasswordReset';
import { MemberResetPassword } from './features/member/MemberResetPassword';

import RequestPasswordReset from './features/auth/RequestPasswordReset';
import ResetPassword from './features/auth/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import VerifyEmail from './features/member/VerifyEmail';
import { IEvent } from './types'; // Import from shared types
import './index.css';
import { useAppSelector } from './app/hooks';
import { RootState } from './app/store';
import CaptivePortal from './features/member/captivePortal'


const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f4f4f4;
  width: 100%;
`;

const AppContent = styled.div`
  flex-grow: 1;
  overflow-auto;
  padding: 2rem;
`;



const App: React.FC = () => {
  // Access the events and members arrays correctly from the state
  const events = useAppSelector((state: RootState) => state.events.events); // Correctly selecting the events array
  const members = useAppSelector((state: RootState) => state.members.members); // Assuming you have a similar structure for members

  const handleEventCreated = (eventData: IEvent) => {
    // Add the new event to the events state
    console.log('New Event Created:', eventData);
  };

  const handleMemberRegistered = (registrationData: { memberId: string; eventId: string; registeredAt: string }) => {
    console.log('Member Registration Data:', registrationData);
    // Handle registration logic here
    
  };
  
  return (
    <Router>
      <AppContainer>
        <NavigationBar />
        <AppContent>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/request-password-reset" element={<RequestPasswordReset />} />
            <Route path="/captiveportal" element={<CaptivePortal/>} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/memberprofile" element={<MemberProfile />} />
              <Route path="/member/listmembers" element={<ListMembers />} />
              <Route path="/memberdetail" element={<MemberDetail />} />
              <Route path="/users" element={<Users />} />
              <Route path="/userpage" element={<UserPage />} />
              <Route path="/user/listusers" element={<ListUsers />} />
              <Route path="/events" element={<EventCreationForm  onEventCreated={handleEventCreated}  />} />
              <Route path="/event/listevents" element={<ListEvents />} />
              <Route
                path="/event/member-registration"
                element={
                  <MemberRegistrationForm
                    events={events}
                    members={members}
                    onMemberRegistered={handleMemberRegistered}
                  />
                }
              />
            </Route>

            {/* Public Routes */}
            <Route path="/memberregister" element={<MemberRegister />} />
            <Route path="/memberlogin" element={<MemberLogin />} />
            <Route path="/member/request-password-reset" element={<MemberRequestPasswordReset />} />
            <Route path="/member/reset-password" element={<MemberResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="*" element={<NoPage />} />
          </Routes>
        </AppContent>
      </AppContainer>
    </Router>
  );
};

export default App;








































// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import styled from 'styled-components';
// import { NavigationBar } from './components/layout/NavigationBar';
// import Dashboard from './components/layout/Dashboard';
// import { Login } from './features/auth/Login';
// import { UserPage } from './features/user/UserPage';
// import { ListUsers } from './features/user/ListUsers';
// import Landing from './components/layout/Landing';
// import Register from './features/auth/Register';
// import NoPage from './components/layout/NoPage';

// import Users from './features/user/Users';
// import Events from './features/event/Events';

// import MemberRegister from './features/member/MemberRegister';
// import MemberProfile from './features/member/MemberProfile';
// import ListMembers from './features/member/ListMembers';
// import MemberDetail from './features/member/MemberDetail';
// import { MemberLogin } from './features/member/MemberLogin';
// import { MemberRequestPasswordReset } from './features/member/MemberRequestPasswordReset';
// import { MemberResetPassword } from './features/member/MemberResetPassword';

// import RequestPasswordReset from './features/auth/RequestPasswordReset';
// import ResetPassword from './features/auth/ResetPassword';
// import ProtectedRoute from './components/ProtectedRoute';
// import './index.css'

// const AppContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   min-height: 100vh;
//   background-color: #f4f4f4;
//   width: 100%;
// `;

// const AppContent = styled.div`
//   flex-grow: 1;
//   overflow-auto;
//   padding: 2rem;
// `;

// const App: React.FC = () => {
//   return (
//     <Router>
//       <AppContainer>
//         <NavigationBar />
//         <AppContent>
//           <Routes>
//             <Route path="/" element={<Landing />} />
//             <Route path="/auth/reset-password" element={<ResetPassword />} />
//             <Route path="/auth/request-password-reset" element={<RequestPasswordReset />} />

//             <Route element={<ProtectedRoute />}>
//               <Route path="/dashboard" element={<Dashboard />} />
//               <Route path="/memberregister" element={<MemberRegister />} />
//               <Route path="/memberprofile" element={<MemberProfile />} />
//               <Route path="/member/listmembers" element={<ListMembers />} />
//               <Route path="/memberdetail" element={<MemberDetail />} />
             
//               <Route path="/member/request-password-reset" element={<MemberRequestPasswordReset />} />
//               <Route path="/member/reset-password" element={<MemberResetPassword />} />

//               <Route path="/users" element={<Users />} />
//               <Route path="/userpage" element={<UserPage />} />
//               <Route path="/user/listusers" element={<ListUsers />} />

//               <Route path="/events" element={<Events />} />
             
//             </Route>
//             <Route path="/memberlogin" element={<MemberLogin />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
           
//             <Route path="*" element={<NoPage />} />
//           </Routes>
//         </AppContent>
//       </AppContainer>
//     </Router>
//   );
// };

// export default App;
