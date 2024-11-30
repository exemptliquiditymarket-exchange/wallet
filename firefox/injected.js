// injected.js
let connected = false;

// Create and define the window.ethereum object
window.elmx = { 
    ethereum : {
        request: async ({ method, params }) => {
            console.log(method)
            if (method === 'eth_requestAccounts') {
                return await handleEthereumRequest();
            } else if (method === 'eth_sendTransaction') {
                return await sendTransaction(params);
            }
            // Implement other methods as needed
            throw new Error(`Method ${method} not supported`);
        },
        isConnected: async () => {
            return connected;
        },
        getSigner: async () => {

        },
        signMessage: async ({message}) => {

        },
    }
};

// Function to request Ethereum accounts
async function handleEthereumRequest() {
    return new Promise((resolve, reject) => {
        // Check if already connected
        if (!window.ethereum.isConnected) {
            // Send message to content script to show the popup
            window.postMessage({ type: 'SHOW_POPUP' }, '*');
            reject('Ethereum wallet not connected');
        } else {
            // Proceed with request if connected
            window.postMessage({
                type: 'ETHEREUM_REQUEST',
                method: 'eth_requestAccounts',
            }, '*');

            window.addEventListener('message', function(event) {
                if (event.data && event.data.type === 'ETHEREUM_RESPONSE' && event.data.method === 'eth_requestAccounts') {
                    resolve(event.data.accounts);
                }
            });
        }
    });
}

async function sendTransaction(params) {
    return new Promise((resolve, reject) => {
        window.postMessage({
            type: 'ETHEREUM_REQUEST',
            method: 'eth_sendTransaction',
        }, '*');

        // Listen for response from the content script
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'ETHEREUM_RESPONSE' && event.data.method === 'eth_sendTransaction') {
                // invoke eth_rpc to connected network passing parameters and returning transaction hash
                resolve(event.data.transaction);
            }
        });
    })
}


console.log('window.ethereum injected');
