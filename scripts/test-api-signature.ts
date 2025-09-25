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

async function querySignNonceAPI(
  token: string
): Promise<{ nonce: string; signature: string; success: boolean }> {
  const apiUrl = 'http://localhost:3030/api/like-lottery/sign-nonce';

  console.log(`Querying API: ${apiUrl}`);
  console.log(`Using token: ${token.substring(0, 50)}...`);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:3000', // Add origin header as required by API
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));

    if (!result.success) {
      throw new Error(`API returned error: ${result.error || 'Unknown error'}`);
    }

    if (!result.nonce || !result.signature) {
      throw new Error('API response missing nonce or signature');
    }

    return {
      nonce: result.nonce,
      signature: result.signature,
      success: result.success,
    };
  } catch (error) {
    console.error('API query failed:', error);
    throw error;
  }
}

async function main() {
  console.log('API Signature Verification Test');
  console.log('================================');

  // JWT token provided by user
  const token =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6IjM1NWQ0M2JmLWM0YjQtNDVlMy04MmNhLThlYjI4YzY3MDllNSJ9.eyJpYXQiOjE3NTg4MDA4NTcsImlzcyI6Imh0dHBzOi8vYXV0aC5mYXJjYXN0ZXIueHl6IiwiZXhwIjoxNzU4ODA0NDU3LCJzdWIiOjU4NzQsImF1ZCI6ImdtLXRyaWZsZS5uZ3Jvay5hcHAifQ.c95M_-gJ5YcoI7YWfeHKN98v1w7fNrY4AmPe4XBBkZkg150qXc27ew6koQDcSZ1lPoXnvz9awYKh9CwIZvUzlY_7cJ9TM8zLJLi_DdVAFuz21wgIaf-GWxj4ajDVlLvMI74Q7Nwk-Cz-ifoFdWy0NKs57E4Ai2z6Wq0a65ArU7qD9MY0Ci9v39r9us9PKGZtyQWkAd3n-FKHLhJVcRYjJV4Onvps8YPM0xRg6LsWgFRuEJdmgRb29dgEs4y6c28m46ld4f4fIwKTt92fc8aG5FlYy1_wSJ4l2mT3G3EY5OaXfwhpTa7FvqWqDcr2jbe3ZQ0xMJ18TIdogcBjP9a6dQ';

  // Get the expected admin address from environment or use the hardcoded one
  const expectedAdminAddress =
    process.env.ADMIN_ADDRESS || '0xF0f5562325BFf40d4C051437Df406415ca89E94a';

  try {
    // Step 1: Query the API to get nonce and signature
    console.log('\n=== Step 1: Query Sign-Nonce API ===');
    const apiResult = await querySignNonceAPI(token);

    console.log(`\nAPI returned:`);
    console.log(`- Nonce: ${apiResult.nonce}`);
    console.log(`- Signature: ${apiResult.signature}`);
    console.log(`- Success: ${apiResult.success}`);

    // Step 2: Verify signature using contract logic
    console.log('\n=== Step 2: Verify Signature with Contract Logic ===');
    const isValidContractStyle = verifySignatureContractStyle(
      apiResult.nonce,
      apiResult.signature,
      expectedAdminAddress
    );
    console.log(`Contract-style verification result: ${isValidContractStyle}`);
    console.log(`Expected admin address: ${expectedAdminAddress}`);

    // Step 3: Standard ethers verification for comparison
    console.log('\n=== Step 3: Standard Ethers Verification ===');
    try {
      const recoveredAddress = ethers.utils.verifyMessage(
        ethers.utils.arrayify(apiResult.nonce),
        apiResult.signature
      );
      console.log(`Recovered address: ${recoveredAddress}`);
      console.log(`Expected address: ${expectedAdminAddress}`);
      console.log(
        `Addresses match: ${recoveredAddress.toLowerCase() === expectedAdminAddress.toLowerCase()}`
      );
    } catch (error: any) {
      console.error(`Standard verification failed: ${error.message}`);
    }

    // Step 4: Signature format validation
    console.log('\n=== Step 4: Signature Format Validation ===');
    console.log(`Signature length: ${apiResult.signature.length}`);
    console.log(`Expected length: 132 (0x + 130 hex chars)`);
    console.log(`Valid hex: ${ethers.utils.isHexString(apiResult.signature)}`);
    console.log(`Starts with 0x: ${apiResult.signature.startsWith('0x')}`);
    console.log(
      `Valid signature format: ${
        apiResult.signature.length === 132 && ethers.utils.isHexString(apiResult.signature)
      }`
    );

    // Step 5: Nonce format validation
    console.log('\n=== Step 5: Nonce Format Validation ===');
    console.log(`Nonce length: ${apiResult.nonce.length}`);
    console.log(`Expected length: 66 (0x + 64 hex chars)`);
    console.log(`Valid hex: ${ethers.utils.isHexString(apiResult.nonce)}`);
    console.log(`Starts with 0x: ${apiResult.nonce.startsWith('0x')}`);
    console.log(
      `Valid nonce format: ${
        apiResult.nonce.length === 66 && ethers.utils.isHexString(apiResult.nonce)
      }`
    );

    // Step 6: Manual signature recovery
    console.log('\n=== Step 6: Manual Signature Recovery ===');
    try {
      const messageHash = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ['string', 'bytes32'],
          ['\x19Ethereum Signed Message:\n32', apiResult.nonce]
        )
      );

      const r = apiResult.signature.slice(0, 66);
      const s = apiResult.signature.slice(66, 130);
      const v = apiResult.signature.slice(130, 132);

      console.log(`Message hash: ${messageHash}`);
      console.log(`Signature components:`);
      console.log(`- r: ${r}`);
      console.log(`- s: ${s}`);
      console.log(`- v: ${v}`);

      const recoveredAddress = ethers.utils.recoverAddress(messageHash, {
        r: r,
        s: s,
        v: parseInt(v, 16),
      });

      console.log(`Recovered address: ${recoveredAddress}`);
      console.log(`Expected address: ${expectedAdminAddress}`);
      console.log(
        `Addresses match: ${recoveredAddress.toLowerCase() === expectedAdminAddress.toLowerCase()}`
      );
    } catch (error: any) {
      console.error(`Manual recovery failed: ${error.message}`);
    }

    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`API call successful: ${apiResult.success ? '✅ YES' : '❌ NO'}`);
    console.log(`Contract-style verification: ${isValidContractStyle ? '✅ PASS' : '❌ FAIL'}`);
    console.log(
      `Signature format valid: ${
        apiResult.signature.length === 132 && ethers.utils.isHexString(apiResult.signature)
          ? '✅ YES'
          : '❌ NO'
      }`
    );
    console.log(
      `Nonce format valid: ${
        apiResult.nonce.length === 66 && ethers.utils.isHexString(apiResult.nonce)
          ? '✅ YES'
          : '❌ NO'
      }`
    );

    if (isValidContractStyle) {
      console.log('\n🎉 SUCCESS: The API signature is valid and will work with the contract!');
      console.log('The API is correctly signing nonces with the admin wallet.');
    } else {
      console.log('\n❌ FAILURE: The API signature is invalid for the expected admin address.');
      console.log('Possible issues:');
      console.log('1. The API is not using the correct admin wallet to sign');
      console.log('2. The signature format is incorrect');
      console.log('3. The nonce was not signed with the correct Ethereum message format');
      console.log('4. The expected admin address is incorrect');
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
