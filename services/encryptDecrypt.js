// Purpose: Encrypt and decrypt data using crypto module
import crypto from 'crypto'
import CONFIG  from '../config/configData.js'

let { encryptDecryptSecretKey, encryptDecryptSecretIv, encryptDecryptMethod } = CONFIG

if (!encryptDecryptSecretKey || !encryptDecryptSecretIv || !encryptDecryptMethod) {
throw new Error('secretKey, secretIV, and ecnryptionMethod are required')
}

// Generate secret hash with crypto to use for encryption
let key = crypto
.createHash('sha512')
.update(encryptDecryptSecretKey)
.digest('hex')
.substring(0, 32)
let encryptionIV = crypto
.createHash('sha512')
.update(encryptDecryptSecretIv)
.digest('hex')
.substring(0, 16)

// Encrypt data
export const encryptData = (data) => {
  try {
    let cipher = crypto.createCipheriv(encryptDecryptMethod, key, encryptionIV)
    return Buffer.from(
    cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
    ).toString('base64') // Encrypts data and converts to hex and base64
  } catch (error) {
    console.log("error in encrypt Data");
    console.log(error);
  }
}

// Decrypt data
export const decryptData = (encryptedData) => {
  try {
    let buff = Buffer.from(encryptedData, 'base64')
    // Converts encrypted data to utf8
    let decipher = crypto.createDecipheriv(encryptDecryptMethod, key, encryptionIV)
    return (
    decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
    decipher.final('utf8')
    ) // Decrypts data and converts to utf8
  } catch (error) {
    // console.log("error in decrypt Data");
    // console.log(error);
  }
}
