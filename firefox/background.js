const content_script = document.createElement('script');
content_script.src = browser.runtime.getURL('content.js');
(document.head || document.documentElement).appendChild(content_script);

// Open or create an IndexedDB database
const openDB = (storeName) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ELMXWalletDB', 2);
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
        }
      };
  
      request.onsuccess = (event) => {
        resolve(event.target.result);  // Return the database object
      };
  
      request.onerror = (event) => {
        reject('Error opening database: ' + event.target.errorCode);
      };
    });
};
  
// Save data to IndexedDB
const saveToIndexedDB = async(storeName, data) => {
    openDB(storeName).then((db) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      store.put(data);  // Insert or update the data in the store
  
      transaction.oncomplete = () => {
        console.log("Data saved successfully!");
      };
  
      transaction.onerror = (event) => {
        console.error("Error saving data:", event.target.error);
      };
    });
};
  
  // Read all data from a specific object store
const readFromIndexedDB = async(storeName) => {
    return new Promise((resolve, reject) => {
      openDB(storeName).then((db) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();  // Get all data from the store
  
        request.onsuccess = () => {
          resolve(request.result);  // Return the data from the store
        };
  
        request.onerror = (event) => {
          reject('Error reading data: ' + event.target.errorCode);
        };
      });
    });
};

// Example: Interact with the ELMX Network's RPC endpoint
async function getBalance(address) {
    const response = await fetch("http://localhost:5656/getBalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address })
    });
    const data = await response.json();
    return data.balance;
}

// Listen for messages from the popup
browser.runtime.onMessage.addListener(async(message, sender, sendResponse) => {
    let response = true;

    if (message.action === "getBalance") {
        getBalance(message.address).then(balance => sendResponse({ balance }));
        return true; // Keep the message channel open for async response
    } else if (message.action === 'saveAccount') {
    } else if (message.action === 'getAccounts') {
        // Retrieve accounts from IndexedDB
        await readFromIndexedDB('wallet').then((accounts) => {
            //console.log(accounts)
            sendResponse({ accounts });
            response = accounts;
          }).catch((error) => {
            console.error(error);
            sendResponse({ error: 'Failed to read tokens' });
            response = { error: 'Failed to read tokens' };
          });  
    } else if (message.action === 'saveToken') {
        // Save a token to IndexedDB
        await saveToIndexedDB('tokens', message.data);
    } else if (message.action === 'getTokens') {
        // Retrieve tokens from IndexedDB
        await readFromIndexedDB('tokens').then((tokens) => {
            //console.log(tokens);
            sendResponse({ tokens });
            response = tokens;
        }).catch((error) => {
            console.error(error);
            sendResponse({ error: 'Failed to read tokens' });
            response = { error: 'Failed to read tokens' };
        });
    } else if (message.action === 'getTokenName') {
    } else if (message.action === 'getTokenSymbol') {
    } else if (message.action === 'getTokenTotalSupply') {
    } else if (message.action === 'getTokenBalance') {
    }

    return response;
});

// Example: Listen for a click event on the extension icon (in case you need to perform an action before showing the popup)
browser.action.onClicked.addListener(async() => {
    console.log('Extension icon clicked');

    // You can perform some background logic here, such as modifying the popup content
    const accounts = await readAllAddresses("wallet");
    console.log(accounts);

});


browser.action.setIcon({ path: "icons/icon-48.png" });
browser.action.setPopup({ popup: "popup/popup.html" });

chrome.runtime.onInstalled.addListener(() => {
  console.log('Service worker installed.');
});