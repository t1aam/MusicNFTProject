import { useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../services/contract";

function TransferNFT({ account, connectWallet }) {
  const [tokenId, setTokenId] = useState("");
  const [to, setTo] = useState("");
  const [currentOwner, setCurrentOwner] = useState("");
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState([]);

  async function loadOwner() {
    try {
      if (!tokenId) {
        setStatus("Vui lòng nhập Token ID.");
        return;
      }

      const contract = await getContract();
      const owner = await contract.ownerOf(BigInt(tokenId));

      setCurrentOwner(owner);

      if (account && owner.toLowerCase() === account.toLowerCase()) {
        setStatus("Token này đang thuộc ví đang connect.");
      } else {
        setStatus(`Owner hiện tại của Token #${tokenId}: ${owner}`);
      }
    } catch (error) {
      console.error(error);
      setCurrentOwner("");
      setStatus("Token ID không tồn tại hoặc không lấy được owner.");
    }
  }

  async function transferNFT() {
    try {
      if (!account) {
        setStatus("Vui lòng connect ví trước.");
        return;
      }

      if (!tokenId) {
        setStatus("Vui lòng nhập Token ID.");
        return;
      }

      if (!ethers.isAddress(to)) {
        setStatus("Địa chỉ ví nhận không hợp lệ.");
        return;
      }

      if (to.toLowerCase() === account.toLowerCase()) {
        setStatus("Không thể chuyển NFT cho chính ví đang connect.");
        return;
      }

      setStatus("Đang kiểm tra owner hiện tại...");

      const contract = await getContract();
      const owner = await contract.ownerOf(BigInt(tokenId));

      setCurrentOwner(owner);

      if (owner.toLowerCase() !== account.toLowerCase()) {
        setStatus(
          `Không thể transfer. Ví đang connect không phải owner của Token #${tokenId}.`
        );
        return;
      }

      setStatus("Đang gửi giao dịch transfer lên Sepolia...");

      const tx = await contract.transferFrom(
        account,
        to,
        BigInt(tokenId)
      );

      await tx.wait();

      const newOwner = await contract.ownerOf(BigInt(tokenId));
      setCurrentOwner(newOwner);

      setStatus(`Transfer thành công. Owner mới: ${newOwner}`);

      await loadTransferHistory();
    } catch (error) {
      console.error(error);
      setStatus(
        "Transfer thất bại. Kiểm tra Token ID, ví nhận, quyền sở hữu hoặc MetaMask."
      );
    }
  }

  async function loadTransferHistory() {
    try {
      if (!account) {
        setStatus("Vui lòng connect ví trước để xem lịch sử.");
        return;
      }

      setStatus("Đang tải lịch sử Transfer của ví đang connect...");

      const contract = await getContract();

      const logs = await contract.queryFilter(
        contract.filters.Transfer(),
        0,
        "latest"
      );

      const relatedLogs = logs
        .filter((log) => {
          const from = log.args.from.toLowerCase();
          const receiver = log.args.to.toLowerCase();
          const wallet = account.toLowerCase();

          return from === wallet || receiver === wallet;
        })
        .map((log) => ({
          tokenId: log.args.tokenId.toString(),
          from: log.args.from,
          to: log.args.to,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        }))
        .reverse();

      setHistory(relatedLogs);
      setStatus(`Tìm thấy ${relatedLogs.length} giao dịch Transfer của ví này.`);
    } catch (error) {
      console.error(error);
      setStatus("Không tải được lịch sử Transfer.");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="section-label">Ownership</p>
          <h2>Transfer NFT Ownership</h2>
          <p className="muted">
            Chuyển quyền sở hữu NFT bản quyền âm nhạc từ ví đang connect sang
            một ví cá nhân hoặc tổ chức khác trên Sepolia.
          </p>
        </div>

        <button className="wallet-btn" onClick={connectWallet}>
          {account ? "Wallet Connected" : "Connect Wallet"}
        </button>
      </div>

      {account && (
        <div className="wallet-card">
          <span>Ví đang connect / From Wallet</span>
          <p>{account}</p>
        </div>
      )}

      <div className="form-grid">
        <div className="form-group">
          <label>Token ID</label>
          <input
            placeholder="Ví dụ: 1"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />
          <small>NFT bản quyền cần chuyển nhượng.</small>
        </div>

        <div className="form-group">
          <label>Current Owner</label>
          <input
            placeholder="Bấm Load Owner"
            value={currentOwner}
            readOnly
          />
          <small>Chủ sở hữu hiện tại của NFT theo ownerOf(tokenId).</small>
        </div>

        <div className="form-group full">
          <button className="primary-btn" onClick={loadOwner}>
            Load Owner
          </button>
        </div>

        <div className="form-group full">
          <label>To Address</label>
          <input
            placeholder="Nhập địa chỉ ví nhận NFT, ví dụ: 0x..."
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <small>
            Địa chỉ ví cá nhân hoặc tổ chức nhận quyền sở hữu NFT.
          </small>
        </div>
      </div>

      <div className="action-row">
        <button className="primary-btn" onClick={transferNFT}>
          Transfer NFT
        </button>

        <button className="primary-btn" onClick={loadTransferHistory}>
          Load Wallet History
        </button>

        <div className="status-box">
          {status || "Chưa có giao dịch transfer."}
        </div>
      </div>

      {history.length > 0 && (
        <div className="history-box">
          <h3>Lịch sử Transfer của ví</h3>

          <div className="history-list">
            {history.map((item) => (
              <div
                className="history-card"
                key={`${item.txHash}-${item.tokenId}`}
              >
                <p>
                  <b>Token:</b> #{item.tokenId}
                </p>
                <p>
                  <b>From:</b> {item.from}
                </p>
                <p>
                  <b>To:</b> {item.to}
                </p>
                <p>
                  <b>Block:</b> {item.blockNumber}
                </p>
                <p>
                  <b>Tx:</b>{" "}
                  <a
                    href={`https://sepolia.etherscan.io/tx/${item.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.txHash}
                  </a>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TransferNFT;