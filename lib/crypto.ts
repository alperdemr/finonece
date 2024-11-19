export async function compare(plaintext: string, hash: string): Promise<boolean> {
    const [salt, key] = hash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const encoder = new TextEncoder();
    const plaintextBuffer = encoder.encode(plaintext + salt);
    
    const derivedKey = await crypto.subtle.digest('SHA-256', plaintextBuffer);
    const derivedKeyArray = Array.from(new Uint8Array(derivedKey));
    const derivedKeyHex = derivedKeyArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return derivedKeyHex === key;
} 