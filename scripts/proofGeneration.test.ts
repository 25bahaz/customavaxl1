import dotenv from 'dotenv';
import { expect } from "chai";
import { privateRegister } from "./helpers";
import { User } from './user';
import { ethers } from 'hardhat';

dotenv.config();

describe("Proof Generation - privateRegister", function () {
  it("should generate proof calldata for a new user", async () => {
    // 1. grab signers from hardhat
    const [signer] = await ethers.getSigners();

    // 2. create User instance with signer
    const newUser = new User(signer);

    // 3. chain id
    const chainId = BigInt(process.env.CHAIN_ID!);

    // 4. call privateRegister
    const calldata = await privateRegister(newUser, chainId);

    // 5. sanity checks
    expect(calldata).to.not.be.undefined;

    console.log("Generated calldata:", calldata);
  });
});