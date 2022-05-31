import dotenv from 'dotenv';
import pino from 'pino';

dotenv.config();

export const LOGGER = pino({level: process.env.LOG_LEVEL || 'debug'});
export const DEFAULT_IPFS_BASE_URL = 'https://gateway.pinata.cloud/ipfs/';
