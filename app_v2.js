// ==========================================
// 1. CONFIGURATION
// ==========================================

// Your Sepolia V2 Contract Address
const CONTRACT_ADDRESS = "0xBA4fd9e889e6535B272a22c0b29A280a91d68686"; 

// Your V2 ABI (Includes totalRaised output)
const CONTRACT_ABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "donor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "DonationReceived", "type": "event" },
  { "inputs": [{ "internalType": "address payable", "name": "_charity", "type": "address" }, { "internalType": "string", "name": "_title", "type": "string" }, { "internalType": "uint256", "name": "_goal", "type": "uint256" }, { "internalType": "uint256", "name": "_milestones", "type": "uint256" }], "name": "createProject", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_projectId", "type": "uint256" }], "name": "donate", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_projectId", "type": "uint256" }], "name": "getProject", "outputs": [
      { "internalType": "string", "name": "", "type": "string" }, 
      { "internalType": "uint256", "name": "", "type": "uint256" }, 
      { "internalType": "uint256", "name": "", "type": "uint256" }, // Current Balance
      { "internalType": "uint256", "name": "", "type": "uint256" }, // Total Raised (History)
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
const PROJECT_ID = 1; // ID 1 for new contract

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
    }
});

function handleLogin(account) {
    userAccount = account;
    window.userAccount = account;
    
    // UI Updates
    const wrapper = document.getElementById("connectWrapper");
    const badge = document.getElementById("walletDisplay");
    if(wrapper) wrapper.style.display = "none";
    if(badge) badge.style.display = "flex";
    document.getElementById("walletAddress").innerText = account.substring(0, 6) + "..." + account.substring(38);

    // Initialize Contract
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    
    // Auto-popup disabled. Run "window.createProjectIfMissing()" in console if needed.
    updateUI();
}

// Function exposed to window for manual creation
window.createProjectIfMissing = async function() {
    try {
        await contract.methods.createProject(userAccount, "Clean Water #1", web3.utils.toWei("0.01", "ether"), 4).send({from: userAccount});
        console.log("Project created");
    } catch(e) { console.log(e); }
}

async function updateUI() {
    try {
        const data = await contract.methods.getProject(PROJECT_ID).call();
        
        document.getElementById("projectTitle").innerText = data[0];
        document.getElementById("projectGoal").innerText = web3.utils.fromWei(data[1], "ether") + " ETH";
        
        // Use data[3] (Total Raised) to prevent number going down
        document.getElementById("amountRaised").innerText = web3.utils.fromWei(data[3], "ether") + " ETH";
        
        document.getElementById("currentMilestone").innerText = data[4];
        document.getElementById("totalMilestones").innerText = data[5];
    } catch(e) {
        console.log("Project not found yet. Run createProjectIfMissing() in console.");
    }
}

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

    // Vercel Path
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
        document.getElementById("verifyStatus").innerText = "Failed.";
    }
});

// --- DARK MODE LOGIC ---
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

// --- RECEIPT FUNCTIONS ---
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