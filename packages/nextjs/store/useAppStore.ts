import { create } from 'zustand';

export type UserProfile = 'seller' | 'buyer';

export type Invoice = {
  id: string;
  amount: number;
  verified: boolean;
  dueDate: string;
  issuer: string;
  recipient: string;
  description: string;
  fractionalized: boolean;
  totalFractions: number;
  availableFractions: number;
  pricePerFraction: number;
};

export type Loan = {
  id: number;
  invoiceId: string;
  amount: number;
  rate: number;
  dueDate: string;
  status: 'Active' | 'Repaid';
  monthlyPayment: number;
};

export type FractionOwnership = {
  invoiceId: string;
  fractionsOwned: number;
  totalInvested: number;
  currentValue: number;
  returnRate: number;
};

type PoolStats = {
  totalBalance: number;
  activeLoans: number;
  averageAPY: number;
  yourContribution: number;
};

type ModalState = {
  isOpen: boolean;
  type: 'loading' | 'success' | 'error' | null;
  message: string;
  details?: Record<string, any>;
};

type AppState = {
  userProfile: UserProfile;
  invoices: Invoice[];
  loans: Loan[];
  fractionOwnerships: FractionOwnership[];
  poolStats: PoolStats;
  modal: ModalState;
  
  // Actions
  setUserProfile: (profile: UserProfile) => void;
  addInvoice: (invoice: Invoice) => void;
  fractionalizeInvoice: (invoiceId: string, fractions: number) => void;
  buyFractions: (invoiceId: string, fractionCount: number) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  repayLoan: (loanId: number) => void;
  contributeToPool: (amount: number) => void;
  setModal: (type: 'loading' | 'success' | 'error' | null, message: string, details?: Record<string, any>) => void;
  closeModal: () => void;
};

const initialInvoices: Invoice[] = [
  {
    id: 'INV-0001',
    amount: 10000,
    verified: true,
    dueDate: '2024-12-15',
    issuer: 'Acme Corp',
    recipient: 'Tech Solutions Inc',
    description: 'Q4 Software Development Services',
    fractionalized: true,
    totalFractions: 100,
    availableFractions: 35,
    pricePerFraction: 100
  },
  {
    id: 'INV-0002',
    amount: 15000,
    verified: true,
    dueDate: '2024-12-30',
    issuer: 'Global Industries',
    recipient: 'Manufacturing LLC',
    description: 'Equipment Maintenance Contract',
    fractionalized: true,
    totalFractions: 150,
    availableFractions: 80,
    pricePerFraction: 100
  },
  {
    id: 'INV-0003',
    amount: 8500,
    verified: true,
    dueDate: '2025-01-10',
    issuer: 'Digital Agency',
    recipient: 'Marketing Partners',
    description: 'Social Media Campaign Services',
    fractionalized: false,
    totalFractions: 0,
    availableFractions: 0,
    pricePerFraction: 0
  }
];

const initialLoans: Loan[] = [
  {
    id: 1,
    invoiceId: 'INV-0001',
    amount: 8000,
    rate: 5.5,
    dueDate: '2024-12-01',
    status: 'Active',
    monthlyPayment: 680
  },
  {
    id: 2,
    invoiceId: 'INV-0003',
    amount: 6800,
    rate: 5.8,
    dueDate: '2024-12-20',
    status: 'Active',
    monthlyPayment: 585
  }
];

const initialFractionOwnerships: FractionOwnership[] = [
  {
    invoiceId: 'INV-0001',
    fractionsOwned: 25,
    totalInvested: 2500,
    currentValue: 2575,
    returnRate: 3.0
  },
  {
    invoiceId: 'INV-0002',
    fractionsOwned: 40,
    totalInvested: 4000,
    currentValue: 4180,
    returnRate: 4.5
  }
];

export const useAppStore = create<AppState>((set) => ({
  userProfile: 'seller',
  invoices: initialInvoices,
  loans: initialLoans,
  fractionOwnerships: initialFractionOwnerships,
  poolStats: {
    totalBalance: 2500000,
    activeLoans: 47,
    averageAPY: 6.2,
    yourContribution: 0
  },
  modal: {
    isOpen: false,
    type: null,
    message: '',
    details: {}
  },

  setUserProfile: (profile) => set({ userProfile: profile }),

  addInvoice: (invoice) =>
    set((state) => ({
      invoices: [...state.invoices, invoice]
    })),

  fractionalizeInvoice: (invoiceId, fractions) =>
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              fractionalized: true,
              totalFractions: fractions,
              availableFractions: fractions,
              pricePerFraction: Math.round(inv.amount / fractions)
            }
          : inv
      )
    })),

  buyFractions: (invoiceId, fractionCount) =>
    set((state) => {
      const invoice = state.invoices.find((inv) => inv.id === invoiceId);
      if (!invoice) return state;

      const totalCost = fractionCount * invoice.pricePerFraction;
      const existingOwnership = state.fractionOwnerships.find(
        (fo) => fo.invoiceId === invoiceId
      );

      return {
        invoices: state.invoices.map((inv) =>
          inv.id === invoiceId
            ? { ...inv, availableFractions: inv.availableFractions - fractionCount }
            : inv
        ),
        fractionOwnerships: existingOwnership
          ? state.fractionOwnerships.map((fo) =>
              fo.invoiceId === invoiceId
                ? {
                    ...fo,
                    fractionsOwned: fo.fractionsOwned + fractionCount,
                    totalInvested: fo.totalInvested + totalCost,
                    currentValue: fo.currentValue + totalCost * 1.02
                  }
                : fo
            )
          : [
              ...state.fractionOwnerships,
              {
                invoiceId,
                fractionsOwned: fractionCount,
                totalInvested: totalCost,
                currentValue: totalCost * 1.02,
                returnRate: 2.0
              }
            ],
        poolStats: {
          ...state.poolStats,
          yourContribution: state.poolStats.yourContribution + totalCost
        }
      };
    }),

  addLoan: (loan) =>
    set((state) => ({
      loans: [
        ...state.loans,
        {
          ...loan,
          id: Math.max(0, ...state.loans.map((l) => l.id)) + 1
        }
      ],
      poolStats: {
        ...state.poolStats,
        activeLoans: state.poolStats.activeLoans + 1
      }
    })),

  repayLoan: (loanId) =>
    set((state) => ({
      loans: state.loans.map((loan) =>
        loan.id === loanId ? { ...loan, status: 'Repaid' as const } : loan
      ),
      poolStats: {
        ...state.poolStats,
        activeLoans: state.poolStats.activeLoans - 1
      }
    })),

  contributeToPool: (amount) =>
    set((state) => ({
      poolStats: {
        ...state.poolStats,
        totalBalance: state.poolStats.totalBalance + amount,
        yourContribution: state.poolStats.yourContribution + amount
      }
    })),

  setModal: (type, message, details = {}) =>
    set({
      modal: {
        isOpen: true,
        type,
        message,
        details
      }
    }),

  closeModal: () =>
    set({
      modal: {
        isOpen: false,
        type: null,
        message: '',
        details: {}
      }
    })
}));
