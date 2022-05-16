"use strict";
// @ts-nocheck
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./../index");
function mockFetch(data) {
    return jest.fn().mockImplementation(() => Promise.resolve({
        ok: true,
        json: () => data
    }));
}
describe('On-chain token module', () => {
    test('getOnChainAPISupportBool should be true for supported APIs and chains', () => {
        const controller = new index_1.TokenDiscoveryService();
        expect(controller.getOnChainAPISupportBool('opensea', 'eth')).toBe(true);
        expect(controller.getOnChainAPISupportBool('alchemy', 'rinkeby')).toBe(true);
        expect(controller.getOnChainAPISupportBool('alchemy', 'polygon')).toBe(true);
    });
    test('getOnChainAPISupportBool should be false for unsupported APIs and chains', () => {
        const token = new index_1.TokenDiscoveryService();
        expect(token.getOnChainAPISupportBool('nosuchapi', 'eth')).toBe(false);
        expect(token.getOnChainAPISupportBool('opensea', 'nosuchchain')).toBe(false);
    });
    test('should return OpenSea Collection data', async () => {
        const mockOpenSeaResponse = {
            assets: [
                {
                    collection: {
                        image_url: 'https://lh3.googleusercontent.com/5vvO-HlrXmRv9hG3whp8LzX_6pXDtpLIlcxOswi7r7-Il3wxFkG_vAGj_Ocx92RuTu5OWFwmfsaGXDnv_E1RrC5_UK64QFMr6TC7mw=s120',
                        name: 'STL RnD Zed'
                    }
                }
            ]
        };
        global.fetch = mockFetch(mockOpenSeaResponse);
        const token = new index_1.TokenDiscoveryService();
        const issuer = {
            collectionID: "c",
            contract: '0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656',
            chain: 'rinkeby',
            openSeaSlug: 'stl-rnd-zed'
        };
        const metaData = await token.getInitialContractAddressMetaData(issuer.contract, issuer.chain, issuer.openSeaSlug);
        expect(metaData.api).toBe('opensea');
        expect(metaData.chain).toBe(issuer.chain);
        expect(metaData.contract).toBe(issuer.contract);
        expect(metaData.title).toBe(mockOpenSeaResponse.assets[0].collection.name);
        expect(metaData.image).toBe(mockOpenSeaResponse.assets[0].collection.image_url);
    });
    test('should return Moralis Matic Collection data', async () => {
        const image = 'https://qaimages.lysto.io/assets/bxrt5/token-book.png';
        const mockMoralisResponse = {
            result: [
                {
                    metadata: `{"name":"Membership Token #1","description":"Get Exclusive access to membership club for this NFT","image":"${image}"}`,
                    name: 'MaticTest01'
                }
            ]
        };
        global.fetch = mockFetch(mockMoralisResponse);
        const token = new index_1.TokenDiscoveryService();
        const issuer = { collectionID: "c", contract: '0x94683E532AA9e5b47EF86bBb2D43b768C76c6C19', chain: 'polygon' };
        const metaData = await token.getInitialContractAddressMetaData(issuer.contract, issuer.chain);
        expect(metaData.api).toBe('moralis');
        expect(metaData.chain).toBe(issuer.chain);
        expect(metaData.contract).toBe(issuer.contract);
        expect(metaData.title).toBe(mockMoralisResponse.result[0].name);
        expect(metaData.image).toBe(image);
    });
    test('getInitialContractAddressMetaData should return undefined for unrecognised issuer', async () => {
        const token = new index_1.TokenDiscoveryService();
        const issuer = { collectionID: "c", contract: '0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656', chain: 'nosuchchain', openSeaSlug: 'stl-rnd-zed' };
        expect(await token.getInitialContractAddressMetaData(issuer)).toBe(null);
    });
});
//# sourceMappingURL=onchaintoken.spec.js.map