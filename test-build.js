// Test the built module
const LikeLottery = require('./dist/module.js');

console.log('✅ Module loaded successfully!');
console.log('NetworkName:', LikeLottery.NetworkName);
console.log('ChainId:', LikeLottery.ChainId);
console.log('LikeLottery ABI length:', LikeLottery.LikeLottery.abi.length);
console.log('Base address:', LikeLottery.LikeLottery.addresses[8453]);
console.log('Base Sepolia address:', LikeLottery.LikeLottery.addresses[84532]);

// Test the getAddress function
console.log('Base address via getAddress:', LikeLottery.LikeLottery.getAddress(8453));
console.log('Base Sepolia address via getAddress:', LikeLottery.LikeLottery.getAddress(84532));

// Test the networks object
console.log('Base deployment address:', LikeLottery.LikeLottery.networks[8453]?.address);
console.log('Base Sepolia deployment address:', LikeLottery.LikeLottery.networks[84532]?.address);

// Test the addresses export
console.log('Addresses export - Base:', LikeLottery.addresses.base?.LikeLottery);
console.log('Addresses export - Base Sepolia:', LikeLottery.addresses.baseSepolia?.LikeLottery);
