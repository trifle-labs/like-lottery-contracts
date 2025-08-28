# Package Import Tests

This directory contains comprehensive tests for importing and using both the `index.js` and `index.ts` packages from the Like Lottery Contracts project.

## Test Files

### 1. `package-imports.test.ts` - TypeScript Tests

Comprehensive tests that verify both CommonJS and ES6 import methods work correctly with both packages.

**Features tested:**

- ✅ CommonJS require of `index.js`
- ✅ ES6 import of `index.ts`
- ✅ Dynamic imports of both packages
- ✅ Cross-import compatibility
- ✅ Error handling
- ✅ Real-world usage patterns

**Import methods tested:**

```typescript
// CommonJS
const pkg = require('../src/index.js');

// ES6
const pkg = await import('../src/index.ts');

// Dynamic import
const pkg = await import('../src/index.js');
```

### 2. `package-imports.test.js` - JavaScript Tests

JavaScript-specific tests that focus on CommonJS functionality and avoid TypeScript imports.

**Features tested:**

- ✅ CommonJS require of `index.js`
- ✅ Dynamic import of `index.js`
- ✅ Error handling
- ✅ Real-world usage patterns
- ✅ Package.json export compatibility
- ✅ CommonJS-specific features (destructuring, caching, etc.)

### 3. `package-usage-example.js` - Usage Examples

A practical example script showing real-world usage patterns for both packages.

**Examples demonstrated:**

- CommonJS require usage
- ES6 dynamic import usage
- Contract information access
- Error handling patterns
- Real-world dApp scenarios

## Running the Tests

### Run TypeScript Tests

```bash
npm test -- test/package-imports.test.ts
```

### Run JavaScript Tests

```bash
npm test -- test/package-imports.test.js
```

### Run All Package Import Tests

```bash
npm test -- test/package-imports.test.ts test/package-imports.test.js
```

### Run Usage Example

```bash
node test/package-usage-example.js
```

## What the Tests Verify

### Package Exports

Both packages export the same functionality:

- `NetworkName` - Network name constants
- `ChainId` - Chain ID constants
- `LikeLottery` - Contract information object
- `addresses` - Contract addresses by network
- `deployments` - Deployment information by network
- `getNetworkName(chainId)` - Get network name from chain ID
- `getContractAddress(chainId, contractName)` - Get contract address

### Import Compatibility

- ✅ CommonJS environments can use `require('../src/index.js')`
- ✅ ES6 environments can use `import('../src/index.ts')`
- ✅ Both methods provide identical functionality
- ✅ Dynamic imports work for both packages
- ✅ Package.json exports are properly configured

### Error Handling

- ✅ Unknown chain IDs throw appropriate errors
- ✅ Graceful handling of missing deployments
- ✅ Proper error messages for debugging

### Real-world Usage

- ✅ Contract ABI access
- ✅ Network-specific address retrieval
- ✅ Deployment information access
- ✅ Cross-chain compatibility

## Package Structure

The project exports two main entry points:

1. **`src/index.js`** (CommonJS)

   - Main entry point for Node.js environments
   - Compatible with `require()` and `import()`
   - Exports all functionality as CommonJS module

2. **`src/index.ts`** (TypeScript)
   - TypeScript definitions and source
   - Compatible with ES6 `import` statements
   - Provides type safety and IntelliSense

## Usage Patterns

### CommonJS Environment

```javascript
const { NetworkName, ChainId, LikeLottery } = require('@trifle/like-lottery-contracts');

// Or import the entire package
const pkg = require('@trifle/like-lottery-contracts');
```

### ES6 Environment

```typescript
import { NetworkName, ChainId, LikeLottery } from '@trifle/like-lottery-contracts';

// Or import the entire package
import * as pkg from '@trifle/like-lottery-contracts';
```

### Dynamic Import

```javascript
// Works in both CommonJS and ES6 environments
const pkg = await import('@trifle/like-lottery-contracts');
```

## Test Results

When all tests pass, you should see:

- **TypeScript tests**: 23 passing tests
- **JavaScript tests**: 17 passing tests
- **Total**: 40 passing tests

This ensures that both packages work correctly in all supported environments and import methods.

## Troubleshooting

### Common Issues

1. **Module not found errors**

   - Ensure you're running tests from the project root
   - Check that `src/index.js` and `src/index.ts` exist

2. **TypeScript import errors**

   - JavaScript tests cannot import `.ts` files directly
   - Use `index.js` for JavaScript environments

3. **Path resolution issues**
   - Tests use relative paths from the `test/` directory
   - Adjust paths if running from different locations

### Debugging

- Run individual test files to isolate issues
- Check console output for detailed error messages
- Verify file paths and package structure
- Ensure all dependencies are installed

## Contributing

When adding new functionality to the packages:

1. **Update both `index.js` and `index.ts`**
2. **Add tests for new functionality**
3. **Test both CommonJS and ES6 import methods**
4. **Verify cross-import compatibility**
5. **Update this documentation**

## Related Files

- `src/index.js` - CommonJS package entry point
- `src/index.ts` - TypeScript package entry point
- `package.json` - Package configuration and exports
- `hardhat.config.ts` - Test configuration
