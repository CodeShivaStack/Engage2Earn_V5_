import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { IDL } from './idl/engage_token';

export class EngageTokenProgram {
  program: Program;
  connection: Connection;

  constructor(connection: Connection, wallet: anchor.Wallet) {
    // Replace with your deployed program ID
    const programId = new PublicKey('YOUR_PROGRAM_ID');
    
    const provider = new anchor.AnchorProvider(
      connection,
      wallet,
      { commitment: 'processed' }
    );

    this.program = new Program(IDL, programId, provider);
    this.connection = connection;
  }

  async createTokenAccount(owner: PublicKey): Promise<PublicKey> {
    const [tokenAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('token'), owner.toBuffer()],
      this.program.programId
    );

    const tx = await this.program.methods
      .createTokenAccount()
      .accounts({
        tokenAccount,
        owner,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tokenAccount;
  }

  async createTask(
    creator: PublicKey,
    tokenAmount: number,
    deadline: number
  ): Promise<PublicKey> {
    const [taskAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('task'), creator.toBuffer(), Buffer.from(Date.now().toString())],
      this.program.programId
    );

    const tx = await this.program.methods
      .createTask(new anchor.BN(tokenAmount), new anchor.BN(deadline))
      .accounts({
        taskAccount,
        creator,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return taskAccount;
  }

  async verifyEngagement(
    task: PublicKey,
    participant: PublicKey,
    engagementProof: string
  ): Promise<void> {
    const tx = await this.program.methods
      .verifyEngagement(engagementProof)
      .accounts({
        task,
        participant,
      })
      .rpc();
  }
}