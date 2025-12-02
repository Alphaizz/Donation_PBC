// ==========================================
// 1. CONFIGURATION
// ==========================================

// Your Sepolia V2 Contract Address
const CONTRACT_ADDRESS = "0xBA4fd9e889e6535B272a22c0b29A280a91d68686"; 

// Your V2 ABI
const CONTRACT_ABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "donor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "DonationReceived", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "milestoneIndex", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "proofHash", "type": "string" }], "name": "MilestoneVerified", "type": "event" },
  { "inputs": [{ "internalType": "address payable", "name": "_charity", "type": "address" }, { "internalType": "string", "name": "_title", "type": "string" }, { "internalType": "uint256", "name": "_goal", "type": "uint256" }, { "internalType": "uint256", "name": "_milestones", "type": "uint256" }], "name": "createProject", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_projectId", "type": "uint256" }], "name": "donate", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_projectId", "type": "uint256" }], "name": "getProject", "outputs": [
      { "internalType": "string", "name": "", "type": "string" }, 
      { "internalType": "uint256", "name": "", "type": "uint256" }, 
      { "internalType": "uint256", "name": "", "type": "uint256" }, 
      { "internalType": "uint256", "name": "", "type": "uint256" }, 
      { "internalType": "uint256", "name": "", "type": "uint256" }, 
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_projectId", "type": "uint256" }, { "internalType": "string", "name": "_ipfsHash", "type": "string" }], "name": "submitMilestoneProof", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_projectId", "type": "uint256" }], "name": "verifyMilestone", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

// ==========================================
// 2. APP LOGIC
// ==========================================
let web3;
let contract;
let userAccount;
const PROJECT_ID = 2; // Assuming Project #1 is the main active one

const connectBtn = document.getElementById("connectButton");
const donateBtn = document.getElementById("donateButton");
const uploadBtn = document.getElementById("uploadButton");
const verifyBtn = document.getElementById("verifyButton");

// --- PASSIVE AUTO CONNECT ---
window.addEventListener('load', async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts(); 
        if (accounts.length > 0) {
            handleLogin(accounts[0]);
        }
    } else {
        console.log("MetaMask not found");
    }
});

function handleLogin(account) {
    userAccount = account;
    window.userAccount = account;
    
    // Update Navbar UI
    const wrapper = document.getElementById("connectWrapper");
    const badge = document.getElementById("walletDisplay");
    if(wrapper) wrapper.style.display = "none";
    if(badge) badge.style.display = "flex";
    document.getElementById("walletAddress").innerText = account.substring(0, 6) + "..." + account.substring(38);

    // Initialize Contract
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    
    // Load Dashboard Data
    updateUI();
}

window.createProjectIfMissing = async function() {
    try {
        // New Title: "School Foundation"
        // New Goal: "0.02" ETH
        await contract.methods.createProject(
            userAccount, 
            "School Foundation", 
            web3.utils.toWei("0.02", "ether"), 
            4
        ).send({from: userAccount});

        console.log("Project 2 Created!");
    } catch(e) { console.log(e); }
}

async function updateUI() {
    try {
        // 1. Get Project Stats
        const data = await contract.methods.getProject(PROJECT_ID).call();
        
        document.getElementById("projectTitle").innerText = data[0];
        document.getElementById("projectGoal").innerText = web3.utils.fromWei(data[1], "ether") + " ETH";
        
        // Show Total Raised (Index 3), NOT Balance
        document.getElementById("amountRaised").innerText = web3.utils.fromWei(data[3], "ether") + " ETH";
        
        document.getElementById("currentMilestone").innerText = data[4];
        document.getElementById("totalMilestones").innerText = data[5];

        // 2. Load The Timeline Images
        loadProofGallery();

    } catch(e) {
        console.log("Project data not found yet.");
    }
}

// --- UPDATED TIMELINE GALLERY FUNCTION ---
async function loadProofGallery() {
    const gallery = document.getElementById("proofGallery");
    if (!gallery) return;

    // Clear previous content
    gallery.innerHTML = '<p style="color: gray; font-style: italic;">Loading proofs from blockchain...</p>';

    try {
        // 1. Fetch ALL verification events (Bypassing the filter bug)
        // We use 'earliest' instead of 0 to be safer with RPC nodes
        const events = await contract.getPastEvents('MilestoneVerified', {
            fromBlock: 'earliest',
            toBlock: 'latest'
        });

        // 2. Clear Loading Text
        gallery.innerHTML = ""; 

        // 3. Manual Filter & Render
        let foundCount = 0;

        events.forEach(event => {
            // MANUAL FILTER: Only show events for our Project ID
            // We convert both to String to ensure they match (e.g. "2" == 2)
            if (String(event.returnValues.projectId) === String(PROJECT_ID)) {
                
                foundCount++;
                const milestoneIndex = event.returnValues.milestoneIndex;
                const ipfsHash = event.returnValues.proofHash;
                const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

                const cardHtml = `
                    <div style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 15px;">
                        <div style="background: var(--bg); padding: 10px; font-weight: 600; font-size: 13px; border-bottom: 1px solid var(--border); color: var(--text-main);">
                            <i class="fa-solid fa-check-circle" style="color: var(--success);"></i> 
                            Milestone #${Number(milestoneIndex) + 1} Verified
                        </div>
                        <a href="${imageUrl}" target="_blank">
                            <img src="${imageUrl}" alt="Proof" style="width: 100%; display: block; min-height: 200px; object-fit: cover;">
                        </a>
                    </div>
                `;
                gallery.innerHTML += cardHtml;
            }
        });

        // 4. Handle "No Events Found" specifically for this ID
        if (foundCount === 0) {
            gallery.innerHTML = `<p style="font-style: italic; color: var(--text-muted);">No verified milestones found for Project ${PROJECT_ID}.</p>`;
        }

    } catch (error) {
        console.error("Gallery Error:", error);
        gallery.innerHTML = `<p style="color: red;">Connection Error. Please refresh.</p>`;
    }
}
// --- BUTTON LISTENERS ---

