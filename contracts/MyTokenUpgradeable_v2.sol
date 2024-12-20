// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {MyTokenUpgradeable} from "./MyTokenUpgradeable.sol";

contract MyTokenUpgradeable_v2 is MyTokenUpgradeable {
    function version() public pure returns (string memory) {
        return "2";
    }
}
