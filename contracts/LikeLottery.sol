// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract LikeLottery {
    constructor() {}

    mapping(address => uint256) public crankTimes;
    uint256 public constant CRANK_INTERVAL = 1 days;
    event Crank(address indexed user, uint256 indexed timestamp);

    function crank() public {
        require(
            block.timestamp - crankTimes[msg.sender] >= CRANK_INTERVAL,
            "You can only crank once per day"
        );
        crankTimes[msg.sender] = block.timestamp;
        emit Crank(msg.sender, block.timestamp);
    }
}
