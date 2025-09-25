import { ethers, network } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('Deploying LikeLotteryV2 contract...');
  console.log('Network:', network.name);

  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.utils.formatEther(balance), 'ETH');

  const LikeLotteryV2 = await ethers.getContractFactory('LikeLotteryV2');
  const likeLotteryV2 = await LikeLotteryV2.deploy();

  await likeLotteryV2.deployed();

  console.log('LikeLotteryV2 deployed to:', likeLotteryV2.address);

  // Save deployment info
  const deploymentInfo = {
    address: likeLotteryV2.address,
    abi: JSON.parse(likeLotteryV2.interface.format('json') as string),
    transactionHash: likeLotteryV2.deployTransaction.hash,
    blockNumber: likeLotteryV2.deployTransaction.blockNumber,
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
  const deploymentPath = path.join(deploymentsDir, 'LikeLotteryV2.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log(`Deployment info saved to ${deploymentPath}`);

  // Also save a simple addresses file for easy import
  const addressesPath = path.join(deploymentsDir, 'addresses.json');
  const addresses = fs.existsSync(addressesPath)
    ? JSON.parse(fs.readFileSync(addressesPath, 'utf8'))
    : {};

  addresses.LikeLotteryV2 = likeLotteryV2.address;

  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));

  // Log contract details
  console.log('\nContract Details:');
  console.log('- Admin address:', await likeLotteryV2.admin());
  console.log('- Yank loop count:', (await likeLotteryV2.yankLoopCount()).toString());
  console.log('- Owner:', await likeLotteryV2.owner());

  return likeLotteryV2.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
