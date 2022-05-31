import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import TokenDiscoveryService from '../services/tokenDiscoveryService';

export default async function apiController(fastify: FastifyInstance) {
  fastify.get('/', healthy);
  fastify.get('/get-token-collection', getTokenCollection);
  fastify.get('/get-owner-tokens', getOwnerTokens);
}

async function healthy(_request: FastifyRequest, reply: FastifyReply) {
  reply.send({health: 'ok'});
}

async function getTokenCollection(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const {smartContract, chain, openSeaSlug, ipfsBaseUrl, onChainModuleKeys} =
    request.query as any;

  if (!smartContract || !chain) {
    reply.send(null);
    return;
  }

  const tokenDiscovery = new TokenDiscoveryService(
    onChainModuleKeys,
    ipfsBaseUrl
  );

  const output = await tokenDiscovery.getInitialContractAddressMetaData(
    smartContract,
    chain,
    openSeaSlug
  );

  reply.send(output);
}

async function getOwnerTokens(request: FastifyRequest, reply: FastifyReply) {
  const {
    smartContract,
    chain,
    owner,
    openSeaSlug,
    ipfsBaseUrl,
    onChainModuleKeys,
  } = request.query as any;

  if (!smartContract || !chain || !owner) {
    reply.send([]);
    return;
  }

  const tokenDiscovery = new TokenDiscoveryService(
    onChainModuleKeys,
    ipfsBaseUrl
  );

  const output = await tokenDiscovery.getTokens(
    smartContract,
    chain,
    openSeaSlug,
    owner
  );

  reply.send(output);
}
