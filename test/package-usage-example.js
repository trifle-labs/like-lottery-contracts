#!/usr/bin/env node

/**
 * Example script demonstrating how to use both index.js and index.ts packages
 * This shows real-world usage patterns for developers
 */

console.log('🚀 Like Lottery Contracts Package Usage Examples\n');

// Example 1: CommonJS require (index.js)
console.log('📦 Example 1: CommonJS require (index.js)');
try {
  const pkg = require('../src/index.js');
  
  console.log('✅ Successfully imported via CommonJS require');
  console.log(`   Network Names: ${Object.values(pkg.NetworkName).join(', ')}`);
  console.log(`   Chain IDs: ${Object.values(pkg.ChainId).join(', ')}`);
  console.log(`   LikeLottery ABI length: ${pkg.LikeLottery.abi.length}`);
  
  // Test some functions
  const networkName = pkg.getNetworkName(8453);
  console.log(`   Network for chain 8453: ${networkName}`);
  
  const contractAddress = pkg.getContractAddress(8453, 'LikeLottery');
  console.log(`   Contract address for Base mainnet: ${contractAddress || 'Not deployed'}`);
  
} catch (error) {
  console.log(`❌ CommonJS import failed: ${error.message}`);
}

console.log('\n' + '='.repeat(50) + '\n');

// Example 2: ES6 dynamic import (index.js)
console.log('📦 Example 2: ES6 dynamic import (index.js)');
(async () => {
  try {
    const pkg = await import('../src/index.js');
    
    console.log('✅ Successfully imported via ES6 dynamic import');
    console.log(`   Network Names: ${Object.values(pkg.NetworkName).join(', ')}`);
    console.log(`   Chain IDs: ${Object.values(pkg.ChainId).join(', ')}`);
    
    // Test utility functions
    const localhostNetwork = pkg.getNetworkName(31337);
    console.log(`   Network for chain 31337: ${localhostNetwork}`);
    
  } catch (error) {
    console.log(`❌ ES6 dynamic import failed: ${error.message}`);
  }
})();

console.log('\n' + '='.repeat(50) + '\n');

// Example 3: Working with contract information
console.log('📦 Example 3: Working with contract information');
try {
  const pkg = require('../src/index.js');
  
  console.log('✅ Contract information access:');
  
  // Access contract ABI
  if (pkg.LikeLottery.abi && pkg.LikeLottery.abi.length > 0) {
    console.log(`   LikeLottery ABI has ${pkg.LikeLottery.abi.length} functions/events`);
    
    // Show first few ABI entries
    const firstEntries = pkg.LikeLottery.abi.slice(0, 3);
    firstEntries.forEach((entry, index) => {
      console.log(`     ${index + 1}. ${entry.type}: ${entry.name || 'unnamed'}`);
    });
  }
  
  // Access addresses by network
  console.log('   Contract addresses by network:');
  Object.entries(pkg.addresses).forEach(([network, addresses]) => {
    if (addresses && addresses.LikeLottery) {
      console.log(`     ${network}: ${addresses.LikeLottery}`);
    } else {
      console.log(`     ${network}: Not deployed`);
    }
  });
  
} catch (error) {
  console.log(`❌ Contract info access failed: ${error.message}`);
}

console.log('\n' + '='.repeat(50) + '\n');

// Example 4: Error handling
console.log('📦 Example 4: Error handling');
try {
  const pkg = require('../src/index.js');
  
  console.log('✅ Error handling examples:');
  
  // Test unknown chain ID
  try {
    pkg.getNetworkName(999999);
  } catch (error) {
    console.log(`   Unknown chain ID error: ${error.message}`);
  }
  
  // Test graceful handling
  const unknownAddress = pkg.getContractAddress(999999, 'LikeLottery');
  console.log(`   Unknown chain ID returns: ${unknownAddress}`);
  
} catch (error) {
  console.log(`❌ Error handling test failed: ${error.message}`);
}

console.log('\n' + '='.repeat(50) + '\n');

// Example 5: Real-world usage pattern
console.log('📦 Example 5: Real-world usage pattern');
try {
  const pkg = require('../src/index.js');
  
  console.log('✅ Real-world usage simulation:');
  
  // Simulate a dApp scenario
  const userChainId = 8453; // Base mainnet
  const userNetwork = pkg.getNetworkName(userChainId);
  console.log(`   User is on ${userNetwork} (chain ID: ${userChainId})`);
  
  // Get contract address for user's network
  const contractAddress = pkg.getContractAddress(userChainId, 'LikeLottery');
  if (contractAddress) {
    console.log(`   LikeLottery contract found at: ${contractAddress}`);
    console.log(`   Contract ABI available: ${pkg.LikeLottery.abi.length} entries`);
  } else {
    console.log(`   LikeLottery not deployed on ${userNetwork}`);
  }
  
  // Get deployment info
  const deployment = pkg.LikeLottery.getDeployment(userNetwork);
  if (deployment) {
    console.log(`   Deployment info available: block ${deployment.blockNumber}`);
  } else {
    console.log(`   No deployment info for ${userNetwork}`);
  }
  
} catch (error) {
  console.log(`❌ Real-world usage test failed: ${error.message}`);
}

console.log('\n🎉 Package usage examples completed!\n');
console.log('💡 Tips:');
console.log('   - Use require() for CommonJS environments');
console.log('   - Use import() for ES6/modern environments');
console.log('   - Both methods provide the same functionality');
console.log('   - Check for undefined values when accessing addresses/deployments');
console.log('   - Handle errors gracefully for unknown chain IDs');
