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

### `yarn deploy`, `yarn deploy:rinkeby`
Deploys a subgraph to a Graph Node(onomyprotocol/bondingNOM)
