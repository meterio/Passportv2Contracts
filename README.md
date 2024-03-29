# Token Contracts

## Install
```
npm install
```

## Compile
```
npm compile
```

## Deploy upgradeable contract
1. edit file[./scripts/deployProxy.js](./scripts/deployProxy.js)
2. run
```
npx hardhat run ./scripts/deployProxy.js --network metermain
```

## Deploy
```
npx hardhat deploy --name ttt --symbol ttt --supply 1000000000000000000000000 --owner 0x319a0cfD7595b0085fF6003643C7eD685269F851 --network metermain
```

## setBlackList
```
npx hardhat setBlackList --account 0x319a0cfD7595b0085fF6003643C7eD685269F851 --network metermain
```

## getBlackList
```
npx hardhat getBlackList --account 0x319a0cfD7595b0085fF6003643C7eD685269F851 --network metermain
```

## mint
```
npx npx hardhat mint --to 0x319a0cfD7595b0085fF6003643C7eD685269F851 amount 10000000000000000000000 --network metermain
```

## pause
```
npx hardhat pause --network metermain
```

## unpause
```
npx hardhat unpause --network metermain
```

## grantRole
```
npx hardhat grant --account 0x319a0cfD7595b0085fF6003643C7eD685269F851 --network metermain
```

## revokeRole
```
npx hardhat revoke --account 0x319a0cfD7595b0085fF6003643C7eD685269F851 --network metermain
```

## Publish & Verify
```
npx hardhat veri --network metermain
```

## Deploy all contracts by proxy, use custom rpc and provate key
- --domain domain id default 1
- rpc rpc address
- proxyadmin proxy administrator private key
- bridgeadmin bridge administrator private key, not the same as a proxy admin
```
npx hardhat deploy-proxy-all \
    --domain 1 \
    --rpc https://rpctest.meter.io \
    --proxyadmin 0x123.....890 \
    --bridgeadmin 0x098.....321
```