import dotenv from 'dotenv';
dotenv.config();

import { ethers } from "hardhat";
import { Registrar__factory, EncryptedERC__factory, EncryptedUserBalances__factory } from "../typechain-types"; 
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { User } from '../test/user';
import { privateMint, privateRegister , getDecryptedBalance, privateTransfer} from '../test/helpers';
import { genPrivKey } from "maci-crypto";
import { auditor } from '../typechain-types/contracts';

const REGISTRAR_CONTRACT_ADDRESS = process.env.REGISTRAR_CONTRACT_ADDRESS!;
const ENCRYPTED_ERC_CONTRACT_ADDRESS = process.env.ENCRYPTED_ERC_CONTRACT_ADDRESS!;

const CHAIN_ID = BigInt(process.env.CHAIN_ID!);

const OWNER_ADDRESS = process.env.OWNER_ADDRESS!;
const PRIV_KEY = BigInt(process.env.GEN_PRIV_KEY!);

const NEW_AUDITOR_ADDRESS = process.env.NEW_AUDITOR_ADDRESS!;
const GEN_PRIV_KEY_AUDITOR = BigInt(process.env.GEN_PRIV_KEY_AUDITOR!);

const EWOQ_PUBLIC_KEY = process.env.EWOQ_PUBLIC_KEY!;
const EWOQ_GEN_PRIVATE_KEY = BigInt(process.env.EWOQ_GEN_PRIVATE_KEY!);

const CLI_TELEPORTER_PUBLIC_KEY = process.env.CLI_TELEPORTER_PUBLIC_KEY!;
const CLI_TELEPORTER_GEN_PRIVATE_KEY = BigInt(process.env.CLI_TELEPORTER_GEN_PRIVATE_KEY!);

// const RECEIVER_ADDRESS = process.env.RECEIVER_ADDRESS!;
// const GEN_PRIV_KEY_RECEIVER = BigInt(process.env.GEN_PRIV_KEY_RECEIVER!);

// const priv = genPrivKey()
// console.log(priv)

// == Registrar.sol function declerations ==

export async function _callRegister(
    privKey: bigint,
    newUserAddress: string,
    _contractAddress = REGISTRAR_CONTRACT_ADDRESS,
    _chainId = CHAIN_ID,
) { 
    const newUserSigner = await ethers.getSigner(newUserAddress);
    const newUser = new User(newUserSigner, privKey);
    
    const contract = Registrar__factory.connect(_contractAddress, newUserSigner);

    const calldata_proof = await privateRegister(newUser, _chainId);
    
    const tx = await contract.register(calldata_proof);
    tx.wait();

    console.log("Register tx:", tx);
}

export async function _callIsUserRegistered(
    userAddress: string,
    _contractAddress = REGISTRAR_CONTRACT_ADDRESS,
) { 
    const signer = await ethers.getSigner(userAddress);

    const contract = Registrar__factory.connect(_contractAddress, signer);

    const view_tx = await contract.isUserRegistered(userAddress);

    console.log(`isUser '${userAddress}' Registered:`, view_tx);
}

export async function _callGetUserPublicKey(
    userAddress: string,
    _contractAddress = REGISTRAR_CONTRACT_ADDRESS,
) {
    const signer = await ethers.getSigner(userAddress);

    const contract = Registrar__factory.connect(_contractAddress, signer);

    const userPubKey = await contract.getUserPublicKey(userAddress);

    console.log(`Get '${userAddress}' UserPublicKey: `, userPubKey);
    return userPubKey;
}

// == EncryptedERC.sol function declerations ==

export async function _callAuditorPublicKey(
    _contractAddress = ENCRYPTED_ERC_CONTRACT_ADDRESS,
) {
    const signer = await ethers.getSigners();
    const owner = signer[0];
    const contract = EncryptedERC__factory.connect(_contractAddress ,owner);
    
    const auditorPublicKey = await contract.auditorPublicKey();
    const isAuthSet = await contract.isAuditorKeySet()

    console.log("is auditor set:", isAuthSet);
    console.log("Auditor Public Key:", auditorPublicKey);

    return auditorPublicKey;
}

export async function _callSetAudtiorPublicKey(
    newAuditorAddress: string,
    ownerAddress: string,
    _contractAddress = ENCRYPTED_ERC_CONTRACT_ADDRESS,
) {
    const owner = await ethers.getSigner(ownerAddress);
    
    const contract = EncryptedERC__factory.connect(_contractAddress ,owner);

    const tx = await contract.setAuditorPublicKey(newAuditorAddress);
    tx.wait();

    console.log(`The address ${newAuditorAddress} set auditor by owner address ('${ownerAddress}')`)
}

export async function _callPrivateMint(
    receiverAddress: string,
    ownerAddress: string,
    amount: bigint,
    _contractAddress = ENCRYPTED_ERC_CONTRACT_ADDRESS,
) {
    //-get signers
    const owner = await ethers.getSigner(ownerAddress);
    const receiver = await ethers.getSigner(receiverAddress);

    //-connect contract
    const contract = EncryptedERC__factory.connect(_contractAddress ,owner);

    //-get receiver's and auditor's public key 
    const receiverPublicKey = await _callGetUserPublicKey(receiverAddress);
    const auditorPublicKey = await _callAuditorPublicKey();

    //-generate-proof
    const calldata_proof = await privateMint(amount, receiverPublicKey, auditorPublicKey);

    //-send transaction
    const tx = await contract.privateMint(receiverAddress, {proofPoints: calldata_proof.proofPoints, publicSignals: calldata_proof.publicSignals});
    tx.wait();

    //-result
    console.log("Private mint tx:", tx);
}

