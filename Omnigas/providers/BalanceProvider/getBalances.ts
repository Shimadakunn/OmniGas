import {
  Address,
  Hex,
  formatUnits,
  formatEther,
  createPublicClient,
  http,
} from "viem";
import { tokens, ERC20_ABI, chains } from "@/constants";

export type User = {
  id: Hex;
  pubKey: { x: Hex; y: Hex };
  account: Address;
  balance: bigint;
};

export async function getBalances(
  address: Hex
): Promise<{ balances: string[] }> {
  const promises = [];
  for (const key in tokens) {
    if (tokens.hasOwnProperty(key)) {
      promises.push(getBalance(address, key).then((result) => result.balance));
    }
  }
  const balances = await Promise.all(promises);
  return { balances: balances };
}

export async function getBalance(
  address: Hex,
  tok: string
): Promise<{ balance: string }> {
  const client = createPublicClient({
    chain: chains[tokens[tok].network].viem,
    transport: http(),
  });
  try {
    const price = await fetch(
      `https://min-api.cryptocompare.com/data/price?fsym=${tokens[tok].coin}&tsyms=USD&api_key=${process.env.NEXT_PUBLIC_PRICE_API_KEY}`
    );
    if (!price.ok) {
      throw new Error(`HTTP error! status: ${price.status}`);
    }
    const priceData = await price.json();
    tokens[tok].rate = priceData.USD;
  } catch (error) {
    console.error("Error fetching price", error);
  }

  let balance;
  if (tokens[tok].address) {
    balance = await client.readContract({
      address: tokens[tok].address as Hex,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [address],
    });
    const decimals = await client.readContract({
      address: tokens[tok].address as Hex,
      abi: ERC20_ABI,
      functionName: "decimals",
    });
    const allowance = await client.readContract({
      address: tokens[tok].address as Hex,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [address, chains[tokens[tok].network].paymaster],
    });
    tokens[tok].balance = formatUnits(balance, decimals);
    tokens[tok].decimals = decimals;
    tokens[tok].allowance = formatUnits(allowance, decimals);
  } else {
    balance = await client.getBalance({ address: address });
    tokens[tok].balance = formatEther(balance);
  }
  if (tokens[tok].aave) {
    const aavebalance = await client.readContract({
      address: tokens[tok].aave as Hex,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [address],
    });
    const decimals = await client.readContract({
      address: tokens[tok].aave as Hex,
      abi: ERC20_ABI,
      functionName: "decimals",
    });
    tokens[tok].aavebalance = formatUnits(aavebalance, decimals);
  }
  return {
    balance: balance!.toString(),
  };
}
