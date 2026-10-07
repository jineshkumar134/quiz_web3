// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title QuizToken ($QUIZ)
 * @dev ERC-20 Learn-to-Earn utility token for QuizFlow.
 *      Students earn $QUIZ upon passing quizzes and demonstrating mastery.
 */
contract QuizToken {
    string public name = "QuizFlow Token";
    string public symbol = "QUIZ";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public lastClaimTimestamp;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event QuizRewardClaimed(address indexed student, uint256 amount, uint8 score);

    error Unauthorized();
    error InsufficientBalance();
    error InsufficientAllowance();
    error CooldownActive();
    error InvalidScore();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
        // Mint initial supply of 1,000,000 QUIZ to contract deployer / reward pool
        _mint(msg.sender, 1_000_000 * 10**18);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 currentAllowance = allowance[from][msg.sender];
        if (currentAllowance < amount) revert InsufficientAllowance();
        allowance[from][msg.sender] = currentAllowance - amount;
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @notice Learn-to-Earn reward distribution function.
     * @param student The student address.
     * @param score Percentage score achieved (70-100).
     */
    function rewardQuizStudent(address student, uint8 score) external {
        if (score < 70) revert InvalidScore();

        // 10 QUIZ for score 70-89, 25 QUIZ for score 90-99, 50 QUIZ for score 100
        uint256 rewardAmount;
        if (score == 100) {
            rewardAmount = 50 * 10**18;
        } else if (score >= 90) {
            rewardAmount = 25 * 10**18;
        } else {
            rewardAmount = 10 * 10**18;
        }

        lastClaimTimestamp[student] = block.timestamp;
        _mint(student, rewardAmount);
        emit QuizRewardClaimed(student, rewardAmount, score);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        if (balanceOf[from] < amount) revert InsufficientBalance();
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
}
