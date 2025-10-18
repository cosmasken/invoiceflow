import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "ethers";

/**
 * Network-specific configurations for InvoiceFlow deployment
 */
const getNetworkConfig = (networkName: string) => {
  const configs = {
    hardhat: {
      lendingToken: ethers.ZeroAddress, // Native ETH
      isMATIC: true,
      baseLTV: 8000, // 80%
      baseInterestRate: 500, // 5%
      minLoanAmount: ethers.parseEther("0.1"), // 0.1 ETH
      maxLoanAmount: ethers.parseEther("100"), // 100 ETH
    },
    localhost: {
      lendingToken: ethers.ZeroAddress, // Native ETH
      isMATIC: true,
      baseLTV: 8000, // 80%
      baseInterestRate: 500, // 5%
      minLoanAmount: ethers.parseEther("0.1"), // 0.1 ETH
      maxLoanAmount: ethers.parseEther("100"), // 100 ETH
    },
    polygon: {
      lendingToken: ethers.ZeroAddress, // Native MATIC
      isMATIC: true,
      baseLTV: 7500, // 75% (more conservative on mainnet)
      baseInterestRate: 300, // 3%
      minLoanAmount: ethers.parseEther("10"), // 10 MATIC
      maxLoanAmount: ethers.parseEther("50000"), // 50,000 MATIC
    },
    polygonAmoy: {
      lendingToken: ethers.ZeroAddress, // Native MATIC
      isMATIC: true,
      baseLTV: 8000, // 80%
      baseInterestRate: 500, // 5%
      minLoanAmount: ethers.parseEther("1"), // 1 MATIC
      maxLoanAmount: ethers.parseEther("10000"), // 10,000 MATIC
    },
  };

  return configs[networkName as keyof typeof configs] || configs.hardhat;
};

/**
 * Deploys the InvoiceFlow contracts:
 * 1. InvoiceNFT - Creates NFTs representing invoices
 * 2. InvoiceVerification - Manages verification of invoices
 * 3. InvoiceLendingPool - Handles lending against invoice NFTs
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployInvoiceFlow: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const networkName = hre.network.name;
  const config = getNetworkConfig(networkName);

  console.log(`Deploying InvoiceFlow contracts to ${networkName} from:`, deployer);

  // Deploy InvoiceNFT contract
  const invoiceNFT = await deploy("InvoiceNFT", {
    from: deployer,
    args: [deployer], // initial owner
    log: true,
    autoMine: true,
  });

  console.log(`InvoiceNFT deployed to ${networkName}:`, invoiceNFT.address);

  // Deploy InvoiceVerification contract
  const invoiceVerification = await deploy("InvoiceVerification", {
    from: deployer,
    args: [invoiceNFT.address], // address of InvoiceNFT contract
    log: true,
    autoMine: true,
  });

  console.log(`InvoiceVerification deployed to ${networkName}:`, invoiceVerification.address);

  // Deploy InvoiceLendingPool contract with network-specific config
  const lendingPool = await deploy("InvoiceLendingPool", {
    from: deployer,
    args: [
      invoiceNFT.address,
      config.lendingToken,
      config.isMATIC,
      config.baseLTV,
      config.baseInterestRate,
      config.minLoanAmount,
      config.maxLoanAmount,
    ],
    log: true,
    autoMine: true,
  });

  console.log(`InvoiceLendingPool deployed to ${networkName}:`, lendingPool.address);

  // Get the InvoiceNFT contract instance to make changes
  const invoiceNFTContract = await hre.ethers.getContractAt("InvoiceNFT", invoiceNFT.address);

  // Add the verification contract as a verification agent
  const verificationContract = await hre.ethers.getContractAt("InvoiceVerification", invoiceVerification.address);
  await verificationContract.addVerificationAgent(deployer);
  console.log(`Added deployer as verification agent on ${networkName}`);

  // Authorize the lending pool to lock/unlock invoices
  await invoiceNFTContract.authorizeLocker(lendingPool.address, true);
  console.log(`Authorized lending pool to lock/unlock invoices on ${networkName}`);

  // Authorize the verification contract to verify invoices
  await invoiceNFTContract.authorizeVerifier(invoiceVerification.address, true);
  console.log(`Authorized verification contract to verify invoices on ${networkName}`);

  console.log(`\n=== InvoiceFlow Deployment Summary (${networkName}) ===`);
  console.log(`InvoiceNFT: ${invoiceNFT.address}`);
  console.log(`InvoiceVerification: ${invoiceVerification.address}`);
  console.log(`InvoiceLendingPool: ${lendingPool.address}`);
  console.log(`Network Config:`, config);
};

export default deployInvoiceFlow;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags InvoiceFlow
deployInvoiceFlow.tags = ["InvoiceFlow"];
