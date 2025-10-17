import { ethers, network } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  // Get contract name from command line arguments or environment variable
  const contractName = process.argv[2] || process.env.CONTRACT_NAME;

  if (!contractName) {
    console.error('Please provide a contract name as an argument:');
    console.error('Usage: npx hardhat run scripts/deploy-generic.ts -- <ContractName>');
    console.error('Example: npx hardhat run scripts/deploy-generic.ts -- LikeLotteryV3');
    console.error('Or set CONTRACT_NAME environment variable');
    process.exit(1);
  }

  console.log(`Deploying ${contractName} contract...`);
  console.log('Network:', network.name);

  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.utils.formatEther(balance), 'ETH');

  // Get contract factory
  const ContractFactory = await ethers.getContractFactory(contractName);
  const contract = await ContractFactory.deploy();

  await contract.deployed();

  console.log(`${contractName} deployed to:`, contract.address);

  // Save deployment info
  const deploymentInfo = {
    address: contract.address,
    abi: JSON.parse(contract.interface.format('json') as string),
    transactionHash: contract.deployTransaction.hash,
    blockNumber: contract.deployTransaction.blockNumber,
    deployer: deployer.address,
    network: network.name,
    chainId: network.config.chainId,
    timestamp: new Date().toISOString(),
  };

  // Create deployments directory for this network if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments', network.name);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentPath = path.join(deploymentsDir, `${contractName}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log(`Deployment info saved to ${deploymentPath}`);

  // Also save a simple addresses file for easy import
  const addressesPath = path.join(deploymentsDir, 'addresses.json');
  const addresses = fs.existsSync(addressesPath)
    ? JSON.parse(fs.readFileSync(addressesPath, 'utf8'))
    : {};

  addresses[contractName] = contract.address;

  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));

  // Log contract details (try to get common properties)
  console.log('\nContract Details:');
  try {
    if (await contract.hasOwnProperty('admin')) {
      console.log('- Admin address:', await contract.admin());
    }
    if (await contract.hasOwnProperty('yankLoopCount')) {
      console.log('- Yank loop count:', (await contract.yankLoopCount()).toString());
    }
    if (await contract.hasOwnProperty('yankCost')) {
      console.log('- Yank cost:', ethers.utils.formatEther(await contract.yankCost()), 'ETH');
    }
    if (await contract.hasOwnProperty('owner')) {
      console.log('- Owner:', await contract.owner());
    }
  } catch (error) {
    console.log('- Some contract details could not be retrieved');
  }

  return contract.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
