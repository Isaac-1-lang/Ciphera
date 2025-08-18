import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TrainingModule from '../models/TrainingModule.js';
import { logger } from '../utils/logger.js';

dotenv.config();

const trainingModules = [
  {
    title: 'Phishing Awareness',
    description: 'Learn to identify and avoid phishing attempts',
    content: `
      # Phishing Awareness Training Module
      
      ## What is Phishing?
      Phishing is a cyber attack that uses disguised email as a weapon. The goal is to trick the email recipient into believing that the message is something they want or need.
      
      ## Common Phishing Techniques
      1. **Email Spoofing**: Attackers forge the "from" address to make it appear legitimate
      2. **Link Manipulation**: Malicious links that redirect to fake websites
      3. **Attachment-based**: Malicious files that can infect your system
      4. **Social Engineering**: Psychological manipulation to gain sensitive information
      
      ## Red Flags to Watch For
      - Urgent or threatening language
      - Requests for sensitive information
      - Suspicious sender addresses
      - Poor grammar or spelling
      - Unexpected attachments
      
      ## Best Practices
      - Never click on suspicious links
      - Verify sender addresses
      - Don't share passwords or personal info via email
      - Report suspicious emails to IT
      - Use multi-factor authentication
      
      ## Quiz Questions
      - What should you do if you receive a suspicious email?
      - How can you verify if an email is legitimate?
      - What information should you never share via email?
    `,
    duration: 15,
    difficulty: 'Beginner',
    category: 'Phishing',
    tags: ['phishing', 'email', 'social-engineering', 'beginner'],
    order: 1,
    learningObjectives: [
      'Understand what phishing is and how it works',
      'Identify common phishing techniques',
      'Recognize red flags in suspicious emails',
      'Apply best practices to avoid phishing attacks'
    ],
    resources: [
      {
        title: 'Phishing Awareness Video',
        url: 'https://example.com/phishing-video',
        type: 'video'
      },
      {
        title: 'Phishing Quiz',
        url: 'https://example.com/phishing-quiz',
        type: 'quiz'
      }
    ],
    quiz: {
      questions: [
        {
          question: 'What is the primary goal of a phishing attack?',
          options: [
            'To improve email security',
            'To trick users into revealing sensitive information',
            'To block spam emails',
            'To encrypt user data'
          ],
          correctAnswer: 1,
          explanation: 'Phishing attacks aim to deceive users into providing sensitive information like passwords, credit card numbers, or personal details.'
        },
        {
          question: 'Which of the following is a red flag for phishing emails?',
          options: [
            'Professional formatting',
            'Urgent or threatening language',
            'Clear sender information',
            'Proper grammar and spelling'
          ],
          correctAnswer: 1,
          explanation: 'Urgent or threatening language is a common tactic used by phishers to pressure victims into acting quickly without thinking.'
        },
        {
          question: 'What should you do if you receive a suspicious email?',
          options: [
            'Click on any links to investigate',
            'Reply with your personal information',
            'Report it to IT and delete it',
            'Forward it to all your colleagues'
          ],
          correctAnswer: 2,
          explanation: 'Suspicious emails should be reported to IT for investigation and then deleted to prevent accidental interaction.'
        }
      ],
      passingScore: 80
    }
  },
  {
    title: 'Data Protection Basics',
    description: 'Understanding sensitive data and protection methods',
    content: `
      # Data Protection Basics Training Module
      
      ## What is Sensitive Data?
      Sensitive data includes any information that could cause harm if accessed by unauthorized individuals.
      
      ## Types of Sensitive Data
      1. **Personal Identifiable Information (PII)**
         - Names, addresses, phone numbers
         - Social Security numbers
         - Driver's license numbers
      
      2. **Financial Information**
         - Credit card numbers
         - Bank account details
         - Tax information
      
      3. **Health Information**
         - Medical records
         - Insurance information
         - Health status
      
      4. **Business Information**
         - Trade secrets
         - Customer lists
         - Financial reports
      
      ## Data Protection Methods
      - **Encryption**: Converting data into unreadable format
      - **Access Control**: Limiting who can access data
      - **Data Masking**: Hiding sensitive parts of data
      - **Secure Transmission**: Using encrypted channels
      - **Regular Backups**: Protecting against data loss
      
      ## Best Practices
      - Only collect necessary data
      - Use strong passwords and encryption
      - Regularly update security measures
      - Train employees on data protection
      - Have incident response plans
      
      ## Compliance Requirements
      - GDPR (General Data Protection Regulation)
      - HIPAA (Health Insurance Portability and Accountability Act)
      - SOX (Sarbanes-Oxley Act)
      - Industry-specific regulations
    `,
    duration: 20,
    difficulty: 'Beginner',
    category: 'Data Protection',
    tags: ['data-protection', 'compliance', 'privacy', 'beginner'],
    order: 2,
    learningObjectives: [
      'Identify different types of sensitive data',
      'Understand data protection methods',
      'Apply best practices for data security',
      'Recognize compliance requirements'
    ],
    resources: [
      {
        title: 'Data Protection Guide',
        url: 'https://example.com/data-protection-guide',
        type: 'document'
      },
      {
        title: 'Compliance Checklist',
        url: 'https://example.com/compliance-checklist',
        type: 'document'
      }
    ],
    quiz: {
      questions: [
        {
          question: 'Which of the following is considered PII?',
          options: [
            'Company logo',
            'Social Security number',
            'Public website URL',
            'Weather forecast'
          ],
          correctAnswer: 1,
          explanation: 'A Social Security number is a unique identifier that can be used to identify an individual, making it PII.'
        },
        {
          question: 'What is the purpose of data encryption?',
          options: [
            'To make data easier to read',
            'To convert data into unreadable format',
            'To delete data permanently',
            'To organize data alphabetically'
          ],
          correctAnswer: 1,
          explanation: 'Encryption converts data into an unreadable format that can only be decrypted with the proper key.'
        },
        {
          question: 'Which regulation protects health information?',
          options: [
            'GDPR',
            'HIPAA',
            'SOX',
            'PCI DSS'
          ],
          correctAnswer: 1,
          explanation: 'HIPAA (Health Insurance Portability and Accountability Act) specifically protects health information and medical records.'
        }
      ],
      passingScore: 80
    }
  },
  {
    title: 'Password Security',
    description: 'Creating and managing secure passwords',
    content: `
      # Password Security Training Module
      
      ## Why Password Security Matters
      Passwords are often the first line of defense against unauthorized access to systems and accounts.
      
      ## Characteristics of Strong Passwords
      1. **Length**: At least 12 characters
      2. **Complexity**: Mix of uppercase, lowercase, numbers, and symbols
      3. **Uniqueness**: Different for each account
      4. **Avoidance**: No personal information or common words
      
      ## Password Creation Strategies
      - **Passphrase Method**: Use a memorable sentence with variations
      - **Random Generation**: Use password managers to generate random passwords
      - **Pattern Method**: Create patterns that are hard to guess
      
      ## Common Password Mistakes
      - Using personal information (birthdays, names, pets)
      - Reusing passwords across accounts
      - Using simple patterns (123456, qwerty)
      - Sharing passwords with others
      - Writing passwords down in plain text
      
      ## Password Management Best Practices
      - Use a password manager
      - Enable two-factor authentication
      - Change passwords regularly
      - Monitor for breaches
      - Use unique passwords for each account
      
      ## Two-Factor Authentication (2FA)
      - Something you know (password)
      - Something you have (phone, token)
      - Something you are (biometric)
      
      ## Password Recovery
      - Use security questions that aren't easily guessable
      - Set up alternative email/phone for recovery
      - Keep recovery information updated
    `,
    duration: 12,
    difficulty: 'Intermediate',
    category: 'Password Security',
    tags: ['passwords', 'authentication', 'security', 'intermediate'],
    order: 3,
    learningObjectives: [
      'Create strong, secure passwords',
      'Understand password management best practices',
      'Implement two-factor authentication',
      'Avoid common password mistakes'
    ],
    resources: [
      {
        title: 'Password Strength Checker',
        url: 'https://example.com/password-checker',
        type: 'link'
      },
      {
        title: '2FA Setup Guide',
        url: 'https://example.com/2fa-guide',
        type: 'document'
      }
    ],
    quiz: {
      questions: [
        {
          question: 'What is the minimum recommended length for a strong password?',
          options: [
            '8 characters',
            '10 characters',
            '12 characters',
            '16 characters'
          ],
          correctAnswer: 2,
          explanation: '12 characters is the minimum recommended length for strong passwords, though longer is better.'
        },
        {
          question: 'Which of the following is NOT a good password practice?',
          options: [
            'Using a password manager',
            'Reusing passwords across accounts',
            'Enabling two-factor authentication',
            'Using unique passwords for each account'
          ],
          correctAnswer: 1,
          explanation: 'Reusing passwords across accounts is a security risk - if one account is compromised, all accounts with the same password are at risk.'
        },
        {
          question: 'What does 2FA stand for?',
          options: [
            'Two-Factor Authentication',
            'Two-File Access',
            'Two-Function Application',
            'Two-Factor Authorization'
          ],
          correctAnswer: 0,
          explanation: '2FA stands for Two-Factor Authentication, which requires two different types of verification to access an account.'
        }
      ],
      passingScore: 80
    }
  },
  {
    title: 'Social Engineering',
    description: 'Recognizing manipulation tactics',
    content: `
      # Social Engineering Training Module
      
      ## What is Social Engineering?
      Social engineering is the art of manipulating people into performing actions or divulging confidential information.
      
      ## Common Social Engineering Techniques
      1. **Pretexting**: Creating a fabricated scenario to obtain information
      2. **Phishing**: Using fake emails to steal information
      3. **Baiting**: Leaving physical devices to tempt victims
      4. **Quid Pro Quo**: Offering a service in exchange for information
      5. **Tailgating**: Following someone into a restricted area
      
      ## Psychological Principles Used
      - **Authority**: People tend to obey authority figures
      - **Urgency**: Creating time pressure to prevent thinking
      - **Social Proof**: Using others' actions to influence behavior
      - **Reciprocity**: People feel obliged to return favors
      - **Scarcity**: Limited availability increases perceived value
      
      ## Real-World Examples
      - **CEO Fraud**: Impersonating executives to request money transfers
      - **Tech Support Scams**: Fake technical support calls
      - **Romance Scams**: Building relationships to exploit victims
      - **Investment Scams**: Promising high returns on investments
      
      ## Red Flags to Watch For
      - Requests for immediate action
      - Unusual payment methods
      - Requests for personal information
      - Pressure to bypass security procedures
      - Offers that seem too good to be true
      
      ## Defense Strategies
      - Verify identities independently
      - Never share sensitive information
      - Question unusual requests
      - Report suspicious activities
      - Trust your instincts
      
      ## Incident Response
      - Document the incident
      - Report to security team
      - Change compromised credentials
      - Monitor for suspicious activity
      - Learn from the experience
    `,
    duration: 18,
    difficulty: 'Advanced',
    category: 'Social Engineering',
    tags: ['social-engineering', 'manipulation', 'psychology', 'advanced'],
    order: 4,
    learningObjectives: [
      'Identify social engineering techniques',
      'Understand psychological manipulation tactics',
      'Recognize red flags and warning signs',
      'Apply defense strategies and incident response'
    ],
    resources: [
      {
        title: 'Social Engineering Case Studies',
        url: 'https://example.com/case-studies',
        type: 'document'
      },
      {
        title: 'Defense Strategies Guide',
        url: 'https://example.com/defense-guide',
        type: 'document'
      }
    ],
    quiz: {
      questions: [
        {
          question: 'What is pretexting in social engineering?',
          options: [
            'Creating fake websites',
            'Creating a fabricated scenario to obtain information',
            'Sending phishing emails',
            'Using fake phone numbers'
          ],
          correctAnswer: 1,
          explanation: 'Pretexting involves creating a fabricated scenario or pretext to obtain information from a target.'
        },
        {
          question: 'Which psychological principle involves creating time pressure?',
          options: [
            'Authority',
            'Urgency',
            'Social Proof',
            'Reciprocity'
          ],
          correctAnswer: 1,
          explanation: 'Urgency involves creating time pressure to prevent victims from thinking clearly and making rational decisions.'
        },
        {
          question: 'What should you do if you suspect a social engineering attempt?',
          options: [
            'Engage with the attacker to gather more information',
            'Report it to the security team and document the incident',
            'Ignore it and hope it goes away',
            'Share it on social media to warn others'
          ],
          correctAnswer: 1,
          explanation: 'Suspicious social engineering attempts should be reported to the security team and documented for investigation.'
        }
      ],
      passingScore: 80
    }
  }
];

const seedTrainingModules = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ciphera';
    await mongoose.connect(mongoUri);
    
    // Clear existing training modules
    await TrainingModule.deleteMany({});
    
    // Insert new training modules
    const insertedModules = await TrainingModule.insertMany(trainingModules);
    
    // Log the inserted modules
    insertedModules.forEach(module => {
    });
    process.exit(0);
    
  } catch (error) {
    logger.error('Error seeding training modules:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedTrainingModules();

