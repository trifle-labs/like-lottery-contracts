// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract LikeLotteryDraw is Ownable {
    bytes32 public nonce;
    address public admin = 0xF0f5562325BFf40d4C051437Df406415ca89E94a;
    event GiveawayData(
        bytes32 indexed snapshotHash,
        uint256 indexed timestamp,
        uint256 indexed giveawayIndex
    );
    event Yank(address indexed drawnBy, bytes32 random);

    constructor() Ownable(msg.sender) {}

    function yank() public {
        _yank(msg.sender);
    }

    function _yank(address yanker) internal {
        uint256 lastBlockRandao = block.prevrandao;
        for (uint256 i = 0; i < 10; i++) {
            nonce = keccak256(
                abi.encodePacked(
                    lastBlockRandao,
                    nonce,
                    yanker,
                    block.timestamp
                )
            );
            emit Yank(yanker, nonce);
        }
    }

    function adminYank(address yanker) public {
        require(msg.sender == admin, "Only admin can yank");
        _yank(yanker);
    }

    function emitSnapshotHash(
        bytes32 snapshotHash,
        uint256 timestamp,
        uint256 giveawayIndex
    ) public onlyOwner {
        emit GiveawayData(snapshotHash, timestamp, giveawayIndex);
    }

    function setAdmin(address _admin) public onlyOwner {
        admin = _admin;
    }
}
