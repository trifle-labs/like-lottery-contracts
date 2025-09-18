import { ethers } from 'hardhat';

async function main() {
  // Get the yanker address from environment variable
  const yankerAddress = process.env.YANKER_ADDRESS;

  if (!yankerAddress) {
    console.error('Error: YANKER_ADDRESS environment variable is required');
    console.error(
      'Usage: YANKER_ADDRESS=0x1234... npx hardhat run scripts/yank.ts --network <network>'
    );
    process.exit(1);
  }

  // Validate the address format
  if (!ethers.utils.isAddress(yankerAddress)) {
    console.error('Error: YANKER_ADDRESS must be a valid Ethereum address');
    console.error('Example: YANKER_ADDRESS=0x1234567890123456789012345678901234567890');
    process.exit(1);
  }

  // Get the draw mnemonic from environment variable
  const drawMnemonic = process.env.DRAW_MNEMONIC;
  if (!drawMnemonic) {
    console.error('Error: DRAW_MNEMONIC environment variable is required');
    console.error(
      'Usage: DRAW_MNEMONIC="your mnemonic phrase" YANKER_ADDRESS=0x1234... npx hardhat run scripts/yank.ts --network <network>'
    );
    process.exit(1);
  }

  console.log(`Yanking contract with address: ${yankerAddress}`);

  try {
    // Create wallet from mnemonic
    const wallet = ethers.Wallet.fromMnemonic(drawMnemonic);
    const provider = ethers.provider;
    const signer = wallet.connect(provider);

    console.log(`Using wallet: ${wallet.address}`);

    // Get the contract instance
    const LikeLotteryDraw = await ethers.getContractFactory('LikeLotteryDraw', signer);

    // Get the deployed contract address from deployments
    const network = await ethers.provider.getNetwork();
    let networkName: string;

    // Map chainId to network name for unknown networks
    if (network.name === 'unknown') {
      switch (network.chainId) {
        case 84532:
          networkName = 'baseSepolia';
          break;
        case 8453:
          networkName = 'base';
          break;
        case 31337:
          networkName = 'localhost';
          break;
        default:
          networkName = 'localhost';
      }
    } else {
      networkName = network.name;
    }

    let contractAddress: string;
    try {
      const deployment = require(`../deployments/${networkName}/LikeLotteryDraw.json`);
      contractAddress = deployment.address;
    } catch (error) {
      console.error(`Error: Could not find LikeLotteryDraw deployment for network ${networkName}`);
      console.error('Make sure the contract is deployed first using: npm run deploy:draw:local');
      process.exit(1);
    }

    const contract = LikeLotteryDraw.attach(contractAddress).connect(signer);
    console.log(`\nUsing LikeLotteryDraw contract at: ${contractAddress}`);

    // Get the current nonce for the wallet
    const nonce = await provider.getTransactionCount(wallet.address, 'pending');
    console.log(`Using nonce: ${nonce}`);

    // Call adminYank with custom gas price and nonce
    console.log(`\nCalling adminYank...`);
    const gasPrice = ethers.utils.parseUnits('0.007', 'gwei');
    console.log(`Using gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} GWEI`);
    console.log(`Using gas limit: 50,000`);

    const tx = await contract.adminYank(yankerAddress, {
      gasPrice: gasPrice,
      nonce: nonce,
      gasLimit: 50000,
    });

    console.log(`Transaction submitted: ${tx.hash}`);
    console.log('Waiting for confirmation...');

    const receipt = await tx.wait();

    // Add a small delay to help with nonce management for subsequent runs
    console.log('Transaction confirmed, waiting 2 seconds for nonce to update...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);

    // Parse events
    const yankEvents = receipt.logs.filter((log) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'Yank';
      } catch {
        return false;
      }
    });

    if (yankEvents.length > 0) {
      console.log(`\nYank events emitted: ${yankEvents.length}`);
      yankEvents.forEach((event, index) => {
        const parsed = contract.interface.parseLog(event);
        console.log(
          `- Event ${index + 1}: Yanked by ${parsed?.args.drawnBy}, Random: ${parsed?.args.random}`
        );
      });
    }

    console.log(`\n✅ Contract yanked successfully!`);
  } catch (error: any) {
    if (error.message && error.message.includes('nonce')) {
      console.error('Nonce error detected. This might be due to running the script too quickly.');
      console.error(
        'Try waiting a bit longer between runs or check if a transaction is still pending.'
      );
    }
    console.error('Error:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
