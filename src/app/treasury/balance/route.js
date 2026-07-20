import { createBalanceHandler } from '@bsv-blockchain-demos/float-balance-route/web'
import { getWalletClient } from '@/lib/wallet'

// Read-only treasury balance endpoint for Float, BSVA's balance monitor.
// Float polls this on demand behind a bearer token, so it must never be cached.
export const dynamic = 'force-dynamic'

let cachedHandler

// The handler reads balances exclusively through the shared wallet's
// listOutputs / getPublicKey; it never signs, builds, or broadcasts a
// transaction, and never sees a key. Built lazily on first request so the
// build never needs the wallet (and its key).
async function getHandler() {
    if (!cachedHandler) {
        const wallet = await getWalletClient()
        cachedHandler = createBalanceHandler({
            wallet,
            appName: 'bsv-blockchain-demos/digital-receipts-pos',
            chain: 'main',
            token: process.env.FLOAT_BALANCE_TOKEN,
            toolboxFastBalance: true, // wallet is @bsv/wallet-toolbox-client
            onError: (err) => console.error('[treasury/balance] wallet read failed:', err),
        })
    }
    return cachedHandler
}

export async function GET(request) {
    // Env-var guard: the route stays inert (404) until FLOAT_BALANCE_TOKEN
    // ships, so the app deploys unchanged until then.
    if (!process.env.FLOAT_BALANCE_TOKEN) {
        return new Response(JSON.stringify({ error: 'not_found' }), {
            status: 404,
            headers: { 'content-type': 'application/json' },
        })
    }

    try {
        const handler = await getHandler()
        return handler(request)
    } catch (err) {
        console.error('[treasury/balance] handler init failed:', err)
        return new Response(JSON.stringify({ error: 'balance_unavailable' }), {
            status: 500,
            headers: { 'content-type': 'application/json', 'Cache-Control': 'no-store' },
        })
    }
}