connectBtn.addEventListener('click', async () => {
    try {
        connectBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Connecting...';
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        handleLogin(accounts[0]);
    } catch (error) {
        connectBtn.innerHTML = '<i class="fa-solid fa-wallet"></i> Connect Wallet';
    }
});

donateBtn.addEventListener('click', async () => {
    const amount = document.getElementById("donateAmount").value;
    if(!amount) return alert("Please enter an amount");

    try {
        document.getElementById("donateStatus").innerText = "Processing...";
        
        const receipt = await contract.methods.donate(PROJECT_ID).send({
            from: userAccount,
            value: web3.utils.toWei(amount, "ether")
        });

        document.getElementById("donateStatus").innerText = "Success!";
        updateUI();
        showReceipt(amount, receipt.transactionHash);

    } catch (e) {
        console.error(e);
        document.getElementById("donateStatus").innerText = "Failed.";
    }
});

uploadBtn.addEventListener('click', async () => {
    const file = document.getElementById("proofFile").files[0];
    if(!file) return alert("Select a file first");

    const formData = new FormData();
    formData.append("file", file);

    document.getElementById("uploadStatus").innerText = "Uploading to IPFS...";

    // Vercel API Path
    const res = await fetch("/api/upload-proof", { 
        method: "POST", 
        body: formData 
    });

    const data = await res.json();
    
    if(data.success) {
        document.getElementById("uploadStatus").innerText = "Signing...";
        await contract.methods.submitMilestoneProof(PROJECT_ID, data.ipfsHash).send({from: userAccount});
        alert("Proof Submitted!");
        document.getElementById("uploadStatus").innerText = "Proof Uploaded!";
    } else {
        document.getElementById("uploadStatus").innerText = "Upload Failed.";
    }
});

verifyBtn.addEventListener('click', async () => {
    try {
        document.getElementById("verifyStatus").innerText = "Verifying...";
        await contract.methods.verifyMilestone(PROJECT_ID).send({from: userAccount});
        alert("Verified! Funds Released.");
        updateUI();
        document.getElementById("verifyStatus").innerText = "Success";
    } catch(e) {
        document.getElementById("verifyStatus").innerText = "Failed. (Check wallet or proof)";
    }
});

// ==========================================
// 3. DARK MODE LOGIC
// ==========================================
const themeBtn = document.getElementById('themeToggle');
const body = document.body;
const icon = themeBtn.querySelector('i');

const savedTheme = localStorage.getItem('trustflow_theme');
if (savedTheme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
}

themeBtn.addEventListener('click', () => {
    const isDark = body.getAttribute('data-theme') === 'dark';
    if (isDark) {
        body.removeAttribute('data-theme');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('trustflow_theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('trustflow_theme', 'dark');
    }
});

// ==========================================
// 4. RECEIPT FUNCTIONS
// ==========================================

function showReceipt(amount, txHash) {
    const now = new Date();
    document.getElementById("r-date").innerText = now.toLocaleDateString().toUpperCase();
    document.getElementById("r-time").innerText = now.toLocaleTimeString();
    document.getElementById("r-donor").innerText = userAccount.substring(0,6) + "..." + userAccount.substring(38);
    document.getElementById("r-amount").innerText = amount + " ETH";
    document.getElementById("r-total").innerText = amount + " ETH";
    document.getElementById("r-hash").innerText = txHash.substring(0, 8).toUpperCase(); 
    document.getElementById("receiptModal").style.display = "flex";
}

window.downloadReceipt = async function() {
    const receiptContent = document.querySelector(".receipt-paper");
    const buttons = receiptContent.querySelectorAll(".btn"); 
    buttons.forEach(btn => btn.style.display = "none");
    try {
        const canvas = await html2canvas(receiptContent, { scale: 2, useCORS: true, backgroundColor: null });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `TrustFlow_Receipt_${Date.now()}.png`;
        link.click();
    } catch (error) {
        alert("Oops! Could not generate image.");
    } finally {
        buttons.forEach(btn => btn.style.display = "inline-block");
    }
}

window.closeReceipt = function() {
    document.getElementById("receiptModal").style.display = "none";
}