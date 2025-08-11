import express from 'express';
import cors from 'cors';
import { WalletClient, PrivateKey, KeyDeriver, SymmetricKey } from '@bsv/sdk'
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

// Create receipt endpoint
app.get('/create-receipt', (req, res) => {
    const timestamp = new Date().toISOString();
    //const walletClient = createWalletClient(SERVER_PRIVATE_KEY, WALLET_STORAGE_URL, 'main');

    // Any and all information that is needed to create a receipt
    // Can be put into this JSON object
    const dummyReceipt = JSON.stringify({
        id: "123456",
        store: "My Store",
        timestamp: timestamp,
    });

    // Encrypt dummyReceipt
    const symmetricKey = SymmetricKey.fromRandom();
    const symkeyString = symmetricKey.toString();
    const encryptedReceipt = encryptJSON(dummyReceipt, symmetricKey);

    // Put encrypted receipt data on blockchain
    // const receiptTX = walletClient.createAction({

    // });

    const txid = "123456"; // receiptTX.txid

    // Send back only the txid and decryption keyring
    res.json({ encryptedReceipt, symkeyString, timestamp, txid });
});

// Decrypt receipt endpoint
app.get('/decrypt-receipt', (req, res) => {
    const { txid, symkeyString } = req.query;
    const encryptedReceipt = fetch(`http://localhost:8080/txid/${txid}`).then((res) => res.json()); //TODO arc taal or overlay
    const symmetricKey = SymmetricKey.fromString(symkeyString);
    const decryptedReceipt = decryptJSON(encryptedReceipt, symmetricKey);
    res.json({ decryptedReceipt });
});

// Save receipt endpoint
app.get('/save-receipt', (req, res) => {
    const { encryptedReceipt, symkeyString, timestamp, txid } = req.query;
    // TODO save encryptedReceipt and symkeyString to local storage
    res.json({ success: true });
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

function encryptJSON(data, key) {
    const jsonString = JSON.stringify(data);
    return key.encrypt(jsonString);
}

function decryptJSON(encryptedData, key) {
    const jsonString = key.decrypt(encryptedData, 'utf8');
    return JSON.parse(jsonString);
}