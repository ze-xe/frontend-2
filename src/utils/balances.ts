import { ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils.js';
import erc20 from '../abis/ERC20.json'
import multicall from '../abis/Multicall2.json'

import { ADDRESSES } from './const';


export function getBalancesAndApprovals(tokens: string[], account: string, chain: any, allowanceFor: string = ADDRESSES[chain].Exchange): Promise<any[]> {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    const itf = new Interface(erc20.abi);
    const multicallContract = new ethers.Contract(
        ADDRESSES[chain].Multicall,
        multicall.abi,
        provider.getSigner()
    );

    let calls = []
    for (let i = 0; i<tokens.length; i++) {
        calls.push([tokens[i], itf.encodeFunctionData('balanceOf', [account])])
        calls.push([tokens[i], itf.encodeFunctionData('allowance', [account, allowanceFor])])
    }
    
    return multicallContract.callStatic.aggregate(calls);
}