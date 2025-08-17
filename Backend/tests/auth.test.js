import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../server.js';
import User from '../models/User.js';

dotenv.config();

describe('Authentication API', () => {
  let testUser;
  let authToken;

  before(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI);
    
    // Clear test data
    await User.deleteMany({});
  });

  after(async () => {
    // Clean up
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.user.username).to.equal(userData.username);
      expect(response.body.user.email).to.equal(userData.email);
      expect(response.body.token).to.exist;
      expect(response.body.user.password).to.not.exist;

      testUser = response.body.user;
      authToken = response.body.token;
    });

    it('should not register user with duplicate email', async () => {
      const userData = {
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.user.username).to.equal('testuser');
      expect(response.body.token).to.exist;
    });

    it('should not login with wrong password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.user.username).to.equal('testuser');
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('Access token required');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.include('Logout successful');
    });
  });
});
