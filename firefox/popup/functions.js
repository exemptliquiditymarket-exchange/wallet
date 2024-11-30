// Function to wrap chrome.runtime.sendMessage in a Promise
function sendMessageAsync(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}

function generateJsonRpcId() {
    const now = Date.now(); // Get the current time in milliseconds
    return now.toString(16); // Convert to hexadecimal string
}

// Function to generate a random private key (32 bytes) in the browser
function generatePrivateKey() {
    return new Promise((resolve, reject) => {
      // Use Web Crypto API to generate a random 32-byte array
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
  
      // Convert the array to a hexadecimal string
      const privateKey = Array.from(array)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
  
      // Check if the private key is all zeros
      if (privateKey === '00'.repeat(32)) {
        reject(new Error("Generated private key is all zeros!"));
      } else {
        resolve(privateKey);
      }
    });
}

function createWallet() {
    generatePrivateKey().then((privateKey) => {
        console.log('Private Key:', privateKey);
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        
        const raw = JSON.stringify({
          "jsonrpc": "2.0",
          "method": "personal_importRawKey",
          "params": [
            `0x${privateKey}`,
            ""
          ],
          "id": generateJsonRpcId()
        });
        
        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow"
        };

        const network_url = localStorage.getItem("network");

        if (network_url) {
            fetch(network_url, requestOptions)
            .then((response) => response.json())
            .then(function(response){
              const address = response.result;
              console.log(`address: ${address}`);
              saveToIndexedDB("wallet", { privateKey, address });
              displayWalletInfo(address);
      
            })
            .catch((error) => console.error(error));        
        } else {

        }
    });
}

async function errorDialogCancel() {
    document.getElementById("error-dialog").style.display = "none";
}

async function showError(title, message) {
    // Safely set the title and message by using textContent
    document.getElementById("error-dialog-title").textContent = title;
    document.getElementById("error-dialog-message").textContent = message;

    // Show the error dialog
    document.getElementById("error-dialog").style.display = "block";
}

async function changeNetwork() {
    localStorage.setItem("network",this.value);
    try {
        const accounts = await sendMessageAsync({ action: 'getAccounts' });
        console.log(accounts); // Should now log the expected array or data
        const accountSelect = document.getElementById("accountSelect");

        accounts.forEach((account) => {
            const option = document.createElement("option");
            option.value = account.address;
            option.setAttribute("data-privatekey", account.privateKey);
            option.textContent = account.address; // Set the visible text
            accountSelect.appendChild(option);
        });

        const tokens = await sendMessageAsync({ action: 'getTokens' });
        const securityToken = document.getElementById("security-token");
        tokens.forEach((token) => {
            const option = document.createElement("option");
            option.value = token.contractAddress;
            option.textContent = token.contractAddress; // Set the visible text
            securityToken.appendChild(option);
        })
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
}

function importWallet() {
    document.getElementById('import-wallet-dialog').style.display='block';
}
function importWalletSubmit() {
    const privateKey = document.getElementById("import-wallet-dialog-address").value;
    if (privateKey) {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        
        const raw = JSON.stringify({
          "jsonrpc": "2.0",
          "method": "personal_importRawKey",
          "params": [
            privateKey,
            ""
          ],
          "id": generateJsonRpcId()
        });
        
        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow"
        };
        const networkUrl = localStorage.getItem("network");
        if (networkUrl !== null || networkUrl.length > 0) {
            fetch(networkUrl, requestOptions)
            .then((response) => response.json())
            .then(function(response){
              const address = response.result;
              saveToIndexedDB("wallet", { privateKey, address });
              displayWalletInfo(address);
      
            })
            .catch((error) => console.error(error));          
        } else {
            alert("Please select a network");
        }
    }
}


function displayWalletInfo(address) {
    const walletInfo = document.getElementById("wallet-info");

    // Clear existing content (if needed)
    walletInfo.textContent = '';

    // Create a new paragraph element
    const paragraph = document.createElement("p");

    // Set its text content
    paragraph.textContent = `Address: ${address}`;

    // Append the paragraph to the wallet-info container
    walletInfo.appendChild(paragraph);

    //document.getElementById("wallet-info").innerHTML = `<p>Address: ${address}</p>`;
}

function displayTokenInfo(address) {

}

// Handle account selection
function accountChange() {
    const accountId = this.value;
    if (accountId) {
        localStorage.setItem("account",accountId);
        document.getElementById("buy-token").removeAttribute("disabled");
    } else {
        document.getElementById('buy-token').setAttribute("disabled","disabled");
    }
}

function securityTokenChange() {
    const address = this.value;
    if (address) {
        document.getElementById("view-security").removeAttribute("disabled");
        // buy-security disabled is removed if totalSupply > 0 and newTokenPourchase = true
        // sell-security disabled is remove id wallet balance for token > 0 and sellingRestrictions = false
    } else {
        document.getElementById('view-security').setAttribute("disabled","disabled");
        document.getElementById('buy-security').setAttribute("disabled","disabled");
        document.getElementById('sell-security').setAttribute("disabled","disabled");
    }
}

