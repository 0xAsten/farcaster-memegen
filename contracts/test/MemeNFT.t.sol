// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MemeNFT.sol";

contract MemeNFTTest is Test {
    MemeNFT public nft;
    address public owner = address(1);
    address public recipient = address(2);
    string public tokenURI = "https://api.memegen.link/images/drake/manual_coding/ai_assistants.png";
    
    function setUp() public {
        vm.prank(owner);
        nft = new MemeNFT();
    }
    
    function testMintMeme() public {
        vm.prank(owner);
        uint256 tokenId = nft.mintMeme(recipient, tokenURI);
        
        assertEq(tokenId, 1, "Token ID should be 1");
        assertEq(nft.ownerOf(tokenId), recipient, "Recipient should own the token");
        assertEq(nft.tokenURI(tokenId), tokenURI, "Token URI should match");
    }
    
    function testOnlyOwnerCanMint() public {
        vm.prank(recipient);
        vm.expectRevert("Ownable: caller is not the owner");
        nft.mintMeme(recipient, tokenURI);
    }
} 