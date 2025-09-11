import { ethers, network } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('Deploying LikeLotteryDraw contract...');
  console.log('Network:', network.name);

  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.utils.formatEther(balance), 'ETH');

  const LikeLotteryDraw = await ethers.getContractFactory('LikeLotteryDraw');

  const likeLotteryDraw = await LikeLotteryDraw.deploy();
  await likeLotteryDraw.deployed();

  console.log('LikeLotteryDraw deployed to:', likeLotteryDraw.address);

  // Save deployment info
  const deploymentInfo = {
    address: likeLotteryDraw.address,
    abi: JSON.parse(likeLotteryDraw.interface.format('json') as string),
    transactionHash: likeLotteryDraw.deployTransaction.hash,
    blockNumber: likeLotteryDraw.deployTransaction.blockNumber,
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
  const deploymentPath = path.join(deploymentsDir, 'LikeLotteryDraw.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log(`Deployment info saved to ${deploymentPath}`);

  // Also save a simple addresses file for easy import
  const addressesPath = path.join(deploymentsDir, 'addresses.json');
  const addresses = fs.existsSync(addressesPath)
    ? JSON.parse(fs.readFileSync(addressesPath, 'utf8'))
    : {};

  addresses.LikeLotteryDraw = likeLotteryDraw.address;

  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));

  return likeLotteryDraw.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
