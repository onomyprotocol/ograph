# SolOnomy: Onomy transaction records subgraph

`Graph-cli` and `mustache` is being used for genearting the Assemblyscript and subgraph yam specifiication

## Available Scripts

In the project directory, you can run:

### `yarn install`

Install dependencies.

### `yarn prep:devnet`, `yarn prep:testnet`, `yarn prep:mainnet`

Generates subgraph.yaml based on subgraph template for the specific env and network configuration

### `yarn codegen`

Generates AssemblyScript types for smart contract ABIs and the subgraph schema.

### `yarn build`

Compiles a subgraph to WebAssembly.

### `yarn auth`

Use the access token from the The Graph to allow the deployments.

### `yarn deploy:devnet`, `yarn deploy:testnet`, `yarn deploy:mainnet`

Deploys a subgraph to a Graph Node.

# Playground

The link to the Graph playground: https://thegraph.com/legacy-explorer/subgraph/onomyprotocol/ograph-devnet
The link to the Graph playground: https://thegraph.com/legacy-explorer/subgraph/onomyprotocol/ograph-tevnet
The link to the Graph playground: https://thegraph.com/legacy-explorer/subgraph/onomyprotocol/ograph-mainnet

# Entities

[schema.graphql](./schema.graphql)

## BNOMTransaction

The BNOMTransaction entity is the reflection of the BondingNOM Transaction event emitted by the contract.

### Query example

```
{
  bnomtransactions(
    first: 1000, 
    skip: 0, 
    orderBy: timestamp, 
    orderDirection: desc
  ) {
    id
    senderAddress
    amountNOM
    amountETH
    price
    supply
    buyOrSell
    slippage
    timestamp
  }
}
```

## BNOMHistoricalFrame

BNOMHistoricalFrame is aggregated price change entities within the supported frames (Min, Hour, Day and etc). The
aggregation is based on BondingNOM Transaction event emitted by the contract, so in case there are no events within the
frame, the frame won't exist.

### Query example

```
{
  bnomhistoricalFrames(
    first: 1000, 
    skip: 0,
    where: { type: Minute },
    orderBy: startTime, 
    orderDirection:desc
  ) {
    id
    type
    updateTime
    startTime
    startPrice
    endTime
    endPrice
    minPrice
    maxPrice
    transactionsCount
  }
}
```

# CI/CD

The repo supports the CI processes on the PR or merge to the 'dev', 'testnet', 'main' branches. Ans CD proces on the
merge to the 'dev', 'testnet', 'main' branches with the deployment to the corresponding envs.