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
import Events from './features/event/Events';

import MemberRegister from './features/member/MemberRegister';
import MemberProfile from './features/member/MemberProfile';
import ListMembers from './features/member/ListMembers';
import MemberDetail from './features/member/MemberDetail';
import { MemberLogin } from './features/member/MemberLogin';
import { MemberRequestPasswordReset } from './features/member/MemberRequestPasswordReset';
import { MemberResetPassword } from './features/member/MemberResetPassword';

import RequestPasswordReset from './features/auth/RequestPasswordReset';
import ResetPassword from './features/auth/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css'

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
  return (
    <Router>
      <AppContainer>
        <NavigationBar />
        <AppContent>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/request-password-reset" element={<RequestPasswordReset />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/memberregister" element={<MemberRegister />} />
              <Route path="/memberprofile" element={<MemberProfile />} />
              <Route path="/member/listmembers" element={<ListMembers />} />
              <Route path="/memberdetail" element={<MemberDetail />} />
             
              <Route path="/member/request-password-reset" element={<MemberRequestPasswordReset />} />
              <Route path="/member/reset-password" element={<MemberResetPassword />} />

              <Route path="/users" element={<Users />} />
              <Route path="/userpage" element={<UserPage />} />
              <Route path="/user/listusers" element={<ListUsers />} />

              <Route path="/events" element={<Events />} />
             
            </Route>
            <Route path="/memberlogin" element={<MemberLogin />} />
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
