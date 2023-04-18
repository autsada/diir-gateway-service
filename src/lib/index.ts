import * as crypto from "crypto"

const { API_KEY, ALCHEMY_WEBHOOK_SIGNING_KEY } = process.env

export function isAuthorizedRequestor(key: string) {
  return key === API_KEY
}

export function isValidAchemySignature(
  body: string, // must be raw string body, not json transformed version of the body
  signature: string // your "X-Alchemy-Signature" from header
): boolean {
  const hmac = crypto.createHmac("sha256", ALCHEMY_WEBHOOK_SIGNING_KEY!) // Create a HMAC SHA256 hash using the signing key
  hmac.update(body, "utf8") // Update the token hash with the request body using utf8
  const digest = hmac.digest("hex")
  return signature === digest
}
