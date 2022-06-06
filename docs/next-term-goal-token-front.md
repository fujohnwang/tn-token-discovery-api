
Code name token front

Problem statement:

The Dapp era centralised data providers, while Ether scan being the leader, failed to address the modern needs of web developers, especially newcomers from web2 whose focus is on NFT (and, we believe, soon, on SmartTokens). For the following reasons:

- Traditional data sources such as Etherscan failed to capture token level data. Most data related to tokens are generic, such as total insurance, not specific, such as the indebtedness of a specific AAVE position and the picture URL of a specific NFT.

- NFT data sources such as opensea provides partial data needed for applications.

- Most failed to fetch data from 3rd party sources and present it to the developers in one go.

- Many failed to connect to multiple chains at the same time, yet many tokens exist on more than 1 chain. Some chains are not directly supported by etherscan but by their own block explorer.

- Most data sources are not dynamic, event-driven. If token data changes, or a token changes hand, the API users do not get an update.

- Lacking token discovery service: none can return all tokens the user has based on the user's Ethereum address.

Product-market fit

A token-based version of data API can win paying customers from:

- Vendors who already use Brand Connector and Token Negotiator
- Wallet providers such as AlphaWallet and other wallets on the market.
- Developers who need to build NFT applications quickly in a traditional way, without having to learn how to access the Ethereum blockchain, connect to nodes and call token functions. 

Key functions of the API set:

- Token Discovery service, provide an ethereum address and return current tokens with a basic, small data set for each token, optimised for the token negotiator.

- Token data subscription; for a select token, identified by a combination of chain ID, token contract and token ID (the last can be the Ethereum address for fungible tokens), returns the token data set and keep updating the clients of changes.

- Token activity access. For a select token, return past activities (transactions that affected the token, such as being changed hand or an autograph being added). These token activities are defined by a schema embedded in an uploadable TokenActivities.

Non-function features:

- Merge off-chain and on-chain data. This is, in the case of NFT, reflected by the nft metadata which is typically stored in an URL instead of inside smart contracts, and the NFT image itself.

- Merge data from multiple chains into a single source.

- Extensible. Early (first months) versions might take data from 3rd party sources, but it's expected that the users can upload data schema and event definition (in the format of embedded definition in TokenScripts) to direct the return data of each token. This will soon create versioning issues which need to be addressed in the API design.

- Speed. In 2 cases speed is of importance: the time needed to return an API call, and the time needed for blockchain events to drive. The former is affected by indexing, and the second is how quickly data can be indexed (or provided without indexing first).

- AlphaWallet will be using the service so any event subscription will be converted to message queues (elevator problem). It wasn't decided if this API should provide a message queue directly or would AlphaWallet run its message queue based on this API, but the former is appreciated if architecturally sound.

- Billing and anti-DDos. There is an apparent need for these, but it's desirable to have the system throttle in stages in case of high load or misuse, instead of suddenly cutting off access.

- In terms of scalability, the longer vision is this service can operate as a node in a distributed network, following the example of TheGraph. Note: hence, previously message queue service is better than a module or pluggable instead of built-in since most nodes will not be servicing a mobile wallet. There is no plan to scale throughput as more nodes join, but that is a possibility. For now, scaling through a cloud-based service provision, linearly.

Evolution:

The aggregation (forwarding enquiries to opensea/morali/etherscan etc) is a short-term strategy, and because we have no control over these API providers, they are known to change quota based on their service capability and they may do the same due to competition. Ultimately, the service indexes data through token-issuer defined data schema and rules, similar to how TheGraph uses subgraph. Therefore, the aggregation should be designed modular and retire cleanly, without being the core logic.

The priority is to provide an indexed token discovery service and token data subscription, activity will be the next stage (post 1.0) milestone as it depends on issuer-generated schemas.
