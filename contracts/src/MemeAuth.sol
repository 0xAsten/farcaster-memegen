// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title MemeAuth
 * @dev Contract for authentication in the Meme AI Assistant platform with daily sign-in feature
 */
contract MemeAuth is Ownable {
    using ECDSA for bytes32;

    // Mapping of user address to their nonce (used for preventing replay attacks)
    mapping(address => uint256) public nonces;
    
    // Mapping of user address to their last sign-in timestamp
    mapping(address => uint256) public lastSignInTime;

    mapping(address => uint256) public userXP;
    
    // 12 hours in seconds
    uint256 private constant DAY_IN_SECONDS = 43200;
    
    event UserSignedIn(address indexed user, uint256 timestamp);

    address public serverSigner;
    
    constructor(address _serverSigner) Ownable(msg.sender) {
        serverSigner = _serverSigner;
    }
    
    /**
     * @dev Signs in a user using signature verification, can only be done once per day
     * @param serverSignature The signature produced by the server
     * @return bool True if sign-in successful, along with whether it's a new day sign-in
     */
    function signIn(bytes memory serverSignature) external returns (bool) {  
        require(block.timestamp >= lastSignInTime[msg.sender] + DAY_IN_SECONDS, "User has already signed in today");

        // Create the message that should have been signed
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked(msg.sender, nonces[msg.sender], address(this)))
            )
        );
        
        // Verify signature
        address signer = messageHash.recover(serverSignature);
        require(signer == serverSigner, "Invalid signature");
        
        // Increment nonce to prevent replay attacks
        nonces[msg.sender]++;
        
        // Update last sign-in time
        lastSignInTime[msg.sender] = block.timestamp;

        userXP[msg.sender] += 100;
        
        emit UserSignedIn(msg.sender, block.timestamp);
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
}