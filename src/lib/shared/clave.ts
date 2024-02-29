export const getClaveBuidlBalance = async (
  address: string
): Promise<number> => {
  const BUIDL_TOKEN_ADDRESS = "0x84706f5fcbec6d5b4adb01a277dcca2f6f5cad26";

  const getParsedAddress = () => {
    return address.startsWith("0x") ? address.slice(2) : address;
  };

  let data = JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_call",
    params: [
      {
        to: BUIDL_TOKEN_ADDRESS,
        data: `0x70a08231000000000000000000000000${getParsedAddress()}`,
      },
      "latest",
    ],
    id: 1,
  });

  const rpcUrl = "https://mainnet.era.zksync.io";

  let config = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  };

  try {
    const response = await fetch(rpcUrl, config);
    const json = await response.json();
    const balanceBigInt = BigInt(json.result) / BigInt(1e18);
    const balanceInBuidl = Number(balanceBigInt);
    if (isNaN(balanceInBuidl)) {
      throw new Error("Invalid balance");
    }
    return balanceInBuidl;
  } catch (error) {
    console.error("Error fetching BUIDL balance:", error);
    return 0;
  }
};
