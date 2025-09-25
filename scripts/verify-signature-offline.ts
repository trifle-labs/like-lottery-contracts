import { ethers } from 'ethers';

async function main() {
  console.log('Offline Signature Verification Test');
  console.log('==================================');

  // Test data provided by user
  const testNonce = '0xe7130b7474ff827b8b687a0016bedd22d9cd15d22d590ce37ebc20e7ae7269fa';
  const testSignature =
    '0xc65d2df85853c6eea06778c82fc0c06c3d7e7b18f949faa75d436ae85bb4788b585872f95c62caa0bb8531da65a34c6abfec4c174f6f13790f0717591455c90d1c';
  const testMessage = 'Nonce signed successfully';

  console.log('Test Data:');
  console.log(`- Nonce: ${testNonce}`);
  console.log(`- Signature: ${testSignature}`);
  console.log(`- Message: ${testMessage}`);

  // Get DRAW_MNEMONIC from environment
  const drawMnemonic = process.env.DRAW_MNEMONIC;
  if (!drawMnemonic) {
    console.error('Error: DRAW_MNEMONIC environment variable is required');
    console.error(
      'Usage: DRAW_MNEMONIC="your mnemonic phrase" npx ts-node scripts/verify-signature-offline.ts'
    );
    process.exit(1);
  }

  try {
    // Create wallet from mnemonic
    const wallet = ethers.Wallet.fromMnemonic(drawMnemonic);
    console.log(`\nUsing wallet: ${wallet.address}`);

    // Test 1: Verify the provided signature
    console.log('\n=== Test 1: Verify Provided Signature ===');
    try {
      const recoveredAddress = ethers.utils.verifyMessage(
        ethers.utils.arrayify(testNonce),
        testSignature
      );
      console.log(`Recovered address from provided signature: ${recoveredAddress}`);
      console.log(`Wallet address: ${wallet.address}`);
      console.log(
        `Addresses match: ${recoveredAddress.toLowerCase() === wallet.address.toLowerCase()}`
      );
    } catch (error: any) {
      console.error(`Signature verification failed: ${error.message}`);
    }

    // Test 2: Generate signature from wallet and compare
    console.log('\n=== Test 2: Generate Signature from Wallet ===');

    // Sign the nonce using the wallet
    const generatedSignature = await wallet.signMessage(ethers.utils.arrayify(testNonce));
    console.log(`Generated signature: ${generatedSignature}`);
    console.log(`Provided signature:  ${testSignature}`);
    console.log(`Signatures match: ${generatedSignature === testSignature}`);

    // Test 3: Verify the generated signature
    console.log('\n=== Test 3: Verify Generated Signature ===');
    try {
      const recoveredAddressGenerated = ethers.utils.verifyMessage(
        ethers.utils.arrayify(testNonce),
        generatedSignature
      );
      console.log(`Recovered address from generated signature: ${recoveredAddressGenerated}`);
      console.log(`Wallet address: ${wallet.address}`);
      console.log(
        `Addresses match: ${
          recoveredAddressGenerated.toLowerCase() === wallet.address.toLowerCase()
        }`
      );
    } catch (error: any) {
      console.error(`Generated signature verification failed: ${error.message}`);
    }

    // Test 4: Test different message formats
    console.log('\n=== Test 4: Test Different Message Formats ===');

    // Test signing the raw nonce (what the contract expects)
    const rawNonceSignature = await wallet.signMessage(ethers.utils.arrayify(testNonce));
    console.log(`Raw nonce signature: ${rawNonceSignature}`);

    // Test signing the message string (what the API might be doing)
    const messageSignature = await wallet.signMessage(testMessage);
    console.log(`Message signature: ${messageSignature}`);

    // Test signing with different message formats
    const nonceAsString = testNonce.slice(2); // Remove 0x prefix
    const nonceStringSignature = await wallet.signMessage(nonceAsString);
    console.log(`Nonce as string signature: ${nonceStringSignature}`);

    // Test 5: Manual hash calculation (what the contract does)
    console.log('\n=== Test 5: Manual Hash Calculation ===');

    // This is what the contract does internally
    const contractMessageHash = ethers.utils.keccak256(
      ethers.utils.solidityPack(
        ['string', 'bytes32'],
        ['\x19Ethereum Signed Message:\n32', testNonce]
      )
    );
    console.log(`Contract message hash: ${contractMessageHash}`);

    // This is what ethers.utils.verifyMessage does
    const ethersMessageHash = ethers.utils.hashMessage(ethers.utils.arrayify(testNonce));
    console.log(`Ethers message hash: ${ethersMessageHash}`);

    console.log(`Hashes match: ${contractMessageHash === ethersMessageHash}`);

    // Test 6: Try to recover using the contract's method
    console.log('\n=== Test 6: Contract-style Recovery ===');
    try {
      const r = testSignature.slice(0, 66);
      const s = testSignature.slice(66, 130);
      const v = testSignature.slice(130, 132);

      console.log(`Signature components:`);
      console.log(`- r: ${r}`);
      console.log(`- s: ${s}`);
      console.log(`- v: ${v}`);

      const recoveredAddress = ethers.utils.recoverAddress(contractMessageHash, {
        r: r,
        s: s,
        v: parseInt(v, 16),
      });

      console.log(`Recovered address (contract method): ${recoveredAddress}`);
      console.log(`Wallet address: ${wallet.address}`);
      console.log(
        `Addresses match: ${recoveredAddress.toLowerCase() === wallet.address.toLowerCase()}`
      );
    } catch (error: any) {
      console.error(`Contract-style recovery failed: ${error.message}`);
    }

    // Test 7: Check if the provided signature is valid hex
    console.log('\n=== Test 7: Signature Format Validation ===');
    console.log(`Signature length: ${testSignature.length}`);
    console.log(`Expected length: 132 (0x + 130 hex chars)`);
    console.log(`Valid hex: ${ethers.utils.isHexString(testSignature)}`);
    console.log(`Starts with 0x: ${testSignature.startsWith('0x')}`);
  } catch (error) {
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
