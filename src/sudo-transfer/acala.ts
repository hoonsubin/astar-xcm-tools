import endpoints from '../config/endpoints.json'
import { TransferItem } from '../types';
import _ from 'lodash';
import * as utils from './utils';
import BN from 'bn.js';
import SubstrateApi from './SubstrateApi';

const PUBKEY_TREASURY = '0x5a18b1414ba471070524f17295b98dad3a3c302001e44225909b63305f8cf27b'
const ASTAR_ASSET_ID = '340282366920938463463374607431768211455';
const execute_fee = new BN(4000000);

export default async function index() {
  const senderKey = process.env.SUBSTRATE_MNEMONIC || '//Alice';
  const api = new SubstrateApi(endpoints.parachain.astar, senderKey);

  try {
    await api.start();
  } catch (e) {
    console.error('error', e);
  }

  const allExtrinsics = (await utils.readJson('./extrinsics-acala.json')) as TransferItem[];
  const chunks = 100;

  const assetId = ASTAR_ASSET_ID;

  const batchMint = allExtrinsics.map((item) => {
    const beneficiary = item.account;
    const amount = new BN(item.amount).sub(execute_fee);

    return api.buildTxCall('assets', 'mint', new BN(assetId), {
      'Id': beneficiary
    }, amount);
  })
  
  const splitTx = utils.splitListIntoChunks(batchMint, chunks);
  const batchCalls = splitTx.map((i) => {
    return api.wrapSudoAs(api.wrapBatchAll(i), PUBKEY_TREASURY);
  });

  console.log(`There are ${batchCalls.length} batch calls`);

  // save as file
  await utils.saveAsJson(batchCalls, './dot-mint-batch-astar.json');
}

(async () => {
  await index();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});