// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LikeLotteryDraw is Ownable {
    bool public ready;
    bytes32 public nonce;
    bytes32 public tocHash;
    bytes32[] public snapshotHashes;
    address[] public winners;
    uint256[] public prizes;
    address public usdcAddress;

    event SnapshotHash(
        bytes32 indexed snapshotHash,
        uint256 indexed giveawayIndex
    );
    event Winner(
        address indexed winner,
        uint256 indexed prize,
        uint256 indexed giveawayIndex
    );
    event Burn(
        address indexed drawnBy,
        uint256 indexed giveawayIndex,
        bytes32 random
    );

    constructor(address _usdcAddress) Ownable(msg.sender) {
        usdcAddress = _usdcAddress;
    }

    function burn(uint256 giveawayIndex) public {
        require(
            giveawayIndex < snapshotHashes.length,
            "Invalid giveaway index"
        );
        uint256 lastBlockRandao = block.prevrandao;
        for (uint256 i = 0; i < 10; i++) {
            nonce = keccak256(
                abi.encodePacked(
                    giveawayIndex,
                    lastBlockRandao,
                    nonce,
                    msg.sender,
                    block.timestamp
                )
            );
            emit Burn(msg.sender, giveawayIndex, nonce);
        }
    }

    function claimWinnings(uint256 giveawayIndex, bytes32 _tocHash) public {
        require(_tocHash == tocHash, "Invalid Terms and ConditionsHash");
        require(giveawayIndex < winners.length, "Invalid giveaway index");
        require(winners[giveawayIndex] == msg.sender, "Not the winner");
        winners[giveawayIndex] = address(0);
        IERC20(usdcAddress).transfer(msg.sender, prizes[giveawayIndex]);
    }

    function setTocHash(bytes32 _tocHash) public onlyOwner {
        tocHash = _tocHash;
        if (snapshotHashes.length > 0) {
            ready = true;
        }
    }

    function addSnapShotHash(bytes32 _snapshotHash) public onlyOwner {
        uint256 giveawayIndex = snapshotHashes.length;
        editSnapshotHashWithIndex(_snapshotHash, giveawayIndex);
    }

    function editSnapshotHashWithIndex(
        bytes32 _snapshotHash,
        uint256 giveawayIndex
    ) public onlyOwner {
        if (giveawayIndex == snapshotHashes.length) {
            snapshotHashes.push(_snapshotHash);
        } else if (giveawayIndex < snapshotHashes.length) {
            snapshotHashes[giveawayIndex] = _snapshotHash;
        } else {
            revert("Invalid giveaway index");
        }
        if (tocHash != bytes32(0)) {
            ready = true;
        }
        emit SnapshotHash(_snapshotHash, giveawayIndex);
    }

    function addWinner(address winner, uint256 prize) public onlyOwner {
        uint256 giveawayIndex = winners.length;
        editWinnerWithIndex(winner, prize, giveawayIndex);
    }

    function editWinnerWithIndex(
        address winner,
        uint256 prize,
        uint256 giveawayIndex
    ) public onlyOwner {
        if (giveawayIndex == winners.length) {
            winners.push(winner);
            prizes.push(prize);
        } else if (giveawayIndex < winners.length) {
            winners[giveawayIndex] = winner;
            prizes[giveawayIndex] = prize;
        } else {
            revert("Invalid giveaway index");
        }
        emit Winner(winner, prize, giveawayIndex);
    }

    function recoverStuckFunds(address token, uint256 amount) public onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }

    function recoverStuckETH(uint256 amount) public onlyOwner {
        payable(msg.sender).transfer(amount);
    }
}
