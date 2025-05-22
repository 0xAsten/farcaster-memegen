// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MemeNFT is ERC721URIStorage {
    uint256 private _nextTokenId;

    // Event emitted when a new NFT is minted
    event MemeMinted(uint256 tokenId, address owner, string tokenURI);

    constructor() ERC721("MemeNFT", "MEME") {}

    /**
     * @dev Mint a new meme NFT
     * @param tokenURI URI for the token metadata (points to the meme image)
     * @return uint256 ID of the newly minted token
     */
    function mintMeme(string memory tokenURI) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit MemeMinted(tokenId, msg.sender, tokenURI);
        
        return tokenId;
    }
} 