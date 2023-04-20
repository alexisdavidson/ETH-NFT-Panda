// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("Block Coin", "BLOCK") {
        _mint(msg.sender, 100_000 * 10**uint(decimals()));
    }

    function decimals() public view virtual override returns (uint8) {
        return 4;
    }
}