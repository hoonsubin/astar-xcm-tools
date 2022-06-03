#!/usr/bin/env ts-node

import app from './app';
import { ParachainApi, RelaychainApi, ChainAccount } from './api';
import endpoints from './config/endpoints.json';

(async () => {
    // initialize the account
    const accountSecret = process.env.SUBSTRATE_MNEMONIC || '//Alice';
    const account = new ChainAccount(accountSecret, 'sr25519');

    // initialize the relaychain instance
    const relayApi = new RelaychainApi(endpoints.relaychain.polkadot);
    await relayApi.start();

    // initialize the parachain instance
    const paraApi = new ParachainApi(endpoints.parachain.astar);
    await paraApi.start();

    await app(account, paraApi, relayApi);
    
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
