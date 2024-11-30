const express = require('express');
const https = require('follow-redirects').https;
const axios = require('axios');
const app = express();
const port = 5656;

// Middleware to parse JSON bodies
app.use(express.json());

// Function to convert wei (in hex) to ETH
function weiToEth(weiHex) {
    const wei = BigInt(weiHex); // Convert hex string to BigInt
    const eth = Number(wei) / 1e18; // Convert to ETH by dividing by 10^18
    return eth;
}

function generateJsonRpcId() {
    const now = Date.now(); // Get the current time in milliseconds
    return now.toString(16); // Convert to hexadecimal string
}

// Function to get the latest ETH to USD price from CoinGecko API
const getEthToUsdPrice = async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      return response.data.ethereum.usd;
    } catch (error) {
      throw new Error('Failed to fetch ETH to USD price');
    }
  };
  

// Define the /getBalance endpoint
app.post('/getBalance', (req, res) => {
  // Extract the wallet address from the request body
  const { url, walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required.' });
  }

  const options = {
    'method': 'POST',
    'hostname': url,
    'path': '/',
    'headers': {
      'Content-Type': 'application/json',
    },
    'maxRedirects': 20,
  };

  // Create the request data with the wallet address from the body
  const reqData = JSON.stringify({
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": [
      walletAddress,  // Use the provided wallet address
      "latest"
    ],
    "id": generateJsonRpcId()
  });

  // Make the API request to get the balance
  const apiRequest = https.request(options, (apiRes) => {
    let chunks = [];

    apiRes.on("data", (chunk) => {
      chunks.push(chunk);
    });

    apiRes.on("end", () => {
      const body = Buffer.concat(chunks);
      // Return the response body as the response to our API
      let response = JSON.parse(body.toString());
      response['WEI']= parseInt(response['result'], 16); 
      response['ETH'] = weiToEth(response['result']);
      // Now call the CoinGecko API to get the ETH to USD price
      getEthToUsdPrice()
        .then(price => {
          // Convert the ETH balance to USD
          const balanceInUsd = response['ETH'] * price;
          response['USD'] = balanceInUsd.toFixed(2);
          res.json(response);
        })
        .catch(error => {
          res.status(500).json({ error: 'Error fetching ETH to USD price.' });
        });
    });

    apiRes.on("error", (error) => {
      // Handle any errors in the external request
      res.status(500).json({ error: error.message });
    });
  });

  // Send the request data to the external API
  apiRequest.write(reqData);
  apiRequest.end();
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
