// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./InvoiceNFT.sol";

contract InvoiceLendingPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    InvoiceNFT public invoiceNFT;
    
    // Supported lending token (MATIC in native form or USDC as ERC20)
    IERC20 public lendingToken;
    bool public isLendingTokenMATIC; // True if lending native MATIC, false if lending an ERC20 token
    
    // Default loan term constant
    uint256 public constant DEFAULT_LOAN_TERM = 365 days; // 1 year default term
    
    // Pool parameters
    uint256 public constant MAX_LTV = 10000; // 100.00% represented as basis points
    uint256 public lendingPoolBalance; // Total tokens in the lending pool
    uint256 public activeLoans; // Number of active loans
    uint256 public totalBorrowed; // Total amount currently borrowed
    
    // Loan parameters
    uint256 public baseLTV; // Base loan-to-value ratio (e.g., 8000 = 80%)
    uint256 public baseInterestRate; // Base interest rate per year (e.g., 500 = 5%)
    uint256 public minLoanAmount; // Minimum loan amount
    uint256 public maxLoanAmount; // Maximum loan amount
    
    // Loan structure
    struct Loan {
        uint256 invoiceTokenId;
        address borrower;
        uint256 borrowedAmount;
        uint256 interestRate; // Interest rate for this specific loan
        uint256 startTime;
        uint256 dueDate;
        bool repaid;
    }
    
    mapping(uint256 => Loan) public loans; // loanId => Loan
    uint256 public loanCounter;
    
    mapping(address => uint256[]) public borrowerLoans; // borrower => [loanIds]
    
    // Events
    event PoolFunded(address indexed lender, uint256 amount);
    event LoanCreated(
        uint256 indexed loanId,
        uint256 indexed invoiceTokenId,
        address indexed borrower,
        uint256 borrowedAmount
    );
    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amountPaid
    );
    event LoanLiquidated(
        uint256 indexed loanId,
        uint256 indexed invoiceTokenId,
        address indexed borrower
    );
    event InterestRateUpdated(uint256 newRate);
    event LTVUpdated(uint256 newLTV);

    constructor(
        address _invoiceNFT,
        address _lendingToken,
        bool _isMATIC,
        uint256 _baseLTV,
        uint256 _baseInterestRate,
        uint256 _minLoanAmount,
        uint256 _maxLoanAmount
    ) Ownable(msg.sender) {
        require(_invoiceNFT != address(0), "Invalid InvoiceNFT address");
        require(_baseLTV <= MAX_LTV, "LTV too high");
        require(_baseInterestRate <= 10000, "Interest rate too high");
        require(_minLoanAmount <= _maxLoanAmount, "Min loan amount exceeds max");
        if (!_isMATIC) {
            require(_lendingToken != address(0), "Invalid ERC20 token address");
        }
        
        invoiceNFT = InvoiceNFT(_invoiceNFT);
        lendingToken = IERC20(_lendingToken);
        isLendingTokenMATIC = _isMATIC;
        baseLTV = _baseLTV;
        baseInterestRate = _baseInterestRate;
        minLoanAmount = _minLoanAmount;
        maxLoanAmount = _maxLoanAmount;
    }

    // Function for lenders to supply liquidity to the pool
    function fundPool(uint256 amount) external payable nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        if (isLendingTokenMATIC) {
            // For MATIC, we receive it as msg.value
            require(amount == msg.value, "Amount mismatch with msg.value");
            lendingPoolBalance += amount;
        } else {
            // For ERC20 tokens, transfer from sender
            lendingToken.safeTransferFrom(msg.sender, address(this), amount);
            lendingPoolBalance += amount;
        }
        
        emit PoolFunded(msg.sender, amount);
    }

    // Function for lenders to withdraw their liquidity from the pool
    function withdrawLiquidity(uint256 amount) external nonReentrant onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= lendingPoolBalance, "Insufficient pool balance");
        
        lendingPoolBalance -= amount;
        
        if (isLendingTokenMATIC) {
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            lendingToken.safeTransfer(msg.sender, amount);
        }
    }

    // Function for borrowers to take a loan against their verified invoice NFT
    function borrowAgainstInvoice(uint256 invoiceTokenId, uint256 desiredAmount) external nonReentrant {
        // Get invoice details once to avoid multiple external calls
        InvoiceInfo memory info = invoiceNFT.getInvoiceDetails(invoiceTokenId);
        require(invoiceNFT.ownerOf(invoiceTokenId) == msg.sender, "Not owner of invoice NFT");
        require(info.verified, "Invoice not verified");
        require(!info.locked, "Invoice already locked");
        require(info.collateralValue > 0, "Invalid collateral value");
        
        // Calculate max loan based on LTV
        uint256 maxLoan = (info.collateralValue * baseLTV) / MAX_LTV;
        
        uint256 loanAmount = desiredAmount > 0 ? desiredAmount : maxLoan;
        require(loanAmount >= minLoanAmount, "Loan amount too small");
        require(loanAmount <= maxLoanAmount, "Loan amount too large");
        require(loanAmount <= maxLoan, "Loan exceeds max LTV");
        require(loanAmount <= lendingPoolBalance, "Insufficient pool liquidity");
        
        // Lock the invoice NFT
        invoiceNFT.lockInvoice(invoiceTokenId);
        
        // Create loan record
        uint256 loanId = loanCounter++;
        loans[loanId] = Loan({
            invoiceTokenId: invoiceTokenId,
            borrower: msg.sender,
            borrowedAmount: loanAmount,
            interestRate: baseInterestRate,
            startTime: block.timestamp,
            dueDate: block.timestamp + 365 days, // 1 year loan for example
            repaid: false
        });
        
        borrowerLoans[msg.sender].push(loanId);
        activeLoans++;
        totalBorrowed += loanAmount;
        lendingPoolBalance -= loanAmount;
        
        // Transfer borrowed amount to borrower
        if (isLendingTokenMATIC) {
            (bool success, ) = payable(msg.sender).call{value: loanAmount}("");
            require(success, "Transfer failed");
        } else {
            lendingToken.safeTransfer(msg.sender, loanAmount);
        }
        
        emit LoanCreated(loanId, invoiceTokenId, msg.sender, loanAmount);
    }

    // Function for borrowers to repay their loan
    function repayLoan(uint256 loanId) external payable nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.borrower != address(0), "Loan does not exist");
        require(!loan.repaid, "Loan already repaid");
        require(loan.borrower == msg.sender, "Not loan borrower");
        
        // Calculate total amount due (principal + interest)
        uint256 timeElapsed = block.timestamp - loan.startTime;
        uint256 interest = (loan.borrowedAmount * loan.interestRate * timeElapsed) / (10000 * 365 days);
        uint256 totalDue = loan.borrowedAmount + interest;
        
        if (isLendingTokenMATIC) {
            require(msg.value >= totalDue, "Insufficient payment");
            // Send extra back to borrower
            if (msg.value > totalDue) {
                (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalDue}("");
                require(refundSuccess, "Refund failed");
            }
        } else {
            lendingToken.safeTransferFrom(msg.sender, address(this), totalDue);
        }
        
        // Unlock the invoice NFT
        invoiceNFT.unlockInvoice(loan.invoiceTokenId);
        
        // Update loan status
        loan.repaid = true;
        activeLoans--;
        totalBorrowed -= loan.borrowedAmount;
        lendingPoolBalance += totalDue;
        
        emit LoanRepaid(loanId, msg.sender, totalDue);
    }

    // Function to liquidate a loan if it's not repaid by due date
    function liquidateLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.borrower != address(0), "Loan does not exist");
        require(!loan.repaid, "Loan already repaid");
        // Add a time buffer to prevent front-running
        require(block.timestamp > loan.dueDate + 24 hours, "Loan not due yet with buffer");
        
        // Get the current owner of the NFT (should be the borrower or the lending pool if locked)
        address currentOwner = invoiceNFT.ownerOf(loan.invoiceTokenId);
        
        // If the NFT is locked (which it should be), the lending pool can transfer it to itself to take possession
        // First unlock the invoice NFT (using the authorizedLocker mechanism)
        invoiceNFT.unlockInvoice(loan.invoiceTokenId);
        
        // Transfer the NFT from the borrower to the lending pool contract (protocol takes possession)
        invoiceNFT.transferFrom(currentOwner, address(this), loan.invoiceTokenId);
        
        // Update loan status
        loan.repaid = true;
        activeLoans--;
        totalBorrowed -= loan.borrowedAmount;
        
        emit LoanLiquidated(loanId, loan.invoiceTokenId, loan.borrower);
    }

    // Function to update base interest rate (only owner)
    function updateInterestRate(uint256 newRate) external onlyOwner {
        require(newRate <= 10000, "Interest rate too high");
        baseInterestRate = newRate;
        emit InterestRateUpdated(newRate);
    }

    // Function to update base LTV (only owner)
    function updateLTV(uint256 newLTV) external onlyOwner {
        require(newLTV <= MAX_LTV, "LTV too high");
        baseLTV = newLTV;
        emit LTVUpdated(newLTV);
    }

    // Function to check if a loan is expired
    function isLoanExpired(uint256 loanId) external view returns (bool) {
        Loan memory loan = loans[loanId];
        return !loan.repaid && block.timestamp > loan.dueDate;
    }

    // Function to calculate total interest due on a loan
    function calculateInterestDue(uint256 loanId) external view returns (uint256) {
        Loan memory loan = loans[loanId];
        require(loan.borrower != address(0), "Loan does not exist");
        require(!loan.repaid, "Loan already repaid");
        
        uint256 timeElapsed = block.timestamp - loan.startTime;
        return (loan.borrowedAmount * loan.interestRate * timeElapsed) / (10000 * 365 days);
    }

    // Function to get borrower's active loans
    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return borrowerLoans[borrower];
    }

    receive() external payable {
        require(isLendingTokenMATIC, "This contract only accepts MATIC when set as lending token");
    }
}