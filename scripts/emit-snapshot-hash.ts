import { ethers } from 'hardhat';

interface Participant {
  participant: {
    fid: number;
    username: string;
    display_name?: string;
    avatar?: string;
    wallet_address?: string;
    neynar_score?: number;
    farcaster_approved: boolean;
    addresses: string[];
  };
  total_balance: number;
}

interface ApiResponse {
  lottery: {
    id: string;
    title: string;
    status: string;
  };
  before_datetime: string;
  participants: Participant[];
  summary: {
    total_participants: number;
    total_balance: number;
  };
}

async function fetchLotteryDrawData(beforeDateTime: string): Promise<ApiResponse> {
  const apiUrl = 'https://like-api.trifle.life/api/like-lottery/lotteryDraw/create';
  const url = new URL(apiUrl);
  url.searchParams.set('beforeDateTime', beforeDateTime);

  // Add authentication
  const apiSecret = process.env.API_SECRET;
  if (!apiSecret) {
    throw new Error('API_SECRET environment variable is required');
  }
  url.searchParams.set('secret', apiSecret);

  console.log(`Fetching lottery draw data from: ${url.toString()}`);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => ({ error: { message: 'Unknown error' } }))) as { error?: { message?: string } };
    throw new Error(
      `API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
    );
  }

  return (await response.json()) as ApiResponse;
}

function generateSnapshotHash(participants: Participant[], timestamp: number): string {
  // Sort participants by FID to ensure consistent ordering
  const sortedParticipants = participants.sort((a, b) => a.participant.fid - b.participant.fid);

  // Create array of structs with fid (uint256) and balance (uint256)
  const structData = sortedParticipants.map((p) => ({
    fid: p.participant.fid,
    balance: p.total_balance,
  }));

  console.log(`Snapshot data for ${participants.length} participants:`);
  console.log(JSON.stringify(structData, null, 2));
  console.log(`Timestamp: ${timestamp} (${new Date(timestamp * 1000).toISOString()})`);
  console.log(
    `Note: Timestamp is rounded down to seconds precision to match Solidity block.timestamp`
  );

  // Pack each struct individually, then pack the array
  // Each struct: Player { uint256 fid, uint256 balance }
  const packedStructs = structData.map((player) => {
    // Pack each struct as: fid (32 bytes) + balance (32 bytes)
    return ethers.utils.solidityPack(['uint256', 'uint256'], [player.fid, player.balance]);
  });

  // Pack the array of packed structs with timestamp
  // This simulates: keccak256(abi.encodePacked(snapshotData, timestamp))
  const packedData = ethers.utils.solidityPack(['bytes[]', 'uint256'], [packedStructs, timestamp]);

  // Generate keccak256 hash of the packed data
  const hash = ethers.utils.keccak256(packedData);
  console.log(`Generated snapshot hash: ${hash}`);

  return hash;
}

async function main() {
  // Get parameters from environment variables or use defaults
  const beforeDateTime = process.env.BEFORE_DATETIME || new Date().toISOString();
  const giveawayIndex = process.env.GIVEAWAY_INDEX ? parseInt(process.env.GIVEAWAY_INDEX, 10) : 0;

  // Validate date format if datetime was provided
  const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  if (!dateRegex.test(beforeDateTime)) {
    console.error('Error: BEFORE_DATETIME must be in format YYYY-MM-DDTHH:mm:ss.sssZ');
    console.error('Example: 2024-01-15T12:00:00.000Z');
    console.error(
      'Usage: BEFORE_DATETIME="2024-01-15T12:00:00.000Z" GIVEAWAY_INDEX=0 npx hardhat run scripts/emit-snapshot-hash.ts --network <network>'
    );
    process.exit(1);
  }

  console.log(`Emitting snapshot hash for datetime: ${beforeDateTime}`);
  console.log(`Giveaway index: ${giveawayIndex}`);

  try {
    // Convert beforeDateTime to unix timestamp (seconds precision, matching Solidity)
    const beforeDate = new Date(beforeDateTime);
    const timestamp = Math.floor(beforeDate.getTime() / 1000); // Convert to unix timestamp (seconds)
    console.log(`Unix timestamp: ${timestamp}`);
    console.log(`Timestamp as ISO: ${new Date(timestamp * 1000).toISOString()}`);

    // Fetch lottery draw data from API
    const apiResponse = await fetchLotteryDrawData(beforeDateTime);

    console.log(`\nAPI Response Summary:`);
    console.log(`- Lottery: ${apiResponse.lottery.title} (${apiResponse.lottery.status})`);
    console.log(`- Total participants: ${apiResponse.summary.total_participants}`);
    console.log(`- Total balance: ${apiResponse.summary.total_balance}`);

    // Generate snapshot hash with timestamp
    const snapshotHash = generateSnapshotHash(apiResponse.participants, timestamp);

    // Get the contract instance
    const LikeLotteryDraw = await ethers.getContractFactory('LikeLotteryDraw');

    // Get the deployed contract address from deployments
    const network = await ethers.provider.getNetwork();
    let networkName: string;

    // Map chainId to network name for unknown networks
    if (network.name === 'unknown') {
      switch (network.chainId) {
        case 84532:
          networkName = 'baseSepolia';
          break;
        case 8453:
          networkName = 'base';
          break;
        case 31337:
          networkName = 'localhost';
          break;
        default:
          networkName = 'localhost';
      }
    } else {
      networkName = network.name;
    }

    let contractAddress: string;
    try {
      const deployment = require(`../deployments/${networkName}/LikeLotteryDraw.json`);
      contractAddress = deployment.address;
    } catch (error) {
      console.error(`Error: Could not find LikeLotteryDraw deployment for network ${networkName}`);
      console.error('Make sure the contract is deployed first using: npm run deploy:draw:local');
      process.exit(1);
    }

    const contract = LikeLotteryDraw.attach(contractAddress);
    console.log(`\nUsing LikeLotteryDraw contract at: ${contractAddress}`);

    // Convert hash to bytes32 (remove any existing 0x prefix)
    const snapshotHashBytes32 = snapshotHash.startsWith('0x') ? snapshotHash : '0x' + snapshotHash;

    // Call emitSnapshotHash
    console.log(`\nCalling emitSnapshotHash...`);
    const tx = await contract.emitSnapshotHash(snapshotHashBytes32, timestamp, giveawayIndex);

    console.log(`Transaction submitted: ${tx.hash}`);
    console.log('Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);

    // Parse events
    const snapshotEvent = receipt.logs.find((log) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'GiveawayData';
      } catch {
        return false;
      }
    });

    if (snapshotEvent) {
      const parsed = contract.interface.parseLog(snapshotEvent);
      console.log(`\nGiveawayData event:`);
      console.log(`- Snapshot Hash: ${parsed?.args.snapshotHash}`);
      console.log(`- Timestamp: ${parsed?.args.timestamp.toString()}`);
      console.log(`- Giveaway Index: ${parsed?.args.giveawayIndex.toString()}`);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
