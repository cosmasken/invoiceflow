// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./InvoiceNFT.sol";

contract InvoiceVerification is Ownable {
    InvoiceNFT public invoiceNFT;
    
    // Verification agents can verify invoices
    mapping(address => bool) public verificationAgents;
    
    // Events
    event VerificationAgentAdded(address indexed agent);
    event VerificationAgentRemoved(address indexed agent);
    event InvoiceVerified(
        uint256 indexed invoiceTokenId,
        address indexed verifier,
        bool verified,
        uint8 fraudScore,
        string reason
    );

    constructor(address _invoiceNFT) Ownable(msg.sender) {
        require(_invoiceNFT != address(0), "Invalid InvoiceNFT address");
        invoiceNFT = InvoiceNFT(_invoiceNFT);
    }

    // Add a verification agent (can be AI service, admin, etc.)
    function addVerificationAgent(address agent) external onlyOwner {
        require(agent != address(0), "Invalid agent address");
        verificationAgents[agent] = true;
        emit VerificationAgentAdded(agent);
    }

    // Remove a verification agent
    function removeVerificationAgent(address agent) external onlyOwner {
        verificationAgents[agent] = false;
        emit VerificationAgentRemoved(agent);
    }

    // Verify an invoice (only callable by verification agents)
    function verifyInvoice(
        uint256 invoiceTokenId,
        bool verified,
        uint8 fraudScore,
        string memory reason
    ) external whenNotPaused {
        require(verificationAgents[msg.sender], "Not a verification agent");
        require(fraudScore <= 100, "Fraud score must be between 0-100");
        require(invoiceNFT.ownerOf(invoiceTokenId) != address(0), "Invoice does not exist");
        
        // Call the InvoiceNFT contract to update verification status
        invoiceNFT.verifyInvoice(invoiceTokenId, verified, fraudScore);
        
        emit InvoiceVerified(invoiceTokenId, msg.sender, verified, fraudScore, reason);
    }

    // Batch verify multiple invoices (useful for AI processing)
    function batchVerifyInvoices(
        uint256[] memory invoiceTokenIds,
        bool[] memory verified,
        uint8[] memory fraudScores,
        string[] memory reasons
    ) external whenNotPaused {
        require(verificationAgents[msg.sender], "Not a verification agent");
        require(invoiceTokenIds.length > 0, "Invoice IDs array cannot be empty");
        require(
            invoiceTokenIds.length == verified.length &&
            invoiceTokenIds.length == fraudScores.length &&
            invoiceTokenIds.length == reasons.length,
            "Array lengths must match"
        );
        require(invoiceTokenIds.length <= 100, "Batch size too large"); // Prevent gas limit issues

        for (uint256 i = 0; i < invoiceTokenIds.length; i++) {
            require(fraudScores[i] <= 100, "Fraud score must be between 0-100");
            require(invoiceNFT.ownerOf(invoiceTokenIds[i]) != address(0), "Invoice does not exist");
            
            // Update verification status in InvoiceNFT contract
            invoiceNFT.verifyInvoice(invoiceTokenIds[i], verified[i], fraudScores[i]);
            
            emit InvoiceVerified(invoiceTokenIds[i], msg.sender, verified[i], fraudScores[i], reasons[i]);
        }
    }

    // Emergency pause functionality should not transfer ownership of the InvoiceNFT contract
    // Instead, we'll add a paused state to this contract as a safer approach
    bool public paused = false;
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    // Emergency pause function for critical issues
    function pauseContract() external onlyOwner {
        paused = true;
    }

    // Owner can unpause
    function unpauseContract() external onlyOwner {
        paused = false;
    }
}