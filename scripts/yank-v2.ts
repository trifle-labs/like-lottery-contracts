import { ethers } from 'hardhat';

const rate = 15000;

async function main() {
  // Get the yanker address from environment variable
  const yankerAddress = process.env.YANKER_ADDRESS;

  if (!yankerAddress) {
    console.error('Error: YANKER_ADDRESS environment variable is required');
    console.error(
      'Usage: YANKER_ADDRESS=0x1234... npx hardhat run scripts/yank-v2.ts --network <network>'
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
      'Usage: DRAW_MNEMONIC="your mnemonic phrase" YANKER_ADDRESS=0x1234... npx hardhat run scripts/yank-v2.ts --network <network>'
    );
    process.exit(1);
  }

  console.log(`Yanking LikeLotteryV2 contract with address: ${yankerAddress}`);

  try {
    // Create wallet from mnemonic
    const wallet = ethers.Wallet.fromMnemonic(drawMnemonic);
    const provider = ethers.provider;
    const signer = wallet.connect(provider);

    console.log(`Using wallet: ${wallet.address}`);

    // Get the contract instance
    const LikeLotteryV2 = await ethers.getContractFactory('LikeLotteryV2', signer);

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
      const deployment = require(`../deployments/${networkName}/LikeLotteryV2.json`);
      contractAddress = deployment.address;
    } catch (error) {
      console.error(`Error: Could not find LikeLotteryV2 deployment for network ${networkName}`);
      console.error(
        'Make sure the contract is deployed first using: npx hardhat run scripts/deploy-v2.ts --network <network>'
      );
      process.exit(1);
    }

    const contract = LikeLotteryV2.attach(contractAddress).connect(signer);
    console.log(`\nUsing LikeLotteryV2 contract at: ${contractAddress}`);

    // Check if the wallet is the admin
    const adminAddress = await contract.admin();
    if (wallet.address.toLowerCase() !== adminAddress.toLowerCase()) {
      console.error(
        `Error: Wallet address ${wallet.address} is not the admin address ${adminAddress}`
      );
      console.error('Only the admin can call adminYank');
      process.exit(1);
    }

    // Get the current nonce for the wallet
    const nonce = await provider.getTransactionCount(wallet.address, 'pending');
    console.log(`Using nonce: ${nonce}`);

    // Call adminYank with dynamic gas price handling
    console.log(`\nCalling adminYank...`);
    let gasPrice = ethers.utils.parseUnits('0.006', 'gwei');
    console.log(`Using gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} GWEI`);
    console.log(`Using gas limit: 85,000`);

    let tx;
    try {
      tx = await contract.adminYank(yankerAddress, {
        gasPrice: gasPrice,
        nonce: nonce,
        gasLimit: 85000,
      });
    } catch (error: any) {
      // Check if it's a gas price error
      if (error.message && error.message.includes('max fee per gas less than block base fee')) {
        console.log(`\n⚠️  Gas price too low, attempting to extract base fee from error...`);

        // Try to extract base fee from error message
        const baseFeeMatch = error.message.match(/baseFee:\s*(\d+)/);
        const maxFeeMatch = error.message.match(/maxFeePerGas:\s*(\d+)/);

        if (baseFeeMatch) {
          const baseFeeWei = ethers.BigNumber.from(baseFeeMatch[1]);
          const baseFeeGwei = ethers.utils.formatUnits(baseFeeWei, 'gwei');
          console.log(`Detected base fee: ${baseFeeGwei} GWEI`);

          // Set gas price to 1.2x base fee for safety margin
          const adjustedGasPrice = baseFeeWei.mul(120).div(100);
          const adjustedGasPriceGwei = ethers.utils.formatUnits(adjustedGasPrice, 'gwei');
          console.log(`Retrying with adjusted gas price: ${adjustedGasPriceGwei} GWEI`);

          try {
            tx = await contract.adminYank(yankerAddress, {
              gasPrice: adjustedGasPrice,
              nonce: nonce,
              gasLimit: 85000,
            });
            console.log(`✅ Retry successful with adjusted gas price`);
          } catch (retryError: any) {
            console.error(`❌ Retry failed:`, retryError.message);
            throw retryError;
          }
        } else {
          // Fallback: try with a much higher gas price
          console.log(`Could not extract base fee, trying with 0.01 GWEI...`);
          const fallbackGasPrice = ethers.utils.parseUnits('0.01', 'gwei');

          try {
            tx = await contract.adminYank(yankerAddress, {
              gasPrice: fallbackGasPrice,
              nonce: nonce,
              gasLimit: 85000,
            });
            console.log(`✅ Retry successful with fallback gas price`);
          } catch (retryError: any) {
            console.error(`❌ Fallback retry failed:`, retryError.message);
            throw retryError;
          }
        }
      } else if (error.message && error.message.includes('already known')) {
        // Handle "already known" error by retrying with higher gas price
        console.log(
          `\n⚠️  Transaction already known (duplicate nonce), retrying with higher gas price...`
        );

        // Try with 2x the original gas price
        const higherGasPrice = gasPrice.mul(2);
        const higherGasPriceGwei = ethers.utils.formatUnits(higherGasPrice, 'gwei');
        console.log(`Retrying with higher gas price: ${higherGasPriceGwei} GWEI`);

        try {
          tx = await contract.adminYank(yankerAddress, {
            gasPrice: higherGasPrice,
            nonce: nonce,
            gasLimit: 85000,
          });
          console.log(`✅ Retry successful with higher gas price`);
        } catch (retryError: any) {
          console.error(`❌ Higher gas price retry failed:`, retryError.message);
          throw retryError;
        }
      } else if (error.message && error.message.includes('replacement fee too low')) {
        // Handle "replacement fee too low" error by retrying with higher gas price
        console.log(`\n⚠️  Replacement fee too low, retrying with higher gas price...`);

        // Try with 2x the original gas price
        const higherGasPrice = gasPrice.mul(2);
        const higherGasPriceGwei = ethers.utils.formatUnits(higherGasPrice, 'gwei');
        console.log(`Retrying with higher gas price: ${higherGasPriceGwei} GWEI`);

        try {
          tx = await contract.adminYank(yankerAddress, {
            gasPrice: higherGasPrice,
            nonce: nonce,
            gasLimit: 85000,
          });
          console.log(`✅ Retry successful with higher gas price`);
        } catch (retryError: any) {
          console.error(`❌ Higher gas price retry failed:`, retryError.message);
          throw retryError;
        }
      } else {
        // Re-throw if it's not a recognized error
        throw error;
      }
    }

    console.log(`Transaction submitted: ${tx.hash}`);
    console.log('Waiting for confirmation...');

    // Wait for confirmation with timeout
    let receipt: any;
    let hadTimeout = false;
    try {
      receipt = await Promise.race([
        tx.wait(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Confirmation timeout after ${rate / 1000} seconds`)),
            rate
          )
        ),
      ]);
    } catch (error: any) {
      if (error.message.includes('Confirmation timeout')) {
        console.log(
          `\n⚠️  Confirmation timeout after ${
            rate / 1000
          } seconds, retrying with higher gas price...`
        );
        hadTimeout = true;

        // Try with 2x the current gas price
        const currentGasPrice = tx.gasPrice || gasPrice;
        const higherGasPrice = currentGasPrice.mul(2);
        const higherGasPriceGwei = ethers.utils.formatUnits(higherGasPrice, 'gwei');
        console.log(`Retrying with higher gas price: ${higherGasPriceGwei} GWEI`);

        try {
          const retryTx = await contract.adminYank(yankerAddress, {
            gasPrice: higherGasPrice,
            nonce: nonce,
            gasLimit: 85000,
          });
          console.log(`Retry transaction submitted: ${retryTx.hash}`);
          console.log('Waiting for retry confirmation...');

          receipt = await retryTx.wait();
          console.log(`✅ Retry successful with higher gas price`);
        } catch (retryError: any) {
          console.error(`❌ Retry failed:`, retryError.message);
          throw retryError;
        }
      } else {
        throw error;
      }
    }

    // Add a small delay to help with nonce management for subsequent runs
    if (hadTimeout) {
      console.log('Transaction confirmed (timeout retry), skipping additional wait...');
    } else {
      console.log(`Transaction confirmed, waiting ${rate / 1000} seconds for nonce to update...`);
      await new Promise((resolve) => setTimeout(resolve, rate));
    }
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);

    // Parse events
    const yankEvents = receipt.logs.filter((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'Yank';
      } catch {
        return false;
      }
    });

    if (yankEvents.length > 0) {
      console.log(`\nYank events emitted: ${yankEvents.length}`);
      yankEvents.forEach((event: any, index: number) => {
        const parsed = contract.interface.parseLog(event);
        console.log(
          `- Event ${index + 1}: Yanked by ${parsed?.args.drawnBy}, Random: ${parsed?.args.random}`
        );
      });
    }

    // Display contract state after yank
    console.log(`\nContract state after yank:`);
    console.log(`- Current nonce: ${await contract.nonce()}`);
    console.log(`- Yank loop count: ${(await contract.yankLoopCount()).toString()}`);
    console.log(`- Admin address: ${await contract.admin()}`);

    console.log(`\n✅ LikeLotteryV2 contract yanked successfully!`);
    console.log(`Note: Gas price automatically adjusted based on network conditions`);
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
