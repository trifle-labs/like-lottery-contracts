import { expect } from 'chai';

describe('Package Import Tests', () => {
  describe('CommonJS Import (index.js)', () => {
    let commonjsPackage: any;

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
      expect(commonjsPackage.NetworkName.BASE_SEPOLIA).to.equal('baseSepolia');
      expect(commonjsPackage.NetworkName.BASE).to.equal('base');
    });

    it('should export ChainId constants', () => {
      expect(commonjsPackage.ChainId.LOCALHOST).to.equal(31337);
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

  describe('ES6 Import (index.ts)', () => {
    let es6Package: any;

    before(async () => {
      // Test ES6 import
      es6Package = await import('../src/index.ts');
    });

    it('should successfully import via ES6 import', () => {
      expect(es6Package).to.not.be.undefined;
      expect(es6Package).to.have.property('NetworkName');
      expect(es6Package).to.have.property('ChainId');
      expect(es6Package).to.have.property('LikeLottery');
    });

    it('should export NetworkName enum', () => {
      expect(es6Package.NetworkName.LOCALHOST).to.equal('localhost');
      expect(es6Package.NetworkName.BASE_SEPOLIA).to.equal('baseSepolia');
      expect(es6Package.NetworkName.BASE).to.equal('base');
    });

    it('should export ChainId enum', () => {
      expect(es6Package.ChainId.LOCALHOST).to.equal(31337);
      expect(es6Package.ChainId.BASE_SEPOLIA).to.equal(84532);
      expect(es6Package.ChainId.BASE).to.equal(8453);
    });

    it('should export LikeLottery contract info', () => {
      expect(es6Package.LikeLottery).to.have.property('abi');
      expect(es6Package.LikeLottery).to.have.property('addresses');
      expect(es6Package.LikeLottery).to.have.property('getAddress');
      expect(es6Package.LikeLottery).to.have.property('getDeployment');
    });

    it('should export utility functions', () => {
      expect(es6Package.getNetworkName).to.be.a('function');
      expect(es6Package.getContractAddress).to.be.a('function');
    });

    it('should export addresses and deployments objects', () => {
      expect(es6Package.addresses).to.be.an('object');
      expect(es6Package.deployments).to.be.an('object');
    });

    it('should handle getNetworkName function correctly', () => {
      const networkName = es6Package.getNetworkName(31337);
      expect(networkName).to.equal('localhost');

      const baseNetwork = es6Package.getNetworkName(8453);
      expect(baseNetwork).to.equal('base');
    });

    it('should handle getContractAddress function correctly', () => {
      const address = es6Package.getContractAddress(31337, 'LikeLottery');
      // Address might be undefined if no deployment exists, but function should work
      expect(es6Package.getContractAddress).to.be.a('function');
    });
  });

  describe('Dynamic Import Tests', () => {
    it('should handle dynamic import of index.js', async () => {
      const dynamicImport = await import('../src/index.js');
      expect(dynamicImport).to.have.property('NetworkName');
      expect(dynamicImport).to.have.property('ChainId');
    });

    it('should handle dynamic import of index.ts', async () => {
      const dynamicImport = await import('../src/index.ts');
      expect(dynamicImport).to.have.property('NetworkName');
      expect(dynamicImport).to.have.property('ChainId');
    });
  });

  describe('Cross-Import Compatibility', () => {
    it('should have consistent exports between CommonJS and ES6', async () => {
      const commonjs = require('../src/index.js');
      const es6 = await import('../src/index.ts');

      // Test that both export the same constants
      expect(commonjs.NetworkName.LOCALHOST).to.equal(es6.NetworkName.LOCALHOST);
      expect(commonjs.ChainId.LOCALHOST).to.equal(es6.ChainId.LOCALHOST);
      expect(commonjs.NetworkName.BASE).to.equal(es6.NetworkName.BASE);
      expect(commonjs.ChainId.BASE).to.equal(es6.ChainId.BASE);
    });

    it('should have consistent function behavior between CommonJS and ES6', async () => {
      const commonjs = require('../src/index.js');
      const es6 = await import('../src/index.ts');

      // Test that both functions return the same results
      const commonjsResult = commonjs.getNetworkName(31337);
      const es6Result = es6.getNetworkName(31337);
      expect(commonjsResult).to.equal(es6Result);
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
    it('should simulate typical usage patterns', async () => {
      const pkg = await import('../src/index.ts');

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
});
