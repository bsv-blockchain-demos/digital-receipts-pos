import { WalletClient, PrivateKey, KeyDeriver, SymmetricKey, Script, Utils, LookupResolver, Transaction, TopicBroadcaster } from '@bsv/sdk'
import { WalletStorageManager, Services, Wallet, StorageClient } from '@bsv/wallet-toolbox-client'
import { NextResponse } from 'next/server'

const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY;
const WALLET_STORAGE_URL = process.env.WALLET_STORAGE_URL;

async function broadcastTransaction(response) {
    try {
        // broadcast transaction to overlay
        // Capture the resulting transaction
        const tx = Transaction.fromBEEF(response.tx);

        const overlay = new LookupResolver({
            slapTrackers: ['https://overlay-us-1.bsvb.tech'],
            hostOverrides: {
                'ls_anytx': ['https://overlay-us-1.bsvb.tech']
            }
        });
        
        // Lookup a service which accepts this type of token
        const tb = new TopicBroadcaster(['tm_anytx'], {
            resolver: overlay,
          })

        // Send the tx to that overlay.
        const overlayResponse = await tx.broadcast(tb)
        console.log("Overlay response: ", overlayResponse);
    } catch (error) {
        console.error("Error broadcasting file integrity tx:", error);
    }
}

const encryptJSON = async (data, key) => {
    const jsonString = JSON.stringify(data);
    return key.encrypt(jsonString);
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

const walletClient = await createWalletClient(SERVER_PRIVATE_KEY, WALLET_STORAGE_URL, 'main');

export async function POST(req) {
    const { receiptData } = await req.json();

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
            randomizeOutputs: false,
        });

        broadcastTransaction(receiptTX);
    } catch (error) {
        console.error("Error creating receipt:", error);
        return NextResponse.json({ error: "Failed to create receipt" }, { status: 500 });
    }

    const txid = receiptTX.txid;

    // Send back only the txid and decryption keyring
    return NextResponse.json({ symkeyString, timestamp, txid }, { status: 200 });
}