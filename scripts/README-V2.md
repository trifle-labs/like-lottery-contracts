# LikeLotteryV2 Scripts

This directory contains V2 versions of all scripts that target the new `LikeLotteryV2` contract with signature-based authentication.

## Scripts Overview

### 1. `deploy-v2.ts`

Deploys the LikeLotteryV2 contract and saves deployment information.

**Usage:**

```bash
npx hardhat run scripts/deploy-v2.ts --network <network>
```

**Features:**

- Deploys LikeLotteryV2 contract
- Saves deployment info to `deployments/<network>/LikeLotteryV2.json`
- Updates addresses file for easy import
- Displays contract details (admin, yank loop count, owner)

### 2. `emit-snapshot-hash-v2.ts`

Emits snapshot hash data to the LikeLotteryV2 contract (owner only).

**Usage:**

```bash
PRIZE=213.74 BEFORE_DATETIME="2024-01-15T12:00:00.000Z" GIVEAWAY_INDEX=0 npx hardhat run scripts/emit-snapshot-hash-v2.ts --network <network>
```

**Environment Variables:**

- `PRIZE` (required): Prize amount for the lottery
- `BEFORE_DATETIME` (optional): ISO datetime string (defaults to current time)
- `GIVEAWAY_INDEX` (optional): Giveaway index (defaults to 0)
- `API_SECRET` (required): API secret for authentication

### 3. `verify-v2.ts`

Verifies the LikeLotteryV2 contract on block explorers.

**Usage:**

```bash
CONTRACT_ADDRESS=0x1234... npx hardhat run scripts/verify-v2.ts --network <network>
```

**Environment Variables:**

- `CONTRACT_ADDRESS` (required): Address of deployed contract
- `CONTRACT_NAME` (optional): Contract name (defaults to "LikeLotteryV2")

### 4. `yank-v2.ts`

Executes adminYank function (admin or owner only).

**Usage:**

```bash
DRAW_MNEMONIC="your mnemonic phrase" YANKER_ADDRESS=0x1234... npx hardhat run scripts/yank-v2.ts --network <network>
```

**Environment Variables:**

- `DRAW_MNEMONIC` (required): Mnemonic phrase for admin wallet
- `YANKER_ADDRESS` (required): Address to yank for

**Features:**

- Validates admin permissions
- Dynamic gas price adjustment
- Comprehensive error handling
- Displays yank events and contract state

### 5. `yank-crank-v2.ts`

Executes signature-authenticated yank or crank functions.

**Usage:**

```bash
ACTION=yank NONCE=0x1234... SIGNATURE=0x5678... npx hardhat run scripts/yank-crank-v2.ts --network <network>
```

**Environment Variables:**

- `ACTION` (required): Either "yank" or "crank"
- `NONCE` (required): 32-byte hex string (0x + 64 hex characters)
- `SIGNATURE` (required): 65-byte hex string (0x + 130 hex characters)

**Features:**

- Validates nonce and signature format
- Checks nonce usage before execution
- Supports both yank and crank operations
- Displays relevant events

### 6. `generate-nonce-signature.ts`

Generates nonces and signatures for testing signature authentication.

**Usage:**

```bash
ADMIN_MNEMONIC="your mnemonic phrase" npx ts-node scripts/generate-nonce-signature.ts
```

**Environment Variables:**

- `ADMIN_MNEMONIC` (required): Mnemonic phrase for admin wallet

**Features:**

- Generates random 32-byte nonce
- Signs nonce with admin wallet
- Verifies signature validity
- Provides usage instructions

## Complete Workflow Example

### 1. Deploy the Contract

```bash
npx hardhat run scripts/deploy-v2.ts --network baseSepolia
```

### 2. Verify the Contract

```bash
CONTRACT_ADDRESS=0x1234... npx hardhat run scripts/verify-v2.ts --network baseSepolia
```

### 3. Generate Nonce and Signature

```bash
ADMIN_MNEMONIC="your mnemonic phrase" npx ts-node scripts/generate-nonce-signature.ts
```

### 4. Test Signature Authentication

```bash
# Test yank
ACTION=yank NONCE=0x1234... SIGNATURE=0x5678... npx hardhat run scripts/yank-crank-v2.ts --network baseSepolia

# Test crank
ACTION=crank NONCE=0x1234... SIGNATURE=0x5678... npx hardhat run scripts/yank-crank-v2.ts --network baseSepolia
```

### 5. Admin Yank (No Signature Required)

```bash
DRAW_MNEMONIC="your mnemonic phrase" YANKER_ADDRESS=0x1234... npx hardhat run scripts/yank-v2.ts --network baseSepolia
```

### 6. Emit Snapshot Hash (Owner Only)

```bash
PRIZE=1000 API_SECRET=your_secret npx hardhat run scripts/emit-snapshot-hash-v2.ts --network baseSepolia
```

## Key Differences from V1 Scripts

1. **Target Contract**: All scripts target `LikeLotteryV2` instead of separate contracts
2. **Signature Authentication**: `yank-crank-v2.ts` supports signature-based authentication
3. **Enhanced Error Handling**: Better validation and error messages
4. **Contract State Display**: Shows contract details after operations
5. **Nonce Management**: Tracks and validates nonce usage

## Security Notes

- **Admin Private Key**: Keep the admin mnemonic/private key secure
- **Nonce Reuse**: Each nonce can only be used once
- **Signature Verification**: Signatures are verified against the admin address
- **Access Control**: Different functions have different access requirements:
  - `yank`/`crank`: Requires valid signature from admin
  - `adminYank`: Requires admin or owner wallet
  - `emitSnapshotHash`: Requires owner wallet

## Troubleshooting

### Common Issues

1. **"Invalid signature"**: Ensure the signature was created by the admin wallet
2. **"Nonce already used"**: Generate a new nonce for each transaction
3. **"Only admin can yank"**: Use the correct admin wallet for adminYank
4. **"Only owner"**: Use the owner wallet for emitSnapshotHash

### Verification Issues

- **Deprecated API Error**: The hardhat configuration has been updated to use Etherscan API V2 endpoints
- **API Key Required**: Ensure `BASESCAN_API_KEY` environment variable is set for Base networks
- **Network Support**: Verification is supported for Base and Base Sepolia networks

### Gas Issues

- Scripts include automatic gas price adjustment
- If transactions fail, they will retry with higher gas prices
- Monitor gas prices on the target network

### Network Issues

- Ensure the contract is deployed before running other scripts
- Check that the correct network is specified
- Verify deployment files exist in the deployments directory
