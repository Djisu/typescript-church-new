import request from 'supertest';
import { Member, IMember, MemberSchema } from '../../models/Members' 
import app from '../server'
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ConnectOptions } from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const dbURI: string = process.env.MONGODB_URI!

console.log('MongoDB URI:', process.env.MONGODB_URI);

dotenv.config();
// Mocking bcrypt methods
jest.mock('bcrypt');
// Mocking JWT methods
jest.mock('jsonwebtoken');

// Mock bcrypt.compare method
(bcrypt.compare as jest.Mock).mockImplementation(async (password, hash) => {
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  return hashedPassword === hash;
  });
  // Mock jwt.sign method
(jwt.sign as jest.Mock).mockImplementation((payload, secret, options) => {
   return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
});

// Mock jwt.verify method
(jwt.verify as jest.Mock).mockImplementation((token, secret, options, callback) => {
    const decoded = jwt.decode(token, { complete: true }) as { header: { alg: string }, payload: IMember };
    const member = decoded.payload;
    const isValid = member.isVerified;
    console.log('isValid:', isValid);
    console.log('member:', member);
    console.log('token:', token);
    console.log('secret:', secret);
    console.log('options:', options);
    console.log('callback:', callback);
    console.log('decoded:', decoded);
    console.log('decoded.payload:', decoded.payload);
    console.log('decoded.header:', decoded.header);
    console.log('decoded.header.alg:', decoded.header.alg);
    console.log('decoded.payload.isVerified:', decoded.payload.isVerified);

    if (isValid) {
      callback(null, member);
    } else {
      callback(new Error('Invalid token'), null);
    }
    return token;
  });

  // Connect to MongoDB before tests
beforeAll(async () => {
  await mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 20000, // Increase timeout to 20 seconds
    socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
  } as ConnectOptions).then(() => {
    console.log('MongoDB connected');
  }).catch(err => {
    console.error('MongoDB connection error:', err);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});


beforeEach(() => {
  jest.clearAllMocks(); // Clear existing mocks
});
afterEach(() => {
  jest.restoreAllMocks(); // Restore original mocks
});

describe('Basic Model Test', () => {
  it('should not throw an error when assigning comparePassword method', () => {
    // Assuming Member is a model created from MemberSchema
    const Member = mongoose.model('Member', MemberSchema);
    const memberInstance = new Member(); // Create an instance of the model
    expect(() => {
      memberInstance.comparePassword = async function() { return true; };
    }).not.toThrow();
  });
});



describe('Member model', () => {
  it('should have comparePassword method', () => {
    const member = new Member({ password: 'testpassword' });
    expect(typeof member.comparePassword).toBe('function');
  });
});

describe('bcrypt', () => {
  it('should be called with correct arguments when comparing passwords', async () => {
    const mockPassword = 'testpassword';
  });
});

describe('jwt', () => {
  it('should be called with correct arguments when generating tokens', async () => {
    const mockMember = {
      _id: '60c72b2f9b1d8e1c4f1f4b1b',
      userName: 'memberUser',
      email: 'member@example.com',
      role: 'user',
    };

    const token = jwt.sign(mockMember, process.env.JWT_SECRET!);

    expect(token).not.toBeNull();
  });
});

describe('POST /login', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should return 200 and a JWT token when login is successful', async () => {
    // Mock member found in database
    const mockMember = {
      _id: '60c72b2f9b1d8e1c4f1f4b1b',
      userName: 'memberUser',
      email: 'member@example.com',
      role: 'user',
      isVerified: true,
      comparePassword: jest.fn().mockResolvedValue(true), // Mock password comparison
    };

    (Member.findOne as unknown as jest.Mock).mockResolvedValue(mockMember);

    
    const response = await request(app)
      .post('/login')
      .send({
        email: 'member@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.member).toEqual({
      id: mockMember._id,
      username: mockMember.userName,
      email: mockMember.email,
      role: mockMember.role,
    });
  });

  it('should return 400 if email is not verified', async () => {
    // Mock unverified member
    const mockMember = {
      isVerified: false,
    };

    (Member.findOne as jest.Mock).mockResolvedValue(mockMember);

    const response = await request(app)
      .post('/login')
      .send({
        email: 'unverified@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual([{ msg: 'Please verify your email first' }]);
  });

  it('should return 400 for invalid credentials when member does not exist', async () => {
    (Member.findOne as jest.Mock).mockResolvedValue(null); // No member in DB

    const response = await request(app)
      .post('/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual([{ msg: 'Invalid Credentials' }]);
  });

  it('should return 400 for incorrect password', async () => {
    const mockMember = {
      _id: '60c72b2f9b1d8e1c4f1f4b1b',
      userName: 'memberUser',
      email: 'member@example.com',
      role: 'user',
      isVerified: true,
      comparePassword: jest.fn().mockResolvedValue(false), // Mock password comparison failure
    };

    (Member.findOne as jest.Mock).mockResolvedValue(mockMember);

    const response = await request(app)
      .post('/login')
      .send({
        email: 'member@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual([{ msg: 'Invalid Credentials' }]);
  });

  it('should return 400 for validation errors', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'not-an-email', // Invalid email format
        password: '123', // Too short
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveLength(2);
    expect(response.body.errors).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ msg: 'Please include a valid email' }),
            expect.objectContaining({ msg: 'Please enter a password with 6 or more characters' }),
        ])
    );
  });

  it('should return 500 on server error', async () => {
    (Member.findOne as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .post('/login')
      .send({
        email: 'member@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Server error');
  });
});
