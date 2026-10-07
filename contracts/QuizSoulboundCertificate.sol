// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC5192 Minimal Soulbound Token Standard
 * @dev See https://eips.ethereum.org/EIPS/eip-5192
 */
interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}

/**
 * @title QuizSoulboundCertificate
 * @dev Non-transferable ERC-721 Soulbound Token (SBT) for academic and quiz achievements.
 *      Certificates are permanently locked to the recipient's wallet address upon minting.
 */
contract QuizSoulboundCertificate is IERC5192 {
    string public name = "QuizFlow Soulbound Credential";
    string public symbol = "QSBT";
    address public owner;
    uint256 private _nextTokenId = 1;

    struct Certificate {
        address recipient;
        string subject;
        string difficulty;
        uint8 score;
        uint256 issuedAt;
        string metadataUri;
    }

    // Mapping from token ID to certificate data
    mapping(uint256 => Certificate) private _certificates;
    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;
    // Mapping from owner address to token count
    mapping(address => uint256) private _balances;
    // User certificate index list
    mapping(address => uint256[]) private _userTokens;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string subject,
        uint8 score,
        uint256 timestamp
    );

    error NonTransferableSoulboundToken();
    error Unauthorized();
    error TokenDoesNotExist();
    error InvalidRecipient();
    error MinimumScoreRequired();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev ERC-5192 check: All QuizFlow credentials are permanently locked.
     */
    function locked(uint256 tokenId) external view override returns (bool) {
        if (_owners[tokenId] == address(0)) revert TokenDoesNotExist();
        return true;
    }

    /**
     * @notice Mint a new soulbound certificate to a student who passed a quiz.
     * @param to The recipient's wallet address.
     * @param subject The subject passed (e.g. Biology, Computer Science).
     * @param difficulty The difficulty level (easy, medium, hard).
     * @param score Percentage score achieved (0 - 100).
     * @param metadataUri URI pointing to IPFS or on-chain metadata.
     */
    function mintCertificate(
        address to,
        string calldata subject,
        string calldata difficulty,
        uint8 score,
        string calldata metadataUri
    ) external returns (uint256) {
        if (to == address(0)) revert InvalidRecipient();
        if (score < 70) revert MinimumScoreRequired();

        uint256 tokenId = _nextTokenId++;
        _owners[tokenId] = to;
        _balances[to] += 1;
        _userTokens[to].push(tokenId);

        _certificates[tokenId] = Certificate({
            recipient: to,
            subject: subject,
            difficulty: difficulty,
            score: score,
            issuedAt: block.timestamp,
            metadataUri: metadataUri
        });

        // Standard ERC-721 mint event
        emit Transfer(address(0), to, tokenId);
        // ERC-5192 locked event
        emit Locked(tokenId);
        emit CertificateMinted(tokenId, to, subject, score, block.timestamp);

        return tokenId;
    }

    /**
     * @notice Enforce non-transferability (Soulbound).
     * Any transfer attempt after minting will revert.
     */
    function transferFrom(address from, address to, uint256 tokenId) external pure {
        revert NonTransferableSoulboundToken();
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external pure {
        revert NonTransferableSoulboundToken();
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata) external pure {
        revert NonTransferableSoulboundToken();
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address tokenOwner = _owners[tokenId];
        if (tokenOwner == address(0)) revert TokenDoesNotExist();
        return tokenOwner;
    }

    function balanceOf(address account) external view returns (uint256) {
        if (account == address(0)) revert InvalidRecipient();
        return _balances[account];
    }

    function getCertificate(uint256 tokenId) external view returns (Certificate memory) {
        if (_owners[tokenId] == address(0)) revert TokenDoesNotExist();
        return _certificates[tokenId];
    }

    function getUserTokens(address user) external view returns (uint256[] memory) {
        return _userTokens[user];
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
}
