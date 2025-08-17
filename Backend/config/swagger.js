import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ciphera Data Guard API',
      version: '1.0.0',
      description: 'A comprehensive API for data protection and security scanning',
      contact: {
        name: 'Ciphera Team',
        email: 'support@ciphera.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            firstName: {
              type: 'string',
              description: 'First name'
            },
            lastName: {
              type: 'string',
              description: 'Last name'
            },
            isActive: {
              type: 'boolean',
              description: 'User active status'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              description: 'User password'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password', 'firstName', 'lastName'],
          properties: {
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              description: 'User password'
            },
            firstName: {
              type: 'string',
              description: 'First name'
            },
            lastName: {
              type: 'string',
              description: 'Last name'
            }
          }
        },
        ScanResult: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Scan ID'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            type: {
              type: 'string',
              enum: ['text', 'file'],
              description: 'Scan type'
            },
            content: {
              type: 'string',
              description: 'Scanned content'
            },
            fileName: {
              type: 'string',
              description: 'File name (for file scans)'
            },
            fileSize: {
              type: 'number',
              description: 'File size in bytes'
            },
            fileType: {
              type: 'string',
              description: 'File MIME type'
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed'],
              description: 'Scan status'
            },
            threats: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    description: 'Threat type'
                  },
                  severity: {
                    type: 'string',
                    enum: ['low', 'medium', 'high', 'critical'],
                    description: 'Threat severity'
                  },
                  count: {
                    type: 'number',
                    description: 'Number of instances found'
                  },
                  details: {
                    type: 'string',
                    description: 'Threat details'
                  }
                }
              }
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'string',
                description: 'Security recommendations'
              }
            },
            scanTime: {
              type: 'number',
              description: 'Scan duration in milliseconds'
            },
            textLength: {
              type: 'number',
              description: 'Text length (for text scans)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Scan creation timestamp'
            }
          }
        },
        Alert: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Alert ID'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            title: {
              type: 'string',
              description: 'Alert title'
            },
            description: {
              type: 'string',
              description: 'Alert description'
            },
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Alert severity'
            },
            status: {
              type: 'string',
              enum: ['active', 'resolved', 'snoozed'],
              description: 'Alert status'
            },
            category: {
              type: 'string',
              description: 'Alert category'
            },
            source: {
              type: 'string',
              description: 'Alert source'
            },
            affectedUsers: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Affected users'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Alert priority'
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Alert tags'
            },
            assignedTo: {
              type: 'string',
              description: 'Assigned user ID'
            },
            resolution: {
              type: 'string',
              description: 'Resolution notes'
            },
            snoozeUntil: {
              type: 'string',
              format: 'date-time',
              description: 'Snooze until timestamp'
            },
            isArchived: {
              type: 'boolean',
              description: 'Archive status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Alert creation timestamp'
            }
          }
        },
        DashboardData: {
          type: 'object',
          properties: {
            overview: {
              type: 'object',
              properties: {
                totalScans: {
                  type: 'number',
                  description: 'Total scans'
                },
                cleanScans: {
                  type: 'number',
                  description: 'Clean scans'
                },
                threatsDetected: {
                  type: 'number',
                  description: 'Threats detected'
                },
                avgScanTime: {
                  type: 'string',
                  description: 'Average scan time'
                }
              }
            },
            recentActivity: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ScanResult'
              },
              description: 'Recent scan activity'
            },
            securityScore: {
              type: 'number',
              description: 'Overall security score (0-100)'
            },
            alerts: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Alert'
              },
              description: 'Recent alerts'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            status: {
              type: 'number',
              description: 'HTTP status code'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp'
            }
          }
        }
      }
    }
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

export const specs = swaggerJsdoc(options);
