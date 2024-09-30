// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Token.sol";

contract AMM {
    address public owner;
    mapping(address => mapping(address => uint256)) public liquidity; // Token1 -> Token2 -> Amount
    mapping(address => mapping(address => uint256)) public reserves; // Token1 -> Token2 -> Reserve

    event LiquidityAdded(address indexed provider, address token1, address token2, uint256 amountToken1, uint256 amountToken2);
    event LiquidityRemoved(address indexed provider, address token1, address token2, uint256 amountToken1, uint256 amountToken2);
    event TokensSwapped(address indexed trader, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

    constructor() {
        owner = msg.sender;
    }

    function addLiquidity(address token1, address token2, uint256 amountToken1, uint256 amountToken2) external {
        // Transfer tokens from sender to this contract
        Token(token1).transferFrom(msg.sender, address(this), amountToken1);
        Token(token2).transferFrom(msg.sender, address(this), amountToken2);

        // Update liquidity and reserves
        liquidity[token1][token2] += amountToken1;
        liquidity[token2][token1] += amountToken2;
        reserves[token1][token2] += amountToken1;
        reserves[token2][token1] += amountToken2;

        emit LiquidityAdded(msg.sender, token1, token2, amountToken1, amountToken2);
    }

    function removeLiquidity(address token1, address token2, uint256 amountToken1, uint256 amountToken2) external {
        require(liquidity[token1][token2] >= amountToken1 && liquidity[token2][token1] >= amountToken2, "Insufficient liquidity");

        // Transfer tokens back to the liquidity provider
        Token(token1).transfer(msg.sender, amountToken1);
        Token(token2).transfer(msg.sender, amountToken2);

        // Update liquidity and reserves
        liquidity[token1][token2] -= amountToken1;
        liquidity[token2][token1] -= amountToken2;
        reserves[token1][token2] -= amountToken1;
        reserves[token2][token1] -= amountToken2;

        emit LiquidityRemoved(msg.sender, token1, token2, amountToken1, amountToken2);
    }

    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut, uint256 newReserveIn, uint256 newReserveOut) {
        require(reserves[tokenIn][tokenOut] > 0 && reserves[tokenOut][tokenIn] > 0, "No liquidity found for this token pair");

        uint256 reserveIn = reserves[tokenIn][tokenOut];
        uint256 reserveOut = reserves[tokenOut][tokenIn];
        amountOut = (amountIn * reserveOut) / reserveIn;

        // Transfer tokens
        Token(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        Token(tokenOut).transfer(msg.sender, amountOut);

        // Update reserves
        reserves[tokenIn][tokenOut] += amountIn;
        reserves[tokenOut][tokenIn] -= amountOut;

        // Return the new reserves
        newReserveIn = reserves[tokenIn][tokenOut];
        newReserveOut = reserves[tokenOut][tokenIn];

        emit TokensSwapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    function getPrice(address tokenA, address tokenB) external view returns (uint256 price) {
        require(reserves[tokenA][tokenB] > 0 && reserves[tokenB][tokenA] > 0, "No liquidity found for this token pair");
        return (reserves[tokenA][tokenB] * 1e18) / reserves[tokenB][tokenA];
    }

    function getReserves(address token1, address token2) external view returns (uint256 reserveToken1, uint256 reserveToken2) {
        return (reserves[token1][token2], reserves[token2][token1]);
    }

    function getTokenBalance(address token) external view returns (uint256) {
        return Token(token).balanceOf(address(this));
    }
}
