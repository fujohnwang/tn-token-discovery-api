import axios, {AxiosRequestConfig} from 'axios';
import {DEFAULT_IPFS_BASE_URL} from '../constant';
import {IOnChainApiConfig, IToken, ITokenReturnType} from '../types';

export default class TokenDiscoveryService {
  onChainApiConfig: IOnChainApiConfig;
  ipfsBaseUrl?: string;

  constructor(
    onChainModuleKeys?: {[apiName: string]: string},
    ipfsBaseUrl?: string
  ) {
    const moralisAPIKey = onChainModuleKeys?.moralisAPIKey
      ? onChainModuleKeys.moralisAPIKey
      : process.env.MORALIS_API;
    const alchemyAPIKey = onChainModuleKeys?.alchemyAPIKey
      ? onChainModuleKeys.alchemyAPIKey
      : process.env.ALCHEMY_API;
    const openSeaAPIKey = onChainModuleKeys?.openSeaAPIKey
      ? onChainModuleKeys.openSeaAPIKey
      : process.env.OPENSEA_API;

    this.onChainApiConfig = {
      moralis: {
        chainSupport: [
          'eth',
          'mainnet',
          'rinkeby',
          'ropsten',
          'goerli',
          'kovan',
          'bsc',
          'polygon',
          'mumbai',
          'avalanche',
          'fantom',
        ],
        config: {
          mainnet: {
            url: 'https://deep-index.moralis.io/api/v2/',
            apiKey: moralisAPIKey,
          },
        },
      },
      alchemy: {
        chainSupport: [
          'eth',
          'mainnet',
          'rinkeby',
          'arbitrum',
          'polygon',
          'optimism',
        ],
        config: {
          mainnet: {
            url: 'https://eth-mainnet.alchemyapi.io/v2/',
            apiKey: alchemyAPIKey,
          },
          rinkeby: {
            url: 'https://eth-rinkeby.alchemyapi.io/v2/',
            apiKey: alchemyAPIKey,
          },
          optimism: {
            url: 'https://opt-mainnet.g.alchemy.com/v2/',
            apiKey: alchemyAPIKey,
          },
          arbitrum: {
            url: 'wss://arb-mainnet.g.alchemy.com/v2/',
            apiKey: alchemyAPIKey,
          },
          polygon: {
            url: 'https://polygon-mainnet.g.alchemyapi.io/v2/',
            apiKey: alchemyAPIKey,
          },
        },
      },
      opensea: {
        chainSupport: ['eth', 'mainnet', 'rinkeby'],
        config: {
          mainnet: {
            url: 'https://api.opensea.io/api/v1/',
            apiKey: openSeaAPIKey,
          },
          rinkeby: {
            url: 'https://testnets-api.opensea.io/api/v1/',
            apiKey: openSeaAPIKey,
          },
        },
      },
      poap: {
        chainSupport: ['xdai'],
        config: {
          mainnet: {
            url: '',
            apiKey: '',
          },
        },
      },
    };

    this.ipfsBaseUrl = ipfsBaseUrl;
  }

  getOnChainAPISupportBool(apiName: string, chain: string) {
    if (!this.onChainApiConfig[apiName]) return false;

    return this.onChainApiConfig[apiName].chainSupport.indexOf(chain) > -1;
  }

  /**
   * Substitute public IPFS base URLs with the config provided URL.
   */
  private transformImageUrl(url: string) {
    if (!url) return url;

    const useBase = this.ipfsBaseUrl ?? DEFAULT_IPFS_BASE_URL;

    if (url.indexOf('ipfs://') === 0) {
      return url.replace('ipfs://', useBase);
    }

    if (!this.ipfsBaseUrl) return url;

    // TODO: Transform non-public ipfs gateways into specified URL.
    const regex = /https:\/\/gateway.pinata.cloud\/ipfs\//i;

    return url.replace(regex, useBase);
  }

