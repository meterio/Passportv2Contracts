### Deploy core contract
```
npx hardhat deploy --contract bridge --domain 5 --network metertest 
npx hardhat deploy --contract erc20Handler --network metertest
npx hardhat deploy --contract erc721Handler --network metertest
npx hardhat deploy --contract erc1155Handler --network metertest
npx hardhat deploy --contract genericHandler --network metertest
npx hardhat deploy --contract feeHandler --network metertest
```

### Deploy signature
```
npx hardhat deploy-signature --network metertest
```

### Deploy Tokens
```
npx hardhat deploy-token --name 'Rinkeby USDT' --symbol 'USDT' --amount 0 --from 1 --network metertest
```

### Deploy Tokens
```
npx hardhat deploy-token --name 'Rinkeby USDT' --symbol 'USDT' --amount 0 --from 1 --network metertest
```

### Deploy Native Tokens
```
npx hardhat deploy-native --from 1 --name 'Nativa Token' --symbol 'ETH' --network metertest
```