export const dappKnowledge = `
## ACTA dApp — Knowledge Base

ACTA is a decentralized application (dApp) for issuing, managing, sharing, and verifying
verifiable credentials on the Stellar blockchain using zero-knowledge proofs for privacy.

---

### Navigation & Pages

- **Home / Dashboard** (\`/dashboard\`): The landing page after connecting your wallet. Shows a quick-start guide, your vault summary, and shortcuts to all major actions.
- **Issue Credentials** (\`/dashboard/issue\`): Create and issue new verifiable credentials. Choose from predefined templates (e.g. ID Card, Diploma, Certificate) or build a custom credential with your own fields.
- **Authorize Issuers** (\`/dashboard/authorize\`): Manage who can issue credentials on behalf of your vault. Add or remove authorized issuer addresses.
- **Vault / Credentials** (\`/dashboard/credentials\`): View all credentials stored in your personal vault. Search, filter, share, or revoke credentials.
- **API Keys** (\`/dashboard/api-keys\`): Generate and manage API keys for programmatic access to the ACTA API. Keys are network-specific (testnet / mainnet).
- **Notifications** (\`/dashboard/notifications\`): View and manage your dApp notifications (credentials received, verified, expiring soon, revoked, issuer authorized/revoked).
- **Tutorials** (\`/dashboard/tutorials\`): Watch video tutorials about using the ACTA platform.
- **Settings**: Access your profile and wallet settings via the sidebar or the bottom nav on mobile.

---

### Issuing Credentials

1. Navigate to **Issue** (\`/dashboard/issue\`).
2. Pick a **template** (ID Card, Diploma, Certificate, etc.) or choose **Custom** to define your own fields.
3. Fill in the credential fields (holder address, name, expiration, etc.).
4. Click **Issue** — the credential is created on-chain via the Stellar network.
5. The holder can then see it in their **Vault**.

---

### Vault & Credential Management

- Your **Vault** is your personal credential store.
- From the Vault page (\`/dashboard/credentials\`) you can:
  - **View** details of each credential.
  - **Share** a credential using a secure link or QR code with optional zero-knowledge proof.
  - **Revoke** a credential (only the issuer can revoke).
  - **Search & filter** by type, issuer, status, or date.

---

### Sharing Credentials with Zero-Knowledge Proofs

When sharing a credential you can choose which fields to reveal and attach ZK proofs:
- **isAdult**: Proves the holder is 18 or older without revealing the exact date of birth.
- **notExpired**: Proves the credential has not expired without revealing the exact expiry date.
- **isValid**: Proves the credential status is valid.

The verifier receives a link where they can check proofs without seeing private data.

---

### Authorizing Issuers

- Go to **Authorize** (\`/dashboard/authorize\`).
- Enter the Stellar public key of the address you want to authorize.
- Confirm the transaction — that address can now issue credentials under your vault.
- You can also revoke authorization at any time.

---

### API Keys

- Go to **API Keys** (\`/dashboard/api-keys\`).
- Click **Generate** to create a new key.
- Keys are network-specific: a testnet key only works on testnet.
- Use these keys in your own backend to call the ACTA API programmatically.

---

### Wallet & Network

- **Connect Wallet**: Click the wallet connect button on the home page. Supported wallets: Freighter and WalletConnect-compatible wallets.
- **Switch Network**: Toggle between **Testnet** and **Mainnet** via the header toggle. A confirmation modal appears when switching to mainnet.
- Your wallet address is your identity on ACTA.

---

### Common Questions

**Q: How do I issue my first credential?**
A: Go to Dashboard → Issue, select a template, fill the fields, and click Issue.

**Q: Where do I see my credentials?**
A: Go to Dashboard → Vault (Credentials). All credentials issued to your address appear there.

**Q: How do I share a credential privately?**
A: Open the credential in your Vault, click Share, select which fields to reveal, and optionally attach a ZK proof. A secure link / QR is generated.

**Q: How do I verify a credential someone shared with me?**
A: Open the share link. The verification page shows the revealed fields and validates any attached ZK proofs.

**Q: How do I authorize someone to issue credentials on my behalf?**
A: Go to Dashboard → Authorize, enter their Stellar public key, and confirm.

**Q: What is a zero-knowledge proof?**
A: A ZK proof lets you prove a statement (e.g. "I am over 18") without revealing the underlying data (your birthdate).

**Q: How do I switch between testnet and mainnet?**
A: Use the network toggle in the header bar. Testnet is for testing; mainnet is for production.

**Q: How do I generate an API key?**
A: Go to Dashboard → API Keys and click Generate. The key is tied to the current network.

**Q: Where are the tutorials?**
A: Go to Dashboard → Tutorials for video guides on all major features.
`;
