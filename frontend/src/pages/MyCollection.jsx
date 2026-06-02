import { useState } from "react";
import { getContractReadOnly } from "../services/contract";

function MyCollection() {
  const [account, setAccount] = useState("");
  const [nfts, setNfts] = useState([]);
  const [status, setStatus] = useState("");

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("Chưa cài MetaMask.");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0]);
    setStatus("Đã kết nối ví. Bấm Load My NFTs để xem tài sản.");
  }

  async function loadMyNFTs() {
    try {
      if (!account) {
        setStatus("Vui lòng connect ví trước.");
        return;
      }

      setStatus("Đang đọc lịch sử Transfer từ blockchain...");

      const contract = await getContractReadOnly();

      const transferLogs = await contract.queryFilter(
        contract.filters.Transfer(),
        0,
        "latest"
      );

      const latestOwnerByToken = new Map();

      for (const log of transferLogs) {
        const tokenId = log.args.tokenId.toString();
        const to = log.args.to;

        latestOwnerByToken.set(tokenId, to);
      }

      const ownedTokenIds = [];

      for (const [tokenId, owner] of latestOwnerByToken.entries()) {
        if (owner.toLowerCase() === account.toLowerCase()) {
          ownedTokenIds.push(tokenId);
        }
      }

      const results = [];

      for (const tokenId of ownedTokenIds) {
        try {
          const info = await contract.getMusicInfo(tokenId);
          const tokenURI = await contract.tokenURI(tokenId);

          results.push({
            tokenId,
            title: info.title,
            artist: info.artist,
            creator: info.creator,
            audioHash: info.audioHash,
            rightsHash: info.rightsHash,
            licenseType: Number(info.licenseType),
            createdAt: Number(info.createdAt),
            tokenURI,
          });
        } catch (error) {
          console.error("Cannot load token", tokenId, error);
        }
      }

      setNfts(results);

      if (results.length === 0) {
        setStatus("Ví này hiện chưa sở hữu NFT nào trong contract.");
      } else {
        setStatus(`Tìm thấy ${results.length} NFT thuộc ví này.`);
      }
    } catch (error) {
      console.error(error);
      setStatus("Không thể tải My Collection. Kiểm tra network hoặc contract.");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="section-label">My Collection</p>
          <h2>Tài sản NFT của tôi</h2>
          <p className="muted">
            Hệ thống đọc event Transfer của ERC721 để xác định các Music NFT
            hiện đang thuộc ví MetaMask đang kết nối.
          </p>
        </div>

        <button className="wallet-btn" onClick={connectWallet}>
          {account ? "Wallet Connected" : "Connect Wallet"}
        </button>
      </div>

      {account && (
        <div className="wallet-card">
          <span>Connected account</span>
          <p>{account}</p>
        </div>
      )}

      <div className="action-row">
        <button className="primary-btn" onClick={loadMyNFTs}>
          Load My NFTs
        </button>

        <div className="status-box">{status || "Chưa tải dữ liệu."}</div>
      </div>

      {nfts.length > 0 && (
        <div className="collection-grid">
          {nfts.map((nft) => (
            <div className="collection-card" key={nft.tokenId}>
              <div className="collection-art">♪</div>

              <div>
                <p className="section-label">Token #{nft.tokenId}</p>
                <h3>{nft.title}</h3>
                <p className="muted">{nft.artist}</p>

                <div className="info-grid">
                  <div>
                    <span>Creator</span>
                    <p>{nft.creator}</p>
                  </div>

                  <div>
                    <span>Metadata URL</span>
                    <p>
                      <a href={nft.tokenURI} target="_blank" rel="noreferrer">
                        {nft.tokenURI}
                      </a>
                    </p>
                  </div>

                  <div>
                    <span>Audio Hash</span>
                    <p>{nft.audioHash}</p>
                  </div>

                  <div>
                    <span>Rights Hash</span>
                    <p>{nft.rightsHash}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCollection;