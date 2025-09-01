import LikeLotteryBase from '../deployments/base/LikeLottery.json';
import LikeLotteryBaseAddresses from '../deployments/base/addresses.json';

import LikeLotteryBaseSepolia from '../deployments/baseSepolia/LikeLottery.json';
import LikeLotteryBaseSepoliaAddresses from '../deployments/baseSepolia/addresses.json';

// Network names mapping
export enum NetworkName {
  BASE_SEPOLIA = 'baseSepolia',
  BASE = 'base',
}

// Chain IDs
export enum ChainId {
  BASE_SEPOLIA = 84532,
  BASE = 8453,
}

// Export addresses by network
export const addresses = {
  [NetworkName.BASE_SEPOLIA]: LikeLotteryBaseSepoliaAddresses,
  [NetworkName.BASE]: LikeLotteryBaseAddresses,
};

// Network name mapping function
export function getNetworkName(chainId: number): NetworkName {
  switch (chainId) {
    case ChainId.BASE_SEPOLIA:
      return NetworkName.BASE_SEPOLIA;
    case ChainId.BASE:
      return NetworkName.BASE;
    default:
      throw new Error(`Unknown chain ID: ${chainId}`);
  }
}

// Type definitions
export interface DeploymentInfo {
  address: string;
  abi: any[];
  transactionHash: string;
  blockNumber: number;
  deployer: string;
  network: string;
  chainId: number;
  timestamp: string;
}

export interface ContractAddresses {
  LikeLottery?: string;
}

// Helper function to load deployment info
function loadDeployment(network: string): DeploymentInfo | null {
  switch (network) {
    case NetworkName.BASE_SEPOLIA:
      return LikeLotteryBaseSepolia;
    case NetworkName.BASE:
      return LikeLotteryBase;
    default:
      throw new Error(`Unknown network: ${network}`);
  }
}

// Export contract ABIs (loaded from artifacts)
const LikeLotteryABI = LikeLotteryBase.abi;

// Export full deployment info by network
const deployments = {
  [NetworkName.BASE_SEPOLIA]: {
    LikeLottery: loadDeployment(NetworkName.BASE_SEPOLIA),
  },
  [NetworkName.BASE]: {
    LikeLottery: loadDeployment(NetworkName.BASE),
  },
};

// Helper function to get contract address by chain ID
function getContractAddress(chainId: number, contractName: string): string | undefined {
  let network: NetworkName;

  switch (chainId) {
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

  return (addresses[network] as any)?.[contractName];
}

// Export convenience functions for specific contracts
export const LikeLottery = {
  abi: LikeLotteryABI,
  networks: {
    [ChainId.BASE_SEPOLIA]: LikeLotteryBaseSepolia,
    [ChainId.BASE]: LikeLotteryBase,
  },
  addresses: {
    [ChainId.BASE_SEPOLIA]: addresses[NetworkName.BASE_SEPOLIA]?.LikeLottery,
    [ChainId.BASE]: addresses[NetworkName.BASE]?.LikeLottery,
  },
  getAddress: (chainId: number) => getContractAddress(chainId, 'LikeLottery'),
  getDeployment: (network: NetworkName) => deployments[network]?.LikeLottery,
};
