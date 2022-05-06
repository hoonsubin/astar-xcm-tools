import { SubmittableExtrinsic } from '@polkadot/api/types';
export * from './assets';

export type ExtrinsicPayload = SubmittableExtrinsic<'promise'>;

export interface ChainProperty {
    tokenSymbols: string[];
    tokenDecimals: number[];
    chainName: string;
}