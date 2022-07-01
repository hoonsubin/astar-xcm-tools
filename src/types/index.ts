import { SubmittableExtrinsic } from '@polkadot/api/types';
export * from './assets';

export type ExtrinsicPayload = SubmittableExtrinsic<'promise'>;
export type KeypairType = 'ed25519' | 'sr25519' | 'ecdsa' | 'ethereum';

export interface ChainProperty {
    tokenSymbols: string[];
    tokenDecimals: number[];
    chainName: string;
    ss58Prefix: number;
}
