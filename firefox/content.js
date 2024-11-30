// content.js

// Inject the Ethereum provider script into the webpage
const script = document.createElement('script');
script.src = browser.runtime.getURL('injected.js');
(document.head || document.documentElement).appendChild(script);

// Handle requests from the webpage
window.addEventListener('message', async (event) => {
    if (event.source !== window || !event.data || event.data.type !== 'ETHEREUM_REQUEST') return;

    const { method } = event.data;

    if (method === 'eth_requestAccounts') {
        try {
            const accounts = await browser.runtime.sendMessage({ method: 'eth_requestAccounts' });
            //const accounts = await loadWalletAccounts();
            console.log(accounts)
            window.postMessage({
                type: 'ETHEREUM_RESPONSE',
                method: 'eth_requestAccounts',
                accounts: accounts
            }, '*');
        } catch (error) {
            console.error('Error handling Ethereum request:', error);
        }
    } else if (method === 'eth_sendTransaction') {
        try {
            const transaction = await browser.runtime.sendMessage({ method: 'eth_sendTransaction' });
            window.postMessage({
                type: 'ETHEREUM_RESPONSE',
                method: 'eth_sendTransaction',
                transaction: transaction
            }, '*');
        } catch (error) {
            console.error('Error handling Ethereum request:', error);
        }
    }
});
