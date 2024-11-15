import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { logout } from '../../features/auth/authSlice';
import styled from 'styled-components';

// Styled components (same as before)
// Styled components
export const NavContainer = styled.nav`
  background-color: #1f2937;
  padding: 1rem 1.5rem;
  width: 100%;
  position: relative;
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

const NavBrand = styled(Link)`
  color: #fff;
  font-weight: bold;
  font-size: 1.25rem;
`;

const NavLinks = styled.ul`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const NavLink = styled(Link)`
  color: #9ca3af;
  &:hover {
    color: #fff;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: 768px) {
    margin-top: 1rem;
    justify-content: flex-end;
  }
`;

const LogoutButton = styled.button`
  background-color: #6b7280;
  color: #fff;
  font-weight: bold;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  margin-left: 1rem;
  &:hover {
    background-color: #4b5563;
  }
`;

// Define the Dropdown component
const Dropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  background-color: #1f2937;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1;
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  margin-top: 0.5rem; /* Optional: add some spacing from the parent */
`;

const DropdownLink = styled(NavLink)`
  display: block;
  padding: 0.5rem 1rem;
  &:hover {
    background-color: #4b5563;
  }
`;

// Define props interface for DropdownWrapper
interface DropdownWrapperProps {
  $isOpen: boolean;
  children: React.ReactNode;
  onMouseLeave?: () => void; // Optional for handling mouse leave
}

// DropdownWrapper component
const DropdownWrapper: React.FC<DropdownWrapperProps> = ({ $isOpen, children, onMouseLeave }) => {
  return (
    <Dropdown $isOpen={$isOpen} onMouseLeave={onMouseLeave}>
      {children}
    </Dropdown>
  );
};


export const NavigationBar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const username = useAppSelector((state: RootState) => state.auth.user?.username || '');
  const memberUsername = useAppSelector((state: RootState) => state.members.currentMember?.userName || '');

  const role = useAppSelector((state: RootState) => state.members.currentMember?.role || '');
  const userRole = useAppSelector((state: RootState) => state.auth.user?.role || '');

  console.log('userRole', userRole)

  const [$dropdownOpen, setDropdownOpen] = useState(false);
  const [$dropdownOpenMember, setDropdownOpenMember] = useState(false);
  const [$dropdownOpenEvent, setDropdownOpenEvent] = useState(false);

  useEffect(() => {
    console.log('Current Role:', role); // Debugging line
  }, [username]);

  const handleLogout = () => {
    console.log('Logging out...');
    dispatch(logout());
    navigate('/');
  };

  const handleToggleDropdownMember = () => {
    setDropdownOpenMember((prev) => !prev);
  };

  const handleToggleDropdownEvent = () => {
    setDropdownOpenEvent((prev) => !prev);
  };

  return (
    <NavContainer>
      <NavContent>
        <NavBrand to="/">ChurchSoft</NavBrand>
        {(username || memberUsername) ? (
          <>
            <NavLinks>
              <li>
                <NavLink to="/dashboard">Dashboard</NavLink>
              </li>
              <li>
                <span 
                  onClick={handleToggleDropdownMember} 
                  style={{ cursor: 'pointer', color: '#9ca3af' }}
                >
                  Members
                </span>
                <DropdownWrapper $isOpen={$dropdownOpenMember} onMouseLeave={() => setDropdownOpenMember(false)}> 
                  {userRole === 'admin' && (
                    <>
                      <DropdownLink to="/member/listmembers">Member List</DropdownLink>
                      <DropdownLink to="/user/listusers">User List</DropdownLink>
                    </>
                  )}
                  {role === 'Member' && (
                    <>
                      <DropdownLink to="/memberprofile">Member Profile</DropdownLink>
                      <DropdownLink to="/memberregister">Member Registration</DropdownLink>
                    </>
                  )}
                </DropdownWrapper>
              </li>
              <li>
                <span 
                  onClick={() => setDropdownOpen(!$dropdownOpen)} 
                  style={{ cursor: 'pointer', color: '#9ca3af' }}
                >
                  Users
                </span>
                <DropdownWrapper $isOpen={$dropdownOpen} onMouseLeave={() => setDropdownOpen(false)}>
                  {userRole === 'user' || userRole === 'admin' && (
                    <>
                      <DropdownLink to="/userpage">User Details</DropdownLink>
                      <DropdownLink to="/users">Create User</DropdownLink>
                    </>
                  )}
                </DropdownWrapper>
              </li>
              {/* <li>
              {userRole === 'admin' && (
                <>
                  <NavLink to="/events">Events</NavLink>
                  <NavLink to="/event/listevents">List Events</NavLink>
                </>
              )}                
              </li> */}
              <li>
                <span 
                  onClick={handleToggleDropdownEvent} 
                  style={{ cursor: 'pointer', color: '#9ca3af' }}
                >
                  Events
                </span>
                <DropdownWrapper $isOpen={$dropdownOpenEvent} onMouseLeave={() => setDropdownOpenEvent(false)}> 
                  {userRole === 'admin' && (
                    <>
                      <DropdownLink to="/events">Events</DropdownLink>
                      <DropdownLink to="/event/listevents">List Events</DropdownLink>
                    </>
                  )}
                </DropdownWrapper>
              </li>
            </NavLinks>
            <NavActions>
              <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
            </NavActions>
          </>
        ) : (
          <NavActions>
            <Link to="/login" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              User Login
            </Link>
            <Link to="/memberlogin" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Member Login
            </Link>
          </NavActions>
        )}
      </NavContent>
    </NavContainer>
  );
};

















// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAppDispatch, useAppSelector } from '../../app/hooks';
// import { RootState } from '../../app/store';
// import { logout } from '../../features/auth/authSlice';
// import styled from 'styled-components';

// // Styled components
// export const NavContainer = styled.nav`
//   background-color: #1f2937;
//   padding: 1rem 1.5rem;
//   width: 100%;
//   position: relative;
// `;

