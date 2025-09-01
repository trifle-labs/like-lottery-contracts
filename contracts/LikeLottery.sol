// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract LikeLottery {
    constructor() {}

    event Crank(address indexed user, uint256 indexed timestamp);

    function crank() public {
        emit Crank(msg.sender, block.timestamp);
    }
}
