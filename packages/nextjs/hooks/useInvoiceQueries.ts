import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInvoiceStore, type Invoice } from "~~/services/store/invoiceStore";

// Mock API functions (replace with real API calls)
const mockVerifyInvoice = async (invoiceData: Partial<Invoice>): Promise<Invoice> => {
  // Simulate AI verification delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    ...invoiceData,
    id: Date.now().toString(),
    status: "verified",
    verificationScore: Math.random() * 0.3 + 0.7, // 70-100% score
    createdAt: new Date().toISOString(),
  } as Invoice;
};

const mockMintInvoiceNFT = async (invoice: Invoice): Promise<Invoice> => {
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return {
    ...invoice,
    status: "minted",
    tokenId: `0x${Math.random().toString(16).substr(2, 8)}`,
  };
};

const mockFetchUserInvoices = async (address: string): Promise<Invoice[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock invoices for demo
  return [
    {
      id: "1",
      amount: 5000,
      currency: "USD",
      dueDate: "2024-12-01",
      issuerAddress: address,
      recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590e4CAF",
      description: "Web development services",
      status: "minted",
      tokenId: "0x12345678",
      verificationScore: 0.95,
      createdAt: "2024-10-15T10:00:00Z",
    },
  ];
};

// React Query hooks
export const useVerifyInvoice = () => {
  const queryClient = useQueryClient();
  const { addInvoice, setLoading, setError } = useInvoiceStore();

  return useMutation({
    mutationFn: mockVerifyInvoice,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (verifiedInvoice) => {
      addInvoice(verifiedInvoice);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error: Error) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useMintInvoiceNFT = () => {
  const queryClient = useQueryClient();
  const { updateInvoice, setLoading, setError } = useInvoiceStore();

  return useMutation({
    mutationFn: mockMintInvoiceNFT,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (mintedInvoice) => {
      updateInvoice(mintedInvoice.id, mintedInvoice);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error: Error) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useUserInvoices = (address?: string) => {
  return useQuery({
    queryKey: ["invoices", address],
    queryFn: () => mockFetchUserInvoices(address!),
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
