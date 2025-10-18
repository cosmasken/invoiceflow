import { useDeployedContractInfo } from "./useDeployedContractInfo";
import { useScaffoldWriteContract } from "./useScaffoldWriteContract";

/**
 * Hook for interacting with the InvoiceNFT contract
 */
export const useInvoiceNFT = () => {
  const { data: invoiceNFT } = useDeployedContractInfo({ contractName: "InvoiceNFT" });
  const { writeContractAsync: invoiceNFTWrite } = useScaffoldWriteContract({ contractName: "InvoiceNFT" });

  return {
    contract: invoiceNFT,
    write: invoiceNFTWrite,
  };
};

/**
 * Hook for interacting with the InvoiceLendingPool contract
 */
export const useInvoiceLendingPool = () => {
  const { data: lendingPool } = useDeployedContractInfo({ contractName: "InvoiceLendingPool" });
  const { writeContractAsync: lendingPoolWrite } = useScaffoldWriteContract({ contractName: "InvoiceLendingPool" });

  return {
    contract: lendingPool,
    write: lendingPoolWrite,
  };
};

/**
 * Hook for interacting with the InvoiceVerification contract
 */
export const useInvoiceVerification = () => {
  const { data: verificationContract } = useDeployedContractInfo({ contractName: "InvoiceVerification" });
  const { writeContractAsync: verificationWrite } = useScaffoldWriteContract({ contractName: "InvoiceVerification" });

  return {
    contract: verificationContract,
    write: verificationWrite,
  };
};
