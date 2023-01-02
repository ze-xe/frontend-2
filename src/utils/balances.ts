import { ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils.js';
import { getABI, getContract, getAddress } from './contract';

export async function getBalancesAndApprovals(tokens: string[], account: string, chain: any, allowanceFor: string = getAddress('Exchange')): Promise<any[]> {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    const itf = new Interface(getABI('BTC'));
    const multicallContract = await getContract('Multicall2', chain);

    let calls = []
    for (let i = 0; i<tokens.length; i++) {
        calls.push([tokens[i], itf.encodeFunctionData('balanceOf', [account])])
        calls.push([tokens[i], itf.encodeFunctionData('allowance', [account, allowanceFor])])
    }
    
    return multicallContract.callStatic.aggregate(calls);
}