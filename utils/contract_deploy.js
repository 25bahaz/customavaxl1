import { readFileSync } from 'fs';

import { JsonRpcProvider,} from 'ethers/providers';
import { Wallet } from 'ethers/wallet';
import { ContractFactory } from 'ethers';


const provider = new JsonRpcProvider("http://34.255.227.109:37575/ext/bc/2KLgZ13cVF9siHrY1cjp5ZZNHjZA22KYB6ngEUsB9BSr2qasEV/rpc");
const bytecode = readFileSync("<bin>").toString();
const abi = JSON.parse(readFileSync("<abi>").toString());
const privateKey = "YOUR_PRIVATE_KEY"; // prefix yok
const signer = new Wallet(privateKey, provider).connect(provider);
const tokenContract = new ContractFactory(abi, bytecode, signer);
const contract = await tokenContract.deploy();