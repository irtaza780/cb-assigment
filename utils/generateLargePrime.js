// Function to generate a random prime number of n bits
function generatePrime(n) {
  let number;
  do {
    number = getRandomOdd(n); // Generate a random odd number of n bits
  } while (!isPrime(number)); // Keep generating numbers until a prime is found
  return number;
}

// Function to generate a random odd number of n bits
function getRandomOdd(n) {
  let bits = "1";
  for (let i = 1; i < n - 1; i++) {
    bits += Math.round(Math.random()); // Randomly generate 0 or 1
  }
  bits += "1"; // Ensure the number is odd
  return BigInt("0b" + bits); // Convert binary string to BigInt
}

// Function to check if a number is prime using the Miller-Rabin primality test
function isPrime(n, k = 5) {
  if (n <= 1n) return false;
  if (n <= 3n) return true;
  if (n % 2n === 0n) return false;

  let d = n - 1n;
  while (d % 2n === 0n) {
    d /= 2n;
  }

  for (let i = 0; i < k; i++) {
    if (!millerRabinTest(n, d)) {
      return false;
    }
  }
  return true;
}

// Miller-Rabin primality test
function millerRabinTest(n, d) {
  const a = getRandomInRange(2n, n - 2n);
  let x = modExp(a, d, n);
  if (x === 1n || x === n - 1n) return true;

  while (d !== n - 1n) {
    x = (x * x) % n;
    d *= 2n;
    if (x === 1n) return false;
    if (x === n - 1n) return true;
  }
  return false;
}

// Function to perform modular exponentiation (a^b mod m)
function modExp(base, exponent, modulus) {
  let result = 1n;
  base = BigInt(base);
  modulus = BigInt(modulus);
  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % modulus;
    }
    base = (base * base) % modulus;
    exponent = exponent / 2n;
  }
  return result;
}

// Function to generate a random BigInt within a specified range
function getRandomInRange(min, max) {
  const range = max - min;
  const randomValue = BigInt(Math.floor(Math.random() * Number(range)));
  return min + randomValue;
}

// Function to compute the greatest common divisor (GCD) of two numbers
function gcd(a, b) {
  while (b !== 0n) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// Function to compute the modular inverse of a number
function modInverse(a, m) {
  let [m0, x0, x1] = [m, 0n, 1n];
  while (a > 1n) {
    const q = a / m;
    [a, m] = [m, a % m];
    [x0, x1] = [x1 - q * x0, x0];
  }
  return x1 < 0n ? x1 + m0 : x1;
}

// Function to determine the block size based on the modulus N
function getBlockSize(N) {
  // Determine the number of bytes required to represent N
  const numBytes = Math.ceil(N.toString(16).length / 2);
  // Block size should be such that each block is smaller than N
  return numBytes - 1; // Subtract one to ensure each block is smaller than N
}

// Function to encrypt a message using RSA
function encryptMessage(message, publicKey) {
  const [N, e] = publicKey;
  const blockSize = getBlockSize(N);
  const encryptedChunks = [];

  console.log("Block size: ", blockSize);

  // Split the message into blocks of appropriate size
  for (let i = 0; i < message.length; i += blockSize) {
    const block = message.slice(i, i + blockSize);
    const m = BigInt("0x" + Buffer.from(block).toString("hex"));
    const c = modExp(m, e, N);
    encryptedChunks.push(c.toString());

    console.log("Block:", block, "BigInt:", m.toString(), "Encrypted:", c.toString());
  }

  return encryptedChunks;
}

// Function to sign a message using RSA
function signMessage(message, privateKey) {
  const [N, d] = privateKey;
  const blockSize = getBlockSize(N);
  const signedChunks = [];

  // Split the message into blocks of appropriate size
  for (let i = 0; i < message.length; i += blockSize) {
    const block = message.slice(i, i + blockSize);
    const m = BigInt("0x" + Buffer.from(block).toString("hex"));
    const sig = modExp(m, d, N);
    signedChunks.push(sig.toString());

    console.log("Signing Block:", block, "Signature:", sig.toString());
  }

  return signedChunks;
}

// Function to verify a signature using RSA
function verifySignature(signature, publicKey, originalMessage) {
  const [N, e] = publicKey;
  const blockSize = getBlockSize(N);
  let verified = true;

  for (let i = 0; i < signature.length; i++) {
    const sigChunk = BigInt(signature[i]);
    const decryptedChunk = modExp(sigChunk, e, N);
    const decryptedBytes = Buffer.from(decryptedChunk.toString(16), "hex").toString();

    console.log("Verifying Signature:", sigChunk.toString(), "Decrypted:", decryptedBytes);

    if (decryptedBytes !== originalMessage.slice(i * blockSize, (i + 1) * blockSize)) {
      verified = false;
      break;
    }
  }

  return verified;
}

// Function to decrypt a message using RSA
function decryptMessage(encryptedMessage, privateKey) {
  const [N, d] = privateKey;
  const decryptedBlocks = [];

  for (let i = 0; i < encryptedMessage.length; i++) {
    const encryptedChunk = BigInt(encryptedMessage[i]);
    const decryptedChunk = modExp(encryptedChunk, d, N);
    const decryptedHex = decryptedChunk.toString(16);
    const decryptedBytes = hexToAscii(decryptedHex);

    console.log("Decrypting:", encryptedChunk.toString(), "To:", decryptedBytes);

    decryptedBlocks.push(decryptedBytes);
  }

  return decryptedBlocks.join('');
}

// Function to convert hexadecimal string to ASCII string
function hexToAscii(hexString) {
  if (hexString.length % 2 !== 0) hexString = "0" + hexString;
  let asciiString = '';
  for (let i = 0; i < hexString.length; i += 2) {
    const hexCharCode = parseInt(hexString.substr(i, 2), 16);
    asciiString += String.fromCharCode(hexCharCode);
  }
  return asciiString;
}

// Example RSA Key Generation and Usage
const p = generatePrime(16);
const q = generatePrime(16);
const n = p * q;
const phi = (p - 1n) * (q - 1n);
let e;
do {
  e = getRandomInRange(2n, phi - 1n);
} while (gcd(e, phi) !== 1n);
const d = modInverse(e, phi);

console.log("Public key (N, e):", `(${n}, ${e})`);
console.log("Private key (N, d):", `(${n}, ${d})`);

const partnerPublicKey = [n, e]; // Use the generated public key
const message = "Hello World";

const encryptedMessage = encryptMessage(message, partnerPublicKey);
console.log("Encrypted Message:", encryptedMessage);

const decryptedMessage = decryptMessage(encryptedMessage, [n, d]);
console.log("Decrypted Message:", decryptedMessage);
