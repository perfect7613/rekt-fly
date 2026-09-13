"use client";
import { useEffect, useRef, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  formatUnits,
  type Address,
  type EIP1193Provider,
} from "viem";
import { sepolia } from "viem/chains";
import {
  LENDING,
  VETH,
  VUSD,
  lendingAbi,
  tokenAbi,
  health,
  protection,
} from "@/lib/challenge";

type Snapshot = {
  account: Address;
  open: boolean;
  active: boolean;
  joined: boolean;
  collateral: bigint;
  debt: bigint;
  price: bigint;
  eth: bigint;
  usd: bigint;
  block: bigint;
};
const units = (n: bigint) => formatUnits(n, 2);
export default function Challenge() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    "Connect MetaMask to inspect your real testnet position.",
  );
  const [hash, setHash] = useState("");
  const generation = useRef(0);
  function provider() {
    const p = (window as Window & { ethereum?: EIP1193Provider }).ethereum;
    if (!p)
      throw new Error(
        "Open this page in a browser with MetaMask installed, or in the MetaMask app browser.",
      );
    return p;
  }
  function clients() {
    const transport = custom(provider());
    return {
      wallet: createWalletClient({ chain: sepolia, transport }),
      rpc: createPublicClient({ chain: sepolia, transport }),
    };
  }
  useEffect(() => {
    const p = (window as Window & { ethereum?: EIP1193Provider }).ethereum;
    const reset = () => {
      generation.current++;
      setSnapshot(null);
      setHash("");
      setMessage(
        "Wallet account or network changed. Connect again to refresh.",
      );
    };
    p?.on("accountsChanged", reset);
    p?.on("chainChanged", reset);
    return () => {
      p?.removeListener("accountsChanged", reset);
      p?.removeListener("chainChanged", reset);
    };
  }, []);
  async function load(account: Address) {
    const id = generation.current;
    const { rpc } = clients();
    if ((await rpc.getChainId()) !== sepolia.id)
      throw new Error(
        "Select Ethereum Sepolia (chain 11155111) in MetaMask, then connect again.",
      );
    const blockNumber = await rpc.getBlockNumber();
    const base = { address: LENDING, abi: lendingAbi, blockNumber };
    const [
      open,
      start,
      end,
      joined,
      position,
      price,
      eth,
      usd,
      veth,
      vusd,
      de,
      du,
    ] = await Promise.all([
      rpc.readContract({ ...base, functionName: "challengeOpen" }),
      rpc.readContract({ ...base, functionName: "scenarioStartTime" }),
      rpc.readContract({ ...base, functionName: "scenarioEndTime" }),
      rpc.readContract({ ...base, functionName: "isUser", args: [account] }),
      rpc.readContract({ ...base, functionName: "positions", args: [account] }),
      rpc.readContract({ ...base, functionName: "vETHPrice" }),
      rpc.readContract({
        address: VETH,
        abi: tokenAbi,
        functionName: "balanceOf",
        args: [account],
        blockNumber,
      }),
      rpc.readContract({
        address: VUSD,
        abi: tokenAbi,
        functionName: "balanceOf",
        args: [account],
        blockNumber,
      }),
      rpc.readContract({ ...base, functionName: "vETH" }),
      rpc.readContract({ ...base, functionName: "vUSD" }),
      rpc.readContract({
        address: VETH,
        abi: tokenAbi,
        functionName: "decimals",
        blockNumber,
      }),
      rpc.readContract({
        address: VUSD,
        abi: tokenAbi,
        functionName: "decimals",
        blockNumber,
      }),
    ]);
    if (
      veth.toLowerCase() !== VETH.toLowerCase() ||
      vusd.toLowerCase() !== VUSD.toLowerCase() ||
      de !== 2 ||
      du !== 2
    )
      throw new Error(
        "Challenge contract configuration differs from the published deployment. Actions disabled.",
      );
    if (generation.current !== id)
      throw new Error("Wallet changed during the request. Reconnect.");
    const value = {
      account,
      open,
      active: open && start > 0n && end === 0n,
      joined,
      collateral: position[0],
      debt: position[1],
      price,
      eth,
      usd,
      block: blockNumber,
    };
    setSnapshot(value);
    return value;
  }
  async function run(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setHash("");
    try {
      await fn();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message.split("\n")[0]
          : "Wallet request failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  const connect = () =>
    run(async () => {
      const { wallet } = clients();
      const [account] = await wallet.requestAddresses();
      if (!account) throw new Error("No wallet account selected.");
      if ((await wallet.getChainId()) !== sepolia.id)
        await wallet.switchChain({ id: sepolia.id });
      await load(account);
      setMessage(
        "Position read from Sepolia. Refresh before comparing a new market move.",
      );
    });
  const act = (action: "join" | "deposit" | "repay") =>
    run(async () => {
      if (!snapshot) throw new Error("Connect first.");
      const { wallet, rpc } = clients();
      const [account] = await wallet.getAddresses();
      if (account?.toLowerCase() !== snapshot.account.toLowerCase())
        throw new Error("Wallet changed. Reconnect.");
      const current = await load(account);
      const id = generation.current;
      const amount =
        action === "deposit"
          ? 50n
          : current.debt < 35000n
            ? current.debt
            : 35000n;
      if (!current.open || (action !== "join" && !current.active))
        throw new Error(
          "The organizer has not enabled this action yet, or the scenario has ended.",
        );
      async function receipt(tx: Address) {
        setHash(tx);
        setMessage("Waiting for Sepolia confirmation…");
        const result = await rpc.waitForTransactionReceipt({
          hash: tx,
          timeout: 120000,
        });
        if (result.status !== "success")
          throw new Error(
            "Transaction reverted. No successful action recorded.",
          );
        if (generation.current !== id)
          throw new Error("Wallet changed. Reconnect to inspect the receipt.");
      }
      if (action !== "join") {
        if (!current.joined || amount <= 0n)
          throw new Error("No eligible position.");
        const token = action === "deposit" ? VETH : VUSD;
        if ((action === "deposit" ? current.eth : current.usd) < amount)
          throw new Error("Insufficient virtual token balance.");
        const allowance = await rpc.readContract({
          address: token,
          abi: tokenAbi,
          functionName: "allowance",
          args: [account, LENDING],
        });
        if (allowance < amount) {
          setMessage(
            `Approve exactly ${units(amount)} ${action === "deposit" ? "vETH" : "vUSD"} in MetaMask. A second confirmation performs the action.`,
          );
          const { request } = await rpc.simulateContract({
            address: token,
            abi: tokenAbi,
            functionName: "approve",
            args: [LENDING, amount],
            account,
          });
          await receipt(await wallet.writeContract(request));
        }
      }
      if (
        (await wallet.getChainId()) !== sepolia.id ||
        generation.current !== id
      )
        throw new Error("Network or account changed. Reconnect.");
      setMessage(`Confirm ${action} in MetaMask. Only testnet gas is used.`);
      const call =
        action === "join"
          ? { functionName: "join" as const }
          : { functionName: action, args: [amount] as const };
      const { request } = await rpc.simulateContract({
        address: LENDING,
        abi: lendingAbi,
        account,
        ...call,
      });
      await receipt(await wallet.writeContract(request));
      await load(account);
      setMessage(`${action} confirmed on Sepolia. Position refreshed.`);
    });
  const plan = snapshot
    ? protection(snapshot.collateral, snapshot.debt, snapshot.price)
    : null;
  const hf = snapshot
    ? health(snapshot.collateral, snapshot.debt, snapshot.price)
    : 0;
  return (
    <section className="challenge-panel" id="testnet">
      <div className="section-label">
        04 <span>TAKE THE LESSON ONCHAIN</span>
        <span className="right-label">ETHEREUM SEPOLIA</span>
      </div>
      <div className="challenge-heading">
        <div>
          <h2>A real position. Testnet stakes.</h2>
          <p>
            Practice above, then inspect and protect your position in the
            official Chainlink lending challenge. These balances are independent
            of the game.
          </p>
        </div>
        <button className="wallet-primary" disabled={busy} onClick={connect}>
          {busy ? "Working…" : snapshot ? "Refresh wallet" : "Connect MetaMask"}
        </button>
      </div>
      <div className="challenge-steps">
        <p>
          <b>1. Get gas</b>Use a little Sepolia ETH for transaction fees.
          Joining mints the virtual challenge tokens; no ETH collateral payment
          is sent.
        </p>
        <p>
          <b>2. Understand the tradeoff</b>Adding collateral preserves your loan
          but commits capital. Repayment lowers risk and reduces the outstanding
          loan.
        </p>
        <p>
          <b>3. Confirm your action</b>Each transaction asks in MetaMask. The
          local neural pilot never controls your wallet; confidential CRE
          automation is not deployed.
        </p>
      </div>
      {snapshot && (
        <div className="chain-position">
          <div className="chain-stats">
            <span>
              HEALTH FACTOR
              <strong>{Number.isFinite(hf) ? hf.toFixed(2) : "No debt"}</strong>
            </span>
            <span>
              COLLATERAL<strong>{units(snapshot.collateral)} vETH</strong>
            </span>
            <span>
              DEBT<strong>{units(snapshot.debt)} vUSD</strong>
            </span>
            <span>
              WALLET RESERVES
              <strong>
                {units(snapshot.eth)} vETH · {units(snapshot.usd)} vUSD
              </strong>
            </span>
          </div>
          <p>
            {snapshot.joined ? "Registered" : "Not registered"} ·{" "}
            {snapshot.open
              ? snapshot.active
                ? "Scenario active"
                : "Waiting for scenario / scenario ended"
              : "Challenge closed"}{" "}
            · Block {snapshot.block.toString()} · {snapshot.account.slice(0, 6)}
            …{snapshot.account.slice(-4)}
          </p>
          {snapshot.joined && plan && (
            <p className="protection-explanation">
              At the current price of {units(snapshot.price)} vUSD, reaching HF
              1.20 requires <b>{units(plan.deposit)} additional vETH</b> or{" "}
              <b>{units(plan.repay)} vUSD repayment</b>. These are alternatives,
              not both required. Recalculate after price changes; this is a
              snapshot, not a guarantee.
            </p>
          )}
          <div className="chain-actions">
            <button
              disabled={busy || snapshot.joined || !snapshot.open}
              onClick={() => act("join")}
            >
              Join & mint virtual tokens
            </button>
            <button
              disabled={
                busy ||
                !snapshot.joined ||
                !snapshot.active ||
                snapshot.eth < 50n
              }
              onClick={() => act("deposit")}
            >
              Add 0.50 vETH
            </button>
            <button
              disabled={
                busy ||
                !snapshot.joined ||
                !snapshot.active ||
                snapshot.debt === 0n ||
                snapshot.usd < (snapshot.debt < 35000n ? snapshot.debt : 35000n)
              }
              onClick={() => act("repay")}
            >
              Repay up to 350 vUSD
            </button>
          </div>
        </div>
      )}
      <p className="wallet-message" role="status">
        {message}
      </p>
      <div className="chain-links">
        <a
          href={`https://sepolia.etherscan.io/address/${LENDING}`}
          target="_blank"
          rel="noreferrer"
        >
          Verify lending contract ↗
        </a>
        <a
          href="https://ethglobal.com/events/ethonline2026/prizes/chainlink"
          target="_blank"
          rel="noreferrer"
        >
          Challenge rules & setup ↗
        </a>
        {hash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
          >
            View transaction ↗
          </a>
        )}
      </div>
    </section>
  );
}
