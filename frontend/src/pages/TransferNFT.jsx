import { useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../services/contract";

function TransferNFT({ account, connectWallet }) {
  const [tokenId, setTokenId] = useState("");
  const [to, setTo] = useState("");
  const [currentOwner, setCurrentOwner] = useState("");
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState([]);

  const testCases = [
    {
      title: "TC01 - Transfer hợp lệ",
      input: "Token ID thuộc ví đang connect, To Address là ví hợp lệ khác",
      expected: "NFT được chuyển sang ví nhận, ownerOf(tokenId) đổi sang ví mới.",
    },
    {
      title: "TC02 - Ví hiện tại không phải owner",
      input: "Token ID thuộc ví khác",
      expected: "Hệ thống chặn giao dịch và báo ví hiện tại không phải owner.",
    },
    {
      title: "TC03 - Sai địa chỉ ví nhận",
      input: "To Address không đúng định dạng 0x...",
      expected: "Hệ thống báo địa chỉ nhận không hợp lệ, không gửi transaction.",
    },
    {
      title: "TC04 - Token ID không tồn tại",
      input: "Nhập Token ID chưa từng mint",
      expected: "Không lấy được owner, giao dịch transfer không được thực hiện.",
    },
    {
      title: "TC05 - Chuyển cho chính mình",
      input: "To Address trùng với ví đang connect",
      expected: "Hệ thống cảnh báo không nên chuyển NFT cho chính ví hiện tại.",
    },
  ];

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
        setStatus("Đã lấy owner hiện tại. Ví đang connect là owner của NFT này.");
      } else {
        setStatus(
          `Đã lấy owner hiện tại. Ví đang connect không phải owner. Owner: ${owner}`
        );
      }
    } catch (error) {
      console.error(error);
      setCurrentOwner("");
      setStatus("Không lấy được owner. Token ID có thể không tồn tại.");
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
        setStatus("Địa chỉ nhận không hợp lệ.");
        return;
      }

      if (to.toLowerCase() === account.toLowerCase()) {
        setStatus("Ví nhận đang trùng với ví hiện tại. Vui lòng nhập ví khác.");
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

      setStatus("Đang chuyển quyền sở hữu NFT...");

      const tx = await contract.transferFrom(
        account,
        to,
        BigInt(tokenId)
      );

      await tx.wait();

      const newOwner = await contract.ownerOf(BigInt(tokenId));
      setCurrentOwner(newOwner);

      setStatus(
        `Chuyển quyền sở hữu thành công. Owner mới: ${newOwner}`
      );

      await loadTransferHistory();
    } catch (error) {
      console.error(error);
      setStatus(
        "Transfer thất bại. Kiểm tra Token ID, ví nhận hoặc quyền sở hữu NFT."
      );
    }
  }

  async function loadTransferHistory() {
    try {
      if (!account) {
        setStatus("Vui lòng connect ví trước để xem lịch sử.");
        return;
      }

      setStatus("Đang tải lịch sử giao dịch Transfer của ví...");

      const contract = await getContract();

      const logs = await contract.queryFilter(
        contract.filters.Transfer(),
        0,
        "latest"
      );

      const relatedLogs = logs
        .filter((log) => {
          const from = log.args.from.toLowerCase();
          const to = log.args.to.toLowerCase();
          const wallet = account.toLowerCase();

          return from === wallet || to === wallet;
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

      setStatus(`Tìm thấy ${relatedLogs.length} giao dịch Transfer liên quan đến ví này.`);
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

      <div className="testcase-box">
        <h3>Test case đề xuất cho màn Transfer</h3>

        <div className="testcase-grid">
          {testCases.map((tc) => (
            <div className="testcase-card" key={tc.title}>
              <strong>{tc.title}</strong>
              <p>
                <b>Input:</b> {tc.input}
              </p>
              <p>
                <b>Kết quả mong đợi:</b> {tc.expected}
              </p>
            </div>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="history-box">
          <h3>Lịch sử Transfer của ví</h3>

          <div className="history-list">
            {history.map((item) => (
              <div className="history-card" key={`${item.txHash}-${item.tokenId}`}>
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