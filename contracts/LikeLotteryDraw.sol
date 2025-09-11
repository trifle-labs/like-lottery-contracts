// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract LikeLotteryDraw is Ownable {
    bytes32 public nonce;
    event GiveawayData(
        bytes32 indexed snapshotHash,
        uint256 indexed timestamp,
        uint256 indexed giveawayIndex
    );
    event Yank(address indexed drawnBy, bytes32 random);

    constructor() Ownable(msg.sender) {}

    function yank() public {
        uint256 lastBlockRandao = block.prevrandao;
        for (uint256 i = 0; i < 10; i++) {
            nonce = keccak256(
                abi.encodePacked(
                    lastBlockRandao,
                    nonce,
                    msg.sender,
                    block.timestamp
                )
            );
            emit Yank(msg.sender, nonce);
        }
    }

    function emitSnapshotHash(
        bytes32 snapshotHash,
        uint256 timestamp,
        uint256 giveawayIndex
    ) public onlyOwner {
        emit GiveawayData(snapshotHash, timestamp, giveawayIndex);
    }
}
