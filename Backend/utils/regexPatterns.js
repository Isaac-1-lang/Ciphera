const sanitizePrompts = (prompt) => {
  if (!prompt || typeof prompt !== "string") return prompt;

  return prompt
    // Emails
    .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, "[EMAIL]")
    // Phone numbers
    .replace(/(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?(\d{3,4}[-.\s]?\d{4})/g, "[PHONE]")
    // Credit card numbers
    .replace(/(\b\d{4}[-\s]?){3}\d{4}\b/g, "[CREDIT_CARD]")
    // URLs
    .replace(/(https?:\/\/[^\s]+)/g, "[URL]")
    // IBAN basic
    .replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/g, "[IBAN]")
    // OpenAI API keys
    .replace(/sk-[A-Za-z0-9]{48}/g, "[OPENAI_API_KEY]")
    // Stripe API keys
    .replace(/sk_live_[A-Za-z0-9]{24,}/g, "[STRIPE_API_KEY]")
    // JWT
    .replace(/eyJ[a-zA-Z0-9-_]+?\.[a-zA-Z0-9-_]+?\.[a-zA-Z0-9-_]+/g, "[JWT]")
    // Passwords-like fields
    .replace(/(?<=\bpassword\s*:\s*)[^\s]+/gi, "[PASSWORD]")
    // IPv4
    .replace(/(\b\d{1,3}\.){3}\d{1,3}\b/g, "[IPV4]")
    // IPv6
    .replace(/([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|:([0-9a-fA-F]{1,7})/g, "[IPV6]")
    // MAC addresses
    .replace(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/g, "[MAC_ADDRESS]")
    // Social Security Numbers (SSN)
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN]")
    // Bank account numbers
    .replace(/\b\d{8,12}\b/g, "[BANK_ACCOUNT]")
    // License plates
    .replace(/\b[A-Z]{1,3}-\d{1,4}-[A-Z]{1,2}\b/g, "[LICENSE_PLATE]")
    // Vehicle Identification Numbers (VIN)
    .replace(/\b[A-HJ-NPR-Z0-9]{17}\b/g, "[VIN]")
    // National ID numbers
    .replace(/\b\d{9,12}\b/g, "[NATIONAL_ID]")
    // Tax Identification Numbers (TIN)
    .replace(/\b\d{2}-\d{7}-\d{1}\b/g, "[TIN]")
    // Medical record numbers
    .replace(/\b\d{10,15}\b/g, "[MEDICAL_RECORD]");
};
export default sanitizePrompts;
export { sanitizePrompts };   