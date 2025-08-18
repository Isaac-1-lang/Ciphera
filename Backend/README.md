# Ciphera Data Guard - Backend API

A comprehensive security and data protection backend system built with Node.js, Express, and MongoDB.

## 🚀 Features

### Core Functionality
- **Authentication System**: JWT-based authentication with secure cookie handling
- **Data Scanning**: Text and file content analysis for sensitive information detection
- **Security Alerts**: Comprehensive alert management system for security incidents
- **Training Modules**: Security awareness training with progress tracking
- **Analytics Dashboard**: Real-time security metrics and performance analytics
- **User Management**: Role-based access control and user profile management

### Security Features
- **Threat Detection**: Pattern-based detection of sensitive data (PII, credentials, financial data)
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation using Joi
- **Secure Headers**: Helmet.js for security headers
- **CORS Protection**: Configurable cross-origin resource sharing
- **Logging**: Comprehensive logging with Winston

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies
- **Validation**: Joi schema validation
- **Logging**: Winston logger
- **Testing**: Mocha + Chai + Supertest
- **Security**: bcrypt, helmet, CORS

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 6+
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   PORT=3560
   NODE_ENV=development
   MONGODB_URI
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:8080
   LOG_LEVEL=info
   SESSION_SECRET=your-session-secret
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB service
   # Then seed the database
   npm run seed
   npm run seed:training
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | User registration | No |
| POST | `/login` | User authentication | No |
| POST | `/logout` | User logout | Yes |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| PUT | `/change-password` | Change password | Yes |

### Scanning (`/api/scan`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/text` | Scan text content | Yes |
| POST | `/file` | Scan file content | Yes |
| GET | `/history` | Get scan history | Yes |
| GET | `/stats` | Get scan statistics | Yes |
| GET | `/:scanId` | Get scan details | Yes |
| DELETE | `/:scanId` | Delete scan | Yes |

### Alerts (`/api/alerts`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create new alert | Yes |
| GET | `/` | Get all alerts | Yes |
| GET | `/stats` | Get alert statistics | Yes |
| GET | `/:alertId` | Get alert details | Yes |
| PUT | `/:alertId` | Update alert | Yes |
| POST | `/:alertId/resolve` | Resolve alert | Yes |
| POST | `/:alertId/snooze` | Snooze alert | Yes |
| DELETE | `/:alertId` | Delete alert | Yes |
| POST | `/acknowledge-all` | Acknowledge all alerts | Yes |

### Dashboard (`/api/dashboard`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/data` | Get dashboard overview | Yes |
| GET | `/analytics` | Get detailed analytics | Yes |

## 🔐 Authentication

The API uses JWT tokens stored in HTTP-only cookies for security. Include the token in requests:

```bash
# Token is automatically included via cookies
curl -X GET http://localhost:3560/api/auth/profile \
  -H "Content-Type: application/json" \
  --cookie "token=your-jwt-token"
```

## 📊 Data Models

### User
- Basic profile information
- Authentication credentials
- Role and access level
- Activity tracking

### Scan
- Content analysis results
- Threat detection data
- Performance metrics
- Metadata and tags

### Alert
- Security incident details
- Severity and priority levels
- Status tracking
- Resolution information

### TrainingModule
- Security training content
- Quiz and assessments
- Learning objectives
- Difficulty levels

### UserProgress
- Training completion tracking
- Quiz results and scores
- Time spent on modules
- Achievement tracking

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run specific test files:

```bash
npm test tests/auth.test.js
```

## 📝 Logging

The application uses Winston for logging with the following levels:
- **Error**: Application errors and exceptions
- **Warn**: Warning conditions
- **Info**: General information
- **Debug**: Detailed debugging information

Logs are stored in the `logs/` directory:
- `error.log`: Error-level messages
- `combined.log`: All log messages

## 🔒 Security Considerations

### Rate Limiting
- Authentication endpoints are rate-limited
- Configurable limits per IP address
- Sliding window implementation

### Input Validation
- All user inputs are validated using Joi schemas
- SQL injection protection via Mongoose
- XSS protection via input sanitization

### CORS Configuration
- Configurable allowed origins
- Credentials support for cookies
- Secure header configuration

## 🚀 Deployment

### Production Environment
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure MongoDB with authentication
4. Set up proper logging levels
5. Configure CORS for production domains

### Docker Support
```bash
# Build image
docker build -t ciphera-backend .

# Run container
docker run -p 3560:3560 ciphera-backend
```

## 📈 Performance

### Database Optimization
- Indexed queries for common operations
- Pagination support for large datasets
- Efficient aggregation pipelines

### Caching Strategy
- JWT token caching
- Database query optimization
- Response compression

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3560)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: Token expiration time
- `FRONTEND_URL`: Frontend URL for CORS
- `LOG_LEVEL`: Logging level
- `SESSION_SECRET`: Session encryption secret

### Database Configuration
- Connection pooling
- Read/write concern settings
- Index optimization
- Backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API examples

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Authentication system
- Data scanning functionality
- Alert management
- Training modules
- Analytics dashboard
- Comprehensive API endpoints
