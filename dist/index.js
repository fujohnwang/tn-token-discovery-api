"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fastify = require("fastify")({ logger: true });
const token_discovery_controller_1 = require("./token-discovery-controller");
fastify.get("/", async () => {
    return { "health": 'ok' };
});
fastify.get("/get-token-collection:params", async (request) => {
    const { smartContract, chain, openSeaSlug, ipfsBaseUrl, onChainModuleKeys } = request.query;
    if (!smartContract || !chain)
        return null;
    const tokenDiscovery = new token_discovery_controller_1.TokenDiscoveryController(onChainModuleKeys, ipfsBaseUrl);
    const output = await tokenDiscovery.getInitialContractAddressMetaData(smartContract, chain, openSeaSlug);
    return output;
});
fastify.get("/get-owner-tokens:params", async (request, reply) => {
    const { smartContract, chain, owner, openSeaSlug, ipfsBaseUrl, onChainModuleKeys } = request.query;
    if (!smartContract || !chain || !owner)
        return [];
    const tokenDiscovery = new token_discovery_controller_1.TokenDiscoveryController(onChainModuleKeys, ipfsBaseUrl);
    const output = await tokenDiscovery.getTokens(smartContract, chain, openSeaSlug, owner);
    return output;
});
// offering a verification end point
// to verify ownership of a
// fastify.get('/verify-ownership', async (request:any, reply:any) => {
//   inputs: signature, signedMsg, claim
//   return boolean
// })
const start = (async () => {
    try {
        await fastify.listen(3000);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
})();
//# sourceMappingURL=index.js.map