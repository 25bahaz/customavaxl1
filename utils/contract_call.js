import dotenv from "dotenv";
dotenv.config();

import { readFileSync } from "fs";

import { JsonRpcProvider } from 'ethers/providers';
import { Wallet } from 'ethers/wallet';
import { Contract } from "ethers";

async function ContractCaller(rpc, pk, abiPath, contractAddr, funcOption, storeValue = 0) {
    const provider = new JsonRpcProvider(rpc);
    const signer = new Wallet(pk, provider);

    const abi = JSON.parse(readFileSync(abiPath).toString());

    const contract = new Contract(contractAddr, abi, signer);
    
    if (funcOption == 'store') { 
        const tx = await contract.store(storeValue); 
        
        console.log("Transaction hash:", tx.hash);
        await tx.wait();
        console.log("value stored successfully");
        return tx
    } else if (funcOption == 'retrieve') {
        const value = await contract.retrieve();
        
        console.log("Stored value is:", value.toString());
        return value
    }
    return console.error('Function option is unavialable rn!');
}

export { ContractCaller }