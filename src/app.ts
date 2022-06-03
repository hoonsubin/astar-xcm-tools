import { ParachainApi, RelaychainApi, ChainAccount } from './api';
import BN from 'bn.js';

import '@polkadot/types-augment';

export default async function app(account: ChainAccount, paraApi: ParachainApi, relayApi: RelaychainApi) {
    console.log(`${paraApi.chainProperty.chainName} Parachain has Parachain ID ${paraApi.paraId}`);
    console.log(`${relayApi.chainProperty.chainName} Relaychain has parachains with the ID ${relayApi.parachains}`);

    // fetch a list of assets registered in the parachain (that has the assets pallet)
    const assets = await paraApi.fetchAssets();
    console.log(assets);

    // send the relaychain token
    const amount = new BN(10).pow(new BN(relayApi.chainProperty.tokenDecimals[0])).divn(100);

    //note: uncomment one of these functions
    //await dmpTest(amount, paraApi, relayApi, account);
    //await umpTest(amount, paraApi, account);

    await testActualTransferAmount(amount, paraApi, relayApi, account);

    //todo: test asset bridging from relaychain to parachain (UMP, DMP), test asset bridging from parachain to parachain (HRMP)
    //todo: test XC20 interaction and bridging
    //todo: create a parachain multiLocation abstraction (like a URL for parachains)

    // we need this to exit out of polkadot-js/api instance
    process.exit(0);
}

const dmpTest = async (amount: BN, parachain: ParachainApi, relaychain: RelaychainApi, account: ChainAccount) => {
    account.formatAccount(relaychain.chainProperty);
    console.log(`Sending ${amount.toString()} from ${account.pair.address} to parachain ${parachain.paraId}`);

    const dmpTxCall = relaychain.transferToParachain(parachain.paraId, account.pair.address, amount);
    await relaychain.signAndSend(account, dmpTxCall);
};

const umpTest = async (amount: BN, parachain: ParachainApi, account: ChainAccount) => {
    console.log(`Sending ${amount.toString()} from ${parachain.chainProperty.chainName} to its relaychain`);
    const umpTxCall = parachain.transferToRelaychain(account.pair.address, amount);
    await parachain.signAndSend(account, umpTxCall);
};

const testActualTransferAmount = async (
    amount: BN,
    parachain: ParachainApi,
    relaychain: RelaychainApi,
    account: ChainAccount,
) => {
    const relaychainInfo = relaychain.chainProperty;
    const parachainInfo = parachain.chainProperty;

    const assets = await parachain.fetchAssets();
    const relaychainToken = relaychain.chainProperty.tokenSymbols[0];
    const xcmAsset = assets.find((i) => {
        return i.metadata.symbol.toString() === relaychainToken;
    });

    if (!xcmAsset) {
        throw new Error(`Could not find asset ${relaychainToken} on ${parachainInfo.chainName}`);
    }

    const initialAmountOnRelay = await relaychain.getBalance(account);
    const balanceOnParachain = await parachain.getAssetBalance(new BN(xcmAsset.id), account);

    console.log(`Account ${account.pair.address} has ${initialAmountOnRelay.toString()} ${
        relaychainInfo.tokenSymbols[0]
    } on ${relaychainInfo.chainName} 
    And ${balanceOnParachain.toHuman() || 0} ${xcmAsset.metadata.symbol.toString()} on ${parachainInfo.chainName}`);

    console.log(`Sending ${amount.toString()} ${relaychainInfo.tokenSymbols[0]}`);
    // comment out the bottom and run again to read the balance after finality (manual check)
    await dmpTest(amount, parachain, relaychain, account);
};
