/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  ERC20MinterBurnerPauser,
  ERC20MinterBurnerPauserInterface,
} from "../../contracts/ERC20MinterBurnerPauser";

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "decimals_",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MINTER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PAUSER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burnFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getRoleMember",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleMemberCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162001daf38038062001daf8339810160408190526200003491620003d5565b8282818181600590805190602001906200005092919062000262565b5080516200006690600690602084019062000262565b50506007805460ff191690555062000080600033620000fd565b620000ac7f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a633620000fd565b620000d87f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a33620000fd565b50506007805460ff9092166101000261ff001990921691909117905550620004979050565b6200010982826200010d565b5050565b6200012482826200015060201b6200094b1760201c565b60008281526001602090815260409091206200014b918390620009cf620001f0821b17901c565b505050565b6000828152602081815260408083206001600160a01b038516845290915290205460ff1662000109576000828152602081815260408083206001600160a01b03851684529091529020805460ff19166001179055620001ac3390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b600062000207836001600160a01b03841662000210565b90505b92915050565b600081815260018301602052604081205462000259575081546001818101845560008481526020808220909301849055845484825282860190935260409020919091556200020a565b5060006200020a565b82805462000270906200045a565b90600052602060002090601f016020900481019282620002945760008555620002df565b82601f10620002af57805160ff1916838001178555620002df565b82800160010185558215620002df579182015b82811115620002df578251825591602001919060010190620002c2565b50620002ed929150620002f1565b5090565b5b80821115620002ed5760008155600101620002f2565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200033057600080fd5b81516001600160401b03808211156200034d576200034d62000308565b604051601f8301601f19908116603f0116810190828211818310171562000378576200037862000308565b816040528381526020925086838588010111156200039557600080fd5b600091505b83821015620003b957858201830151818301840152908201906200039a565b83821115620003cb5760008385830101525b9695505050505050565b600080600060608486031215620003eb57600080fd5b83516001600160401b03808211156200040357600080fd5b62000411878388016200031e565b945060208601519150808211156200042857600080fd5b5062000437868287016200031e565b925050604084015160ff811681146200044f57600080fd5b809150509250925092565b600181811c908216806200046f57607f821691505b602082108114156200049157634e487b7160e01b600052602260045260246000fd5b50919050565b61190880620004a76000396000f3fe608060405234801561001057600080fd5b50600436106101c45760003560e01c806370a08231116100f9578063a457c2d711610097578063d539139311610071578063d5391393146103bd578063d547741f146103e4578063dd62ed3e146103f7578063e63ab1e91461040a57600080fd5b8063a457c2d714610384578063a9059cbb14610397578063ca15c873146103aa57600080fd5b80639010d07c116100d35780639010d07c1461033657806391d148541461036157806395d89b4114610374578063a217fddf1461037c57600080fd5b806370a08231146102f257806379cc67901461031b5780638456cb591461032e57600080fd5b8063313ce567116101665780633f4ba83a116101405780633f4ba83a146102b957806340c10f19146102c157806342966c68146102d45780635c975abb146102e757600080fd5b8063313ce5671461027657806336568abe1461029357806339509351146102a657600080fd5b806318160ddd116101a257806318160ddd1461021957806323b872dd1461022b578063248a9ca31461023e5780632f2ff15d1461026157600080fd5b806301ffc9a7146101c957806306fdde03146101f1578063095ea7b314610206575b600080fd5b6101dc6101d73660046115ae565b610431565b60405190151581526020015b60405180910390f35b6101f961045c565b6040516101e89190611604565b6101dc610214366004611653565b6104ee565b6004545b6040519081526020016101e8565b6101dc61023936600461167d565b610506565b61021d61024c3660046116b9565b60009081526020819052604090206001015490565b61027461026f3660046116d2565b61052a565b005b600754610100900460ff1660405160ff90911681526020016101e8565b6102746102a13660046116d2565b610554565b6101dc6102b4366004611653565b6105d7565b6102746105f9565b6102746102cf366004611653565b61069f565b6102746102e23660046116b9565b61073e565b60075460ff166101dc565b61021d6103003660046116fe565b6001600160a01b031660009081526002602052604090205490565b610274610329366004611653565b61074b565b610274610760565b610349610344366004611719565b610804565b6040516001600160a01b0390911681526020016101e8565b6101dc61036f3660046116d2565b610823565b6101f961084c565b61021d600081565b6101dc610392366004611653565b61085b565b6101dc6103a5366004611653565b6108d6565b61021d6103b83660046116b9565b6108e4565b61021d7f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a681565b6102746103f23660046116d2565b6108fb565b61021d61040536600461173b565b610920565b61021d7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a81565b60006001600160e01b03198216635a05180f60e01b14806104565750610456826109e4565b92915050565b60606005805461046b90611765565b80601f016020809104026020016040519081016040528092919081815260200182805461049790611765565b80156104e45780601f106104b9576101008083540402835291602001916104e4565b820191906000526020600020905b8154815290600101906020018083116104c757829003601f168201915b5050505050905090565b6000336104fc818585610a19565b5060019392505050565b600033610514858285610b3d565b61051f858585610bb7565b506001949350505050565b60008281526020819052604090206001015461054581610d90565b61054f8383610d9a565b505050565b6001600160a01b03811633146105c95760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201526e103937b632b9903337b91039b2b63360891b60648201526084015b60405180910390fd5b6105d38282610dbc565b5050565b6000336104fc8185856105ea8383610920565b6105f491906117b6565b610a19565b6106237f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a33610823565b6106955760405162461bcd60e51b815260206004820152603960248201527f45524332305072657365744d696e7465725061757365723a206d75737420686160448201527f76652070617573657220726f6c6520746f20756e70617573650000000000000060648201526084016105c0565b61069d610dde565b565b6106c97f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a633610823565b6107345760405162461bcd60e51b815260206004820152603660248201527f45524332305072657365744d696e7465725061757365723a206d7573742068616044820152751d99481b5a5b9d195c881c9bdb19481d1bc81b5a5b9d60521b60648201526084016105c0565b6105d38282610e30565b6107483382610f1b565b50565b610756823383610b3d565b6105d38282610f1b565b61078a7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a33610823565b6107fc5760405162461bcd60e51b815260206004820152603760248201527f45524332305072657365744d696e7465725061757365723a206d75737420686160448201527f76652070617573657220726f6c6520746f20706175736500000000000000000060648201526084016105c0565b61069d611075565b600082815260016020526040812061081c90836110b2565b9392505050565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b60606006805461046b90611765565b600033816108698286610920565b9050838110156108c95760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b60648201526084016105c0565b61051f8286868403610a19565b6000336104fc818585610bb7565b6000818152600160205260408120610456906110be565b60008281526020819052604090206001015461091681610d90565b61054f8383610dbc565b6001600160a01b03918216600090815260036020908152604080832093909416825291909152205490565b6109558282610823565b6105d3576000828152602081815260408083206001600160a01b03851684529091529020805460ff1916600117905561098b3390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b600061081c836001600160a01b0384166110c8565b60006001600160e01b03198216637965db0b60e01b148061045657506301ffc9a760e01b6001600160e01b0319831614610456565b6001600160a01b038316610a7b5760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b60648201526084016105c0565b6001600160a01b038216610adc5760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b60648201526084016105c0565b6001600160a01b0383811660008181526003602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6000610b498484610920565b90506000198114610bb15781811015610ba45760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e636500000060448201526064016105c0565b610bb18484848403610a19565b50505050565b6001600160a01b038316610c1b5760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b60648201526084016105c0565b6001600160a01b038216610c7d5760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b60648201526084016105c0565b610c88838383611117565b6001600160a01b03831660009081526002602052604090205481811015610d005760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b60648201526084016105c0565b6001600160a01b03808516600090815260026020526040808220858503905591851681529081208054849290610d379084906117b6565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610d8391815260200190565b60405180910390a3610bb1565b6107488133611122565b610da4828261094b565b600082815260016020526040902061054f90826109cf565b610dc68282611186565b600082815260016020526040902061054f90826111eb565b610de6611200565b6007805460ff191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa335b6040516001600160a01b03909116815260200160405180910390a1565b6001600160a01b038216610e865760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f20616464726573730060448201526064016105c0565b610e9260008383611117565b8060046000828254610ea491906117b6565b90915550506001600160a01b03821660009081526002602052604081208054839290610ed19084906117b6565b90915550506040518181526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b6001600160a01b038216610f7b5760405162461bcd60e51b815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736044820152607360f81b60648201526084016105c0565b610f8782600083611117565b6001600160a01b03821660009081526002602052604090205481811015610ffb5760405162461bcd60e51b815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e604482015261636560f01b60648201526084016105c0565b6001600160a01b038316600090815260026020526040812083830390556004805484929061102a9084906117ce565b90915550506040518281526000906001600160a01b038516907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a3505050565b61107d611249565b6007805460ff191660011790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258610e133390565b600061081c838361128f565b6000610456825490565b600081815260018301602052604081205461110f57508154600181810184556000848152602080822090930184905584548482528286019093526040902091909155610456565b506000610456565b61054f8383836112b9565b61112c8282610823565b6105d357611144816001600160a01b0316601461131f565b61114f83602061131f565b6040516020016111609291906117e5565b60408051601f198184030181529082905262461bcd60e51b82526105c091600401611604565b6111908282610823565b156105d3576000828152602081815260408083206001600160a01b0385168085529252808320805460ff1916905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b600061081c836001600160a01b0384166114bb565b60075460ff1661069d5760405162461bcd60e51b815260206004820152601460248201527314185d5cd8589b194e881b9bdd081c185d5cd95960621b60448201526064016105c0565b60075460ff161561069d5760405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b60448201526064016105c0565b60008260000182815481106112a6576112a661185a565b9060005260206000200154905092915050565b60075460ff161561054f5760405162461bcd60e51b815260206004820152602a60248201527f45524332305061757361626c653a20746f6b656e207472616e736665722077686044820152691a5b19481c185d5cd95960b21b60648201526084016105c0565b6060600061132e836002611870565b6113399060026117b6565b67ffffffffffffffff8111156113515761135161188f565b6040519080825280601f01601f19166020018201604052801561137b576020820181803683370190505b509050600360fc1b816000815181106113965761139661185a565b60200101906001600160f81b031916908160001a905350600f60fb1b816001815181106113c5576113c561185a565b60200101906001600160f81b031916908160001a90535060006113e9846002611870565b6113f49060016117b6565b90505b600181111561146c576f181899199a1a9b1b9c1cb0b131b232b360811b85600f16601081106114285761142861185a565b1a60f81b82828151811061143e5761143e61185a565b60200101906001600160f81b031916908160001a90535060049490941c93611465816118a5565b90506113f7565b50831561081c5760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e7460448201526064016105c0565b600081815260018301602052604081205480156115a45760006114df6001836117ce565b85549091506000906114f3906001906117ce565b90508181146115585760008660000182815481106115135761151361185a565b90600052602060002001549050808760000184815481106115365761153661185a565b6000918252602080832090910192909255918252600188019052604090208390555b8554869080611569576115696118bc565b600190038181906000526020600020016000905590558560010160008681526020019081526020016000206000905560019350505050610456565b6000915050610456565b6000602082840312156115c057600080fd5b81356001600160e01b03198116811461081c57600080fd5b60005b838110156115f35781810151838201526020016115db565b83811115610bb15750506000910152565b60208152600082518060208401526116238160408501602087016115d8565b601f01601f19169190910160400192915050565b80356001600160a01b038116811461164e57600080fd5b919050565b6000806040838503121561166657600080fd5b61166f83611637565b946020939093013593505050565b60008060006060848603121561169257600080fd5b61169b84611637565b92506116a960208501611637565b9150604084013590509250925092565b6000602082840312156116cb57600080fd5b5035919050565b600080604083850312156116e557600080fd5b823591506116f560208401611637565b90509250929050565b60006020828403121561171057600080fd5b61081c82611637565b6000806040838503121561172c57600080fd5b50508035926020909101359150565b6000806040838503121561174e57600080fd5b61175783611637565b91506116f560208401611637565b600181811c9082168061177957607f821691505b6020821081141561179a57634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b600082198211156117c9576117c96117a0565b500190565b6000828210156117e0576117e06117a0565b500390565b7f416363657373436f6e74726f6c3a206163636f756e742000000000000000000081526000835161181d8160178501602088016115d8565b7001034b99036b4b9b9b4b733903937b6329607d1b601791840191820152835161184e8160288401602088016115d8565b01602801949350505050565b634e487b7160e01b600052603260045260246000fd5b600081600019048311821515161561188a5761188a6117a0565b500290565b634e487b7160e01b600052604160045260246000fd5b6000816118b4576118b46117a0565b506000190190565b634e487b7160e01b600052603160045260246000fdfea264697066735822122042f5f04f81a3d3a366bd402c2ac5b4fcf1df7db4e808eb6f83c8db95deaea03a64736f6c634300080b0033";

type ERC20MinterBurnerPauserConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ERC20MinterBurnerPauserConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ERC20MinterBurnerPauser__factory extends ContractFactory {
  constructor(...args: ERC20MinterBurnerPauserConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    name: string,
    symbol: string,
    decimals_: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ERC20MinterBurnerPauser> {
    return super.deploy(
      name,
      symbol,
      decimals_,
      overrides || {}
    ) as Promise<ERC20MinterBurnerPauser>;
  }
  override getDeployTransaction(
    name: string,
    symbol: string,
    decimals_: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(name, symbol, decimals_, overrides || {});
  }
  override attach(address: string): ERC20MinterBurnerPauser {
    return super.attach(address) as ERC20MinterBurnerPauser;
  }
  override connect(signer: Signer): ERC20MinterBurnerPauser__factory {
    return super.connect(signer) as ERC20MinterBurnerPauser__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC20MinterBurnerPauserInterface {
    return new utils.Interface(_abi) as ERC20MinterBurnerPauserInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC20MinterBurnerPauser {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ERC20MinterBurnerPauser;
  }
}
