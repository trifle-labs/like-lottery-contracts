import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying LikeLottery contract...");
  console.log("Network:", network.name);

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

  const LikeLottery = await ethers.getContractFactory("LikeLottery");
  const likeLottery = await LikeLottery.deploy();

  await likeLottery.deployed();

  console.log("LikeLottery deployed to:", likeLottery.address);

  // Save deployment info
  const deploymentInfo = {
    address: likeLottery.address,
    abi: JSON.parse(likeLottery.interface.format("json") as string),
    transactionHash: likeLottery.deployTransaction.hash,
    blockNumber: likeLottery.deployTransaction.blockNumber,
    deployer: deployer.address,
    network: network.name,
    chainId: network.config.chainId,
    timestamp: new Date().toISOString()
  };

  // Create deployments directory for this network if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments", network.name);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentPath = path.join(deploymentsDir, "LikeLottery.json");
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`Deployment info saved to ${deploymentPath}`);

  // Also save a simple addresses file for easy import
  const addressesPath = path.join(deploymentsDir, "addresses.json");
  const addresses = fs.existsSync(addressesPath) 
    ? JSON.parse(fs.readFileSync(addressesPath, "utf8"))
    : {};
  
  addresses.LikeLottery = likeLottery.address;
  
  fs.writeFileSync(
    addressesPath,
    JSON.stringify(addresses, null, 2)
  );

  return likeLottery.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });