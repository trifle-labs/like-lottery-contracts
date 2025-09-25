// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract LikeLotteryV2 is Ownable {
    bytes32 public nonce;
    address public admin = 0xF0f5562325BFf40d4C051437Df406415ca89E94a;
    uint256 public yankLoopCount = 10;

    // Mapping to track used nonces
    mapping(bytes32 => bool) public usedNonces;

    // Events
    event GiveawayData(
        bytes32 indexed snapshotHash,
        uint256 indexed timestamp,
        uint256 indexed giveawayIndex
    );
    event Yank(address indexed drawnBy, bytes32 random);
    event Crank(address indexed user, uint256 indexed timestamp);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Verifies that the signature was created by the admin address
     * @param nonceValue The random nonce that was signed
     * @param signature The signature to verify
     * @return true if signature is valid, false otherwise
     */
    function verifySignature(
        bytes32 nonceValue,
        bytes memory signature
    ) internal view returns (bool) {
        // Compute the EIP-191 digest for 32-byte data
        // Equivalent to prefix "\x19Ethereum Signed Message:\n32" + nonce bytes
        bytes32 digest = MessageHashUtils.toEthSignedMessageHash(nonceValue);
        // Recover signer using OpenZeppelin's ECDSA (includes malleability checks)
        address signer = ECDSA.recover(digest, signature);
        return signer == admin;
    }

    /**
     * @dev Checks if a nonce has been used and marks it as used
     * @param nonceValue The nonce to check and mark as used
     * @return true if nonce was not used before, false if already used
     */
    function checkAndMarkNonce(bytes32 nonceValue) internal returns (bool) {
        if (usedNonces[nonceValue]) {
            return false;
        }
        usedNonces[nonceValue] = true;
        return true;
    }

    /**
     * @dev Yank function with signature authentication
     * @param nonceValue Random nonce that was signed by admin
     * @param signature Signature of the nonce by admin
     */
    function yank(bytes32 nonceValue, bytes memory signature) public {
        require(verifySignature(nonceValue, signature), "Invalid signature");
        require(checkAndMarkNonce(nonceValue), "Nonce already used");
        _yank(msg.sender);
    }

    /**
     * @dev Crank function with signature authentication
     * @param nonceValue Random nonce that was signed by admin
     * @param signature Signature of the nonce by admin
     */
    function crank(bytes32 nonceValue, bytes memory signature) public {
        require(verifySignature(nonceValue, signature), "Invalid signature");
        require(checkAndMarkNonce(nonceValue), "Nonce already used");
        emit Crank(msg.sender, block.timestamp);
    }

    /**
     * @dev Internal yank function that generates randomness
     * @param yanker The address that initiated the yank
     */
    function _yank(address yanker) internal {
        uint256 lastBlockRandao = block.prevrandao;
        for (uint256 i = 0; i < yankLoopCount; i++) {
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

    /**
     * @dev Admin yank function - accessible by both owner and admin
     * @param yanker The address to yank for
     */
    function adminYank(address yanker) public {
        require(
            msg.sender == admin || msg.sender == owner(),
            "Only admin or owner can yank"
        );
        _yank(yanker);
    }

    /**
     * @dev Emit snapshot hash - only accessible by owner
     * @param snapshotHash The snapshot hash to emit
     * @param timestamp The timestamp
     * @param giveawayIndex The giveaway index
     */
    function emitSnapshotHash(
        bytes32 snapshotHash,
        uint256 timestamp,
        uint256 giveawayIndex
    ) public onlyOwner {
        emit GiveawayData(snapshotHash, timestamp, giveawayIndex);
    }

    /**
     * @dev Set admin address - only accessible by owner
     * @param _admin The new admin address
     */
    function setAdmin(address _admin) public onlyOwner {
        admin = _admin;
    }

    /**
     * @dev Set yank loop count - only accessible by admin
     * @param _yankLoopCount The new yank loop count
     */
    function setYankLoopCount(uint256 _yankLoopCount) public {
        require(msg.sender == admin, "Only admin can set yank loop count");
        yankLoopCount = _yankLoopCount;
    }

    /**
     * @dev Check if a nonce has been used
     * @param nonceValue The nonce to check
     * @return true if nonce has been used, false otherwise
     */
    function isNonceUsed(bytes32 nonceValue) public view returns (bool) {
        return usedNonces[nonceValue];
    }
}