export async function _callBalanceOfStandalone(
    userAddress: string,
    _contractAddress = ENCRYPTED_ERC_CONTRACT_ADDRESS,
) {
    //-get signers
    const sender = await ethers.getSigner(userAddress);

    //-connect contract
    const contract = EncryptedERC__factory.connect(_contractAddress, sender);

    //-call the contract 
    const balanceOf = await contract.balanceOfStandalone(userAddress);
    
    //-return balance of given address
    return balanceOf;
}

export async function _callTransfer(
    senderAddress: string,
    senderPrivGen: bigint,
    receiverAddress: string,
    receiverPrivGen: bigint,
    auditorAddress: string,
    auditorPrivGen: bigint,
    transferAmount: bigint,
    _contractAddress = ENCRYPTED_ERC_CONTRACT_ADDRESS,
    _tokenId = 0n,
) { 
    try {
        //-get users
        const sender = await ethers.getSigner(senderAddress);
        const senderUser = new User(sender, senderPrivGen);

        const receiver = await ethers.getSigner(receiverAddress);
        const receiverUser = new User(receiver, receiverPrivGen);
        
        const auditor = await ethers.getSigner(auditorAddress);
        const auditorUser = new User(auditor, auditorPrivGen);

        //-connect contract
        const contract = EncryptedERC__factory.connect(_contractAddress ,sender);

        //-get balance inputs
        const {encryptedBalance, decryptedBalance} = await getDecryptedBalanceOfUser(senderAddress, senderPrivGen);
        if(transferAmount > decryptedBalance) return console.error("Insufficient fund!");

        const eGCT = encryptedBalance.eGCT;
        const concatenatedEncryptedBalance = [...eGCT[0], ...eGCT[1]];
        
        //-generate calldata proof
        const {proof, senderBalancePCT} = await privateTransfer(
            senderUser,
            decryptedBalance, 
            receiverUser.publicKey, 
            transferAmount, 
            concatenatedEncryptedBalance,
            auditorUser.publicKey
        );

        //-send transaction
        const tx = await contract.transfer(receiverUser.signer.address, _tokenId, proof, senderBalancePCT);
        await tx.wait();

        console.log(`${senderAddress} sent ${transferAmount} private eERC-20 native token to ${receiverAddress}`);
        console.log("tx_result:", tx);

    } catch (err: any) {
        if (err.reason) {
            console.error("Revert reason:", err.reason);
        } 
        else if (err.errorName) {
            console.error("Custom error:", err.errorName, err.errorArgs);
        } 
        else if (err.data) {
            try {
                const iface = EncryptedERC__factory.createInterface();
                const decoded = iface.parseError(err.data)!;
                console.error("Decoded custom error:", decoded.name, decoded.args);
            } catch (_) {
                console.error("Unknown error with data:", err.data);
            }
        } 
        else {
            console.error("Unknown error:", err);
        }
    }
}


// == Helper Wrapper Functions ==

export async function getDecryptedBalanceOfUser(
    userAddress: string,
    userPrivKey: bigint,
) {
    const encryptedBalance = await _callBalanceOfStandalone(userAddress);
    const decryptedBalance = await getDecryptedBalance(userPrivKey, encryptedBalance.amountPCTs, encryptedBalance.balancePCT, encryptedBalance.eGCT);
    return {encryptedBalance, decryptedBalance};
}



// == TEST CALLS ==

// _callRegister(CLI_TELEPORTER_GEN_PRIVATE_KEY, CLI_TELEPORTER_PUBLIC_KEY)
// .catch((error) => {
//     console.error(error);
// 	process.exitCode = 1;
// });

// _callIsUserRegistered(CLI_TELEPORTER_PUBLIC_KEY)
// .catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// })

// _callGetUserPublicKey(CLI_TELEPORTER_PUBLIC_KEY).then(pub => console.log(typeof pub))
// .catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// })

// _callAuditorPublicKey()
// .catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// })

// _callSetAudtiorPublicKey(NEW_AUDITOR_ADDRESS, OWNER_ADDRESS)
// .catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// })

// _callPrivateMint(CLI_TELEPORTER_PUBLIC_KEY, OWNER_ADDRESS, BigInt(10000))
// .catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// })

// _callBalanceOfStandalone(NEW_AUDITOR_ADDRESS, OWNER_ADDRESS)
// .then(bal => {console.log('Balance of the given address: ', bal)})
// .catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// })

// getDecryptedBalanceOfUser(OWNER_ADDRESS, PRIV_KEY)
// .then(({encryptedBalance,decryptedBalance}) => { 
//     console.log(`Decrypted balance of given user (${CLI_TELEPORTER_PUBLIC_KEY}) is:`, decryptedBalance);
//     console.log("\nEncrypted balance:", encryptedBalance);
// })
// .catch(e => console.error(e));

// _callTransfer(
//     OWNER_ADDRESS, 
//     PRIV_KEY, 
//     CLI_TELEPORTER_PUBLIC_KEY, 
//     CLI_TELEPORTER_GEN_PRIVATE_KEY, 
//     NEW_AUDITOR_ADDRESS, 
//     GEN_PRIV_KEY_AUDITOR, 
//     BigInt(500)
// )
// .catch(e => console.error(e));