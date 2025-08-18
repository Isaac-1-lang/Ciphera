import { logger } from './logger.js';

// Expanded sensitive data regex patterns
// Note: These are heuristic and may produce false positives; tune as needed.
const patterns = {
	email: {
		regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
		type: 'Personal Information',
		severity: 'high',
		details: (matches) => `${matches} email address(es) detected`,
		confidence: 95,
	},
	phone: {
		regex: /(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?(\d{3,4}[-.\s]?\d{4})/g,
		type: 'Personal Information',
		severity: 'high',
		details: (matches) => `${matches} phone number(s) detected`,
		confidence: 90,
	},
	creditCard: {
		regex: /(\b\d{4}[-\s]?){3}\d{4}\b/g,
		type: 'Financial Data',
		severity: 'critical',
		details: (matches) => `${matches} credit card number pattern(s) detected`,
		confidence: 85,
	},
	ssn: {
		regex: /\b\d{3}-\d{2}-\d{4}\b/g,
		type: 'Personal Information',
		severity: 'critical',
		details: (matches) => `${matches} SSN pattern(s) detected`,
		confidence: 90,
	},
	ipv4: {
		regex: /(\b\d{1,3}\.){3}\d{1,3}\b/g,
		type: 'Network Information',
		severity: 'medium',
		details: (matches) => `${matches} IPv4 address(es) detected (review context)`,
		confidence: 70,
	},
	ipv6: {
		regex: /([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|:([0-9a-fA-F]{1,7})/g,
		type: 'Network Information',
		severity: 'medium',
		details: (matches) => `${matches} IPv6 address(es) detected (review context)`,
		confidence: 65,
	},
	url: {
		regex: /(https?:\/\/[^\s]+)/g,
		type: 'Links',
		severity: 'low',
		details: (matches) => `${matches} URL(s) detected`,
		confidence: 60,
	},
	iban: {
		regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/g,
		type: 'Financial Data',
		severity: 'high',
		details: (matches) => `${matches} IBAN pattern(s) detected`,
		confidence: 80,
	},
	bankAccount: {
		regex: /\b\d{8,12}\b/g,
		type: 'Financial Data',
		severity: 'high',
		details: (matches) => `${matches} bank account-like number(s) detected`,
		confidence: 70,
	},
	jwt: {
		regex: /eyJ[a-zA-Z0-9-_]+?\.[a-zA-Z0-9-_]+?\.[a-zA-Z0-9-_]+/g,
		type: 'Credentials',
		severity: 'critical',
		details: (matches) => `${matches} JWT token(s) detected`,
		confidence: 85,
	},
	apiKeyGeneric: {
		regex: /\b(api[_-]?key|token|secret)[\s]*[:=][\s]*['"]?[A-Za-z0-9-_]{24,}['"]?/gi,
		type: 'Credentials',
		severity: 'critical',
		details: (matches) => `${matches} potential API key(s) or token(s) detected`,
		confidence: 80,
	},
	openAIKey: {
		regex: /sk-[A-Za-z0-9]{48}/g,
		type: 'Credentials',
		severity: 'critical',
		details: (matches) => `${matches} OpenAI API key(s) detected`,
		confidence: 95,
	},
	stripeSecret: {
		regex: /sk_live_[A-Za-z0-9]{24,}/g,
		type: 'Credentials',
		severity: 'critical',
		details: (matches) => `${matches} Stripe live secret key(s) detected`,
		confidence: 95,
	},
	passwordField: {
		regex: /\b(password|passwd|pwd)[\s]*[:=][\s]*['"]?[^\s'\"]+['"]?/gi,
		type: 'Credentials',
		severity: 'high',
		details: (matches) => `${matches} potential password(s) detected`,
		confidence: 75,
	},
	mac: {
		regex: /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/g,
		type: 'Network Information',
		severity: 'low',
		details: (matches) => `${matches} MAC address(es) detected`,
		confidence: 60,
	},
	nationalId: {
		regex: /\b\d{9,12}\b/g,
		type: 'Personal Information',
		severity: 'high',
		details: (matches) => `${matches} national ID-like number(s) detected`,
		confidence: 60,
	},
	tin: {
		regex: /\b\d{2}-\d{7}-\d{1}\b/g,
		type: 'Personal Information',
		severity: 'high',
		details: (matches) => `${matches} tax ID pattern(s) detected`,
		confidence: 60,
	},
	medicalRecord: {
		regex: /\b\d{10,15}\b/g,
		type: 'Health Information',
		severity: 'high',
		details: (matches) => `${matches} medical record-like number(s) detected`,
		confidence: 55,
	},
	// Simple US/UK style physical address heuristic: number + street name + street type
	address: {
		regex: /\b\d{1,6}\s+[A-Za-z0-9'.\-\s]{2,}\s+(Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Boulevard|Blvd\.?|Lane|Ln\.?|Drive|Dr\.?|Court|Ct\.?|Place|Pl\.?|Terrace|Ter\.?|Way|Highway|Hwy\.?|Close)\b(,?\s+[A-Za-z\s]+)?(,?\s+[A-Z]{2})?(\s+\d{4,6})?/g,
		type: 'Physical Address',
		severity: 'high',
		details: (matches) => `${matches} physical address-like pattern(s) detected`,
		confidence: 60,
	},
};

function countMatches(regex, text) {
	const matches = text.match(regex);
	return matches ? matches.length : 0;
}

export function detectSensitive(content) {
	try {
		const threats = [];

		// Base detections
		for (const [key, rule] of Object.entries(patterns)) {
			const count = countMatches(rule.regex, content);
			if (count > 0) {
				threats.push({
					type: rule.type,
					severity: rule.severity,
					count,
					details: rule.details(count),
					confidence: rule.confidence,
					kind: key,
				});
			}
		}

		// Special handling for private IPv4 addresses
		const ipv4Matches = content.match(patterns.ipv4.regex) || [];
		if (ipv4Matches.length > 0) {
			const privateIPs = ipv4Matches.filter((ip) => {
				const parts = ip.split('.').map(Number);
				return (
					(parts[0] === 10) ||
					(parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
					(parts[0] === 192 && parts[1] === 168)
				);
			});
			if (privateIPs.length > 0) {
				threats.push({
					type: 'Network Information',
					severity: 'medium',
					count: privateIPs.length,
					details: `${privateIPs.length} private IPv4 address(es) detected`,
					confidence: 70,
					kind: 'ipv4Private',
				});
			}
		}

		return threats;
	} catch (error) {
		logger.error('Error during sensitive data detection:', error);
		return [];
	}
}

export default {
	detectSensitive,
	patterns,
};
