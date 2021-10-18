// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonkeyCoinAvax is ERC20Burnable, Ownable {
    constructor(uint256 totalSupply) ERC20("MonkeyCoin", "MKC") Ownable() {
        _mint(msg.sender, totalSupply * (10**uint256(decimals())));
    }
}
