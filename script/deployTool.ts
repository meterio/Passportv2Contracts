import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { Contract, Signer, BigNumber, BytesLike, utils, } from "ethers";

export const allowVerifyChain = [
  "mainnet",
  // "ropsten",
  // "rinkeby",
  // "goerli",
  // "kovan",
  // "bsctest",
  // "bscmain",
  // "hecotest",
  // "hecomain",
  // "maticmain",
  // "ftmtest",
  // "ftmmain",
  // "hoomain",
];

type AddressMap = { [name: string]: string };

export function compileSetting(version: string, runs: number) {
  return {
    version: version,
    settings: {
      optimizer: {
        enabled: true,
        runs: runs,
      }, outputSelection: {
        "*": {
          "*": [
            "abi",
            "evm.bytecode",
            "evm.deployedBytecode",
            "metadata", // <-- add this
          ]
        },
      },
    },
  };
}

export async function deployContract(
  name: string,
  network: string,
  getContractFactory: Function,
  signer: Signer,
  args: Array<any> = [],
  libraries: Object = {}
): Promise<Contract> {
  const factory = await getContractFactory(name, {
    signer: signer,
    libraries: libraries,
  });
  const contract = await factory.deploy(...args);
  console.log("Deploying", name);
  console.log("  to", contract.address);
  console.log("  in", contract.deployTransaction.hash);
  // console.log("  receipt", await contract.deployTransaction.wait());
  await saveFile(network, name, contract, args, libraries);
  return contract.deployed();
}

export function getContract(network: string, name: string) {
  const nameArr = name.split(":");
  const contractName = nameArr.length > 1 ? nameArr[1] : nameArr[0];
  const path = `./deployments/${network}/`;
  const latest = `${contractName}.json`;

  if (existsSync(path + latest)) {
    let json = JSON.parse(readFileSync(path + latest).toString());
    console.log("Deployed", name);
    console.log("  on", json.address);
    return json;
  } else {
    return "";
  }
}

export async function saveFile(
  network: string,
  name: string,
  contract: Contract,
  args: Array<any> = [],
  libraries: Object = {}
) {
  const nameArr = name.split(":");
  const contractName = nameArr.length > 1 ? nameArr[1] : nameArr[0];
  const path = `./deployments/${network}/`;
  const file = `${contractName}.json`;

  mkdirSync(path, { recursive: true });

  if (contractName != name) {
    writeFileSync(path + file, JSON.stringify({
      address: contract.address,
      constructorArguments: args,
      libraries: libraries,
      contract: name
    }));
  } else {
    writeFileSync(path + file, JSON.stringify({
      address: contract.address,
      constructorArguments: args,
      libraries: libraries
    }));
  }
}

type Config = {
  name: string;
  type: string;
  id: number;
  from: string;
  bridge: string;
  erc20Handler: string;
  erc721Handler: string;
  erc1155Handler: string;
  genericHandler: string;
  feeHandler: string;
  signature: string;
  tokens: Token[];
}

export type Token = {
  address: string;
  name: string;
  symbol: string;
  from: number;
  native: boolean;
  decimals: number;
  resourceId: string;
}


export function loadConfig(network: string, proxy: boolean = false): Config {
  const path = `./deployments/${network}/`;
  const latest = proxy ? `config-proxy.json` : `config.json`;

  if (existsSync(path + latest)) {
    let json = JSON.parse(readFileSync(path + latest).toString()) as Config;
    return json;
  } else {

    let json: Config = {
      name: "",
      type: "",
      id: 0,
      from: "",
      bridge: "",
      erc20Handler: "",
      erc721Handler: "",
      erc1155Handler: "",
      genericHandler: "",
      feeHandler: "",
      signature: "",
      tokens: []
    };
    return json;
  }
}

export function saveConfig(network: string, json: Config, proxy: boolean = false) {
  const path = `./deployments/${network}/`;
  const latest = proxy ? `config-proxy.json` : `config.json`;

  mkdirSync(path, { recursive: true });
  writeFileSync(path + latest, JSON.stringify(json));
}


export const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

export const toHex = (covertThis: BytesLike, padding: number): string => {
  return utils.hexZeroPad(utils.hexlify(covertThis), padding);
};

export const createResourceID = (contractAddress: string, domainID: number) => {
  return toHex(contractAddress + toHex(BigNumber.from(domainID).toHexString(), 1).substr(2), 32)
};

export const expandDecimals = (amount: any, decimals = 18): BigNumber => {
  return utils.parseUnits(String(amount), decimals);
}

export const encodeData = (amount: string, recipient: string) => {
  const data = '0x' +
    utils.hexZeroPad(expandDecimals(amount).toHexString(), 32).substr(2) +  // Deposit Amount        (32 bytes)
    utils.hexZeroPad(utils.hexlify((recipient.length - 2) / 2), 32).substr(2) +    // len(recipientAddress) (32 bytes)
    recipient.substr(2);                    // recipientAddress      (?? bytes)
  return data;
}