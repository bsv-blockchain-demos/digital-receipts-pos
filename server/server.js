import express from 'express';
import cors from 'cors';
import { WalletClient, PrivateKey, KeyDeriver } from '@bsv/sdk'
import { WalletStorageManager, Services, Wallet, StorageClient } from '@bsv/wallet-toolbox-client'
import dotenv from 'dotenv'
import crypto from 'crypto'

const app = express();
const PORT = process.env.PORT || 8080;

const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY;
const WALLET_STORAGE_URL = process.env.WALLET_STORAGE_URL;

console.log("SERVER_PRIVATE_KEY", SERVER_PRIVATE_KEY);
console.log("WALLET_STORAGE_URL", WALLET_STORAGE_URL);

// Middleware
app.use(cors());
app.use(express.json());

// Create receipt endpoint - migrated from Next.js API route
app.get('/create-receipt', (req, res) => {
    const timestamp = new Date().toISOString();
    //const walletClient = createWalletClient(SERVER_PRIVATE_KEY, WALLET_STORAGE_URL, 'main');

    const dummyReceipt = JSON.stringify({
        id: "123456",
        store: "My Store",
        timestamp: timestamp,
    });

    // TODO: Encrypt dummyReceipt

    // TODO: Put encrypted receipt data on blockchain
    // const receiptTX = walletClient.createAction({

    // });

    // TODO: Send back only the txid and decryption keyring
    res.json({ dummyReceipt });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});

global.self = { crypto };
dotenv.config();

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