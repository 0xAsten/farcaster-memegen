// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MemeAuth.sol";

contract DeployMemeAuth is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address serverSigner = vm.envAddress("SERVER_SIGNER_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        MemeAuth memeAuth = new MemeAuth(serverSigner);
        
        vm.stopBroadcast();
        
        console.log("MemeAuth deployed to:", address(memeAuth));
    }
} 