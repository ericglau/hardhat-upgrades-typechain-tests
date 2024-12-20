// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {MyTokenUUPS} from "./MyTokenUUPS.sol";

contract MyTokenUUPS_v2 is MyTokenUUPS {
    function version() public pure returns (string memory) {
        return "2";
    }
}
