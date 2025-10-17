# Generic Deployment and Verification Scripts

This document describes how to use the generic deployment and verification scripts that can work with any LikeLottery contract version.

## Generic Deploy Script

The `deploy-generic.ts` script can deploy any LikeLottery contract version by specifying the contract name as a parameter.

### Usage

```bash
# Using command line argument
npx hardhat run scripts/deploy-generic.ts -- <ContractName> --network <network>

# Using environment variable
CONTRACT_NAME=<ContractName> npx hardhat run scripts/deploy-generic.ts --network <network>

# Using npm script
npm run deploy:generic -- <ContractName> --network <network>
```

### Examples

```bash
# Deploy LikeLotteryV2 to baseSepolia
npx hardhat run scripts/deploy-generic.ts -- LikeLotteryV2 --network baseSepolia

# Deploy LikeLotteryV3 to base
npx hardhat run scripts/deploy-generic.ts -- LikeLotteryV3 --network base

# Deploy LikeLottery to localhost
CONTRACT_NAME=LikeLottery npx hardhat run scripts/deploy-generic.ts --network localhost
```

### Features

- Automatically detects and logs contract-specific properties (admin, yankLoopCount, yankCost, owner)
- Saves deployment info to `deployments/<network>/<ContractName>.json`
- Updates the `addresses.json` file for easy import
- Provides clear error messages if contract name is not provided

## Generic Verify Script

The `verify-generic.ts` script can verify any deployed LikeLottery contract by specifying the contract address and name.

### Usage

```bash
# Using command line arguments
npx hardhat run scripts/verify-generic.ts -- <ContractAddress> <ContractName> --network <network>

# Using environment variables
CONTRACT_ADDRESS=<address> CONTRACT_NAME=<name> npx hardhat run scripts/verify-generic.ts --network <network>

# Using npm script
npm run verify:generic -- <ContractAddress> <ContractName> --network <network>
```

### Examples

```bash
# Verify LikeLotteryV2 at specific address
npx hardhat run scripts/verify-generic.ts -- 0x1234...abcd LikeLotteryV2 --network baseSepolia

# Verify LikeLotteryV3 at specific address
npx hardhat run scripts/verify-generic.ts -- 0x5678...efgh LikeLotteryV3 --network base

# Using environment variables
CONTRACT_ADDRESS=0x1234...abcd CONTRACT_NAME=LikeLotteryV2 npx hardhat run scripts/verify-generic.ts --network baseSepolia
```

## Updated V2 Verify Script

The `verify-v2.ts` script has been updated to accept command line arguments while maintaining backward compatibility with environment variables.

### Usage

```bash
# Using command line arguments (new)
npx hardhat run scripts/verify-v2.ts -- <ContractAddress> [ContractName] --network <network>

# Using environment variables (existing)
CONTRACT_ADDRESS=<address> CONTRACT_NAME=<name> npx hardhat run scripts/verify-v2.ts --network <network>
```

### Examples

```bash
# Verify with command line arguments
npx hardhat run scripts/verify-v2.ts -- 0x1234...abcd LikeLotteryV3 --network baseSepolia

# Verify with environment variables (defaults to LikeLotteryV2)
CONTRACT_ADDRESS=0x1234...abcd npx hardhat run scripts/verify-v2.ts --network baseSepolia
```

## Workflow Examples

### Deploy and Verify LikeLotteryV3

```bash
# 1. Deploy LikeLotteryV3
npx hardhat run scripts/deploy-generic.ts -- LikeLotteryV3 --network baseSepolia

# 2. Note the deployed address from the output
# 3. Verify the contract
npx hardhat run scripts/verify-generic.ts -- <deployed_address> LikeLotteryV3 --network baseSepolia
```

### Deploy and Verify LikeLotteryV2

```bash
# 1. Deploy LikeLotteryV2
npx hardhat run scripts/deploy-generic.ts -- LikeLotteryV2 --network baseSepolia

# 2. Note the deployed address from the output
# 3. Verify the contract
npx hardhat run scripts/verify-generic.ts -- <deployed_address> LikeLotteryV2 --network baseSepolia
```

## Error Handling

Both scripts provide clear error messages and usage instructions if required parameters are missing:

- **Deploy script**: Requires contract name
- **Verify scripts**: Require contract address and name

The scripts will exit with code 1 and display helpful usage information if parameters are missing.
