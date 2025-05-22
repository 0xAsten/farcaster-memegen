// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MemeAuth.sol";

contract MemeAuthTest is Test {
    MemeAuth public auth;
    address public user = address(0x1);
    uint256 public userPrivateKey = 0xA11CE;

    function setUp() public {
        auth = new MemeAuth();
        vm.deal(user, 1 ether);
    }

    function testRegister() public {
        vm.startPrank(user);
        
        // User should not be registered initially
        assertFalse(auth.isRegistered(user));
        
        // Register the user
        auth.register();
        
        // User should be registered after registration
        assertTrue(auth.isRegistered(user));
        
        // Nonce should be initialized to 0
        assertEq(auth.getNonce(user), 0);
        
        // Should revert if user tries to register again
        vm.expectRevert("User already registered");
        auth.register();
        
        vm.stopPrank();
    }

    function testSignIn() public {
        vm.startPrank(user);
        
        // Register the user first
        auth.register();
        
        // Create and sign the message
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked(user, uint256(0), address(auth)))
            )
        );
        
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userPrivateKey, messageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        // Sign in with the signature
        bool success = auth.signIn(signature);
        assertTrue(success);
        
        // Nonce should be incremented
        assertEq(auth.getNonce(user), 1);
        
        vm.stopPrank();
    }

    function testSignInFailsWithInvalidSignature() public {
        vm.startPrank(user);
        
        // Register the user first
        auth.register();
        
        // Create an invalid signature
        bytes memory invalidSignature = abi.encodePacked(bytes32(0), bytes32(0), uint8(0));
        
        // Sign in should fail with invalid signature
        vm.expectRevert("Invalid signature");
        auth.signIn(invalidSignature);
        
        vm.stopPrank();
    }

    function testNonRegisteredUserCannotSignIn() public {
        vm.startPrank(user);
        
        // Try to sign in without registering
        bytes memory signature = abi.encodePacked(bytes32(0), bytes32(0), uint8(0));
        
        // Sign in should fail because user is not registered
        vm.expectRevert("User not registered");
        auth.signIn(signature);
        
        vm.stopPrank();
    }
} 