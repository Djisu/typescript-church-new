import {jwtDecode} from 'jwt-decode';

interface IDecodedToken {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    avatar: string;
  };
  iat: number;
  exp: number;
}

export function detokenize(token: string): [string, string, string, string, string] {
  //console.log('IN detokenize');
  
  try {
    // Decode the token to extract user information
    const decodedToken = jwtDecode<IDecodedToken>(token);

    //console.log('token:: ', token);

    localStorage.setItem('token', token)

    const { id, username, email, role, avatar } = decodedToken.user;

    localStorage.setItem('id', id) 
    localStorage.setItem('username', username)
    localStorage.setItem('email', email)
    localStorage.setItem('role', role)
    localStorage.setItem('avatar', avatar)

    // console.log('userId', id);
    // console.log('userName', username);
    // console.log('userEmail', email);
    // console.log('role', role);
    // console.log('avatar',)

    return [id, username, email, role, avatar];
  } catch (error) {
    console.error('Failed to decode token:', error);
    return ['', '', '', '', '']; // Return default values in case of error
  }
}

//export default detokenize;
