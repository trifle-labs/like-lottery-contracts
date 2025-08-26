const fs = require('fs');
const path = require('path');

// Network names mapping
const NetworkName = {
  LOCALHOST: 'localhost',
  HARDHAT: 'hardhat',
  BASE_SEPOLIA: 'baseSepolia',
  BASE: 'base',
};

// Chain IDs
const ChainId = {
  LOCALHOST: 31337,
  HARDHAT: 31337,
  BASE_SEPOLIA: 84532,
  BASE: 8453,
};

// Helper function to load deployment info
function loadDeployment(network, contractName) {
  try {
    const deploymentPath = path.join(
      __dirname,
      '..',
      'deployments',
      network,
      `${contractName}.json`
    );
    if (fs.existsSync(deploymentPath)) {
      return JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    }
  } catch (error) {
    console.error(`Failed to load deployment for ${contractName} on ${network}:`, error);
  }
  return null;
}

// Helper function to load addresses for a network
function loadAddresses(network) {
  try {
    const addressesPath = path.join(__dirname, '..', 'deployments', network, 'addresses.json');
    if (fs.existsSync(addressesPath)) {
      return JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    }
  } catch (error) {
    console.error(`Failed to load addresses for ${network}:`, error);
  }
  return {};
}

// Export contract ABIs (loaded from artifacts)
const LikeLotteryABI = (() => {
  try {
    const artifactPath = path.join(
      __dirname,
      '..',
      'artifacts',
      'contracts',
      'LikeLottery.sol',
      'LikeLottery.json'
    );
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      return artifact.abi;
    }
  } catch (error) {
    console.error('Failed to load LikeLottery ABI:', error);
  }
  return [];
})();

// Export addresses by network
const addresses = {
  [NetworkName.LOCALHOST]: loadAddresses(NetworkName.LOCALHOST),
  [NetworkName.HARDHAT]: loadAddresses(NetworkName.HARDHAT),
  [NetworkName.BASE_SEPOLIA]: loadAddresses(NetworkName.BASE_SEPOLIA),
  [NetworkName.BASE]: loadAddresses(NetworkName.BASE),
};

// Export full deployment info by network
const deployments = {
  [NetworkName.LOCALHOST]: {
    LikeLottery: loadDeployment(NetworkName.LOCALHOST, 'LikeLottery'),
  },
  [NetworkName.HARDHAT]: {
    LikeLottery: loadDeployment(NetworkName.HARDHAT, 'LikeLottery'),
  },
  [NetworkName.BASE_SEPOLIA]: {
    LikeLottery: loadDeployment(NetworkName.BASE_SEPOLIA, 'LikeLottery'),
  },
  [NetworkName.BASE]: {
    LikeLottery: loadDeployment(NetworkName.BASE, 'LikeLottery'),
  },
};

// Helper function to get contract address by chain ID
function getContractAddress(chainId, contractName) {
  let network;

  switch (chainId) {
    case ChainId.LOCALHOST:
    case ChainId.HARDHAT:
      network = NetworkName.LOCALHOST;
      break;
    case ChainId.BASE_SEPOLIA:
      network = NetworkName.BASE_SEPOLIA;
      break;
    case ChainId.BASE:
      network = NetworkName.BASE;
      break;
    default:
      console.warn(`Unknown chain ID: ${chainId}`);
      return undefined;
  }

  return addresses[network]?.[contractName];
}

// Export convenience functions for specific contracts
const LikeLottery = {
  abi: LikeLotteryABI,
  addresses: {
    [ChainId.LOCALHOST]: addresses[NetworkName.LOCALHOST]?.LikeLottery,
    [ChainId.HARDHAT]: addresses[NetworkName.HARDHAT]?.LikeLottery,
    [ChainId.BASE_SEPOLIA]: addresses[NetworkName.BASE_SEPOLIA]?.LikeLottery,
    [ChainId.BASE]: addresses[NetworkName.BASE]?.LikeLottery,
  },
  getAddress: (chainId) => getContractAddress(chainId, 'LikeLottery'),
  getDeployment: (network) => deployments[network]?.LikeLottery,
};

module.exports = {
  NetworkName,
  ChainId,
  addresses,
  deployments,
  getContractAddress,
  LikeLotteryABI,
  LikeLottery,
};
