import { ParachainApi, RelaychainApi, ChainAccount } from './api';
import endpoints from './config/endpoints.json';
import BN from 'bn.js';

import '@polkadot/types-augment';

export default async function app() {
    // initialize the account
    const accountSecret = process.env.SUBSTRATE_MNEMONIC || '//Alice';
    const account = new ChainAccount(accountSecret, 'sr25519');

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

    //note: uncomment one of these functions

    //await dmpTest(amount, paraApi, relayApi, account);
    //await umpTest(amount, paraApi, account);

    const balance = await relayApi.getBalance(account);
    console.log(`${account.pair.address} has a balance of ${balance.toString()} ${relayApi.chainProperty.tokenSymbols[0]}`);

    //todo: test asset bridging from relaychain to parachain (UMP, DMP), test asset bridging from parachain to parachain (HRMP)
    //todo: test XC20 interaction and bridging
    //todo: create a parachain multiLocation abstraction (like a URL for parachains)

    // we need this to exit out of polkadot-js/api instance
    process.exit(0);
}

const dmpTest = async (amount: BN, parachain: ParachainApi, relaychain: RelaychainApi, account: ChainAccount) => {
    //account.formatAccount(relaychain.chainProperty);
    //console.log(``);

    const dmpTxCall = relaychain.transferToParachain(parachain.paraId, account.pair.address, amount)
    await relaychain.signAndSend(account, dmpTxCall);
}

const umpTest = async (amount: BN, parachain: ParachainApi, account: ChainAccount) => {
    console.log(`Sending ${amount.toString()} from ${parachain.chainProperty.chainName} to its relaychain`)
    const umpTxCall = parachain.transferToRelaychain(account.pair.address, amount);
    await parachain.signAndSend(account, umpTxCall);
}