import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import MintMusic from "./pages/MintMusic";
import SearchNFT from "./pages/SearchNFT";
import VerifyAudio from "./pages/VerifyAudio";
import VerifyFingerprint from "./pages/VerifyFingerprint";
import UpdateMetadata from "./pages/UpdateMetadata";
import RoyaltyInfo from "./pages/RoyaltyInfo";
import TransferNFT from "./pages/TransferNFT";
import ApprovalManager from "./pages/ApprovalManager";
import MyCollection from "./pages/MyCollection";
import TypingTitle from "./components/TypingTitle";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="animated-bg">
        <div className="orb orb-one"></div>
        <div className="orb orb-two"></div>
        <div className="orb orb-three"></div>
      </div>

      <div className="app-shell">
        <aside className="sidebar glass-panel">
          <div className="logo-box">
            <div className="logo">♪</div>
            <div>
              <h1>SoundRights</h1>
              <p>Music NFT Copyright</p>
            </div>
          </div>

          <nav className="nav-menu">
            <NavLink to="/" end>
              Mint NFT
            </NavLink>

            <NavLink to="/search">
              Search NFT
            </NavLink>

            <NavLink to="/collection">
              My Collection
            </NavLink>

            <NavLink to="/verify">
              Verify Audio
            </NavLink>

            <NavLink to="/fingerprint">
              Audio Fingerprint
            </NavLink>

            <NavLink to="/royalty">
              Royalty Info
            </NavLink>

            <NavLink to="/transfer">
              Transfer Ownership
            </NavLink>

            <NavLink to="/approval">
              Approval Manager
            </NavLink>

            <NavLink to="/update">
              Update Metadata
            </NavLink>
          </nav>

          <div className="sidebar-note">
            <p>Security Model</p>
            <strong>CIA + Blockchain</strong>

            <hr style={{ margin: "12px 0", opacity: 0.2 }} />

            <p>
              C: Hash only
              <br />
              I: SHA-256 + Fingerprint
              <br />
              A: Blockchain storage
            </p>
          </div>
        </aside>

        <main className="main-area">
          <section className="hero hero-web3">
            <div className="hero-left">
              <span className="pill">
                Blockchain Music Registry
              </span>

              <TypingTitle />

              <p>
                Register music ownership, generate audio hashes, compare
                fingerprints, verify authenticity, manage royalties and transfer
                copyright ownership with NFT technology.
              </p>

              <div className="hero-actions">
                <NavLink to="/" className="hero-btn primary">
                  Mint NFT
                </NavLink>

                <NavLink to="/collection" className="hero-btn secondary">
                  My Collection
                </NavLink>
              </div>
            </div>

            <div className="hero-right">
              <div className="mini-nft-card">
                <div className="mini-cover">♪</div>
                <h3>Music Copyright NFT</h3>
                <p>ERC721 · ERC2981 · SHA-256</p>

                <div className="mini-row">
                  <span>Network</span>
                  <strong>Sepolia</strong>
                </div>

                <div className="mini-row">
                  <span>Security</span>
                  <strong>CIA Model</strong>
                </div>
              </div>
            </div>

            <div className="marquee">
              <div className="marquee-track">
                <span>Confidentiality: Hash only</span>
                <span>Integrity: SHA-256 + Fingerprint</span>
                <span>Availability: On-chain query</span>
                <span>Royalty: ERC2981</span>
                <span>Ownership: ERC721 Transfer</span>
                <span>Copyright Check: Audio Reuse Detection</span>

                <span>Confidentiality: Hash only</span>
                <span>Integrity: SHA-256 + Fingerprint</span>
                <span>Availability: On-chain query</span>
                <span>Royalty: ERC2981</span>
                <span>Ownership: ERC721 Transfer</span>
                <span>Copyright Check: Audio Reuse Detection</span>
              </div>
            </div>
          </section>

          <section className="page-card glass-panel">
            <Routes>
              <Route path="/" element={<MintMusic />} />
              <Route path="/search" element={<SearchNFT />} />
              <Route path="/collection" element={<MyCollection />} />
              <Route path="/verify" element={<VerifyAudio />} />
              <Route path="/fingerprint" element={<VerifyFingerprint />} />
              <Route path="/royalty" element={<RoyaltyInfo />} />
              <Route path="/transfer" element={<TransferNFT />} />
              <Route path="/approval" element={<ApprovalManager />} />
              <Route path="/update" element={<UpdateMetadata />} />
            </Routes>
          </section>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;