export interface BOQItem {
  id: string;
  section: string;
  description: string;
  quantity: number;
  unit: string;
  unitRate: number; // usually calculated from materialRate + labourRate, but can be customized
  materialRate: number; // material cost portion per unit
  labourRate: number; // labour cost portion per unit
  total: number; // quantity * unitRate
}

export interface QuoteSummary {
  materialTotal: number;
  labourTotal: number;
  subtotal: number;
  overheadPercent: number;
  overheadTotal: number;
  profitPercent: number;
  profitTotal: number;
  vatPercent: number;
  vatTotal: number;
  grandTotal: number;
}

export interface PaymentScheduleItem {
  id: string;
  milestone: string;
  percentage: number;
  amount: number;
  dueDate: string;
}

export interface Quote {
  id: string;
  reference: string;
  date: string;
  projectName: string;
  clientName: string;
  companyName: string;
  siteAddress: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  items: BOQItem[];
  summary: QuoteSummary;
  scopeOfWorks: string;
  paymentSchedule: PaymentScheduleItem[];
  termsAndConditions: string;
  createdAt: string;
  pdfFileName?: string;
  pdfDataUrl?: string; // fallback base64 PDF representation or sample placeholder
}

export interface AppSettings {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  companyLogoUrl?: string;
  defaultOverheadPercent: number;
  defaultProfitPercent: number;
  defaultVatPercent: number;
  defaultTermsAndConditions: string;
  useFirebase: boolean;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}
