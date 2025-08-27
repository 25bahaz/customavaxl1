import path from 'path';
import { fileURLToPath } from 'url';

import { writeFileSync } from 'fs';

import { ContractDeployer } from './contract_deploy';

// CONSTANTS
const PRIVATE_KEY = process.env.PRIVATE_KEY;  // prefix yok
const RPC_URL = process.env.RPC_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FILE PATHS 
const outputPath = path.join(__dirname, 'contracts/deployeresults/storage.json');
const abiPath = path.join(__dirname, 'contracts/abi/storage.abi');
const binPath = path.join(__dirname, 'contracts/bin/storage.bin');

// FUNCTION CALLS
const contract = ContractDeployer(RPC_URL, PRIVATE_KEY, binPath, abiPath);
const jsonContract = JSON.stringify(contract, null, 2);

writeFileSync(outputPath, jsonContract, "utf8");