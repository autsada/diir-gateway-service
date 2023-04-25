import { PrismaClient } from "@prisma/client"

import { WalletAPI } from "./dataSources/walletAPI"

export interface Context {
  dataSources: {
    walletAPI: WalletAPI
  }
  prisma: PrismaClient
  idToken: string | undefined
  signedMessage?: string // A signed message for `WALLET` account
}
