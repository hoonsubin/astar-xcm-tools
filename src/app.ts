import { ParachainApi, RelaychainApi, ChainAccount } from './api/SubstrateApi';
import endpoints from './config/endpoints.json';
import { BN } from 'bn.js';

import '@polkadot/types-augment';

export default async function app() {
    // initialize the account
    const accountSecret = process.env.SUBSTRATE_MNEMONIC || '//Alice';
    const account = new ChainAccount(accountSecret);

    // initialize the relaychain instance
    const relayApi = new RelaychainApi(endpoints.relaychain.kusama);
    await relayApi.start();

    // initialize the parachain instance
    const paraApi = new ParachainApi(endpoints.parachain.shiden);
    await paraApi.start();

    console.log(`${paraApi.chainProperty.chainName} Parachain has Parachain ID ${paraApi.paraId}`);
    console.log(`${relayApi.chainProperty.chainName} Relaychain has parachains with the ID ${relayApi.parachains}`);

    // fetch a list of assets registered in the parachain (that has the assets pallet)
    const assets = await paraApi.fetchAssets();
    console.log(assets);

    // send tokens from the relaychain to the parachain
    const amount = new BN(10).pow(new BN(relayApi.chainProperty.tokenDecimals[0]));
    const dmpTxCall = relayApi.transferToParachain(paraApi.paraId, account.pair.address, amount)
    await relayApi.signAndSend(account, dmpTxCall);

    const balance = await relayApi.getBalance(account);
    console.log(`${account.pair.address} has a balance of ${balance.toString()} ${relayApi.chainProperty.tokenSymbols[0]}`);

    //todo: test asset bridging from relaychain to parachain (UMP, DMP), test asset bridging from parachain to parachain (HRMP)
    //todo: create a parachain multiLocation abstraction (like a URL for parachains)

    // we need this to exit out of polkadot-js/api instance
    process.exit(0);
}
