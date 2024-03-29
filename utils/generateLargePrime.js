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
  exponent = BigInt(exponent);
  base = BigInt(base);
  modulus = BigInt(modulus);
  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      // Make sure exponent is BigInt
      result = (result * base) % modulus;
    }
    base = (base * base) % modulus;
    exponent = exponent / 2n; // Ensure exponent is BigInt
  }
  return result;
}

// Function to generate a random BigInt within a specified range
function getRandomInRange(min, max) {
  const range = max - min;
  const randomValue = BigInt(Math.floor(Math.random() * Number(range)));
  return min + randomValue;
}

// Step 1: Generate two prime numbers, p and q (16 bits each)
const p = generatePrime(16);
const q = generatePrime(16);

// Step 2: Compute N = p * q
const n = p * q;

// Step 3: Compute Phi(N) = (p - 1) * (q - 1)
const phi = (p - 1n) * (q - 1n);

// Step 4: Randomly select a public key, e, such that e < Phi(N) and gcd(e, Phi(N)) = 1
let e;
do {
  e = getRandomInRange(2n, phi - 1n);
} while (gcd(e, phi) !== 1n);

// Step 5: Find the corresponding private key d such that (e * d) mod Phi(N) = 1
const d = modInverse(e, phi);

// Step 6: Output the public key (N, e) to be published
console.log("Public key (N, e):", `(${n}, ${e})`);
console.log("Private key (N, d):", `(${n}, ${d})`);

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

// Function to encrypt a message using RSA
function encryptMessage(message, publicKey) {
  const [N, e] = publicKey;
  const blockSize = getBlockSize(N);
  const encryptedChunks = [];

  // Split the message into blocks of appropriate size
  for (let i = 0; i < message.length; i += blockSize) {
    const block = message.slice(i, i + blockSize);
    // Convert the block to BigInt
    const m = BigInt("0x" + Buffer.from(block).toString("hex"));
    // Encrypt the block using modular exponentiation
    const c = modExp(m, e, N);
    encryptedChunks.push(c.toString());
  }

  return encryptedChunks;
}

// Function to determine the block size based on the modulus N
function getBlockSize(N) {
  // Determine the number of bytes required to represent N
  const numBytes = Math.ceil(N.toString(16).length / 2);
  // Block size should be such that each block is smaller than N
  // Adjusting to ensure padding can be added if needed
  return Math.floor((numBytes - 1) * 0.75);
}

// Example usage:
const partnerPublicKey = [2814796069, 12814796069]; // Obtain partner's public key from Moodle
const message = "Here is the encrypted message"; // Your message to be encrypted
const encryptedMessage = encryptMessage(message, partnerPublicKey);
console.log("Encrypted Message:", encryptedMessage);
