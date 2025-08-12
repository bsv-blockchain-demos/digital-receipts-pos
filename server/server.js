import express from 'express';
import cors from 'cors';
import { WalletClient, PrivateKey, KeyDeriver, SymmetricKey, Script, Utils, LookupResolver, TopicBroadcaster, Transaction } from '@bsv/sdk'
import { WalletStorageManager, Services, Wallet, StorageClient } from '@bsv/wallet-toolbox-client'
import dotenv from 'dotenv'
import crypto from 'crypto'
dotenv.config();
global.self = { crypto };

const app = express();
const PORT = process.env.PORT || 8080;

const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY;
const WALLET_STORAGE_URL = process.env.WALLET_STORAGE_URL;

const overlay = new LookupResolver({
    slapTrackers: ['https://overlay-us-1.bsvb.tech'],
    additionalHosts: {
        'ls_anytx': ['https://overlay-us-1.bsvb.tech']
    }
});

console.log("SERVER_PRIVATE_KEY", SERVER_PRIVATE_KEY);
console.log("WALLET_STORAGE_URL", WALLET_STORAGE_URL);

const walletClient = await createWalletClient(SERVER_PRIVATE_KEY, WALLET_STORAGE_URL, 'main');
console.log("walletClient", walletClient);

// Middleware
app.use(cors());
app.use(express.json());

// Create receipt endpoint
app.post('/create-receipt', async (req, res) => {
    const receiptData = req.body.receiptData;

    const timestamp = new Date().toISOString();
    let receiptTX;
    let symkeyString;
    try {
        // Encrypt receipt data
        const symmetricKey = SymmetricKey.fromRandom();
        symkeyString = symmetricKey.toHex();
        const encryptedReceipt = await encryptJSON(receiptData, symmetricKey);
        const encryptedReceiptHex = Utils.toHex(Utils.toArray(encryptedReceipt));

        const lockingScript = Script.fromASM(`OP_FALSE OP_RETURN ${encryptedReceiptHex}`).toHex();
        console.log("lockingScript", lockingScript);

        // Put encrypted receipt data on blockchain
        receiptTX = await walletClient.createAction({
            description: "Receipt",
            outputs: [
                {
                    outputDescription: "Receipt",
                    satoshis: 1,
                    lockingScript: lockingScript,
                },
            ],
        });

        broadcastTransaction(receiptTX);
    } catch (error) {
        console.error("Error creating receipt:", error);
        res.status(500).json({ error: "Failed to create receipt" });
        return;
    }

    console.log("receiptTX", receiptTX);
    const txid = receiptTX.txid;

    // Send back only the txid and decryption keyring
    res.json({ symkeyString, timestamp, txid });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});

async function broadcastTransaction(response) {
    try {
        // broadcast transaction to overlay
        // Capture the resulting transaction
        const tx = Transaction.fromBEEF(response.tx);

        // Lookup a service which accepts this type of token
        const tb = new TopicBroadcaster(['tm_anytx'], {
            resolver: overlay,
            requireAcknowledgmentFromSpecificHostsForTopics: {
              'ls_anytx': ['https://overlay-us-1.bsvb.tech']
            }
          })

        // Send the tx to that overlay.
        const overlayResponse = await tx.broadcast(tb)
        console.log("Overlay response: ", overlayResponse);
    } catch (error) {
        console.error("Error broadcasting file integrity tx:", error);
    }
}

const createWalletClient = async (keyHex, walletStorageUrl, chain) => {
    const rootKey = PrivateKey.fromHex(keyHex)
    const keyDeriver = new KeyDeriver(rootKey)
    const storage = new WalletStorageManager(keyDeriver.identityKey)
    const services = new Services(chain)
    const wallet = new Wallet({
        chain,
        keyDeriver,
        storage,
        services,
    })
    const client = new StorageClient(wallet, walletStorageUrl)
    await storage.addWalletStorageProvider(client)
    await storage.makeAvailable()
    return new WalletClient(wallet)
}

const encryptJSON = async (data, key) => {
    const jsonString = JSON.stringify(data);
    return key.encrypt(jsonString);
}