/**
 * Function for registering the user by using chain id
 * @param user
 * @param chainId 
 * @returns proof - Proof and public inputs for the generated proof
 * publicSignals = [
 *		pk.x,                // [0]
 * 		pk.y,                // [1]
 *		accountAddress,      // [2]
 * 		chainId,             // [3]
 * 		registrationHash     // [4]
 *	]
 */

export const privateRegister = async (
  newUser: User,
  chainId: bigint
): Promise<CalldataRegistrationCircuitGroth16> => {
  // 1. generate registration hash
  const registrationHash = newUser.genRegistrationHash(chainId);

  // 2. prepare circuit input
  const input = {
    SenderPrivateKey: newUser.formattedPrivateKey,  
    SenderPublicKey: newUser.publicKey,             
    SenderAddress: BigInt(newUser.signer.address),
    ChainID: chainId,
    RegistrationHash: registrationHash,
  };

  // 3. load the registration circuit
  const circuit = (await zkit.getCircuit("RegistrationCircuit"));
  const registerCircuit = circuit as unknown as RegistrationCircuit;

  const proof = await registerCircuit.generateProof(input);
  const calldata = await registerCircuit.generateCalldata(proof);

  return calldata;
};