// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonkeyCoinBsc is ERC20Burnable, Ownable {
    address public minter;

    modifier onlyMinter() {
        require(minter == _msgSender(), "caller is not the minter");
        _;
    }

    constructor() ERC20("MonkeyCoin", "MKC") Ownable() {}

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    function mint(address account, uint256 amount) external onlyMinter {
        _mint(account, amount);
    }
}
