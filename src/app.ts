import { ParachainApi, RelaychainApi, ChainAccount } from './api/SubstrateApi';
import endpoints from './config/endpoints.json';

import '@polkadot/types-augment';

export default async function app() {
    const accountSecret = process.env.SUBSTRATE_MNEMONIC || '//Alice';
    const account = new ChainAccount(accountSecret);

    const paraApi = new ParachainApi(endpoints.parachain.shibuya);
    await paraApi.start();

    const relayApi = new RelaychainApi(endpoints.relaychain.osaka);
    await relayApi.start();

    console.log(`${paraApi.chainProperty.chainName} Parachain has Parachain ID ${paraApi.paraId}`);

    console.log(`${relayApi.chainProperty.chainName} Relaychain has parachains with the ID ${relayApi.parachains}`);

    const assets = await paraApi.fetchAssets();
    console.log(assets);

    //todo: test asset bridging from relaychain to parachain (UMP, DMP), test asset bridging from parachain to parachain (HRMP)
    //todo: create a parachain multiLocation abstraction (like a URL for parachains)

    // we need this to exit out of polkadot-js/api instance
    process.exit(0);
}
