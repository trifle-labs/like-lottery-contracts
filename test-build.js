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
