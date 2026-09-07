// bridge.js — batched TON jetton bridge (reference, scrubbed).
//
// The treasury signs ONE external message that fans out to N jetton transfers
// (instead of one wallet tx per token). Each transfer forwards a small amount
// of TON to the recipient's jetton wallet so it can pay its own storage rent —
// carved out of the transfer's value, not an extra treasury cost.

const {
  TonClient4, WalletContractV5R1, internal, toNano,
  beginCell, Address, SendMode, external, storeMessage,
} = require('@ton/ton');
const { mnemonicToPrivateKey } = require('@ton/crypto');

const JETTON_TRANSFER_OPCODE = 0x0f8a7ea5;
const FORWARD_TON_AMOUNT = toNano('0.01'); // recipient wallet rent, from the value

// `transfers`: [{ toAddress, jettonMasterAddress, amount }]
async function sendJettons(transfers) {
  const mnemonic = (process.env.TON_MNEMONIC || '').trim();
  const client = new TonClient4({ endpoint: process.env.TON_ENDPOINT });
  const keyPair = await mnemonicToPrivateKey(mnemonic.split(/\s+/).filter(Boolean));
  const wallet = WalletContractV5R1.create({ publicKey: keyPair.publicKey, workchain: 0 });
  const walletContract = client.open(wallet);

  const messages = [];
  for (const t of transfers) {
    const jettonAmount = BigInt(Math.round(Number(t.amount) * 1e9));
    const master = Address.parse(t.jettonMasterAddress);
    const recipient = Address.parse(t.toAddress);

    // Derive the treasury's jetton wallet for this master.
    const lastBlock = await client.getLastBlock();
    const method = await client.runMethod(lastBlock.last.seqno, master, 'get_wallet_address', [
      { type: 'slice', cell: beginCell().storeAddress(wallet.address).endCell() },
    ]);
    const jettonWallet = method.reader.readAddress();

    const body = beginCell()
      .storeUint(JETTON_TRANSFER_OPCODE, 32)
      .storeUint(0, 64)                         // query_id
      .storeCoins(jettonAmount)
      .storeAddress(recipient)
      .storeAddress(wallet.address)             // excess returns to treasury
      .storeMaybeRef(null)                       // custom_payload
      .storeCoins(FORWARD_TON_AMOUNT)            // funds the recipient's rent
      .storeMaybeRef(null)                       // forward_payload
      .endCell();

    messages.push(internal({ to: jettonWallet, value: toNano('0.05'), bounce: true, body }));
  }

  // One signed body → wrapped in an external-in envelope → broadcast.
  const seqno = await walletContract.getSeqno();
  const transfer = await walletContract.createTransfer({
    seqno,
    secretKey: keyPair.secretKey,
    sendMode: SendMode.PAY_GAS_SEPARATELY,
    messages,
  });
  const ext = external({ to: wallet.address, init: null, body: transfer });
  const extCell = beginCell().store(storeMessage(ext)).endCell();
  await client.sendMessage(extCell.toBoc());
  return extCell.hash().toString('hex');
}

module.exports = { sendJettons };
