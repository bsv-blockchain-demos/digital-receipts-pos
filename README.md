# Digital Receipts Point of Sale Demo

A Next.js demonstration that generates a receipt from a sample shopping cart, encrypts the receipt and records it in a BSV transaction. The point-of-sale screen then displays a QR code for retrieving and decrypting the receipt in the companion mobile application.

The current implementation uses Next.js route handlers. There is no separate Express server to install or start.

## Receipt flow

1. The browser builds an example receipt from the selected products.
2. `POST /create-receipt` generates a symmetric key and encrypts the receipt JSON.
3. A server-held wallet creates a one-satoshi `OP_FALSE OP_RETURN` output containing the encrypted data.
4. The response supplies the transaction ID, timestamp and decryption key for the QR code.
5. The [Digital Receipts Mobile app](https://github.com/bsv-blockchain-demos/digital-receipts-mobile) provides the separate scanning and viewing interface.

**The QR code contains the decryption key.** Anyone with a copy can attempt to retrieve and decrypt the associated receipt. It contains a transaction reference and key, rather than the complete receipt JSON.

The shopping cart and payment details are demonstration data. Checkout creates the receipt transaction; it does not integrate with a card-payment processor.

## Run locally

Use Node.js 22 and npm, a funded mainnet server wallet and a compatible wallet storage provider.

```sh
npm ci
cp .env.example .env.local
```

Configure `.env.local`:

| Variable | Purpose |
| --- | --- |
| `SERVER_PRIVATE_KEY` | Required hexadecimal private key for the server wallet. |
| `WALLET_STORAGE_URL` | Wallet storage provider, default `https://store-us-1.bsvb.tech`. |
| `FLOAT_BALANCE_TOKEN` | Optional bearer token enabling `GET /treasury/balance`. Leave unset when unused. |

```sh
npm run dev -- --hostname 127.0.0.1
```

Open `http://localhost:3000`. Receipt creation uses the server wallet and incurs mainnet fees. The network is fixed to `main` in [src/lib/wallet.js](src/lib/wallet.js); setting a `CHAIN` variable does not change it.

Dependencies include a package from GitHub Packages. If installation reports an authentication error, configure an appropriate package-read credential outside the repository.

## Current limitations

The receipt-creation route has no application authentication or rate limiting. Anyone able to reach it can request transactions funded by the server wallet. Add suitable access controls before exposing an instance beyond a controlled demonstration.

The route starts overlay broadcasting without awaiting the result and logs delivery failures. A successful receipt response does not establish that the overlay has indexed the transaction for the mobile reader.

The application does not measure environmental savings or provide a general receipt-verification guarantee.

## Build and containers

```sh
npm run build
npm start -- --hostname 127.0.0.1
```

Next.js produces a server application with standalone output enabled. Runtime wallet configuration is loaded lazily, so a build does not require a funded wallet.

The [Dockerfile](Dockerfile) expects a BuildKit secret named `github_token`. The supplied Compose build does not declare that secret. Configure it before building containers, and use `.env` for Compose runtime settings. Compose maps host port 3000 to container port 8080.

The lint script still invokes `next lint`, which is unavailable in Next.js 16. No automated test script is defined.

- [src/app/page.js](src/app/page.js): cart, receipt and QR display.
- [src/app/create-receipt/route.js](src/app/create-receipt/route.js): encryption, transaction creation and overlay submission.

## Licence

**Open BSV Licence v6.** See [LICENSE.txt](LICENSE.txt) for the full terms. The licence applies to this project's original code and documentation and restricts use to the BSV blockchain defined in the licence. Third-party code, assets and referenced standards retain their respective terms.
