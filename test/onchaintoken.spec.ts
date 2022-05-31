import tap from 'tap';
import TokenDiscoveryService from '../src/services/tokenDiscoveryService';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

tap.test('On-chain token module', t => {
  t.test(
    'getOnChainAPISupportBool should be true for supported APIs and chains',
    childTest => {
      const controller = new TokenDiscoveryService();
      childTest.equal(
        controller.getOnChainAPISupportBool('opensea', 'eth'),
        true
      );
      childTest.equal(
        controller.getOnChainAPISupportBool('alchemy', 'rinkeby'),
        true
      );
      childTest.equal(
        controller.getOnChainAPISupportBool('alchemy', 'polygon'),
        true
      );
      childTest.end();
    }
  );

  t.test(
    'getOnChainAPISupportBool should be false for unsupported APIs and chains',
    childTest => {
      const token = new TokenDiscoveryService();
      childTest.equal(
        token.getOnChainAPISupportBool('nosuchapi', 'eth'),
        false
      );
      childTest.equal(
        token.getOnChainAPISupportBool('opensea', 'nosuchchain'),
        false
      );
      childTest.end();
    }
  );

  t.test('should return OpenSea Collection data', async childTest => {
    const mockOpenSeaResponse = {
      assets: [
        {
          collection: {
            image_url:
              'https://lh3.googleusercontent.com/5vvO-HlrXmRv9hG3whp8LzX_6pXDtpLIlcxOswi7r7-Il3wxFkG_vAGj_Ocx92RuTu5OWFwmfsaGXDnv_E1RrC5_UK64QFMr6TC7mw=s120',
            name: 'STL RnD Zed',
          },
        },
      ],
    };
    const mock = new MockAdapter(axios);
    mock.onGet().reply(200, mockOpenSeaResponse);
    const token = new TokenDiscoveryService();
    const issuer = {
      collectionID: 'c',
      contract: '0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656',
      chain: 'rinkeby',
      openSeaSlug: 'stl-rnd-zed',
    };
    const metaData = await token.getInitialContractAddressMetaData(
      issuer.contract,
      issuer.chain,
      issuer.openSeaSlug
    );
    childTest.equal(metaData!.api, 'opensea');
    childTest.equal(metaData!.chain, issuer.chain);
    childTest.equal(metaData!.contract, issuer.contract);
    childTest.equal(
      metaData!.title,
      mockOpenSeaResponse.assets[0].collection.name
    );
    childTest.equal(
      metaData!.image,
      mockOpenSeaResponse.assets[0].collection.image_url
    );
    mock.restore();
    childTest.end();
  });

  t.test('should return Moralis Matic Collection data', async childTest => {
    const image = 'https://qaimages.lysto.io/assets/bxrt5/token-book.png';
    const mockMoralisResponse = {
      result: [
        {
          metadata: `{"name":"Membership Token #1","description":"Get Exclusive access to membership club for this NFT","image":"${image}"}`,
          name: 'MaticTest01',
        },
      ],
    };
    const mock = new MockAdapter(axios);
    mock.onGet().reply(200, mockMoralisResponse);
    const token = new TokenDiscoveryService();
    const issuer = {
      collectionID: 'c',
      contract: '0x94683E532AA9e5b47EF86bBb2D43b768C76c6C19',
      chain: 'polygon',
    };
    const metaData = await token.getInitialContractAddressMetaData(
      issuer.contract,
      issuer.chain
    );
    childTest.equal(metaData!.api, 'moralis');
    childTest.equal(metaData!.chain, issuer.chain);
    childTest.equal(metaData!.contract, issuer.contract);
    childTest.equal(metaData!.title, mockMoralisResponse.result[0].name);
    childTest.equal(metaData!.image, image);
    mock.restore();
    childTest.end();
  });

  t.test(
    'getInitialContractAddressMetaData should return undefined for unrecognised issuer',
    async childTest => {
      const token = new TokenDiscoveryService();
      const issuer = {
        collectionID: 'c',
        contract: '0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656',
        chain: 'nosuchchain',
        openSeaSlug: 'stl-rnd-zed',
      };
      childTest.equal(
        await token.getInitialContractAddressMetaData(
          issuer.contract,
          issuer.chain,
          issuer.openSeaSlug
        ),
        null
      );
      childTest.end();
    }
  );

  t.end();
});
