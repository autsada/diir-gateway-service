const { API_KEY } = process.env

export function isAuthorizedRequestor(key: string) {
  return key === API_KEY
}
