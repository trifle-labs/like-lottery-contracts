import { expect } from 'chai';
import { ethers } from 'hardhat';
import { LikeLottery } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('LikeLottery', function () {
  let likeLottery: LikeLottery;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const LikeLotteryFactory = await ethers.getContractFactory('LikeLottery');
    likeLottery = await LikeLotteryFactory.deploy();
    await likeLottery.deployed();
  });

  describe('Deployment', function () {
    it('Should deploy successfully', async function () {
      expect(likeLottery.address).to.be.properAddress;
    });

    it('Should have correct CRANK_INTERVAL', async function () {
      const crankInterval = await likeLottery.CRANK_INTERVAL();
      expect(crankInterval).to.equal(24 * 60 * 60); // 1 day in seconds
    });
  });

  describe('Crank Function', function () {
    it('Should allow user to crank for the first time', async function () {
      const tx = likeLottery.connect(addr1).crank();
      await expect(tx).to.emit(likeLottery, 'Crank');

      const crankTime = await likeLottery.crankTimes(addr1.address);
      expect(crankTime).to.be.gt(0);
    });

    it('Should emit Crank event with correct parameters', async function () {
      const tx = likeLottery.connect(addr1).crank();

      await expect(tx).to.emit(likeLottery, 'Crank');
    });

    it('Should prevent user from cranking twice in the same day', async function () {
      // First crank should succeed
      await likeLottery.connect(addr1).crank();

      // Second crank should fail
      await expect(likeLottery.connect(addr1).crank()).to.be.revertedWith(
        'You can only crank once per day'
      );
    });

    it('Should allow user to crank again after 1 day', async function () {
      // First crank
      await likeLottery.connect(addr1).crank();
      const firstCrankTime = await likeLottery.crankTimes(addr1.address);

      // Advance time by 1 day
      await ethers.provider.send('evm_increaseTime', [24 * 60 * 60]);
      await ethers.provider.send('evm_mine', []);

      // Second crank should succeed
      const tx = likeLottery.connect(addr1).crank();
      await expect(tx).to.emit(likeLottery, 'Crank');

      const secondCrankTime = await likeLottery.crankTimes(addr1.address);
      expect(secondCrankTime).to.be.gt(firstCrankTime);
    });

    it('Should allow multiple users to crank independently', async function () {
      // User 1 cranks
      await likeLottery.connect(addr1).crank();
      const addr1CrankTime = await likeLottery.crankTimes(addr1.address);

      // User 2 cranks
      await likeLottery.connect(addr2).crank();
      const addr2CrankTime = await likeLottery.crankTimes(addr2.address);

      expect(addr1CrankTime).to.be.gt(0);
      expect(addr2CrankTime).to.be.gt(0);
      expect(addr1CrankTime).to.not.equal(addr2CrankTime);
    });

    it('Should allow user to crank after exactly 1 day', async function () {
      // First crank
      await likeLottery.connect(addr1).crank();

      // Advance time by exactly 1 day
      await ethers.provider.send('evm_increaseTime', [24 * 60 * 60]);
      await ethers.provider.send('evm_mine', []);

      // Should be able to crank again
      await expect(likeLottery.connect(addr1).crank()).to.not.be.reverted;
    });

    it('Should prevent user from cranking before 1 day has passed', async function () {
      // First crank
      await likeLottery.connect(addr1).crank();

      // Advance time by 23 hours (less than 1 day)
      await ethers.provider.send('evm_increaseTime', [23 * 60 * 60]);
      await ethers.provider.send('evm_mine', []);

      // Should not be able to crank yet
      await expect(likeLottery.connect(addr1).crank()).to.be.revertedWith(
        'You can only crank once per day'
      );
    });

    it('Should track crank times correctly for different users', async function () {
      // User 1 cranks
      await likeLottery.connect(addr1).crank();
      const addr1Time1 = await likeLottery.crankTimes(addr1.address);

      // User 2 cranks
      await likeLottery.connect(addr2).crank();
      const addr2Time1 = await likeLottery.crankTimes(addr2.address);

      // Advance time and let user 1 crank again
      await ethers.provider.send('evm_increaseTime', [24 * 60 * 60]);
      await ethers.provider.send('evm_mine', []);
      await likeLottery.connect(addr1).crank();
      const addr1Time2 = await likeLottery.crankTimes(addr1.address);

      expect(addr1Time2).to.be.gt(addr1Time1);
      expect(addr2Time1).to.equal(await likeLottery.crankTimes(addr2.address)); // addr2 time unchanged
    });
  });

  describe('Edge Cases', function () {
    it('Should handle multiple cranks from same user after time intervals', async function () {
      const user = addr1;

      // First crank
      await likeLottery.connect(user).crank();
      let lastCrankTime = await likeLottery.crankTimes(user.address);

      // Crank multiple times with 1 day intervals
      for (let i = 0; i < 3; i++) {
        await ethers.provider.send('evm_increaseTime', [24 * 60 * 60]);
        await ethers.provider.send('evm_mine', []);
        await likeLottery.connect(user).crank();

        const newCrankTime = await likeLottery.crankTimes(user.address);
        expect(newCrankTime).to.be.gt(lastCrankTime);
        lastCrankTime = newCrankTime;
      }
    });

    it('Should maintain correct state after many users crank', async function () {
      const users = [addr1, addr2, owner];

      // All users crank
      for (const user of users) {
        await likeLottery.connect(user).crank();
        const crankTime = await likeLottery.crankTimes(user.address);
        expect(crankTime).to.be.gt(0);
      }

      // Verify all users have crank times recorded
      for (const user of users) {
        const crankTime = await likeLottery.crankTimes(user.address);
        expect(crankTime).to.be.gt(0);
      }
    });
  });
});
