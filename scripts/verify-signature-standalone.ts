import { ethers } from 'ethers';

// Replicate the contract's signature verification logic using only ethers
function verifySignatureContractStyle(
  nonce: string,
  signature: string,
  adminAddress: string
): boolean {
  try {
    // This is exactly what the contract does in verifySignature function
    // Contract calculates: keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", nonce))
    const messageHash = ethers.utils.keccak256(
      ethers.utils.solidityPack(['string', 'bytes32'], ['\x19Ethereum Signed Message:\n32', nonce])
    );

    // Extract signature components (same as contract assembly)
    const r = signature.slice(0, 66);
    const s = signature.slice(66, 130);
    const v = signature.slice(130, 132);

    // Recover the signer address using ecrecover equivalent
    const signer = ethers.utils.recoverAddress(messageHash, {
      r: r,
      s: s,
      v: parseInt(v, 16),
    });

    return signer.toLowerCase() === adminAddress.toLowerCase();
  } catch (error) {
    console.error('Contract-style verification error:', error);
    return false;
  }
}

async function main() {
  console.log('Standalone Signature Verification Test');
  console.log('=====================================');

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
      'Usage: DRAW_MNEMONIC="your mnemonic phrase" npx ts-node scripts/verify-signature-standalone.ts'
    );
    process.exit(1);
  }

  try {
    // Create wallet from mnemonic
    const wallet = ethers.Wallet.fromMnemonic(drawMnemonic);
    console.log(`\nUsing wallet: ${wallet.address}`);

    // Test 1: Contract-style signature verification
    console.log('\n=== Test 1: Contract-Style Signature Verification ===');
    const isValidContractStyle = verifySignatureContractStyle(
      testNonce,
      testSignature,
      wallet.address
    );
    console.log(`Contract-style verification result: ${isValidContractStyle}`);

    // Test 2: Generate signature from wallet and verify
    console.log('\n=== Test 2: Generate and Verify Signature from Wallet ===');

    // Sign the nonce using the wallet (same way the API should do it)
    const generatedSignature = await wallet.signMessage(ethers.utils.arrayify(testNonce));
    console.log(`Generated signature: ${generatedSignature}`);
    console.log(`Provided signature:  ${testSignature}`);
    console.log(`Signatures match: ${generatedSignature === testSignature}`);

    // Verify the generated signature using contract logic
    const isValidGenerated = verifySignatureContractStyle(
      testNonce,
      generatedSignature,
      wallet.address
    );
    console.log(`Generated signature verification: ${isValidGenerated}`);

    // Test 3: Standard ethers verification (for comparison)
    console.log('\n=== Test 3: Standard Ethers Verification ===');
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
      console.error(`Standard verification failed: ${error.message}`);
    }

    // Test 4: Manual signature component analysis
    console.log('\n=== Test 4: Signature Component Analysis ===');

    const r = testSignature.slice(0, 66);
    const s = testSignature.slice(66, 130);
    const v = testSignature.slice(130, 132);

    console.log(`Signature components:`);
    console.log(`- r: ${r}`);
    console.log(`- s: ${s}`);
    console.log(`- v: ${v}`);
    console.log(`- Total length: ${testSignature.length} (expected: 132)`);

    // Test 5: Message hash comparison
    console.log('\n=== Test 5: Message Hash Analysis ===');

    // Contract's message hash calculation
    const contractMessageHash = ethers.utils.keccak256(
      ethers.utils.solidityPack(
        ['string', 'bytes32'],
        ['\x19Ethereum Signed Message:\n32', testNonce]
      )
    );
    console.log(`Contract message hash: ${contractMessageHash}`);

    // Ethers standard message hash
    const ethersMessageHash = ethers.utils.hashMessage(ethers.utils.arrayify(testNonce));
    console.log(`Ethers message hash: ${ethersMessageHash}`);
    console.log(`Hashes match: ${contractMessageHash === ethersMessageHash}`);

    // Test 6: Test different signing approaches
    console.log('\n=== Test 6: Different Signing Approaches ===');

    // Approach 1: Raw nonce bytes (correct for contract)
    const approach1 = await wallet.signMessage(ethers.utils.arrayify(testNonce));
    console.log(`Approach 1 (raw nonce bytes): ${approach1}`);
    console.log(`Matches provided: ${approach1 === testSignature}`);

    // Approach 2: Nonce as string
    const approach2 = await wallet.signMessage(testNonce);
    console.log(`Approach 2 (nonce as string): ${approach2}`);
    console.log(`Matches provided: ${approach2 === testSignature}`);

    // Approach 3: Nonce without 0x prefix
    const nonceWithoutPrefix = testNonce.slice(2);
    const approach3 = await wallet.signMessage(nonceWithoutPrefix);
    console.log(`Approach 3 (nonce without 0x): ${approach3}`);
    console.log(`Matches provided: ${approach3 === testSignature}`);

    // Test 7: Verify all approaches with contract logic
    console.log('\n=== Test 7: Verify All Approaches with Contract Logic ===');

    const approaches = [
      { name: 'Raw nonce bytes', signature: approach1 },
      { name: 'Nonce as string', signature: approach2 },
      { name: 'Nonce without 0x', signature: approach3 },
      { name: 'Provided signature', signature: testSignature },
    ];

    approaches.forEach((approach, index) => {
      const isValid = verifySignatureContractStyle(testNonce, approach.signature, wallet.address);
      console.log(`${index + 1}. ${approach.name}: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    });

    // Test 8: Signature format validation
    console.log('\n=== Test 8: Signature Format Validation ===');
    console.log(`Provided signature length: ${testSignature.length}`);
    console.log(`Expected length: 132 (0x + 130 hex chars)`);
    console.log(`Valid hex: ${ethers.utils.isHexString(testSignature)}`);
    console.log(`Starts with 0x: ${testSignature.startsWith('0x')}`);
    console.log(
      `Valid signature format: ${
        testSignature.length === 132 && ethers.utils.isHexString(testSignature)
      }`
    );

    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Contract-style verification: ${isValidContractStyle ? '✅ PASS' : '❌ FAIL'}`);
    console.log(
      `Generated signature matches: ${generatedSignature === testSignature ? '✅ YES' : '❌ NO'}`
    );
    console.log(
      `Signature format valid: ${
        testSignature.length === 132 && ethers.utils.isHexString(testSignature) ? '✅ YES' : '❌ NO'
      }`
    );

    if (isValidContractStyle) {
      console.log('\n🎉 SUCCESS: The provided signature is valid and will work with the contract!');
    } else {
      console.log(
        '\n❌ FAILURE: The provided signature is invalid for this wallet/nonce combination.'
      );
      console.log('Possible issues:');
      console.log('1. The signature was not created by this wallet');
      console.log('2. The signature was created for a different nonce');
      console.log('3. The signature format is incorrect');
      console.log('4. The nonce was not signed with the correct Ethereum message format');
    }
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
