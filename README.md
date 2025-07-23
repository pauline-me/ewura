# EWURA XML Signer

A TypeScript application for generating and signing EWURA (Energy and Water Utilities Regulatory Authority) XML documents for fuel station transactions, registrations, and daily summaries.

## Features

- **Transaction XML Generation** - Generate signed XML for fuel transactions
- **Registration XML Generation** - Generate signed XML for retail station registration
- **Daily Summary XML Generation** - Generate signed XML for daily fuel station summaries
- **Digital Signing** - Sign XML documents using PKCS#12 certificates
- **TypeScript Support** - Full type safety and modern JavaScript features
- **Date Utilities** - Helper functions for generating date ranges

## Installation

```bash
npm install
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Clean Build
```bash
npm run clean
npm run build
```

## Configuration

1. Create a `.env` file in the root directory:
```
EWURA_P12PASSWORD="your_certificate_password"
```

2. Place your PKCS#12 certificate file in the `certs/` directory as `advatech.pfx`

## Project Structure

```
src/
├── index.ts        # Main application entry point
└── signer.ts       # XML generation and signing functions
certs/
└── advatech.pfx    # PKCS#12 certificate (not included)
dist/               # Compiled JavaScript output
tsconfig.json       # TypeScript configuration
package.json        # Project dependencies and scripts
```

## API Functions

### `generateTransactionXml(body, callback)`
Generates signed XML for fuel transactions.

### `ewuraRegistrationXml(body, callback)`
Generates signed XML for retail station registration.

### `generateDailySummaryXml(body, callback)`
Generates signed XML for daily fuel station summaries.

## TypeScript Interfaces

- `TransactionBody` - Transaction data structure
- `RegistrationBody` - Registration data structure  
- `DailySummaryBody` - Daily summary data structure
- `TankInventory` - Tank inventory data structure

## Example Output

The application generates properly formatted and signed XML documents that comply with EWURA requirements for fuel station reporting.

## Requirements

- Node.js 14+
- TypeScript 4+
- Valid PKCS#12 certificate for signing

## License

ISC
