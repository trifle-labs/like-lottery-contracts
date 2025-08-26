# Like Lottery Contracts

Smart contracts for the Like Lottery project, deployed on Base network.

## Installation

```bash
yarn install
```

## Usage

### Compile Contracts

```bash
yarn compile
```

### Run Tests

```bash
yarn test
```

### Deploy

1. Copy `.env.example` to `.env` and add your mnemonic phrase and API keys:
```bash
cp .env.example .env
```

2. Deploy to the desired network:
```bash
# Deploy to Base Sepolia testnet
yarn deploy:baseSepolia

# Deploy to Base mainnet
yarn deploy:base

# Deploy to local network
yarn node # In one terminal
yarn deploy:local # In another terminal
```

### Verify Contracts

After deployment, verify your contracts:
```bash
CONTRACT_ADDRESS=<deployed-address> yarn verify:baseSepolia
# or
CONTRACT_ADDRESS=<deployed-address> yarn verify:base
```

## Importing Deployed Contracts

When this package is published, you can import deployed contract addresses and ABIs:

### JavaScript/TypeScript

```typescript
import { LikeLottery, ChainId } from 'like-lottery-contracts';

// Get ABI
const abi = LikeLottery.abi;

// Get address for a specific chain
const address = LikeLottery.getAddress(ChainId.BASE);
// or
const baseSepoliaAddress = LikeLottery.addresses[ChainId.BASE_SEPOLIA];

// Get full deployment info
import { deployments, NetworkName } from 'like-lottery-contracts';
const deployment = deployments[NetworkName.BASE_SEPOLIA].LikeLottery;
```

### Direct Access

You can also directly access deployment files:
```typescript
import baseDeployment from 'like-lottery-contracts/deployments/base/LikeLottery.json';
import baseSepoliaDeployment from 'like-lottery-contracts/deployments/baseSepolia/LikeLottery.json';
```

## Deployment Files

After deploying, the contract addresses and ABIs are automatically saved in the `deployments` directory:

```
deployments/
├── localhost/
│   ├── LikeLottery.json    # Full deployment info with ABI
│   └── addresses.json      # Simple address mapping
├── baseSepolia/
│   ├── LikeLottery.json
│   └── addresses.json
└── base/
    ├── LikeLottery.json
    └── addresses.json
```

Each `LikeLottery.json` contains:
- `address`: Contract address
- `abi`: Contract ABI
- `transactionHash`: Deployment transaction hash
- `blockNumber`: Deployment block number
- `deployer`: Deployer address
- `chainId`: Chain ID
- `timestamp`: Deployment timestamp

## Networks

- **Base Sepolia** (testnet): Chain ID 84532
- **Base** (mainnet): Chain ID 8453
- **Localhost**: Chain ID 31337

## License

MIT