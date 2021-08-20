# SolOnomy: Onomy transaction records subgraph

`Graph-cli` and `mustache` is being used for genearting the Assemblyscript and subgraph yam specifiication

## Prerequisites
1) graph-cli : https://github.com/graphprotocol/graph-cli
2) mustache : https://github.com/janl/mustache.js

## Available Scripts

In the project directory, you can run:

### `yarn codegen`
Generates AssemblyScript types for smart contract ABIs and the subgraph schema.

### `yarn build`
Compiles a subgraph to WebAssembly.

### `yarn prep:mainnet`, `yarn prep:rinkeby`
Generates subgraph.yaml based on subgraph template for the speicific network and network configuration

### `yarn deploy`, `yarn deploy:debug`
Deploys a subgraph to a Graph Node(onomyprotocol/ograph)

# Playground

The link to the Graph playground: https://thegraph.com/legacy-explorer/subgraph/onomyprotocol/ograph

# Entities

[schema.graphql](./schema.graphql)

## WNOMTransaction

The WNOMTransaction entity is the reflection of the BondingNOM Transaction event emitted by the contract. 

### Query example

```
{
  wnomtransactions(
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

## WNOMHistoricalFrame 

WNOMHistoricalFrame is aggregated price change entities within the supported frames (Min, Hour, Day and etc).
The aggregation is based on  BondingNOM Transaction event emitted by the contract, so in case there are no events
within the frame, the frame won't exist.

### Query example

```
{
  wnomhistoricalFrames(
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