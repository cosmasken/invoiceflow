#!/usr/bin/env ts-node

import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Helper script to deploy InvoiceFlow contracts to specific networks
 * Usage: yarn ts-node scripts/deployToNetwork.ts <network>
 * Example: yarn ts-node scripts/deployToNetwork.ts polygonAmoy
 */

const SUPPORTED_NETWORKS = ["hardhat", "localhost", "polygon", "polygonAmoy"];

const getNetworkInfo = (network: string) => {
  const info = {
    hardhat: {
      name: "Hardhat Local",
      chainId: 31337,
      currency: "ETH",
      explorer: "N/A (Local)",
    },
    localhost: {
      name: "Localhost",
      chainId: 31337,
      currency: "ETH",
      explorer: "N/A (Local)",
    },
    polygon: {
      name: "Polygon Mainnet",
      chainId: 137,
      currency: "MATIC",
      explorer: "https://polygonscan.com",
    },
    polygonAmoy: {
      name: "Polygon Amoy Testnet",
      chainId: 80002,
      currency: "MATIC",
      explorer: "https://amoy.polygonscan.com",
    },
  };

  return info[network as keyof typeof info];
};

const checkDeployerBalance = async (network: string) => {
  try {
    const result = execSync(`hardhat account --network ${network}`, { encoding: "utf-8" });
    console.log("Deployer account info:");
    console.log(result);
  } catch (error) {
    console.warn("Could not check deployer balance:", error);
  }
};

const deployToNetwork = async (network: string) => {
  if (!SUPPORTED_NETWORKS.includes(network)) {
    console.error(`❌ Unsupported network: ${network}`);
    console.log(`Supported networks: ${SUPPORTED_NETWORKS.join(", ")}`);
    process.exit(1);
  }

  const networkInfo = getNetworkInfo(network);

  console.log(`\n🚀 Deploying InvoiceFlow to ${networkInfo.name}`);
  console.log(`📊 Chain ID: ${networkInfo.chainId}`);
  console.log(`💰 Currency: ${networkInfo.currency}`);
  console.log(`🔍 Explorer: ${networkInfo.explorer}`);
  console.log("=".repeat(50));

  // Check if .env file exists for non-local networks
  if (network !== "hardhat" && network !== "localhost") {
    const envPath = join(__dirname, "../.env");
    if (!existsSync(envPath)) {
      console.error("❌ .env file not found. Please create one with your private key.");
      console.log("Copy .env.example to .env and fill in your DEPLOYER_PRIVATE_KEY");
      process.exit(1);
    }
  }

  try {
    // Check deployer balance
    if (network !== "hardhat") {
      await checkDeployerBalance(network);
    }

    // Deploy contracts
    console.log(`\n📦 Deploying contracts to ${network}...`);
    execSync(`hardhat deploy --network ${network}`, {
      encoding: "utf-8",
      stdio: "inherit",
    });

    console.log(`\n✅ Successfully deployed to ${networkInfo.name}!`);

    // Show deployment info
    const deploymentsPath = join(__dirname, `../deployments/${network}`);
    if (existsSync(deploymentsPath)) {
      console.log(`\n📋 Deployment files saved to: deployments/${network}/`);

      // Try to read and display contract addresses
      try {
        const contracts = ["InvoiceNFT", "InvoiceVerification", "InvoiceLendingPool"];
        console.log("\n📍 Contract Addresses:");

        for (const contract of contracts) {
          const contractFile = join(deploymentsPath, `${contract}.json`);
          if (existsSync(contractFile)) {
            const contractData = JSON.parse(readFileSync(contractFile, "utf-8"));
            console.log(`  ${contract}: ${contractData.address}`);
          }
        }
      } catch {
        console.log("Could not read deployment addresses");
      }
    }

    if (networkInfo.explorer !== "N/A (Local)") {
      console.log(`\n🔍 Verify contracts on ${networkInfo.explorer}`);
      console.log(`Run: yarn verify --network ${network}`);
    }
  } catch (error) {
    console.error(`❌ Deployment failed:`, error);
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  const network = process.argv[2];

  if (!network) {
    console.log("Usage: yarn ts-node scripts/deployToNetwork.ts <network>");
    console.log(`Available networks: ${SUPPORTED_NETWORKS.join(", ")}`);
    process.exit(1);
  }

  await deployToNetwork(network);
};

main().catch(console.error);