// Handle Buy Button click
/**
 * For a wallet holder to buy ELMX Tokens to use as a unit of exchange on the ELMX exchange
 * Before a wallet can buy a ELMX Token, must check if they are whitelisted on the ELMX Token contract, 
 * when a user first registers and after they passed KYC, they are added to the ELMX Token whitelisted users.
 * 
 * invoking the https://rpc.exemptliuiditymartket.exchange/checkWallet passing wallet in the request.body
 * and return either truwe (for whitelisted) or false (not whitelisted)
 * 
 * only on a return of true will invoke the purchase dialog,
 * 1. Asks for how much in USD and shows actual ELM Tokens based on Stripes fees
 * 2. Upon submit, verifies the wallet has a stripe connect account, if not report the error to have to logged in the exchange portal
 * 3. then hand off to stripe to make the charge and deposit into the stripe connect account for the wallet
 * 4. stripe webhook returns to upodate???
 */
function buyToken() {
    document.getElementById('buy-elmxtoken-dialog').style.display='block';
}
function buyELMXTokenDialogSubmit() {
    const accountId = accountSelect.value;
    if (accountId) {
        const amount = prompt('Enter amount to buy:');
        if (amount) {
        fetch('http://localhost:5656/buyCrypto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountId, amount: parseFloat(amount) })
        })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error('Error buying crypto:', error));
        }
    } else {
        alert('Please select an account first.');
    }
}

// Handle other buttons similarly (Sell, Import Token, etc.)
function sellSecurityToken() {
    alert('Sell Token functionality not implemented yet.');
}

function importSecurity() {
    document.getElementById('import-token-dialog').style.display='block';
    //const contractAddress = prompt("Enter your security token contract address:");
}

function importTokenDialogSubmit() {
    const contractAddress = document.getElementById("import-token-dialog-address").value;
    if (contractAddress) {
        saveToIndexedDB("tokens", { contractAddress });
    }
    document.getElementById('import-token-dialog').style.display='none';
}

function buySecurity() {
    alert('Buy Security Token functionality not implemented yet.');
}

function importTokenDialogCancel() {
    document.getElementById('import-token-dialog').style.display='none';
}

function importWalletDialogCancel() {
    document.getElementById('import-wallet-dialog').style.display='none';
}

function buyELMXTokenDialogCancel() {
    document.getElementById('buy-elmxtoken-dialog').style.display='none';
}

function viewTokenDialogCancel() {
    document.getElementById("view-token-dialog-cancel"),style.display = 'none';
}

function viewTokenSecurity() {
    // make eth_call to get name, symbol, total supply and wallet holder balance, if any?
    getTokenName(this.value);
    document.getElementById("view-token-dialog-cancel").style.display = 'block';
}

// DATABASE
function saveToIndexedDB(storeName, data) {
    const request = indexedDB.open("ELMXWalletDB", 2);
    request.onupgradeneeded = () => {
        const db = request.result;
        //db.createObjectStore(storeName, { keyPath: "address" });
        db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
    };
    request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        store.put(data);
        tx.oncomplete = () => console.log("Wallet saved!");
    };
}


async function readAllAddresses(storeName) {
    return new Promise((resolve,reject) => {
        const request = indexedDB.open("ELMXWalletDB", 2);

        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
    
            // Open a cursor to iterate over all the records in the object store
            const cursorRequest = store.openCursor();
    
            const allData = [];
            
            cursorRequest.onsuccess = () => {
                const cursor = cursorRequest.result;
                if (cursor) {
                    // Push each data into the allData array
                    allData.push(cursor.value);
                    // Move the cursor to the next record
                    cursor.continue();
                } else {
                    console.log("All wallet data fetched.");
                    resolve(null, allData); // Pass all the collected data to callback
                }
            };
    
            cursorRequest.onerror = () => {
                console.error("Error reading all wallet data:", cursorRequest.error);
                reject(cursorRequest.error, null); // Handle error
            };
    
            tx.oncomplete = () => console.log("Read operation complete!");
        };
    
        request.onerror = () => {
            console.error("Error opening IndexedDB:", request.error);
            reject(request.error, null); // Handle error in opening the database
        };    
    })
}

// RPC-JSON
function decodeTokenName(data) {
    // Remove the "0x" prefix if present
    if (data.startsWith("0x")) {
        data = data.slice(2);
    }

    // Convert hex string to binary
    let stringData = "";
    for (let i = 0; i < data.length; i += 2) {
        const hexByte = data.slice(i, i + 2);
        stringData += String.fromCharCode(parseInt(hexByte, 16));
    }

    // Return the string
    return stringData;
}


function getTokenName(address) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    const raw = JSON.stringify({
      "jsonrpc": "2.0",
      "method": "eth_call",
      "params": [
        {
          "to": `0x${address}`,
          "data": "0x06fdde03"
        },
        "latest"
      ],
      "id": generateJsonRpcId()
    });
    
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };
    
    fetch("https://test.exemptliquiditymarket.exchange", requestOptions)
      .then((response) => response.json())
      .then(function(result){
        console.log(result)
        const name = decodeTokenName(result.result);
        console.log(name)
        document.getElementById("view-token-dialog-name").value = name;
      })
      .catch((error) => console.error(error));    
}