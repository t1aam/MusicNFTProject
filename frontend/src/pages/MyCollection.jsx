import { useState } from "react";
import { getContractReadOnly } from "../services/contract";

function MyCollection({ account, connectWallet }) {
  const [nfts, setNfts] = useState([]);
  const [status, setStatus] = useState("");
  const [prices, setPrices] = useState({});

  function getSavedPrice(tokenId) {
    return localStorage.getItem(`nft_price_${tokenId}`) || "";
  }

  function handlePriceChange(tokenId, value) {
    setPrices((prev) => ({
      ...prev,
      [tokenId]: value,
    }));
  }

  function savePrice(tokenId) {
    const price = prices[tokenId] ?? getSavedPrice(tokenId);

    if (!price || Number(price) <= 0) {
      setStatus("Vui lòng nhập giá hợp lệ.");
      return;
    }

    localStorage.setItem(`nft_price_${tokenId}`, price);
    setStatus(`Đã lưu giá cho Token #${tokenId}: ${price} ETH.`);
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
            savedPrice: getSavedPrice(tokenId),
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
          {nfts.map((nft) => {
            const currentPrice =
              prices[nft.tokenId] ?? getSavedPrice(nft.tokenId);

            return (
              <div className="collection-card" key={nft.tokenId}>
                <div className="collection-art">♪</div>

                <div className="collection-content">
                  <div className="collection-top">
                    <div>
                      <p className="section-label">Token #{nft.tokenId}</p>
                      <h3>{nft.title}</h3>
                      <p className="muted">{nft.artist}</p>
                    </div>

                    <div className="price-box">
                      <span>Định giá</span>
                      <div className="price-input-row">
                        <input
                          type="number"
                          min="0"
                          step="0.001"
                          placeholder="ETH"
                          value={currentPrice}
                          onChange={(e) =>
                            handlePriceChange(nft.tokenId, e.target.value)
                          }
                        />
                        <button
                          className="price-btn"
                          onClick={() => savePrice(nft.tokenId)}
                        >
                          Lưu
                        </button>
                      </div>

                      {currentPrice && (
                        <strong>{currentPrice} ETH</strong>
                      )}
                    </div>
                  </div>

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
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyCollection;