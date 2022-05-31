export interface IOnChainApiConfig {
  [apiName: string]: {
    chainSupport: string[];
    config: {
      [network: string]: {
        url: string;
        apiKey?: string;
      };
    };
  };
}

export interface IToken {
  api: string;
  tokenId: string;
  title?: string;
  image?: string;
  data?: string;
}

export interface ITokenReturnType {
  api: string;
  contract: string;
  chain: string;
  openSeaSlug?: string;
  image?: string;
  title?: string;
}
