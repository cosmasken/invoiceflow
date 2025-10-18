import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  dueDate: string;
  issuerAddress: string;
  recipientAddress: string;
  description: string;
  status: "pending" | "verified" | "minted" | "funded";
  tokenId?: string;
  verificationScore?: number;
  createdAt: string;
}

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setInvoices: (invoices: Invoice[]) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  setCurrentInvoice: (invoice: Invoice | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useInvoiceStore = create<InvoiceState>()(
  devtools(
    (set, get) => ({
      invoices: [],
      currentInvoice: null,
      isLoading: false,
      error: null,

      setInvoices: (invoices) => set({ invoices }),
      
      addInvoice: (invoice) => 
        set((state) => ({ 
          invoices: [...state.invoices, invoice] 
        })),
      
      updateInvoice: (id, updates) =>
        set((state) => ({
          invoices: state.invoices.map((invoice) =>
            invoice.id === id ? { ...invoice, ...updates } : invoice
          ),
        })),
      
      setCurrentInvoice: (invoice) => set({ currentInvoice: invoice }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
    }),
    { name: "invoice-store" }
  )
);
