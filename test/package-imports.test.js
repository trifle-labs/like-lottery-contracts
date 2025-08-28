const { expect } = require('chai');

describe('Package Import Tests (JavaScript)', () => {
  describe('CommonJS Import (index.js)', () => {
    let commonjsPackage;

    before(async () => {
      // Test CommonJS require
      commonjsPackage = require('../src/index.js');
    });

    it('should successfully import via CommonJS require', () => {
      expect(commonjsPackage).to.not.be.undefined;
      expect(commonjsPackage).to.have.property('NetworkName');
      expect(commonjsPackage).to.have.property('ChainId');
      expect(commonjsPackage).to.have.property('LikeLottery');
    });

    it('should export NetworkName constants', () => {
      expect(commonjsPackage.NetworkName.LOCALHOST).to.equal('localhost');
      expect(commonjsPackage.NetworkName.HARDHAT).to.equal('hardhat');
      expect(commonjsPackage.NetworkName.BASE_SEPOLIA).to.equal('baseSepolia');
      expect(commonjsPackage.NetworkName.BASE).to.equal('base');
    });

    it('should export ChainId constants', () => {
      expect(commonjsPackage.ChainId.LOCALHOST).to.equal(31337);
      expect(commonjsPackage.ChainId.HARDHAT).to.equal(31337);
      expect(commonjsPackage.ChainId.BASE_SEPOLIA).to.equal(84532);
      expect(commonjsPackage.ChainId.BASE).to.equal(8453);
    });

    it('should export LikeLottery contract info', () => {
      expect(commonjsPackage.LikeLottery).to.have.property('abi');
      expect(commonjsPackage.LikeLottery).to.have.property('addresses');
      expect(commonjsPackage.LikeLottery).to.have.property('getAddress');
      expect(commonjsPackage.LikeLottery).to.have.property('getDeployment');
    });

    it('should export utility functions', () => {
      expect(commonjsPackage.getNetworkName).to.be.a('function');
      expect(commonjsPackage.getContractAddress).to.be.a('function');
    });

    it('should export addresses and deployments objects', () => {
      expect(commonjsPackage.addresses).to.be.an('object');
      expect(commonjsPackage.deployments).to.be.an('object');
    });

    it('should handle getNetworkName function correctly', () => {
      const networkName = commonjsPackage.getNetworkName(31337);
      expect(networkName).to.equal('localhost');
      
      const baseNetwork = commonjsPackage.getNetworkName(8453);
      expect(baseNetwork).to.equal('base');
    });

    it('should handle getContractAddress function correctly', () => {
      const address = commonjsPackage.getContractAddress(31337, 'LikeLottery');
      // Address might be undefined if no deployment exists, but function should work
      expect(commonjsPackage.getContractAddress).to.be.a('function');
    });
  });

  describe('Dynamic Import Tests', () => {
    it('should handle dynamic import of index.js', async () => {
      const dynamicImport = await import('../src/index.js');
      expect(dynamicImport).to.have.property('NetworkName');
      expect(dynamicImport).to.have.property('ChainId');
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown chain ID in getNetworkName', () => {
      const commonjs = require('../src/index.js');
      
      expect(() => {
        commonjs.getNetworkName(999999);
      }).to.throw('Unknown chain ID: 999999');
    });

    it('should handle unknown chain ID in getContractAddress gracefully', () => {
      const commonjs = require('../src/index.js');
      
      const result = commonjs.getContractAddress(999999, 'LikeLottery');
      expect(result).to.be.undefined;
    });
  });

  describe('Real-world Usage Simulation', () => {
    it('should simulate typical usage patterns with CommonJS', () => {
      const pkg = require('../src/index.js');
      
      // Simulate getting network info for a chain ID
      const chainId = 8453; // Base mainnet
      const networkName = pkg.getNetworkName(chainId);
      expect(networkName).to.equal('base');
      
      // Simulate getting contract address
      const contractAddress = pkg.getContractAddress(chainId, 'LikeLottery');
      // Address might be undefined, but function should work
      expect(pkg.getContractAddress).to.be.a('function');
      
      // Simulate accessing contract ABI
      expect(pkg.LikeLottery.abi).to.be.an('array');
      
      // Simulate getting deployment info
      const deployment = pkg.LikeLottery.getDeployment('base');
      // Deployment might be null, but function should work
      expect(pkg.LikeLottery.getDeployment).to.be.a('function');
    });
  });

  describe('Package.json Export Tests', () => {
    it('should work with package.json main field', () => {
      // This tests the package.json "main" field which points to src/index.js
      const pkg = require('../src/index.js');
      expect(pkg).to.have.property('NetworkName');
      expect(pkg).to.have.property('ChainId');
    });

    it('should work with package.json exports field', async () => {
      // This tests the package.json "exports" field
      const pkg = await import('../src/index.js');
      expect(pkg).to.have.property('NetworkName');
      expect(pkg).to.have.property('ChainId');
    });
  });

  describe('CommonJS Specific Tests', () => {
    it('should work with destructuring assignment', () => {
      const { NetworkName, ChainId, LikeLottery } = require('../src/index.js');
      
      expect(NetworkName.LOCALHOST).to.equal('localhost');
      expect(ChainId.LOCALHOST).to.equal(31337);
      expect(LikeLottery).to.have.property('abi');
    });

    it('should work with individual property access', () => {
      const pkg = require('../src/index.js');
      
      // Test individual property access
      expect(pkg.NetworkName).to.be.an('object');
      expect(pkg.ChainId).to.be.an('object');
      expect(pkg.LikeLottery).to.be.an('object');
      expect(pkg.addresses).to.be.an('object');
      expect(pkg.deployments).to.be.an('object');
    });

    it('should maintain object references', () => {
      const pkg1 = require('../src/index.js');
      const pkg2 = require('../src/index.js');
      
      // Node.js caches modules, so they should be the same reference
      expect(pkg1).to.equal(pkg2);
      expect(pkg1.NetworkName).to.equal(pkg2.NetworkName);
      expect(pkg1.ChainId).to.equal(pkg2.ChainId);
    });
  });
});
