import { PrismaClient } from "@prisma/client"

import { WalletAPI } from "./dataSources/walletAPI"

export interface Context {
  dataSources: {
    walletAPI: WalletAPI
  }
  prisma: PrismaClient
  idToken: string | undefined
  signature?: string // A signature signed by a `WALLET` account
}
