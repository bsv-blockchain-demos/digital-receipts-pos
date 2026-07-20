import { WalletClient, PrivateKey, KeyDeriver } from '@bsv/sdk'
import { WalletStorageManager, Services, Wallet, StorageClient } from '@bsv/wallet-toolbox-client'

// The server wallet is created once and shared by every route that needs it
// (receipt creation, and the read-only Float treasury balance route), so the
// app runs a single wallet instance rather than constructing one per route.
//
// The key comes only from the environment: provide SERVER_PRIVATE_KEY via your
// deployment secret store. There is deliberately no in-source fallback key.
//
// Initialisation is lazy (on first use), never at module load. Next.js
// evaluates route modules during the build's page-data collection, so eager
// top-level init would require the key (and a network round-trip to storage)
// at build time; deferring it keeps the build independent of runtime secrets.
const WALLET_STORAGE_URL = process.env.WALLET_STORAGE_URL || 'https://store-us-1.bsvb.tech'

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

let walletClientPromise

/**
 * Returns the shared server WalletClient, creating it on first call. The
 * promise is memoised so all callers share one instance; a failed
 * initialisation is not cached, so the next request can retry.
 */
export function getWalletClient() {
    if (!walletClientPromise) {
        const key = process.env.SERVER_PRIVATE_KEY
        if (!key) {
            throw new Error('SERVER_PRIVATE_KEY is not set; the server wallet cannot start')
        }
        walletClientPromise = createWalletClient(key, WALLET_STORAGE_URL, 'main').catch((err) => {
            walletClientPromise = undefined
            throw err
        })
    }
    return walletClientPromise
}