  /**
   * @function getInitialContractAddressMetaData
   * @description returns initial contract address data collection name & image.
   * @example issuerKey example: 0x381748c76f2b8871afbbe4578781cd24df34ae0d-rinkeby
   * @returns from searching API's
  {
  chain: "rinkeby",
  contractAddress: "0x381748c76f2b8871afbbe4578781cd24df34ae0d",
  image: "https://storage.googleapis.com/opensea-rinkeby/0x381748c76f2b8871afbbe4578781cd24df34ae0d.png",
  title: "OpenSea Creature Sale"
  }
   */
  public async getInitialContractAddressMetaData(
    contract: string,
    chain: string,
    openSeaSlug?: string
  ) {
    if (!contract || !chain) return null;

    let collectionData = null;

    if (
      contract.toLowerCase() === '0x22c1f6050e56d2876009903609a2cc3fef83b415'
    ) {
      return {
        api: 'poap',
        chain: chain,
        contract: contract,
        image:
          'https://storage.googleapis.com/subgraph-images/1647414847706poap.jpeg',
        title: 'POAP Proof of attendance protocol',
      };
    }

    if (openSeaSlug !== undefined) {
      collectionData = await this.getContractDataOpenSea(
        contract,
        chain,
        openSeaSlug
      );
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
  async getContractDataOpenSea(
    contractAddress: string,
    chain: string,
    openSeaSlug: string
  ): Promise<ITokenReturnType | null> {
    if (!this.getOnChainAPISupportBool('opensea', chain)) return null;

    const path = `/assets?asset_contract_address=${contractAddress}&collection=${openSeaSlug}&order_direction=desc&offset=0&limit=20`;

    let response: any;

    try {
      response = await this.getDataOpensea(path, chain);

      if (!response?.assets?.length) return null;

      return {
        api: 'opensea',
        chain: chain,
        contract: contractAddress,
        image: response.assets[0].collection.image_url,
        title: response.assets[0].collection.name,
      };
    } catch (error: any) {
      console.warn(
        'Failed to collect contract data from OpenSea API',
        error.message
      );
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
  async getContractDataMoralis(
    contractAddress: string,
    chain: string
  ): Promise<ITokenReturnType | null> {
    if (!this.getOnChainAPISupportBool('moralis', chain)) return null;

    if (chain === 'mainnet') chain = 'eth';

    const path = `/nft/${contractAddress}?chain=${chain}&format=decimal&limit=1`;

    let response, image;

    try {
      response = await this.getDataMoralis(path, chain);

      if (!response?.result?.length) return null;

      image = JSON.parse(response.result[0].metadata).image;
    } catch (err: any) {
      console.warn(
        'Failed to collect contract data from Moralis API',
        err.message
      );
      return null;
    }

    return {
      api: 'moralis',
      chain: chain,
      contract: contractAddress,
      image: this.transformImageUrl(image),
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
  async getContractDataAlchemy(
    contractAddress: string,
    chain: string
  ): Promise<ITokenReturnType | null> {
    if (!this.getOnChainAPISupportBool('alchemy', chain)) return null;

    const tokenId = '0';
    const withMetadata = 'true';
    const path = `/getNFTsForCollection?contractAddress=${contractAddress}&cursorKey=${tokenId}&withMetadata=${withMetadata}`;

    let response;

    try {
      response = await this.getDataAlchemy(path, chain);
    } catch (err: any) {
      console.warn('failed to collect contract data from Alchemy API', err);
      return null;
    }

    if (!response?.nfts?.length) return null;

    return {
      api: 'alchemy',
      chain: chain,
      contract: contractAddress,
      image: this.transformImageUrl(response.nfts[0].metadata.image),
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
  public async getTokens(
    smartContract: string,
    chain: string,
    openSeaSlug: string,
    owner: string
  ) {
    let tokens: {[tokenId: string]: IToken} | undefined = {};
    if (
      smartContract.toLowerCase() ===
      '0x22c1f6050e56d2876009903609a2cc3fef83b415'
    ) {
      return this.getTokensPOAP(owner);
    }

    if (openSeaSlug !== undefined) {
      const openseaTokens = await this.getTokensOpenSea(
        smartContract,
        chain,
        owner,
        openSeaSlug
      );
      tokens = this.mergeTokenMetadata(tokens, openseaTokens);
    }

    if (!this.validateTokenMetadata(tokens)) {
      const moralisTokens = await this.getTokensMoralis(
        smartContract,
        chain,
        owner
      );
      tokens = this.mergeTokenMetadata(tokens, moralisTokens);
    }

    if (!this.validateTokenMetadata(tokens) && openSeaSlug === undefined) {
      const alchemyTokens = await this.getTokensAlchemy(
        smartContract,
        chain,
        owner
      );
      tokens = this.mergeTokenMetadata(tokens, alchemyTokens);
    }

    return Object.values(tokens);
  }

  private mergeTokenMetadata(
    curTokens: {[tokenId: string]: IToken},
    tokens: IToken[]
  ): {[tokenId: string]: IToken} {
    for (const token of tokens) {
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

  private validateTokenMetadata(tokens: {[tokenId: string]: IToken}): boolean {
    if (!Object.keys(tokens).length) return false;

    for (const tokenId in tokens) {
      if (!tokens[tokenId].image || !tokens[tokenId].title) return false;
    }

    return true;
  }

  private async getTokensOpenSea(
    address: string,
    chain: string,
    owner: string,
    openSeaSlug: string,
    offset = 0,
    limit = 20
  ): Promise<IToken[]> {
    if (!this.getOnChainAPISupportBool('opensea', chain)) return [];

    this.requiredParams(
      chain && address && owner,
      'cannot search for tokens, missing params'
    );

    const path = `/assets?owner=${owner}&collection=${openSeaSlug}&order_direction=desc&offset=0&limit=20`;

    return this.getDataOpensea(path, chain)
      .then((response: any) => {
        return response.assets
          .filter((item: any) => {
            return item.token_id !== null;
          })
          .map((item: any) => {
            const image = item.image_url ? item.image_url : '';
            const title = item.name ? item.name : '';

            return {
              api: 'opensea',
              tokenId: item.token_id,
              title: title,
              image: image,
              data: item,
            };
          });
      })
      .catch((error: any) => {
        console.warn('Failed to collect contract data from OpenSea API', error);
        return [];
      });
  }

  private async getTokensMoralis(
    address: string,
    chain: string,
    owner: string,
    offset = 0,
    limit = 20
  ): Promise<IToken[]> {
    if (!this.getOnChainAPISupportBool('moralis', chain)) return [];

    this.requiredParams(
      chain && address && owner,
      'cannot search for tokens, missing params'
    );

    let _chain: string = chain;

    if (chain === 'mainnet') _chain = 'eth';

    const path = `/${owner}/nft/${address}?chain=${_chain}&format=decimal`;

    return this.getDataMoralis(path, chain)
      .then((response: any) => {
        return response.result
          .filter((item: any) => {
            return item.token_id !== null;
          })
          .map((item: any) => {
            let parsedMeta = null;

            if (item.metadata) {
              parsedMeta = JSON.parse(item.metadata);
            }

            return {
              api: 'moralis',
              tokenId: item.token_id,
              title: parsedMeta?.title ? parsedMeta?.title : '',
              image: parsedMeta?.image
                ? this.transformImageUrl(parsedMeta?.image)
                : '',
              data: parsedMeta,
            };
          });
      })
      .catch(err => {
        console.warn('Failed to collect tokens from Moralis API', err.message);
        return [];
      });
  }

  private async getTokensAlchemy(
    address: string,
    chain: string,
    owner: string
  ): Promise<IToken[]> {
    if (!this.getOnChainAPISupportBool('alchemy', chain)) return [];

    const path = `/getNFTs/?owner=${owner}&contractAddresses[]=${address}`;

    return this.getDataAlchemy(path, chain)
      .then(result => {
        return result.ownedNfts
          .filter((item: any) => {
            return item?.id.tokenId !== null;
          })
          .map((item: any) => {
            const tokenId = Number(item.id.tokenId).toFixed(0);

            return {
              api: 'alchemy',
              tokenId: tokenId,
              title: item.title,
              image: this.transformImageUrl(item.metadata.image),
              data: item,
            };
          });
      })
      .catch(err => {
        console.warn('Failed to collect tokens from Alchemy API', err.message);
        return [];
      });
  }

  private async getDataOpensea(path: string, chain: string) {
    const config = this.getConfigForServiceAndChain('opensea', chain);

    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-API-KEY': config.apiKey!,
      },
    };

    const url = this.joinUrl(config.url, path);

    return this.httpJsonRequest(url, options);
  }

  private async getDataAlchemy(path: string, chain: string) {
    const options = {
      method: 'GET',
      headers: {
        redirect: 'follow',
      },
    };

    const config = this.getConfigForServiceAndChain('alchemy', chain);

    const url = this.joinUrl(config.url, config.apiKey + path);

    return this.httpJsonRequest(url, options);
  }

  private async getDataMoralis(path: string, chain: string) {
    const config = this.getConfigForServiceAndChain('moralis', chain);

    const options = {
      method: 'GET',
      headers: {
        'x-api-key': config.apiKey!,
      },
    };

    const url = this.joinUrl(config.url, path);

    return this.httpJsonRequest(url, options);
  }

  private joinUrl(baseUrl: string, path: string) {
    const baseEnd = baseUrl.charAt(baseUrl.length - 1);
    const pathStart = path.charAt(0);

    if (baseEnd !== '/' && pathStart !== '/') {
      return baseUrl + '/' + path;
    } else if (baseEnd === '/' && pathStart === '/') {
      return baseUrl + path.substring(1);
    }

    return baseUrl + path;
  }

  private getConfigForServiceAndChain(
    service: string,
    chain: string,
    defaultCred = 'mainnet'
  ) {
    if (!this.onChainApiConfig[service])
      throw new Error('Invalid API service: ' + service);

    if (chain === 'eth') chain = 'mainnet';

    const configs = this.onChainApiConfig[service].config;

    if (configs[chain]) return configs[chain];

    if (defaultCred && configs[defaultCred]) return configs[defaultCred];

    throw new Error(
      'API config not available for ' + service + ' chain: ' + chain
    );
  }

  private async httpJsonRequest(
    req: string,
    requestOptions: AxiosRequestConfig<any>
  ) {
    requestOptions.headers = {
      ...requestOptions.headers,
      'Accept-Encoding': 'gzip',
    };
    return (await axios(req, requestOptions)).data;
  }

  private async getTokensPOAP(owner: string) {
    // Uncomment to test a really large POAP collection - this guy gets around
    // let url = `https://api.poap.xyz/actions/scan/0x4d2803f468b736b62fe9eec992c8f4c41be4cb15`;
    const url = `https://api.poap.xyz/actions/scan/${owner}`;

    const tokens: any[] = [];
    let res;

    try {
      res = await this.httpJsonRequest(url, {
        method: 'GET',
      });
    } catch (e: any) {
      console.log(e.message);
      return tokens;
    }

    for (const token of res) {
      tokens.push({
        api: 'poap',
        title: token.event.name,
        image: token.event.image_url,
        data: token,
      });
    }

    return tokens;
  }

  requiredParams = (item: any, msg: string) => {
    if (!item) throw new Error(msg);
  };
}
