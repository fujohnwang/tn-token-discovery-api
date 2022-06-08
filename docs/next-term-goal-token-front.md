
# Code name token front

Token Front is a web service API providing token level data access (as opposed to blockchain level data access).

Token Negotiator needed a subset of its feature before the Token Font product could be designed; hence a small subset of the feature is implemented and go by the name of Token Discovery.

## Problem statement:

The Dapp era centralised data providers, while Ether scan being the leader, failed to address the modern needs of web developers, especially newcomers from web2 whose focus is on NFT (and, we believe, soon, on SmartTokens). For the following reasons:

- Traditional data sources such as Etherscan failed to capture token level data. Most data related to tokens are generic, such as total insurance, not specific, such as the indebtedness of a specific AAVE position and the picture URL of a specific NFT.

- NFT data sources such as open sea provides partial data needed for applications.

- Most failed to fetch data from 3rd party sources and present it to the developers in one go.

- Many failed to connect to multiple chains simultaneously, yet many tokens exist on more than one chain. Some chains are not directly supported by etherscan but by their bespoke block explorer.

- Most data sources are not dynamic, event-driven. If token data changes, or a token changes hand, the API users do not get an update.

- Lacking token discovery service: none can return all tokens the user has based on the user's Ethereum address.

## Product-market fit

A token-based version of data API can win paying customers from:

- Vendors who already use Brand Connector and Token Negotiator
- Wallet providers such as AlphaWallet and other wallets on the market.
- Developers who need to build NFT applications quickly in a traditional way, without learning how to access the Ethereum blockchain, connect to nodes and call token functions. 

Key functions of the API set:

Token Discovery service provides an ethereum address and returns current tokens with a succinct, small data set for each token, optimised for the token Negotiator.

- Token data subscription; for a select token, identified by a combination of chain ID, token contract and token ID (the last can be the Ethereum address for fungible tokens), returns the token data set and keep updating the clients of changes.

- Token activity access. For a select token, return past activities (transactions that affected the token, such as being changed hand or an autograph being added). These token activities are defined by a schema embedded in an uploadable TokenActivities.

Non-function features:

- Merge off-chain and on-chain data. In the case of NFT, typically, off-chain data includes NFT metadata stored in an URL and the NFT image itself. On-chain data includes mint-time and number of transactions and last auction price.

- Merge data from multiple chains into a single source.

- Extensible. Early (first months) versions might take data from 3rd party sources, but it's expected that the users can upload data schema and event definition (in the format of embedded definition in TokenScripts) to direct the return data of each token. This will soon create versioning issues which need to be addressed in the API design.

- Speed. In 2 cases, speed is essential: 𝑎) the time needed to return an API call and 𝑏) the time needed for blockchain events to result in changes in token data. The former is affected by indexing, and the second is how quickly data can be indexed (or provided without indexing first).

- AlphaWallet will be using the service, so any event subscription will be converted to message queues (elevator problem). We are unsure if this API should provide a message queue directly or would AlphaWallet run its message queue based on this API. Still, the former is appreciated if architecturally sound.

- Billing and anti-DDoS. There is an apparent need for these, but it's desirable to have the system throttle in stages in case of high load or misuse instead of suddenly cutting off access.

- In terms of scalability, we envision this service to operate as a node in a distributed network, following the example of TheGraph. Note: hence, message queue service was previously better than a module or pluggable instead of built-in since most nodes will not be servicing a mobile wallet. There is no plan to scale throughput as more nodes join, but that is possible. For now, we are scaling through a cloud-based service provision linearly.


## Evolutionary path

The aggregation (forwarding enquiries to OpenSea/morali/etherscan etc) is a short-term strategy. Because we have no control over these API providers, they are known to change quotas based on their service capability. They may do it to us specifically using terms and conditions, since we are a competition. Ultimately, the service indexes data through token-issuer defined data schema and rules, similar to how TheGraph uses subgraph. Therefore, the aggregation should be designed modular and retire cleanly, without being the core logic.

The priority is to provide an indexed token discovery service and token data subscription. Eventually, the TokenScript engine kicks in to allow us to obtain rich data set about tokens without dependency on the aggregators.

## Design challenges

### Consistency

Since the service starts its life as a token data aggregator, there will be consistency issues across data returned by different services. To make the matter worse, data services, such as opensea, unanimously do not report the block height; hence there is no way to assert how outdated the data is.

It may be the case that until Token Front takes blockchain data entirely directly from blockchains, consistency will always be hard to address; however, any measurements to improve consistency is appreciated.

(Weiwu: Let's give up providing Activity related functions until the next stage where tokenscript aids the service to fetch and analyze data directly from blockchains. In doing so, we will effectively shift the consistence issue from Token Front API to the client when it comes to Token API. That could be the only choice.)

## Data abstraction

Since the aggregator takes data from multiple sources, some abstraction is needed for high-level applications to not care about the actual data source. Achieving this requires a data interface abstracted from the dependent data services.

## Boon's challenge point 3

I forgot what it is - Weiwu

# Token Front Design Draft(added by Darren)

## Core Positioning

1. metadata service
	- realtime refresh is not acceptable
2. consistent API layer for easy use(e.g. Spring Framework of web2 era)
	- forward is ok and make sense 


## API Spec Layers

There will be at least two layers of API: 
1.  Server Side API  / Provider side API
2.  Client Side SDK API / Consumer side SDK API

The Serverside API is the key protocol or contract for the token interactions.  Maybe GraphQL is the best suitable tool for this scenario. It meets Abstraction and Consistency demands.

Although client side applications(dApps) or consumer side applications can access Token Front directly via GraphQL in their own way, a better designed SDK will help a lot. Especially nodejs/javascript ecosystem is the most popular community

SDK API can be an easy way to use Token Front service, e.g. 

```
val token = TokenFront.token(symbol)
token.profile(...)
token.tranfer(...)
token.issue(...)
token.mint(...)
token.sign(...)
...
```

As more and more users accept us, SDKs of Android/iOS/PWA may be introduced.



## About Completeness

As completeness, I have two understandings, let's me show you one by one.

The First Completeness I can understand is, How can we cover all of the tokens in the market? 

That's why I have mentioned on the meeting what will be the order or roadmap for Token Front to serve all of the tokens.

The Second Completeness is "How can we cover all of the functions of any Token?" or "How can we cover a full function set of a Token?"

They are different granularities, but both need our attention.

For the First Completeness,  we have at least 3 ways to go:

1.  cover the topN tokens first, then other tokens as per some priority;
2.  serve at demand,  if the requested token is not ready, we log and bring it online later on;
3.  registration and enlist,  we define specification and vendors submit there token, after that, the token will be ready for use on Token Front;


For the Second Completeness, there is no better way just one way:  as long as more tokens we introduce onto Token Front, the abstraction will come to completeness naturally.





## Architecture Proposal


![image](https://user-images.githubusercontent.com/451506/172513737-1ef117d8-413f-44a9-b7f5-4f708fb4bf4f.png)

Data Subscription should be abstracted behind Token Front and make it inline, consumers or token front users should not care about it.


