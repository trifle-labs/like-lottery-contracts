import LikeLotteryBase from '../deployments/base/LikeLottery.json';
import LikeLotteryDrawBase from '../deployments/base/LikeLotteryDraw.json';
import LikeLotteryV2Base from '../deployments/base/LikeLotteryV2.json';
import LikeLotteryBaseAddresses from '../deployments/base/addresses.json';

import LikeLotteryBaseSepolia from '../deployments/baseSepolia/LikeLottery.json';
import LikeLotteryDrawBaseSepolia from '../deployments/baseSepolia/LikeLotteryDraw.json';
import LikeLotteryV2BaseSepolia from '../deployments/baseSepolia/LikeLotteryV2.json';
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
  LikeLotteryDraw?: string;
  LikeLotteryV2?: string;
}

// Helper function to load deployment info
function loadDeployment(network: string, contractName: string): DeploymentInfo | null {
  switch (network) {
    case NetworkName.BASE_SEPOLIA:
      if (contractName === 'LikeLottery') return LikeLotteryBaseSepolia;
      if (contractName === 'LikeLotteryDraw') return LikeLotteryDrawBaseSepolia;
      if (contractName === 'LikeLotteryV2') return LikeLotteryV2BaseSepolia;
      throw new Error(`Unknown contract for ${network}: ${contractName}`);
    case NetworkName.BASE:
      if (contractName === 'LikeLottery') return LikeLotteryBase;
      if (contractName === 'LikeLotteryDraw') return LikeLotteryDrawBase;
      if (contractName === 'LikeLotteryV2') return LikeLotteryV2Base;
      throw new Error(`Unknown contract for ${network}: ${contractName}`);
    default:
      throw new Error(`Unknown network: ${network}`);
  }
}

// Export contract ABIs (loaded from artifacts)
const LikeLotteryABI = LikeLotteryBase.abi;
const LikeLotteryDrawABI = LikeLotteryDrawBase.abi;
const LikeLotteryV2ABI = LikeLotteryV2Base.abi;

// Export full deployment info by network
const deployments = {
  [NetworkName.BASE_SEPOLIA]: {
    LikeLottery: loadDeployment(NetworkName.BASE_SEPOLIA, 'LikeLottery'),
    LikeLotteryDraw: loadDeployment(NetworkName.BASE_SEPOLIA, 'LikeLotteryDraw'),
    LikeLotteryV2: loadDeployment(NetworkName.BASE_SEPOLIA, 'LikeLotteryV2'),
  },
  [NetworkName.BASE]: {
    LikeLottery: loadDeployment(NetworkName.BASE, 'LikeLottery'),
    LikeLotteryDraw: loadDeployment(NetworkName.BASE, 'LikeLotteryDraw'),
    LikeLotteryV2: loadDeployment(NetworkName.BASE, 'LikeLotteryV2'),
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

export const LikeLotteryDraw = {
  abi: LikeLotteryDrawABI,
  networks: {
    [ChainId.BASE_SEPOLIA]: LikeLotteryDrawBaseSepolia,
    [ChainId.BASE]: LikeLotteryDrawBase,
  },
  addresses: {
    [ChainId.BASE_SEPOLIA]: addresses[NetworkName.BASE_SEPOLIA]?.LikeLotteryDraw,
    [ChainId.BASE]: addresses[NetworkName.BASE]?.LikeLotteryDraw,
  },
  getAddress: (chainId: number) => getContractAddress(chainId, 'LikeLotteryDraw'),
  getDeployment: (network: NetworkName) => deployments[network]?.LikeLotteryDraw,
};

export const LikeLotteryV2 = {
  abi: LikeLotteryV2ABI,
  networks: {
    [ChainId.BASE_SEPOLIA]: LikeLotteryV2BaseSepolia,
    [ChainId.BASE]: LikeLotteryV2Base,
  },
  addresses: {
    [ChainId.BASE_SEPOLIA]: (addresses[NetworkName.BASE_SEPOLIA] as any)?.LikeLotteryV2,
    [ChainId.BASE]: (addresses[NetworkName.BASE] as any)?.LikeLotteryV2,
  },
  getAddress: (chainId: number) => getContractAddress(chainId, 'LikeLotteryV2'),
  getDeployment: (network: NetworkName) => (deployments as any)[network]?.LikeLotteryV2,
};
