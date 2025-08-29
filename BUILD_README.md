# Build System

This project uses Parcel to build the TypeScript source into a JavaScript module that can be used in both Node.js and browser environments.

## Build Commands

- `yarn build` - Build the library for production
- `yarn dev` - Watch mode for development
- `yarn clean` - Clean the dist directory

## Output

The build process generates:

- `dist/module.js` - The main library file (works in both CommonJS and ESM)

## Usage

### Node.js (CommonJS)

```javascript
const LikeLottery = require('@trifle/like-lottery-contracts');

console.log(LikeLottery.NetworkName.BASE); // 'base'
console.log(LikeLottery.ChainId.BASE); // 8453
console.log(LikeLottery.LikeLottery.addresses[8453]); // Base mainnet address
```

### Browser/ESM

```javascript
import { LikeLottery, NetworkName, ChainId } from '@trifle/like-lottery-contracts';

console.log(NetworkName.BASE); // 'base'
console.log(ChainId.BASE); // 8453
console.log(LikeLottery.addresses[8453]); // Base mainnet address
```

## API

### LikeLottery

- `abi` - Contract ABI
- `networks` - Network-specific deployment data
- `addresses` - Contract addresses by chain ID
- `getAddress(chainId)` - Get contract address for a specific chain
- `getDeployment(network)` - Get deployment info for a specific network

### NetworkName

- `BASE_SEPOLIA` - 'baseSepolia'
- `BASE` - 'base'

### ChainId

- `BASE_SEPOLIA` - 84532
- `BASE` - 8453

## Build Configuration

The build uses Parcel's default configuration with a simple target setup in `package.json`:

```json
"targets": {
  "module": {
    "optimize": true,
    "source": "src/index.ts",
    "isLibrary": true
  }
}
```

This generates a single optimized JavaScript file that works in both CommonJS and ESM environments.
