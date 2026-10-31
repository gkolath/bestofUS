// End-to-end encryption for paired couples, using the browser's built-in Web Crypto API.
// Each phone makes its own key pair when pairing and publishes only the public half. Both phones
// derive the same couple key from (my private key + partner's public key), so the server only ever
// stores ciphertext and never holds a key that can read it.
(function () {
  const subtle = window.crypto && window.crypto.subtle;
  const te = new TextEncoder();
  const td = new TextDecoder();

  function b64(buf) {
    const bytes = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

  function available() { return !!subtle; }

  // ECDH P-256 key pair, exported as JWK so it can be kept on this device.
  async function generateKeyPair() {
    const pair = await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
    const [publicJwk, privateJwk] = await Promise.all([subtle.exportKey('jwk', pair.publicKey), subtle.exportKey('jwk', pair.privateKey)]);
    return { publicJwk: { kty: publicJwk.kty, crv: publicJwk.crv, x: publicJwk.x, y: publicJwk.y }, privateJwk };
  }

  // Shared AES-GCM key: ECDH secret, stretched with HKDF and bound to this couple's id.
  async function deriveCoupleKey(privateJwk, theirPublicJwk, coupleId) {
    const priv = await subtle.importKey('jwk', privateJwk, { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
    const pub = await subtle.importKey('jwk', theirPublicJwk, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
    const secret = await subtle.deriveBits({ name: 'ECDH', public: pub }, priv, 256);
    const hkdf = await subtle.importKey('raw', secret, 'HKDF', false, ['deriveKey']);
    return subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt: te.encode('ustwo-couple:' + coupleId), info: te.encode('ustwo entries v1') },
      hkdf, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }

  // `aad` (the entry id) is authenticated, so the server can't move ciphertext between entries.
  async function encrypt(key, obj, aad) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ct = await subtle.encrypt({ name: 'AES-GCM', iv, additionalData: te.encode(aad) }, key, te.encode(JSON.stringify(obj)));
    return { v: 1, iv: b64(iv), ct: b64(ct) };
  }

  async function decrypt(key, box, aad) {
    const pt = await subtle.decrypt({ name: 'AES-GCM', iv: unb64(box.iv), additionalData: te.encode(aad) }, key, unb64(box.ct));
    return JSON.parse(td.decode(pt));
  }

  // Short code both partners compare on their phones. If it matches, nobody swapped the keys in transit.
  async function safetyCode(pubA, pubB) {
    const canon = k => `${k.crv}:${k.x}:${k.y}`;
    const digest = new Uint8Array(await subtle.digest('SHA-256', te.encode(canon(pubA) + '|' + canon(pubB))));
    const groups = [];
    for (let i = 0; i < 4; i++) {
      const n = ((digest[i * 3] << 16) | (digest[i * 3 + 1] << 8) | digest[i * 3 + 2]) % 10000;
      groups.push(String(n).padStart(4, '0'));
    }
    return groups.join(' ');
  }

  window.UsTwoCrypto = { available, generateKeyPair, deriveCoupleKey, encrypt, decrypt, safetyCode };
})();
