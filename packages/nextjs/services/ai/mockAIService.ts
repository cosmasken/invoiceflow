// Mock AI service for buildathon demo
export interface InvoiceData {
  company: string;
  amount: string;
  dueDate: string;
  invoiceNumber: string;
  verified: boolean;
  fraudScore: number;
  confidence: number;
}

// Fortune 500 companies for demo
const TRUSTED_COMPANIES = [
  "Walmart Inc.",
  "Amazon.com Inc.",
  "Apple Inc.",
  "CVS Health Corporation",
  "UnitedHealth Group",
  "Exxon Mobil Corporation",
  "Berkshire Hathaway",
  "Alphabet Inc.",
  "McKesson Corporation",
  "AmerisourceBergen",
];

export const mockAIVerification = async (): Promise<InvoiceData> => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock OCR extraction based on filename or random selection
  const randomCompany = TRUSTED_COMPANIES[Math.floor(Math.random() * TRUSTED_COMPANIES.length)];
  const randomAmount = (Math.random() * 50000 + 5000).toFixed(2);
  const randomDays = Math.floor(Math.random() * 60 + 30);
  const dueDate = new Date(Date.now() + randomDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Lower fraud score for trusted companies
  const fraudScore = TRUSTED_COMPANIES.includes(randomCompany)
    ? Math.floor(Math.random() * 20) + 5 // 5-25 for trusted
    : Math.floor(Math.random() * 40) + 30; // 30-70 for unknown

  return {
    company: randomCompany,
    amount: `$${randomAmount}`,
    dueDate,
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    verified: fraudScore < 30,
    fraudScore,
    confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
  };
};

// Check if company is in Fortune 500
export const isTrustedCompany = (company: string): boolean => {
  return TRUSTED_COMPANIES.some(trusted => company.toLowerCase().includes(trusted.toLowerCase().split(" ")[0]));
};

// Calculate loan-to-value ratio based on company and fraud score
export const calculateLTV = (company: string, fraudScore: number): number => {
  let baseLTV = 70; // 70% base LTV

  // Bonus for trusted companies
  if (isTrustedCompany(company)) {
    baseLTV += 10;
  }

  // Adjust based on fraud score
  if (fraudScore < 20) baseLTV += 5;
  else if (fraudScore > 50) baseLTV -= 15;

  return Math.min(Math.max(baseLTV, 50), 85); // Cap between 50-85%
};
