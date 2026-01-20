# 🌊 TrustFlow
> **Transparent. Secure. Decentralized.**
> *Redefining charity through the power of Blockchain and IPFS.*

>https://vercel.com/alphaizzs-projects/donation-pbc

## 📜 Overview

**TrustFlow** is a decentralized application (dApp) built to solve the lack of transparency in traditional charity systems. By leveraging the **Ethereum Blockchain** and **IPFS (InterPlanetary File System)**, TrustFlow ensures that every donation is tracked, locked, and only released when real-world impact is proven.

No more blind giving. Funds are held in a secure **Smart Contract Escrow** and are released in milestones only *after* the charity provides photographic proof of their work.

---

## ✨ Key Features

* **🛡️ Smart Contract Escrow:** Donations are locked on-chain and cannot be withdrawn by the charity immediately.
* **📸 Proof-of-Work Verification:** Charities must upload image proofs to **IPFS** via Pinata to unlock funds.
* **🔓 Milestone-Based Release:** Funds are released in stages (e.g., 25% per milestone) to ensure continuous progress.
* **⚖️ Decentralized Governance:** Donors/Admins verify the proofs before the smart contract releases the ETH.
* **🌐 Web3 Integration:** Seamless login and transaction signing via **MetaMask**.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Blockchain** | ![Solidity](https://img.shields.io/badge/Solidity-%23363636.svg?style=flat&logo=solidity&logoColor=white) | Smart Contracts (ERC-20 logic & Escrow) |
| **Network** | ![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=flat&logo=Ethereum&logoColor=white) | Deployed on **Sepolia Testnet** |
| **Frontend** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | Vanilla JS + Web3.js for blockchain interaction |
| **Storage** | ![IPFS](https://img.shields.io/badge/IPFS-65C2CB?style=flat&logo=ipfs&logoColor=white) | Decentralized image storage via **Pinata API** |
| **Backend** | ![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white) | Serverless API (Vercel) for secure key management |
| **Hosting** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white) | CI/CD and Deployment |

---

## 📂 Project Structure

```bash
trustflow/
├── api/                  # Python Backend (Serverless)
│   ├── index.py          # Handles IPFS uploads securely
│   └── requirements.txt  # Python dependencies
├── public/               # Frontend Assets
│   ├── index.html        # Main User Interface
│   ├── style.css         # Aesthetic Dark Mode Styles
│   └── app_v2.js         # Web3 Logic & Smart Contract Integration
├── contracts/            # Solidity Source Code
│   └── TrustFlow.sol     # The Escrow Smart Contract
└── vercel.json           # Vercel Routing Configuration
```
## 🚀 How It Works

1.  **Donation:** A user connects their wallet and donates ETH. The funds are sent to the **Smart Contract**, not the charity's wallet.
2.  **Milestone:** The charity completes a task (e.g., *"Digging the well foundation"*).
3.  **Proof:** The charity uploads a photo. The image is stored on **IPFS**, and the hash is sent to the blockchain.
4.  **Verification:** The Admin reviews the photo on the dApp dashboard.
5.  **Release:** Upon approval, the smart contract automatically releases the allocated portion of funds to the charity.

---

## 💻 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) & [Python](https://www.python.org/) installed.
* [MetaMask](https://metamask.io/) browser extension.
* A [Pinata](https://www.pinata.cloud/) account for IPFS keys.

### Installation

1.  **Clone the repo**
    ```bash
    git clone [https://github.com/yourusername/trustflow.git](https://github.com/yourusername/trustflow.git)
    cd trustflow
    ```

2.  **Install Python Dependencies**
    ```bash
    cd api
    pip install -r requirements.txt
    ```

3.  **Run Locally (Optional)**
    * You can use `vercel dev` or simply open `index.html` with Live Server (for frontend-only testing).

---

## 🔒 Security

* **Anti-Overdraft:** Smart contract checks balances before every transfer.
* **Admin-Only Verification:** `onlyAdmin` modifiers ensure high-level security for fund release.
* **Key Protection:** API keys are stored in backend environment variables, never exposed to the client.

---

## 📄 License

This project was built by Alfaizz Dyandra Ardin

<br>

<p align="center">
  Built with ❤️ for a better world.
</p>
