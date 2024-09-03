// Layout.tsx
import React from 'react';
import { NavigationBar } from './NavigationBar';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div style={{ display: 'flex' }}>
      <NavigationBar />
      <div style={{ marginLeft: '200px', padding: '20px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;