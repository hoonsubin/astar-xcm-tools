import { decodeAddress } from '@polkadot/util-crypto';
import BN from 'bn.js';
import { ChainApi } from '../api';
import { ExtrinsicPayload } from '../types';

const astarAssetToRelay = (
    api: ChainApi,
    amount: BN,
    assetType: 'native' | { assetId: string },
    paraId: number,
    recipientAccountId: string,
): ExtrinsicPayload => {
    if (assetType !== 'native') {
        throw new Error('You can only send native tokens to the relay chain');
    }

    // the relaychain that the current parachain is connected to
    const dest = {
        V1: {
            interior: 'Here',
            parents: new BN(1),
        },
    };
    // the account ID within the relaychain
    const beneficiary = {
        V1: {
            interior: {
                X1: {
                    AccountId32: {
                        network: 'Any',
                        id: decodeAddress(recipientAccountId),
                    },
                },
            },
            parents: new BN(0),
        },
    };
    // amount of fungible tokens to be transferred
    const assets = {
        V1: [
            {
                fun: {
                    Fungible: amount,
                },
                id: {
                    Concrete: {
                        interior: 'Here',
                        parents: new BN(1),
                    },
                },
            },
        ],
    };

    return api.buildTxCall('polkadotXcm', 'reserveWithdrawAssets', dest, beneficiary, assets, new BN(0));
};

// todo: write how to create the correct asset ID
const astarAssetToParaId = (
    api: ChainApi,
    amount: BN,
    assetType: 'native' | { assetId: string },
    paraId: number,
    recipientAccountId: string,
): ExtrinsicPayload => {
    // the target parachain the native asset will be sent to
    const dest = {
        V1: {
            interior: {
                X1: {
                    Parachain: new BN(paraId),
                },
            },
            parents: new BN(1),
        },
    };
    // the account ID within the relaychain
    const beneficiary = {
        V1: {
            interior: {
                X1: {
                    AccountId32: {
                        network: 'Any',
                        id: decodeAddress(recipientAccountId),
                    },
                },
            },
            parents: new BN(0),
        },
    };

    // note that not all assets will be accepted by the other chain. There is no generic check for this yet

    const assetId =
        assetType === 'native'
            ? {
                  Concrete: {
                      interior: 'Here',
                      parents: new BN(1),
                  },
              }
            : {
                  X2: {
                      Parachain: new BN(paraId),
                      GeneralKey: assetType.assetId,
                  },
              };

    // amount of fungible tokens to be transferred
    const assets = {
        V1: [
            {
                fun: {
                    Fungible: amount,
                },
                id: assetId,
            },
        ],
    };
    return api.buildTxCall('polkadotXcm', 'reserveWithdrawAssets', dest, beneficiary, assets, new BN(0));
};

const acalaToParaId = (
    api: ChainApi,
    amount: BN,
    assetType: 'native' | { assetId: string },
    paraId: number,
    recipientAccountId: string,
): ExtrinsicPayload => {
    // todo; define the args
    const dest = {
        V1: {
            parents: new BN(1),
            interior: {
                X2: [
                    {
                        Parachain: paraId,
                    },
                    {
                        AccountId32: {
                            network: 'Any',
                            id: decodeAddress(recipientAccountId),
                        },
                    },
                ],
            },
        },
    };
    return api.buildTxCall('xTokens', 'transferMultiAssets');
};

export const paraTransfers = [astarAssetToParaId, acalaToParaId];
