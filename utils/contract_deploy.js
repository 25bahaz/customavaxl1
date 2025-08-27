import { readFileSync } from 'fs';

import { JsonRpcProvider,} from 'ethers/providers';
import { Wallet } from 'ethers/wallet';
import { ContractFactory } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// CONSTANTS
const PRIVATE_KEY = process.env.PRIVATE_KEY;  // prefix yok
const RPC_URL = process.env.RPC_URL;

const provider = new JsonRpcProvider(RPC_URL);
const signer = new Wallet(PRIVATE_KEY, provider).connect(provider);

const bytecode = readFileSync("<bin>").toString();
const abi = JSON.parse(readFileSync("<abi>").toString());

const tokenContract = new ContractFactory(abi, bytecode, signer);
const contract = await tokenContract.deploy();