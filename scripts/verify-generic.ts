import { run } from 'hardhat';

async function main() {
  // Get contract address and name from command line arguments or environment variables
  const contractAddress = process.argv[2] || process.env.CONTRACT_ADDRESS;
  const contractName = process.argv[3] || process.env.CONTRACT_NAME;

  if (!contractAddress) {
    console.error('Please provide a contract address as an argument:');
    console.error(
      'Usage: npx hardhat run scripts/verify-generic.ts -- <ContractAddress> [ContractName]'
    );
    console.error(
      'Example: npx hardhat run scripts/verify-generic.ts -- 0x1234...abcd LikeLotteryV3'
    );
    console.error('Or set CONTRACT_ADDRESS and CONTRACT_NAME environment variables');
    process.exit(1);
  }

  if (!contractName) {
    console.error('Please provide a contract name as an argument:');
    console.error(
      'Usage: npx hardhat run scripts/verify-generic.ts -- <ContractAddress> <ContractName>'
    );
    console.error(
      'Example: npx hardhat run scripts/verify-generic.ts -- 0x1234...abcd LikeLotteryV3'
    );
    console.error('Or set CONTRACT_NAME environment variable');
    process.exit(1);
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
