// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AMM.sol";

contract Aggregator {
    struct AMMData {
        AMM amm;
        string name; // e.g. "AMM1" or "AMM2"
    }

    AMMData[] public amms;

    constructor(AMM _amm1, AMM _amm2) {
        amms.push(AMMData({ amm: _amm1, name: "AMM1" }));
        amms.push(AMMData({ amm: _amm2, name: "AMM2" }));
    }

    function getPriceData(address token1, address token2)
        public
        view
        returns (uint256 bestPrice, string memory bestAMM)
    {
        bestPrice = type(uint256).max;
        bestAMM = "";

        // For each AMM, we try calling getPrice. If it fails or there's no liquidity, we skip.
        for (uint i = 0; i < amms.length; i++) {
            try amms[i].amm.getPrice(token1, token2) returns (uint256 price) {
                // If got a non-zero price and it's lower than the current best, update
                if (price != 0 && price < bestPrice) {
                    bestPrice = price;
                    bestAMM = amms[i].name;
                }
            } catch {
                // Reverted due to no liquidity or other reason => skip
            }
        }

        require(bytes(bestAMM).length != 0, "No liquidity found for that pair");
    }

    function performSwap(address tokenIn, address tokenOut, uint256 amountIn)
        external
        returns (uint256 amountOut)
    {
        // 1) Figure out which AMM is best
        (, string memory bestAMM) = getPriceData(tokenIn, tokenOut);

        // 2) Perform the actual swap with that AMM
        if (_compareStrings(bestAMM, "AMM1")) {
            (amountOut,,) = amms[0].amm.swap(tokenIn, tokenOut, amountIn);
        } else if (_compareStrings(bestAMM, "AMM2")) {
            (amountOut,,) = amms[1].amm.swap(tokenIn, tokenOut, amountIn);
        }

        return amountOut;
    }

    function _compareStrings(string memory a, string memory b)
        internal
        pure
        returns (bool)
    {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}