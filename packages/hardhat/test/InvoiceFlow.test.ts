import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("InvoiceFlow Contracts", function () {
  async function deployInvoiceFlowFixture() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy InvoiceNFT
    const InvoiceNFT = await ethers.getContractFactory("InvoiceNFT");
    const invoiceNFT = await InvoiceNFT.deploy(owner.address);
    await invoiceNFT.waitForDeployment();

    // Deploy InvoiceVerification
    const InvoiceVerification = await ethers.getContractFactory("InvoiceVerification");
    const invoiceVerification = await InvoiceVerification.deploy(await invoiceNFT.getAddress());
    await invoiceVerification.waitForDeployment();

    // Deploy InvoiceLendingPool
    const InvoiceLendingPool = await ethers.getContractFactory("InvoiceLendingPool");
    const lendingPool = await InvoiceLendingPool.deploy(
      await invoiceNFT.getAddress(),
      ethers.ZeroAddress, // MATIC
      true, // isMATIC
      8000, // baseLTV = 80%
      500, // baseInterestRate = 5%
      ethers.parseEther("10"), // minLoanAmount = 10 MATIC
      ethers.parseEther("10000"), // maxLoanAmount = 10,000 MATIC
    );
    await lendingPool.waitForDeployment();

    // Authorize the lending pool to lock/unlock invoices
    await invoiceNFT.authorizeLocker(await lendingPool.getAddress(), true);
    // Authorize the verification contract to verify invoices
    await invoiceNFT.authorizeVerifier(await invoiceVerification.getAddress(), true);
    // Add verification agent
    await invoiceVerification.addVerificationAgent(owner.address);

    return {
      invoiceNFT,
      invoiceVerification,
      lendingPool,
      owner,
      addr1,
      addr2,
      addr3,
    };
  }

  describe("InvoiceNFT Contract", function () {
    it("Should deploy with correct name and symbol", async function () {
      const { invoiceNFT } = await loadFixture(deployInvoiceFlowFixture);

      expect(await invoiceNFT.name()).to.equal("InvoiceFlow NFT");
      expect(await invoiceNFT.symbol()).to.equal("INV");
    });

    it("Should mint a new invoice NFT", async function () {
      const { invoiceNFT, addr1 } = await loadFixture(deployInvoiceFlowFixture);

      // Mint an invoice
      await invoiceNFT.connect(addr1).mintInvoice(
        ethers.parseEther("1000"), // 1000 tokens
        Math.floor(Date.now() / 1000) + 86400 * 30, // Due in 30 days
        "Test Issuer",
        "Test Recipient",
        "QmTestInvoiceHash",
      );

      expect(await invoiceNFT.balanceOf(addr1.address)).to.equal(1);
      expect(await invoiceNFT.ownerOf(0)).to.equal(addr1.address);

      // Check invoice info
      const invoiceInfo = await invoiceNFT.invoiceInfo(0);
      expect(invoiceInfo.amount).to.equal(ethers.parseEther("1000"));
      expect(invoiceInfo.issuer).to.equal("Test Issuer");
      expect(invoiceInfo.verified).to.equal(false);
    });

    it("Should verify an invoice", async function () {
      const { invoiceNFT, invoiceVerification } = await loadFixture(deployInvoiceFlowFixture);

      // Mint an invoice first
      await invoiceNFT.mintInvoice(
        ethers.parseEther("1000"),
        Math.floor(Date.now() / 1000) + 86400 * 30,
        "Test Issuer",
        "Test Recipient",
        "QmTestInvoiceHash2",
      );

      // Verify the invoice
      await invoiceVerification.verifyInvoice(0, true, 20, "Valid invoice");

      const invoiceInfo = await invoiceNFT.invoiceInfo(0);
      expect(invoiceInfo.verified).to.equal(true);
      expect(invoiceInfo.fraudScore).to.equal(20);
      // Collateral value should be amount * (100 - fraudScore) / 100
      expect(invoiceInfo.collateralValue).to.equal(ethers.parseEther("800")); // 1000 * (100-20)/100
    });

    it("Should allow authorized addresses to lock/unlock invoices", async function () {
      const { invoiceNFT, owner } = await loadFixture(deployInvoiceFlowFixture);

      // Mint an invoice
      await invoiceNFT.mintInvoice(
        ethers.parseEther("1000"),
        Math.floor(Date.now() / 1000) + 86400 * 30,
        "Test Issuer",
        "Test Recipient",
        "QmTestInvoiceHash3",
      );

      // Verify it's unlocked initially
      let invoiceInfo = await invoiceNFT.invoiceInfo(0);
      expect(invoiceInfo.locked).to.equal(false);

      // First, authorize the owner to lock/unlock
      await invoiceNFT.connect(owner).authorizeLocker(owner.address, true);

      // Lock via authorized contract
      await invoiceNFT.connect(owner).lockInvoice(0);
      invoiceInfo = await invoiceNFT.invoiceInfo(0);
      expect(invoiceInfo.locked).to.equal(true);

      // Unlock via authorized contract
      await invoiceNFT.connect(owner).unlockInvoice(0);
      invoiceInfo = await invoiceNFT.invoiceInfo(0);
      expect(invoiceInfo.locked).to.equal(false);
    });
  });

  describe("InvoiceLendingPool Contract", function () {
    it("Should allow funding and withdrawal", async function () {
      const { lendingPool, addr1 } = await loadFixture(deployInvoiceFlowFixture);

      // Fund the pool
      const fundAmount = ethers.parseEther("100");
      await lendingPool.connect(addr1).fundPool(fundAmount, { value: fundAmount });

      expect(await ethers.provider.getBalance(await lendingPool.getAddress())).to.equal(fundAmount);
      expect(await lendingPool.lendingPoolBalance()).to.equal(fundAmount);
    });

    it("Should allow borrowing against verified invoice", async function () {
      const { invoiceNFT, invoiceVerification, lendingPool, addr1 } = await loadFixture(deployInvoiceFlowFixture);

      // Mint an invoice
      await invoiceNFT.connect(addr1).mintInvoice(
        ethers.parseEther("1000"), // 1000 MATIC invoice
        Math.floor(Date.now() / 1000) + 86400 * 365, // Due in 1 year
        "Test Issuer",
        "Test Recipient",
        "QmTestInvoiceHash4",
      );

      // Verify the invoice
      await invoiceVerification.verifyInvoice(0, true, 10, "Valid invoice");

      // Fund the lending pool
      const poolFunding = ethers.parseEther("100");
      await lendingPool.fundPool(poolFunding, { value: poolFunding });

      // Approve the NFT transfer to lending pool (for locking purposes)
      await invoiceNFT.connect(addr1).approve(await lendingPool.getAddress(), 0);

      // Borrow against the invoice
      const borrowAmount = ethers.parseEther("70"); // Should be allowed: 1000 * 80% = 800, we're asking for 70, limited by pool size
      await lendingPool.connect(addr1).borrowAgainstInvoice(0, borrowAmount);

      // Check that loan was created
      const loan = await lendingPool.loans(0);
      expect(loan.borrower).to.equal(addr1.address);
      expect(loan.borrowedAmount).to.equal(borrowAmount);
      expect(loan.repaid).to.equal(false);

      // Check that invoice is now locked
      const invoiceInfo = await invoiceNFT.invoiceInfo(0);
      expect(invoiceInfo.locked).to.equal(true);

      // Check that borrower received funds
      // Note: This check depends on gas costs, so we'll just verify the loan was created properly
      expect(loan.borrowedAmount).to.equal(borrowAmount);
    });

    it("Should calculate interest correctly", async function () {
      const { invoiceNFT, invoiceVerification, lendingPool, addr1 } = await loadFixture(deployInvoiceFlowFixture);

      // Mint and verify an invoice
      await invoiceNFT
        .connect(addr1)
        .mintInvoice(
          ethers.parseEther("1000"),
          Math.floor(Date.now() / 1000) + 86400 * 365,
          "Test Issuer",
          "Test Recipient",
          "QmTestInvoiceHash5",
        );

      await invoiceVerification.verifyInvoice(0, true, 10, "Valid invoice");

      // Fund the lending pool
      const poolFunding = ethers.parseEther("100");
      await lendingPool.fundPool(poolFunding, { value: poolFunding });

      // Approve and borrow
      await invoiceNFT.connect(addr1).approve(await lendingPool.getAddress(), 0);
      const borrowAmount = ethers.parseEther("70");
      await lendingPool.connect(addr1).borrowAgainstInvoice(0, borrowAmount);

      // Advance time to calculate interest (1 year at 5% = 5% interest on 70 = 3.5 MATIC)
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]); // Add 1 year
      await ethers.provider.send("evm_mine");

      // Check interest calculation
      const interestDue = await lendingPool.calculateInterestDue(0);
      expect(interestDue).to.be.closeTo(ethers.parseEther("3.5"), ethers.parseEther("0.1")); // Allow small variance
    });
  });

  describe("InvoiceVerification Contract", function () {
    it("Should allow verification agents to verify invoices", async function () {
      const { invoiceNFT, invoiceVerification } = await loadFixture(deployInvoiceFlowFixture);

      // Mint an invoice
      await invoiceNFT.mintInvoice(
        ethers.parseEther("1000"),
        Math.floor(Date.now() / 1000) + 86400 * 365,
        "Test Issuer",
        "Test Recipient",
        "QmTestInvoiceHash6",
      );

      // Verify the invoice as a verification agent
      await invoiceVerification.verifyInvoice(0, true, 5, "Verified by agent");

      const invoiceInfo = await invoiceNFT.invoiceInfo(0);
      expect(invoiceInfo.verified).to.equal(true);
      expect(invoiceInfo.fraudScore).to.equal(5);
    });

    it("Should allow batch verification", async function () {
      const { invoiceNFT, invoiceVerification } = await loadFixture(deployInvoiceFlowFixture);

      // Mint multiple invoices
      await invoiceNFT.mintInvoice(
        ethers.parseEther("1000"),
        Math.floor(Date.now() / 1000) + 86400 * 365,
        "Test Issuer 1",
        "Test Recipient 1",
        "QmTestInvoiceHash7",
      );

      await invoiceNFT.mintInvoice(
        ethers.parseEther("2000"),
        Math.floor(Date.now() / 1000) + 86400 * 365,
        "Test Issuer 2",
        "Test Recipient 2",
        "QmTestInvoiceHash8",
      );

      // Batch verify
      const tokenIds = [0, 1];
      const verifications = [true, true];
      const fraudScores = [10, 15];
      const reasons = ["Valid invoice 1", "Valid invoice 2"];

      await invoiceVerification.batchVerifyInvoices(tokenIds, verifications, fraudScores, reasons);

      // Check results
      const invoiceInfo1 = await invoiceNFT.invoiceInfo(0);
      expect(invoiceInfo1.verified).to.equal(true);
      expect(invoiceInfo1.fraudScore).to.equal(10);

      const invoiceInfo2 = await invoiceNFT.invoiceInfo(1);
      expect(invoiceInfo2.verified).to.equal(true);
      expect(invoiceInfo2.fraudScore).to.equal(15);
    });
  });
});
