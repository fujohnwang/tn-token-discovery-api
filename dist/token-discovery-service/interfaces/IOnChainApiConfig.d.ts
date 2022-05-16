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
//# sourceMappingURL=IOnChainApiConfig.d.ts.map