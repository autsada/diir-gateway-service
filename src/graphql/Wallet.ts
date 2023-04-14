import { objectType } from "nexus"

export const CreateWalletResult = objectType({
  name: "CreateWalletResult",
  definition(t) {
    t.nonNull.string("address")
    t.nonNull.string("uid")
  },
})
