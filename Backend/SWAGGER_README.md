# Ciphera Data Guard - API Documentation

This document describes the comprehensive API documentation using Swagger/OpenAPI for the Ciphera Data Guard backend.

## 🚀 Quick Access

Once the backend server is running, you can access the interactive API documentation at:

- **Swagger UI**: `http://localhost:3560/api-docs`
- **OpenAPI JSON**: `http://localhost:3560/api-docs.json`

## 📋 API Overview

The Ciphera Data Guard API provides comprehensive endpoints for:

### 🔐 Authentication
- User registration and login
- JWT-based authentication with HTTP-only cookies
- Profile management and password changes
- Secure logout functionality

### 🔍 Data Scanning
- Text content scanning for sensitive information
- File upload and scanning (PDF, DOC, DOCX, TXT, images)
- Real-time threat detection and analysis
- Security recommendations generation

### 📊 Dashboard & Analytics
- Real-time dashboard data
- Comprehensive analytics and reporting
- Security score calculations
- Performance metrics and trends

### 🚨 Alerts & Monitoring
- Security alert management
- Alert resolution and snoozing
- Alert statistics and reporting

## 🛡️ Security Features

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **HTTP-Only Cookies**: XSS protection for token storage
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation using Joi schemas

### Data Protection
- **CORS Configuration**: Secure cross-origin requests
- **Helmet.js**: Security headers implementation
- **Request Logging**: Comprehensive audit trails
- **Error Handling**: Secure error responses without sensitive data exposure

## 📖 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | User logout | Required |
| GET | `/api/auth/profile` | Get user profile | Required |
| PUT | `/api/auth/profile` | Update user profile | Required |
| PUT | `/api/auth/change-password` | Change password | Required |

### Scanning Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/scan/text` | Scan text content | Required |
| POST | `/api/scan/file` | Scan uploaded file | Required |
| GET | `/api/scan/history` | Get scan history | Required |
| GET | `/api/scan/stats` | Get scan statistics | Required |
| GET | `/api/scan/{scanId}` | Get scan details | Required |
| DELETE | `/api/scan/{scanId}` | Delete scan | Required |

### Dashboard Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/dashboard/data` | Get dashboard overview | Required |
| GET | `/api/dashboard/analytics` | Get detailed analytics | Required |

### Alert Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/alerts` | Get alerts | Required |
| GET | `/api/alerts/stats` | Get alert statistics | Required |
| PUT | `/api/alerts/{alertId}` | Update alert | Required |
| POST | `/api/alerts/{alertId}/resolve` | Resolve alert | Required |
| POST | `/api/alerts/{alertId}/snooze` | Snooze alert | Required |

## 🔧 Using the Swagger UI

### 1. Authentication
1. Navigate to the Swagger UI at `http://localhost:3001/api-docs`
2. For protected endpoints, you'll need to authenticate first
3. Use the `/api/auth/login` endpoint to get a session
4. The JWT token will be automatically included in subsequent requests via cookies

### 2. Testing Endpoints
1. Click on any endpoint to expand its documentation
2. Click "Try it out" to test the endpoint
3. Fill in the required parameters and request body
4. Click "Execute" to send the request
5. View the response and status code

### 3. Request Examples

#### Register a New User
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Scan Text Content
```json
{
  "content": "My email is john@example.com and my phone is 555-123-4567"
}
```

## 📊 Data Models

### User Model
```json
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "isActive": "boolean",
  "lastLogin": "date-time",
  "role": "string"
}
```

### Scan Result Model
```json
{
  "_id": "string",
  "userId": "string",
  "type": "text|file",
  "content": "string",
  "fileName": "string",
  "fileSize": "number",
  "fileType": "string",
  "status": "pending|completed|failed",
  "threats": [
    {
      "type": "string",
      "severity": "low|medium|high|critical",
      "count": "number",
      "details": "string"
    }
  ],
  "recommendations": ["string"],
  "scanTime": "number",
  "textLength": "number",
  "createdAt": "date-time"
}
```

### Alert Model
```json
{
  "_id": "string",
  "userId": "string",
  "title": "string",
  "description": "string",
  "severity": "low|medium|high|critical",
  "status": "active|resolved|snoozed",
  "category": "string",
  "source": "string",
  "affectedUsers": ["string"],
  "priority": "low|medium|high|urgent",
  "metadata": "object",
  "tags": ["string"],
  "assignedTo": "string",
  "resolution": "string",
  "snoozeUntil": "date-time",
  "isArchived": "boolean",
  "createdAt": "date-time"
}
```

## 🚨 Error Handling

The API uses standard HTTP status codes and returns consistent error responses:

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "status": 400,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `413` - Payload Too Large
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## 🔍 Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per 15 minutes
- **Scan endpoints**: 10 requests per minute
- **General endpoints**: 100 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time

## 📝 Development Notes

### Adding New Endpoints
1. Create the route handler in the appropriate controller
2. Add the route to the router file
3. Add Swagger documentation using JSDoc comments
4. Update the schema definitions if needed
5. Test the endpoint using Swagger UI

### Swagger Documentation Format
```javascript
/**
 * @swagger
 * /endpoint:
 *   method:
 *     summary: Brief description
 *     tags: [TagName]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchemaName'
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseSchema'
 */
```

## 🧪 Testing

### Using Swagger UI for Testing
1. Start the backend server: `npm run dev`
2. Open Swagger UI: `http://localhost:3001/api-docs`
3. Test endpoints in the following order:
   - Register a new user
   - Login with credentials
   - Test protected endpoints
   - Verify responses and error handling

### Automated Testing
Run the test suite:
```bash
npm test
```

## 🔧 Configuration

### Environment Variables
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ciphera
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Swagger Configuration
The Swagger configuration is located in `config/swagger.js` and includes:
- API metadata and contact information
- Server configurations
- Security schemes
- Data model schemas
- Response examples

## 📚 Additional Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [JWT Authentication](https://jwt.io/)
- [Express.js Documentation](https://expressjs.com/)

## 🤝 Contributing

When adding new endpoints or modifying existing ones:

1. Update the Swagger documentation
2. Add comprehensive examples
3. Include all possible response codes
4. Test the documentation in Swagger UI
5. Update this README if needed

## 📄 License

This API documentation is part of the Ciphera Data Guard project and is licensed under the MIT License.
