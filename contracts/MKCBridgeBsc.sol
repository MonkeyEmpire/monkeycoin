// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IToken {
    function mint(address to, uint256 amount) external;

    function burnFrom(address owner, uint256 amount) external;
}

contract MKCBridgeBsc is Ownable {
    IToken public token;
    uint256 public nonce;
    mapping(uint256 => bool) public processedNonces;
    uint256 public fees;

    enum Step {
        Burn,
        Mint,
        BurnAndSwap
    }
    event Transfer(
        address from,
        address to,
        uint256 amount,
        uint256 date,
        uint256 nonce,
        Step indexed step
    );

    constructor(address _token, uint256 _fees) {
        token = IToken(_token);
        fees = _fees;
    }

    function burn(address to, uint256 amount) external payable {
        require(msg.value >= fees, "Fees too low");
        payable(owner()).transfer(address(this).balance);
        token.burnFrom(msg.sender, amount);
        emit Transfer(
            msg.sender,
            to,
            amount,
            block.timestamp,
            nonce,
            Step.Burn
        );
        nonce++;
    }

    function mint(
        address to,
        uint256 amount,
        uint256 otherChainNonce
    ) external onlyOwner {
        require(
            processedNonces[otherChainNonce] == false,
            "transfer already processed"
        );
        processedNonces[otherChainNonce] = true;
        token.mint(to, amount);
        emit Transfer(
            msg.sender,
            to,
            amount,
            block.timestamp,
            otherChainNonce,
            Step.Mint
        );
    }

    function changeFees(uint256 newFees) external onlyOwner {
        fees = newFees;
    }
}
