import { WillSendRequestOptions, RESTDataSource } from "@apollo/datasource-rest"
// KeyValueCache is the type of Apollo server's default cache
import type { KeyValueCache } from "@apollo/utils.keyvaluecache"

import type { Environment } from "../types"
import { authClient } from "../client/authClient"

const { NODE_ENV, UPLOAD_SERVICE_URL } = process.env

const env = NODE_ENV as Environment

export class UploadAPI extends RESTDataSource {
  override baseURL =
    env === "development" ? "http://localhost:4444" : UPLOAD_SERVICE_URL!
  private idToken: string | undefined

  constructor(options: { idToken: string | undefined; cache: KeyValueCache }) {
    super(options) // this sends our server's `cache` through
    this.idToken = options.idToken
  }

  protected override async willSendRequest(
    req: WillSendRequestOptions
  ): Promise<void> {
    // The token for use to authenticate between services in GCP
    if (env !== "development") {
      const token = await authClient.getIdToken(this.baseURL)
      req.headers["authorization"] = token || ""
    }
    // The id token that to be sent from the UI for use to verify user.
    req.headers["id-token"] = this.idToken || ""
  }

  /**
   * @dev A route to delete a publish's files from cloud storage
   * @param publishRef a directory of the publish in cloud storage
   */
  async deleteFiles(publishRef: string): Promise<void> {
    return this.post("publishes/delete", { body: { publishRef } })
  }
}
