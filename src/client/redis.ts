import { Station } from "@prisma/client"
import Redis from "ioredis"

const { REDIS_HOST, REDIS_PORT } = process.env

const redis = new Redis({
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
})

export function cacheTokenId(address: string, tokenId: string) {
  return redis.set(address.toLowerCase(), tokenId)
}

/**
 * @param owner an EOA address that owns the account
 * @param stations
 * @returns
 */
export async function getStationFromCache(
  owner: string,
  stations: (Station | null)[]
) {
  // Check the previous used station from redis
  const stationId = await redis.get(owner.toLowerCase())
  const defaultStation = stations.length > 0 ? stations[0] : null

  if (!stationId) return defaultStation

  return stations.find((s) => s?.id === stationId) || defaultStation
}

export { redis }
