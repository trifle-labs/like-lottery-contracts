import { run } from 'hardhat';

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const contractName = process.env.CONTRACT_NAME || 'LikeLotteryDraw';

  if (!contractAddress) {
    throw new Error('Please set CONTRACT_ADDRESS in your environment variables');
  }

  console.log(`Verifying ${contractName} contract at address:`, contractAddress);

  try {
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log(`${contractName} contract verified successfully!`);
  } catch (error: any) {
    if (error.message.toLowerCase().includes('already verified')) {
      console.log(`${contractName} contract is already verified!`);
    } else {
      console.error(`Error verifying ${contractName} contract:`, error);
      throw error;
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
