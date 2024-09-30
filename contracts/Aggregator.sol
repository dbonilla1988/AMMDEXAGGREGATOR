// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AMM.sol";

contract Aggregator {
    struct AMMData {
        AMM amm;
        string name; // Unique identifier for each AMM, e.g., "AMM1", "AMM2"
    }

    AMMData[] public amms;

    // Constructor to initialize the AMMs
    constructor(AMM _amm1, AMM _amm2) {
        amms.push(AMMData({amm: _amm1, name: "AMM1"}));
        amms.push(AMMData({amm: _amm2, name: "AMM2"}));
    }

    function getPriceData(address token1, address token2) public view returns (uint256 bestPrice, string memory bestAMM) {
        bestPrice = type(uint256).max;
        bestAMM = "";

        for (uint i = 0; i < amms.length; i++) {
            uint256 price = amms[i].amm.getPrice(token1, token2);

            if (price != 0 && price < bestPrice) {
                bestPrice = price;
                bestAMM = amms[i].name;
            }
        }

        require(bytes(bestAMM).length != 0, "No AMM offers a price for this pair or zero liquidity detected");
    }

    function performSwap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut) {
        (, string memory bestAMM) = getPriceData(tokenIn, tokenOut);

        if (compareStrings(bestAMM, "AMM1")) {
            (amountOut, , ) = amms[0].amm.swap(tokenIn, tokenOut, amountIn);
        } else if (compareStrings(bestAMM, "AMM2")) {
            (amountOut, , ) = amms[1].amm.swap(tokenIn, tokenOut, amountIn);
        }

        return amountOut;
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
