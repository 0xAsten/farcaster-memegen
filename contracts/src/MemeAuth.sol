// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title MemeAuth
 * @dev Contract for authentication in the Meme AI Assistant platform
 */
contract MemeAuth is Ownable {
    using ECDSA for bytes32;

    // Mapping of user address to their nonce (used for preventing replay attacks)
    mapping(address => uint256) public nonces;
    
    // Mapping of user address to their registration status
    mapping(address => bool) public registeredUsers;
    
    // Events
    event UserRegistered(address indexed user);
    event UserSignedIn(address indexed user);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Registers a new user
     */
    function register() external {
        require(!registeredUsers[msg.sender], "User already registered");
        
        registeredUsers[msg.sender] = true;
        nonces[msg.sender] = 0;
        
        emit UserRegistered(msg.sender);
    }
    
    /**
     * @dev Signs in a user using signature verification
     * @param signature The signature produced by the user's wallet
     * @return bool True if sign-in successful
     */
    function signIn(bytes memory signature) external returns (bool) {
        require(registeredUsers[msg.sender], "User not registered");
        
        // Create the message that should have been signed
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked(msg.sender, nonces[msg.sender], address(this)))
            )
        );
        
        // Verify signature
        address signer = messageHash.recover(signature);
        require(signer == msg.sender, "Invalid signature");
        
        // Increment nonce to prevent replay attacks
        nonces[msg.sender]++;
        
        emit UserSignedIn(msg.sender);
        return true;
    }
    
    /**
     * @dev Gets the current nonce for a user
     * @param user The address of the user
     * @return uint256 The current nonce
     */
    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }
    
    /**
     * @dev Checks if a user is registered
     * @param user The address of the user
     * @return bool True if the user is registered
     */
    function isRegistered(address user) external view returns (bool) {
        return registeredUsers[user];
    }
} 