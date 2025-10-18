// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

struct InvoiceInfo {
    uint256 amount;           // Invoice amount in wei
    uint256 dueDate;          // Due date as timestamp
    uint256 collateralValue;  // Collateral value after LTV calculation
    address borrower;         // Address of the borrower
    string issuer;            // Invoice issuer name
    string recipient;         // Invoice recipient name
    string ipfsHash;          // IPFS hash of invoice document
    uint8 fraudScore;         // Fraud risk score (0-100)
    bool verified;            // Verification status from AI
    bool locked;              // Whether the NFT is locked as collateral
}

contract InvoiceNFT is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    uint256 private _tokenIdCounter;
    
    mapping(uint256 => InvoiceInfo) public invoiceInfo;
    mapping(string => bool) public invoiceHashes; // Prevent duplicate invoices
    mapping(address => bool) public authorizedLockers; // Addresses allowed to lock NFTs (e.g., lending pool)
    mapping(address => bool) public authorizedVerifiers; // Addresses allowed to verify invoices (e.g., verification contract)
    
    event InvoiceMinted(
        uint256 indexed tokenId,
        address indexed borrower,
        uint256 amount,
        uint256 dueDate,
        string ipfsHash
    );
    
    event InvoiceVerified(
        uint256 indexed tokenId,
        bool verified,
        uint8 fraudScore
    );
    
    event InvoiceLocked(
        uint256 indexed tokenId
    );
    
    event InvoiceUnlocked(
        uint256 indexed tokenId
    );
    
    event AuthorizationUpdated(
        address indexed locker,
        bool authorized
    );

    constructor(address initialOwner) ERC721("InvoiceFlow NFT", "INV") Ownable(initialOwner) {}

    function mintInvoice(
        uint256 amount,
        uint256 dueDate,
        string memory issuer,
        string memory recipient,
        string memory ipfsHash
    ) external nonReentrant returns (uint256) {
        address to = msg.sender;
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(ipfsHash).length >= 4, "Invalid IPFS hash length");
        require(bytes(issuer).length > 0, "Issuer cannot be empty");
        require(bytes(recipient).length > 0, "Recipient cannot be empty");
        require(dueDate > block.timestamp, "Due date must be in the future");
        require(!invoiceHashes[ipfsHash], "Invoice already exists");
        
        uint256 tokenId = _tokenIdCounter;
        unchecked {
            _tokenIdCounter++;
        }

        InvoiceInfo memory info = InvoiceInfo({
            amount: amount,
            dueDate: dueDate,
            collateralValue: 0,
            borrower: to,
            issuer: issuer,
            recipient: recipient,
            ipfsHash: ipfsHash,
            fraudScore: 0,
            verified: false,
            locked: false
        });

        invoiceInfo[tokenId] = info;
        invoiceHashes[ipfsHash] = true;
        
        _safeMint(to, tokenId);
        
        emit InvoiceMinted(tokenId, to, amount, dueDate, ipfsHash);
        return tokenId;
    }
    
    function mintInvoiceFor(
        address to,
        uint256 amount,
        uint256 dueDate,
        string memory issuer,
        string memory recipient,
        string memory ipfsHash
    ) external onlyOwner nonReentrant returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(to != address(0), "Invalid recipient address");
        require(bytes(ipfsHash).length >= 4, "Invalid IPFS hash length");
        require(bytes(issuer).length > 0, "Issuer cannot be empty");
        require(bytes(recipient).length > 0, "Recipient cannot be empty");
        require(dueDate > block.timestamp, "Due date must be in the future");
        require(!invoiceHashes[ipfsHash], "Invoice already exists");
        
        uint256 tokenId = _tokenIdCounter;
        unchecked {
            _tokenIdCounter++;
        }

        InvoiceInfo memory info = InvoiceInfo({
            amount: amount,
            dueDate: dueDate,
            collateralValue: 0,
            borrower: to,
            issuer: issuer,
            recipient: recipient,
            ipfsHash: ipfsHash,
            fraudScore: 0,
            verified: false,
            locked: false
        });

        invoiceInfo[tokenId] = info;
        invoiceHashes[ipfsHash] = true;
        
        _safeMint(to, tokenId);
        
        emit InvoiceMinted(tokenId, to, amount, dueDate, ipfsHash);
        return tokenId;
    }

    function verifyInvoice(
        uint256 tokenId,
        bool verifiedStatus,
        uint8 fraudScore
    ) external {
        require(ownerOf(tokenId) != address(0), "Invoice does not exist");
        require(fraudScore <= 100, "Fraud score must be between 0-100");
        // Allow only owner or authorized verifiers to call this function
        require(msg.sender == owner() || authorizedVerifiers[msg.sender], "Not authorized to verify invoices");
        
        InvoiceInfo storage info = invoiceInfo[tokenId];
        info.verified = verifiedStatus;
        info.fraudScore = fraudScore;
        
        // Calculate collateral value based on risk (simplified)
        // Higher fraud score = lower LTV ratio
        uint256 ltvRatio = 100 - fraudScore; // Max 100% LTV, min 0% at 100% fraud
        
        // Check for potential overflow in collateral calculation
        require(info.amount <= type(uint256).max / 100, "Amount too large for calculation");
        info.collateralValue = (info.amount * ltvRatio) / 100;
        
        emit InvoiceVerified(tokenId, verifiedStatus, fraudScore);
    }

    function lockInvoice(uint256 tokenId) external {
        require(ownerOf(tokenId) != address(0), "Invoice does not exist");
        require(!invoiceInfo[tokenId].locked, "Invoice already locked");
        // Only owner of the contract or authorized locker can lock
        require(msg.sender == owner() || authorizedLockers[msg.sender], "Not authorized to lock");
        
        invoiceInfo[tokenId].locked = true;
        emit InvoiceLocked(tokenId);
    }

    function unlockInvoice(uint256 tokenId) external {
        require(ownerOf(tokenId) != address(0), "Invoice does not exist");
        require(invoiceInfo[tokenId].locked, "Invoice not locked");
        // Only owner of the contract or authorized locker can unlock
        require(msg.sender == owner() || authorizedLockers[msg.sender], "Not authorized to unlock");
        
        invoiceInfo[tokenId].locked = false;
        emit InvoiceUnlocked(tokenId);
    }

    function authorizeLocker(address locker, bool authorized) external onlyOwner {
        authorizedLockers[locker] = authorized;
        emit AuthorizationUpdated(locker, authorized);
    }

    function authorizeVerifier(address verifier, bool authorized) external onlyOwner {
        authorizedVerifiers[verifier] = authorized;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        
        // Return IPFS URI for the invoice document
        string memory baseURI = "https://ipfs.io/ipfs/";
        return string(abi.encodePacked(baseURI, invoiceInfo[tokenId].ipfsHash));
    }

    function getInvoiceDetails(uint256 tokenId) external view returns (InvoiceInfo memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return invoiceInfo[tokenId];
    }

    // The following functions are overrides required by Solidity.
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        InvoiceInfo storage info = invoiceInfo[tokenId];
        require(!info.locked, "Cannot transfer locked invoice");
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}