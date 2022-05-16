"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenDiscoveryController = void 0;
require('dotenv').config();
// @ts-ignore
const node_fetch_1 = __importDefault(require("node-fetch"));
const DEFAULT_IPFS_BASE_URL = "https://gateway.pinata.cloud/ipfs/";
class TokenDiscoveryController {
    constructor(onChainModuleKeys, ipfsBaseUrl) {
        this.requiredParams = (item, msg) => {
            if (!item)
                throw new Error(msg);
        };
        const moralisAPIKey = (onChainModuleKeys === null || onChainModuleKeys === void 0 ? void 0 : onChainModuleKeys.moralisAPIKey)
            ? onChainModuleKeys.moralisAPIKey
            : process.env.MORALIS_API;
        const alchemyAPIKey = (onChainModuleKeys === null || onChainModuleKeys === void 0 ? void 0 : onChainModuleKeys.alchemyAPIKey)
            ? onChainModuleKeys.alchemyAPIKey
            : process.env.ALCHEMY_API;
        const openSeaAPIKey = (onChainModuleKeys === null || onChainModuleKeys === void 0 ? void 0 : onChainModuleKeys.openSeaAPIKey)
            ? onChainModuleKeys.openSeaAPIKey
            : process.env.OPENSEA_API;
        this.onChainApiConfig = {
            moralis: {
                chainSupport: [
                    "eth",
                    "mainnet",
                    "rinkeby",
                    "ropsten",
                    "goerli",
                    "kovan",
                    "bsc",
                    "polygon",
                    "mumbai",
                    "avalanche",
                    "fantom",
                ],
                config: {
                    mainnet: {
                        url: "https://deep-index.moralis.io/api/v2/",
                        apiKey: moralisAPIKey,
                    },
                },
            },
            alchemy: {
                chainSupport: [
                    "eth",
                    "mainnet",
                    "rinkeby",
                    "arbitrum",
                    "polygon",
                    "optimism",
                ],
                config: {
                    mainnet: {
                        url: "https://eth-mainnet.alchemyapi.io/v2/",
                        apiKey: alchemyAPIKey,
                    },
                    rinkeby: {
                        url: "https://eth-rinkeby.alchemyapi.io/v2/",
                        apiKey: alchemyAPIKey,
                    },
                    optimism: {
                        url: "https://opt-mainnet.g.alchemy.com/v2/",
                        apiKey: alchemyAPIKey,
                    },
                    arbitrum: {
                        url: "wss://arb-mainnet.g.alchemy.com/v2/",
                        apiKey: alchemyAPIKey,
                    },
                    polygon: {
                        url: "https://polygon-mainnet.g.alchemyapi.io/v2/",
                        apiKey: alchemyAPIKey,
                    },
                },
            },
            opensea: {
                chainSupport: ["eth", "mainnet", "rinkeby"],
                config: {
                    mainnet: {
                        url: "https://api.opensea.io/api/v1/",
                        apiKey: openSeaAPIKey,
                    },
                    rinkeby: {
                        url: "https://testnets-api.opensea.io/api/v1/",
                        apiKey: openSeaAPIKey,
                    },
                },
            },
            poap: {
                chainSupport: ["xdai"],
                config: {
                    mainnet: {
                        url: "",
                        apiKey: "",
                    },
                },
            },
        };
        this.ipfsBaseUrl = ipfsBaseUrl;
    }
    getOnChainAPISupportBool(apiName, chain) {
        if (!this.onChainApiConfig[apiName])
            return false;
        return this.onChainApiConfig[apiName].chainSupport.indexOf(chain) > -1;
    }
    /**
     * Substitute public IPFS base URLs with the config provided URL.
     */
    transformImageUrl(url) {
        var _a;
        if (!url)
            return url;
        let useBase = (_a = this.ipfsBaseUrl) !== null && _a !== void 0 ? _a : DEFAULT_IPFS_BASE_URL;
        if (url.indexOf("ipfs://") === 0) {
            return url.replace("ipfs://", useBase);
        }
        if (!this.ipfsBaseUrl)
            return url;
        // TODO: Transform non-public ipfs gateways into specified URL.
        const regex = /https:\/\/gateway.pinata.cloud\/ipfs\//i;
        return url.replace(regex, useBase);
    }
    /**
       * @function getInitialContractAddressMetaData
       * @description returns initial contract address data collection name & image.
       * @example issuerKey example: 0x381748c76f2b8871afbbe4578781cd24df34ae0d-rinkeby
       * @param issuer
       * @returns from searching API's
       * {
                  chain: "rinkeby",
                  contractAddress: "0x381748c76f2b8871afbbe4578781cd24df34ae0d",
                  image: "https://storage.googleapis.com/opensea-rinkeby/0x381748c76f2b8871afbbe4578781cd24df34ae0d.png",
                  title: "OpenSea Creature Sale"
          }
       */
    async getInitialContractAddressMetaData(contract, chain, openSeaSlug) {
        if (!contract || !chain)
            return null;
        let collectionData = null;
        if (contract.toLowerCase() === "0x22c1f6050e56d2876009903609a2cc3fef83b415") {
            return {
                api: "poap",
                chain: chain,
                contract: contract,
                image: "https://storage.googleapis.com/subgraph-images/1647414847706poap.jpeg",
                title: "POAP Proof of attendance protocol",
            };
        }
        if (openSeaSlug !== undefined) {
            collectionData = await this.getContractDataOpenSea(contract, chain, openSeaSlug);
        }
        if (!collectionData) {
            collectionData = await this.getContractDataMoralis(contract, chain);
        }
        if (openSeaSlug === undefined && !collectionData) {
            collectionData = await this.getContractDataAlchemy(contract, chain);
        }
        return collectionData;
    }
    /**
       * @function getContractDataOpenSea
       * @description returns from OpenSea API initial contract address data collection name & image.
       * @param {string} contractAddress smart contract address
       * @param {string} chain chain name used to search via api
       * @param openSeaSlug
       * @returns
       * {
                  chain: "rinkeby",
                  contractAddress: "0x381748c76f2b8871afbbe4578781cd24df34ae0d",
                  image: "https://storage.googleapis.com/opensea-rinkeby/0x381748c76f2b8871afbbe4578781cd24df34ae0d.png",
                  title: "OpenSea Creature Sale"
          }
      */
    async getContractDataOpenSea(contractAddress, chain, openSeaSlug) {
        var _a;
        if (!this.getOnChainAPISupportBool("opensea", chain))
            return null;
        const path = `/assets?asset_contract_address=${contractAddress}&collection=${openSeaSlug}&order_direction=desc&offset=0&limit=20`;
        let response;
        try {
            response = await this.getDataOpensea(path, chain);
            if (!((_a = response === null || response === void 0 ? void 0 : response.assets) === null || _a === void 0 ? void 0 : _a.length))
                return null;
            return {
                api: "opensea",
                chain: chain,
                contract: contractAddress,
                image: response.assets[0].collection.image_url,
                title: response.assets[0].collection.name,
            };
        }
        catch (error) {
            console.warn("Failed to collect contract data from OpenSea API", error.message);
            return null;
        }
    }
    /**
       * @function getContractDataMoralis
       * @description returns from Moralis API initial contract address data collection name & image.
       * @param {string} contractAddress smart contract address
       * @param {string} chain chain name used to search via api
       * @returns
       * {
                  chain: "rinkeby",
                  contractAddress: "0x381748c76f2b8871afbbe4578781cd24df34ae0d",
                  image: "https://storage.googleapis.com/opensea-rinkeby/0x381748c76f2b8871afbbe4578781cd24df34ae0d.png",
                  title: "Title of Collection"
          }
      */
    async getContractDataMoralis(contractAddress, chain) {
        var _a;
        if (!this.getOnChainAPISupportBool("moralis", chain))
            return null;
        if (chain === "mainnet")
            chain = "eth";
        const path = `/nft/${contractAddress}?chain=${chain}&format=decimal&limit=1`;
        let response, image;
        try {
            response = await this.getDataMoralis(path, chain);
            // @ts-ignore
            if (!((_a = response === null || response === void 0 ? void 0 : response.result) === null || _a === void 0 ? void 0 : _a.length))
                return null;
            // @ts-ignore
            image = JSON.parse(response.result[0].metadata).image;
        }
        catch (err) {
            console.warn("Failed to collect contract data from Moralis API", err.message);
            return null;
        }
        return {
            api: "moralis",
            chain: chain,
            contract: contractAddress,
            image: this.transformImageUrl(image),
            // @ts-ignore
            title: response.result[0].name,
        };
    }
    /**
       * @function getContractDataAlchemy
       * @description returns from Moralis API initial contract address data collection name & image.
       * @param {string} contractAddress smart contract address
       * @param {string} chain chain name used to search via api
       * @returns
       * {
                  chain: "rinkeby",
                  contractAddress: "0x381748c76f2b8871afbbe4578781cd24df34ae0d",
                  image: "https://storage.googleapis.com/opensea-rinkeby/0x381748c76f2b8871afbbe4578781cd24df34ae0d.png",
                  title: "Title of Collection"
          }
      */
    async getContractDataAlchemy(contractAddress, chain) {
        var _a;
        if (!this.getOnChainAPISupportBool("alchemy", chain))
            return null;
        const tokenId = "0";
        const withMetadata = "true";
        const path = `/getNFTsForCollection?contractAddress=${contractAddress}&cursorKey=${tokenId}&withMetadata=${withMetadata}`;
        let response;
        try {
            response = await this.getDataAlchemy(path, chain);
        }
        catch (err) {
            console.warn("failed to collect contract data from Alchemy API", err);
            return null;
        }
        // @ts-ignore
        if (!((_a = response === null || response === void 0 ? void 0 : response.nfts) === null || _a === void 0 ? void 0 : _a.length))
            return null;
        return {
            api: "alchemy",
            chain: chain,
            contract: contractAddress,
            // @ts-ignore
            image: this.transformImageUrl(response.nfts[0].metadata.image),
            // @ts-ignore
            title: response.nfts[0].title,
        };
    }
    /**
       * @function getTokens
       * @description returns tokens
       * @param {string} smartContract smart contract address
       * @param {string} chain chain name used to search via api
       * @param {string} openSeaSlug optional
       * @param {string} owner owners wallet address
       * @returns
       * [
       *   tokens
       * ]
    */
    async getTokens(smartContract, chain, openSeaSlug, owner) {
        let tokens = {};
        if (smartContract.toLowerCase() ===
            "0x22c1f6050e56d2876009903609a2cc3fef83b415") {
            return this.getTokensPOAP(owner);
        }
        if (openSeaSlug !== undefined) {
            let openseaTokens = await this.getTokensOpenSea(smartContract, chain, owner, openSeaSlug);
            tokens = this.mergeTokenMetadata(tokens, openseaTokens);
        }
        if (!this.validateTokenMetadata(tokens)) {
            let moralisTokens = await this.getTokensMoralis(smartContract, chain, owner);
            tokens = this.mergeTokenMetadata(tokens, moralisTokens);
        }
        if (!this.validateTokenMetadata(tokens) && openSeaSlug === undefined) {
            let alchemyTokens = await this.getTokensAlchemy(smartContract, chain, owner);
            tokens = this.mergeTokenMetadata(tokens, alchemyTokens);
        }
        return Object.values(tokens);
    }
    mergeTokenMetadata(curTokens, tokens) {
        for (let token of tokens) {
            if (!curTokens[token.tokenId]) {
                curTokens[token.tokenId] = token;
                continue;
            }
            if (!curTokens[token.tokenId].title && token.title)
                curTokens[token.tokenId].title = token.title;
            if (!curTokens[token.tokenId].image && token.image)
                curTokens[token.tokenId].image = token.image;
        }
        return curTokens;
    }
    validateTokenMetadata(tokens) {
        if (!Object.keys(tokens).length)
            return false;
        for (let tokenId in tokens) {
            if (!tokens[tokenId].image || !tokens[tokenId].title)
                return false;
        }
        return true;
    }
    async getTokensOpenSea(address, chain, owner, openSeaSlug, offset = 0, limit = 20) {
        if (!this.getOnChainAPISupportBool("opensea", chain))
            return [];
        this.requiredParams(chain && address && owner, "cannot search for tokens, missing params");
        const path = `/assets?owner=${owner}&collection=${openSeaSlug}&order_direction=desc&offset=0&limit=20`;
        return this.getDataOpensea(path, chain)
            .then((response) => {
            return response.assets
                .filter((item) => {
                return item.token_id !== null;
            })
                .map((item) => {
                const image = item.image_url ? item.image_url : "";
                const title = item.name ? item.name : "";
                return {
                    api: "opensea",
                    tokenId: item.token_id,
                    title: title,
                    image: image,
                    data: item,
                };
            });
        })
            .catch((error) => {
            console.warn("Failed to collect contract data from OpenSea API", error);
            return [];
        });
    }
    async getTokensMoralis(address, chain, owner, offset = 0, limit = 20) {
        if (!this.getOnChainAPISupportBool("moralis", chain))
            return [];
        this.requiredParams(chain && address && owner, "cannot search for tokens, missing params");
        let _chain = chain;
        if (chain === "mainnet")
            _chain = "eth";
        const path = `/${owner}/nft/${address}?chain=${_chain}&format=decimal`;
        return this.getDataMoralis(path, chain)
            .then((response) => {
            return response.result
                .filter((item) => {
                return item.token_id !== null;
            })
                .map((item) => {
                let parsedMeta = null;
                if (item.metadata) {
                    parsedMeta = JSON.parse(item.metadata);
                }
                return {
                    api: "moralis",
                    tokenId: item.token_id,
                    title: (parsedMeta === null || parsedMeta === void 0 ? void 0 : parsedMeta.title) ? parsedMeta === null || parsedMeta === void 0 ? void 0 : parsedMeta.title : "",
                    image: (parsedMeta === null || parsedMeta === void 0 ? void 0 : parsedMeta.image)
                        ? this.transformImageUrl(parsedMeta === null || parsedMeta === void 0 ? void 0 : parsedMeta.image)
                        : "",
                    data: parsedMeta,
                };
            });
        })
            .catch((err) => {
            console.warn("Failed to collect tokens from Moralis API", err.message);
            return [];
        });
    }
    async getTokensAlchemy(address, chain, owner) {
        if (!this.getOnChainAPISupportBool("alchemy", chain))
            return [];
        const path = `/getNFTs/?owner=${owner}&contractAddresses[]=${address}`;
        return this.getDataAlchemy(path, chain)
            .then((result) => {
            // @ts-ignore
            return result.ownedNfts
                .filter((item) => {
                return (item === null || item === void 0 ? void 0 : item.id.tokenId) !== null;
            })
                .map((item) => {
                const tokenId = Number(item.id.tokenId).toFixed(0);
                return {
                    api: "alchemy",
                    tokenId: tokenId,
                    title: item.title,
                    image: this.transformImageUrl(item.metadata.image),
                    data: item,
                };
            });
        })
            .catch((err) => {
            console.warn("Failed to collect tokens from Alchemy API", err.message);
            return [];
        });
    }
    async getDataOpensea(path, chain) {
        const config = this.getConfigForServiceAndChain("opensea", chain);
        const options = {
            method: "GET",
            headers: {
                Accept: "application/json",
                "X-API-KEY": config.apiKey,
            },
        };
        const url = this.joinUrl(config.url, path);
        return await this.httpJsonRequest(url, options);
    }
    async getDataAlchemy(path, chain) {
        const options = {
            method: "GET",
            headers: {
                redirect: "follow",
            },
        };
        const config = this.getConfigForServiceAndChain("alchemy", chain);
        let url = this.joinUrl(config.url, config.apiKey + path);
        return await this.httpJsonRequest(url, options);
    }
    async getDataMoralis(path, chain) {
        const config = this.getConfigForServiceAndChain("moralis", chain);
        const options = {
            method: "GET",
            headers: {
                "x-api-key": config.apiKey,
            },
        };
        const url = this.joinUrl(config.url, path);
        return await this.httpJsonRequest(url, options);
    }
    joinUrl(baseUrl, path) {
        let baseEnd = baseUrl.charAt(baseUrl.length - 1);
        let pathStart = path.charAt(0);
        if (baseEnd !== "/" && pathStart !== "/") {
            return baseUrl + "/" + path;
        }
        else if (baseEnd === "/" && pathStart === "/") {
            return baseUrl + path.substring(1);
        }
        return baseUrl + path;
    }
    getConfigForServiceAndChain(service, chain, defaultCred = "mainnet") {
        if (!this.onChainApiConfig[service])
            throw new Error("Invalid API service: " + service);
        if (chain === "eth")
            chain = "mainnet";
        const configs = this.onChainApiConfig[service].config;
        if (configs[chain])
            return configs[chain];
        if (defaultCred && configs[defaultCred])
            return configs[defaultCred];
        throw new Error("API config not available for " + service + " chain: " + chain);
    }
    async httpJsonRequest(req, requestOptions) {
        let response = await (0, node_fetch_1.default)(req, requestOptions);
        if (response.status > 299 || response.status < 200) {
            throw new Error("HTTP Request error: " + response.statusText);
        }
        try {
            return await response.json();
        }
        catch (err) {
            throw new Error("Failed to parse JSON response: " + err.message);
        }
    }
    async getTokensPOAP(owner) {
        // Uncomment to test a really large POAP collection - this guy gets around
        // let url = `https://api.poap.xyz/actions/scan/0x4d2803f468b736b62fe9eec992c8f4c41be4cb15`;
        let url = `https://api.poap.xyz/actions/scan/${owner}`;
        let tokens = [];
        let res;
        try {
            res = await this.httpJsonRequest(url, {
                method: "GET",
            });
        }
        catch (e) {
            console.log(e.message);
            return tokens;
        }
        // @ts-ignore
        for (let token of res) {
            tokens.push({
                api: "poap",
                title: token.event.name,
                image: token.event.image_url,
                data: token,
            });
        }
        return tokens;
    }
}
exports.TokenDiscoveryController = TokenDiscoveryController;
exports.default = TokenDiscoveryController;
//# sourceMappingURL=index.js.map