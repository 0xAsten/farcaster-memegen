// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MemeNFT.sol";

contract DeployMemeNFT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        MemeNFT memeNFT = new MemeNFT();
        
        vm.stopBroadcast();
        
        console.log("MemeNFT deployed to:", address(memeNFT));
    }
} 