// const NavContent = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   max-width: 1200px;
//   width: 100%;
//   margin: 0 auto;
// `;

// const NavBrand = styled(Link)`
//   color: #fff;
//   font-weight: bold;
//   font-size: 1.25rem;
// `;

// const NavLinks = styled.ul`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   width: 100%;
//   position: relative;
//   @media (max-width: 768px) {
//     flex-direction: column;
//     align-items: flex-start;
//   }
// `;

// const NavLink = styled(Link)`
//   color: #9ca3af;
//   &:hover {
//     color: #fff;
//   }
// `;

// const NavActions = styled.div`
//   display: flex;
//   align-items: center;
//   @media (max-width: 768px) {
//     margin-top: 1rem;
//     justify-content: flex-end;
//   }
// `;

// const LogoutButton = styled.button`
//   background-color: #6b7280;
//   color: #fff;
//   font-weight: bold;
//   padding: 0.375rem 0.75rem;
//   border-radius: 0.375rem;
//   margin-left: 1rem;
//   &:hover {
//     background-color: #4b5563;
//   }
// `;

// // Define the Dropdown component
// const Dropdown = styled.div<{ $isOpen: boolean }>`
//   position: absolute;
//   background-color: #1f2937;
//   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
//   z-index: 1;
//   display: ${props => (props.$isOpen ? 'block' : 'none')};
//   margin-top: 0.5rem; /* Optional: add some spacing from the parent */
// `;

// const DropdownLink = styled(NavLink)`
//   display: block;
//   padding: 0.5rem 1rem;
//   &:hover {
//     background-color: #4b5563;
//   }
// `;

// // Define props interface for DropdownWrapper
// interface DropdownWrapperProps {
//   $isOpen: boolean;
//   children: React.ReactNode;
//   onMouseLeave?: () => void; // Optional for handling mouse leave
// }

// // DropdownWrapper component
// const DropdownWrapper: React.FC<DropdownWrapperProps> = ({ $isOpen, children, onMouseLeave }) => {
//   return (
//     <Dropdown $isOpen={$isOpen} onMouseLeave={onMouseLeave}>
//       {children}
//     </Dropdown>
//   );
// };

// export const NavigationBar = () => {
//   const dispatch = useAppDispatch();

//   const navigate = useNavigate();
//   const username = useAppSelector((state: RootState) => state.auth.user?.username || '');
//   //const role = useAppSelector((state: RootState) => state.auth.user?.role || '');

//   const [$dropdownOpen, setDropdownOpen] = useState(false);
//   const [$dropdownOpenMember, setDropdownOpenMember] = useState(false);

//   const role = localStorage.getItem('role');

//   console.log('role', role)

//   useEffect(() => {
//    console.log('hmm')
//   }, [username])

//   const handleLogout = () => {
//     console.log('in handleLogout')
      
//     dispatch(logout());
//     navigate('/');
//   };

//   return (
//     <NavContainer>
//       <NavContent>
//         <NavBrand to="/">ChurchSoft</NavBrand>
//         {username ? (
//           <>
//             <NavLinks>
//               <li>
//                 <NavLink to="/dashboard">Dashboard</NavLink>
//               </li>
//               <li>
//                 <span 
//                   onClick={() => setDropdownOpenMember(!$dropdownOpenMember)} 
//                   style={{ cursor: 'pointer', color: '#9ca3af' }}
//                 >
//                   Members
//                 </span>
//                 <DropdownWrapper $isOpen={$dropdownOpenMember} onMouseLeave={() => setDropdownOpenMember(false)}> 
//                   {role == 'admin' && (
//                       <>
//                         <DropdownLink to="/member/listmembers">Member List</DropdownLink>
//                         <DropdownLink to="/user/listusers">User List</DropdownLink>
//                       </>
//                   )}    
//                   {role == 'Member' && (
//                     <>
//                       <DropdownLink to="/memberprofile">Member Profile</DropdownLink>
//                       <DropdownLink to="/memberregister">Member Registration</DropdownLink>
//                     </>
//                   )}
                  
//                 </DropdownWrapper>
//               </li>
//               <li>
//                 <span 
//                   onClick={() => setDropdownOpen(!$dropdownOpen)} 
//                   style={{ cursor: 'pointer', color: '#9ca3af' }}
//                 >
//                   Users
//                 </span>
//                 <DropdownWrapper $isOpen={$dropdownOpen} onMouseLeave={() => setDropdownOpen(false)}>
//                   {role == 'user' && (
//                     <>                     
//                       <DropdownLink to="/userpage">User Details</DropdownLink>
//                       <DropdownLink to="/users">Create User</DropdownLink>
//                     </>
//                   )}
                 
//                 </DropdownWrapper>
//               </li>

//               <li>
//                 <NavLink to="/events">Events</NavLink>
//               </li>
//             </NavLinks>
//             <NavActions>
//               <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
//             </NavActions>
//           </>
//         ) : (
//           <NavActions>
//             <Link
//               to="/login"
//               className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
//             >
//               Login
//             </Link>

//             <Link
//               to="/memberlogin"
//               className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
//               onClick={() => console.log("Navigating to Member Login")}
//             >
//               Member Login
//             </Link>

//             {/* <Link
//               to="/register"
//               className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
//             >
//               Register
//             </Link> */}
//             {/* <Link
//               to="/auth/request-password-reset"
//               className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
//             >
//               Forgot Password?
//             </Link> */}
//           </NavActions>
//         )}
//       </NavContent>
//     </NavContainer>
//   );
// };

