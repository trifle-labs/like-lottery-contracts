import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';

// viem imports
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { mnemonicToAccount } from 'viem/accounts';
import crypto from 'crypto';

describe('LikeLotteryV2 (viem signing)', function () {
  let contract: Contract;

  beforeEach(async () => {
    const LikeLotteryV2 = await ethers.getContractFactory('LikeLotteryV2');
    contract = await LikeLotteryV2.deploy();
    await contract.deployed();
  });

  it('accepts yank with viem EIP-191 signature over raw 32-byte nonce', async () => {
    // Arrange: set admin to viem-derived account
    const drawMnemonic = process.env.DRAW_MNEMONIC;
    expect(drawMnemonic, 'DRAW_MNEMONIC must be set for this test').to.be.a('string');

    const account = mnemonicToAccount(drawMnemonic as string);
    const adminAddress = account.address;

    // owner (deployer) sets admin
    const [owner, user] = await ethers.getSigners();
    await (await contract.connect(owner).setAdmin(adminAddress)).wait();

    // Create wallet client (chain is irrelevant for signing, but viem requires one)
    const walletClient = createWalletClient({ account, chain: base, transport: http() });

    // Generate 32-byte nonce as 0x-prefixed hex (bytes32) using crypto
    const nonceBytes = crypto.randomBytes(32);
    const nonceHex = `0x${nonceBytes.toString('hex')}`; // 0x + 64 hex

    // Sign the nonce as RAW bytes (ensures EIP-191 prefix with length 32)
    const signature = await walletClient.signMessage({ account, message: { raw: nonceHex } });

    // Act: call yank with (bytes32 nonce, bytes signature) from a non-admin user
    const tx = await contract.connect(user).yank(nonceHex, signature);
    const receipt = await tx.wait();

    // Assert: event emitted and nonce marked used
    const yankEvents = receipt.logs
      .map((log: any) => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return undefined;
        }
      })
      .filter((e: any) => e && e.name === 'Yank');

    expect(yankEvents.length).to.be.greaterThan(0);

    const used = await contract.isNonceUsed(nonceHex);
    expect(used).to.equal(true);

    // Reuse should fail
    await expect(contract.connect(user).yank(nonceHex, signature)).to.be.revertedWith(
      'Nonce already used'
    );
  });
});
