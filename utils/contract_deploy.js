import dotenv from 'dotenv';
dotenv.config();

import { readFileSync } from 'fs';

import { ContractFactory } from 'ethers';
import { JsonRpcProvider,} from 'ethers/providers';
import { Wallet } from 'ethers/wallet';

async function ContractDeployer(rpc , pk, binPath, abiPath) {
    const provider = new JsonRpcProvider(rpc);
    const signer = new Wallet(pk, provider).connect(provider);

    const bytecode = readFileSync(binPath).toString();
    const abi = JSON.parse(readFileSync(abiPath).toString());

    const tokenContract = new ContractFactory(abi, bytecode, signer);
    const contract = await tokenContract.deploy();

    console.log("Contract deployed to address:", contract.address); 
    return contract;
};

exports = { ContractDeployer }