export const TOKEN_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_symbol",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_totalSupply",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  // Additional ABI elements truncated for brevity
];

export const BYTECODE = "0x608060405260126002553480156200001657600080fd5b50604051620013593803806200135983398181016040528101906200003c919062000369565b826000908051906020019062000054929190620000e1565b5081600190805190602001906200006d929190620000e1565b50600254600a6200007f919062000586565b816200008c9190620005d7565b600381905550600354600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505050506200069d565b828054620000ef9062000667565b90600052602060002090601f0160209004810192826200011357600085556200015f565b82601f106200012e57805160ff19168380011785556200015f565b828001600101855582156200015f579182015b828111156200015e57825182559160200191906001019062000141565b5b5090506200016e919062000172565b5090565b5b808211156200018d57600081600090555060010162000173565b5090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b620001fa82620001af565b810181811067ffffffffffffffff821117156200021c576200021b620001c0565b5b80604052505050565b60006200023162000191565b90506200023f8282620001ef565b919050565b600067ffffffffffffffff821115620002625762000261620001c0565b5b6200026d82620001af565b9050602081019050919050565b60005b838110156200029a5780820151818401526020810190506200027d565b83811115620002aa576000848401525b50505050565b6000620002c7620002c18462000244565b62000225565b905082815260208101848484011115620002e657620002e5620001aa565
