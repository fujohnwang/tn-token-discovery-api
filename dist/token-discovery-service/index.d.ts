import { ITokenReturnType } from "./interfaces/ITokenReturnType";
import { IOnChainApiConfig } from "./interfaces/IOnChainApiConfig";
export declare class TokenDiscoveryService {
    onChainApiConfig: IOnChainApiConfig;
    ipfsBaseUrl?: string;
    constructor(onChainModuleKeys?: {
        [apiName: string]: string;
    }, ipfsBaseUrl?: string);
    private getOnChainAPISupportBool;
    /**
     * Substitute public IPFS base URLs with the config provided URL.
     */
    private transformImageUrl;
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
    getInitialContractAddressMetaData(contract: string, chain: string, openSeaSlug?: string): Promise<ITokenReturnType | null>;
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
    getContractDataOpenSea(contractAddress: string, chain: string, openSeaSlug: string): Promise<ITokenReturnType | null>;
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
    getContractDataMoralis(contractAddress: string, chain: string): Promise<ITokenReturnType | null>;
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
    getContractDataAlchemy(contractAddress: string, chain: string): Promise<ITokenReturnType | null>;
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
    getTokens(smartContract: string, chain: string, openSeaSlug: string, owner: string): Promise<any[]>;
    private mergeTokenMetadata;
    private validateTokenMetadata;
    private getTokensOpenSea;
    private getTokensMoralis;
    private getTokensAlchemy;
    private getDataOpensea;
    private getDataAlchemy;
    private getDataMoralis;
    private joinUrl;
    private getConfigForServiceAndChain;
    private httpJsonRequest;
    private getTokensPOAP;
    requiredParams: (item: any, msg: string) => void;
}
export default TokenDiscoveryService;
//# sourceMappingURL=index.d.ts.map