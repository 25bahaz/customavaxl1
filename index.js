import path from 'path';
import { fileURLToPath } from 'url';

import { writeFileSync } from 'fs';

import { ContractDeployer } from './utils/contract_deploy.js';
import { ContractCaller } from './utils/contract_call.js';

// CONSTANTS
const PRIVATE_KEY = process.env.PRIVATE_KEY;  // prefix yok
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FILE PATHS 
const outputPath = path.join(__dirname, 'contracts/deployeresults/storage.json');
const abiPath = path.join(__dirname, 'contracts/abi/storage.abi');
const binPath = path.join(__dirname, 'contracts/bin/storage.bin');

// FUNCTION CALLS

//--contract deploy
// const contract = await ContractDeployer(RPC_URL, PRIVATE_KEY, binPath, abiPath);
// const jsonContract = JSON.stringify(contract, null, 2);
// writeFileSync(outputPath, jsonContract, "utf8");

//--contract call
// let functOption = 'retrieve';
// const callResult = await ContractCaller(RPC_URL, PRIVATE_KEY, abiPath, CONTRACT_ADDRESS, functOption, 128);
// console.log(callResult);