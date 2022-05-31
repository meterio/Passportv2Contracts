import { Signer, VoidSigner, BigNumber } from "ethers"
import { BytesLike, } from "@ethersproject/bytes";
export async function getSign(
  wallet: Signer,
  verifyingContract: string,
  domainID: string,
  depositNonce: string,
  resourceID: string,
  data: string,
  chainId: number
): Promise<BytesLike> {

  const name = "PermitBridge";
  const version = "1.0";
  let signer = wallet as VoidSigner;
  let signature = await signer._signTypedData(
    { name, version, chainId, verifyingContract },
    {
      PermitBridge: [
        { name: "domainID", type: "uint8" },
        { name: "depositNonce", type: "uint64" },
        { name: "resourceID", type: "bytes32" },
        { name: "data", type: "bytes" }
      ],
    },
    {
      domainID: domainID,
      depositNonce: depositNonce,
      resourceID: resourceID,
      data: data
    }
  );
  return signature;
}
