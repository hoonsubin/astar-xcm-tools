import BigNumber from 'bignumber.js';
import BN from 'bn.js';
import fsPromise from 'fs/promises';
import * as fs from 'fs';

export const saveAsJson = async (list: Array<any>, path: string = './list.json') => {
  const data = JSON.stringify(list);
  await fsPromise.writeFile(path, data);
};

export const readJson = async <T>(filePath: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
      let results: T[] = [];
      
      fs.readFile(filePath, (err, data) => {
          if (err) {
              reject(err);
          }
          
          try {
           results = JSON.parse(data.toString());
          } catch (e) {
              reject(e);
          }
          
          resolve(results);
      });
  });
};


/**
 * Converts the token denominated value to the minimal denomination. For example, 5 DOT will be converted to 50,000,000,000.
 * @param amount The token amount with decimal points
 * @param decimalPoint The number of zeros for 1 token (ex: 15 zeros)
 * @returns The converted token number that can be used in the blockchain.
 */
 export const tokenToMinimalDenom = (amount: string | number, decimalPoint: number) => {
  const tokenAmount = new BigNumber(amount);
  const fullAmount = tokenAmount.multipliedBy(new BigNumber(10).pow(decimalPoint));
  return new BN(fullAmount.toFixed());
};

/**
 * Returns a list of splitted lists based on the chunk.
 * @param listInput The list that should be splitted.
 * @param chunk The number of chunks per list.
 * @returns A list of lists that is splitted based on the chunk.
 */
 export const splitListIntoChunks = <T>(listInput: T[], chunk: number) => {
  // shallow copy of the list
  const list = listInput.map(x => x);

  const listChunks = [];

  const chunks = Math.ceil(list.length / chunk);

  for (let i = 0; i < chunks; i++) {
      // corner case
      if (list.length === 0)
          break;
      listChunks.push(list.splice(0, chunk));
  }

  return listChunks;
}