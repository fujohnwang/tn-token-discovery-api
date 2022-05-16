# token-discovery-api

Token discovery API

### Usage

This API has been created to combine multiple ways of reading on chain tokens across many chains.
To learn collection and token meta. 

### End Points

#### Get NFT Token Collection

Gets an NFT's Collection Image and Title.

````

    /get-token-collection?smartContract=0x...&chain=eth

````

#### Get Tokens of an NFT Collection

Gets a owners NFT's of a collection; Image, Title and Meta.

````

    /get-owner-tokens?smartContract=0x...&chain=eth&owner=0x...

````

### Developer

#### Test

```` npm run test ````

#### Serve

```` npm run start ````

#### Build

```` npm run build ````

### Example URLS

Example URLS for fetching collection data:

http://localhost:3000/get-token-collection?smartContract=0x0d0167a823c6619d430b1a96ad85b888bcf97c37&chain=eth

http://localhost:3000/get-token-collection?smartContract=0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656&chain=rinkeby&openSeaSlug=rinkeby-punk

http://localhost:3000/get-token-collection?smartContract=0x0d0167a823c6619d430b1a96ad85b888bcf97c37&chain=rinkeby

Example URLS for fetching token collection data:

http://localhost:3000/get-owner-tokens?smartContract=0x414c5e3716bcec4b2373108b187914215695627a&chain=eth&owner=0x7abaEd470E89820738B5e58874dFa7a77F9Cd44d

### Chain Support

mainnet / eth
polygon
arbitrum
optimism
rinkeby
ropsten
goerli
kovan
bsc
mumbai
avalanche
fantom
POAP via XDai