import { config, deployments } from './const';
import { ChainID } from './chains';
import { ethers } from 'ethers';

export function getABI(contractName: string) {
  console.log(contractName);
  return deployments.sources[deployments.contracts[contractName].abi];
}

export function getAddress(contractName: string, chain: number = ChainID.ARB_GOERLI) {
  return deployments.contracts[contractName].address
}

export async function getContract(contractName: string, chain: number, address: string = null) {
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  address = address ?? getAddress(contractName, chain);
  let contract = new ethers.Contract(address, getABI(contractName), provider.getSigner());
  return contract;
}

export async function getInterface(contractName: string, chain: number, address: string = null) {
  address = address ?? getAddress(contractName, chain);
  if(chain == ChainID.NILE){
    let contract = await ((window as any).tronWeb).contract(getABI(contractName), address)
    return contract;
  } else {
    let contract = new ethers.utils.Interface(getABI(contractName));
    return contract;
  }
}

export function call(contract: any, method: string, params: any[], chain: number) {
  if(chain == ChainID.NILE){
    return contract[method](...params).call();
  } else {
    return contract[method](...params);
  }
}

export function send(contract: any, method: string, params: any[], chain: number) {
  if(chain == ChainID.NILE){
    return contract[method](...params).send();
  } else {
    return contract[method](...params, { gasPrice: ethers.utils.parseUnits('1.6', 'gwei') });
  }
}