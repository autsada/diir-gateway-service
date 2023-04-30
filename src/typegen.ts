/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { Context } from "./context"
import type { core } from "nexus"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    date<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "DateTime";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    date<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "DateTime";
  }
}


declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  CacheSessionInput: { // input type
    address: string; // String!
    stationId: string; // String!
  }
  CreateDraftPublishInput: { // input type
    accountId: string; // String!
    creatorId: string; // String!
    owner: string; // String!
  }
  CreateStationInput: { // input type
    accountId: string; // String!
    name: string; // String!
    owner: string; // String!
    tokenId: number; // Int!
  }
  CreateTipInput: { // input type
    amount: string; // String!
    fee: string; // String!
    from: string; // String!
    publishId: string; // String!
    receiverId: string; // String!
    senderId: string; // String!
    to: string; // String!
  }
  GetMyAccountInput: { // input type
    accountType: NexusGenEnums['AccountType']; // AccountType!
  }
  MintStationNFTInput: { // input type
    name: string; // String!
    to: string; // String!
  }
  QueryByIdInput: { // input type
    requestorId?: string | null; // String
    targetId: string; // String!
  }
  SendTipsInput: { // input type
    publishId: string; // String!
    qty: number; // Int!
    receiverId: string; // String!
    senderId: string; // String!
  }
  UpdatePublishInput: { // input type
    accountId: string; // String!
    description?: string | null; // String
    isPublic?: boolean | null; // Boolean
    kind?: NexusGenEnums['PublishKind'] | null; // PublishKind
    owner: string; // String!
    primaryCategory?: NexusGenEnums['Category'] | null; // Category
    publishId: string; // String!
    secondaryCategory?: NexusGenEnums['Category'] | null; // Category
    thumbSource?: NexusGenEnums['ThumbSource'] | null; // ThumbSource
    thumbnail?: string | null; // String
    title?: string | null; // String
  }
}

export interface NexusGenEnums {
  AccountType: "TRADITIONAL" | "WALLET"
  Category: "Animals" | "Children" | "Education" | "Entertainment" | "Food" | "Gaming" | "LifeStyle" | "Men" | "Movies" | "Music" | "News" | "Other" | "Programming" | "Science" | "Sports" | "Technology" | "Travel" | "Vehicles" | "Women"
  CommentType: "COMMENT" | "PUBLISH"
  PublishKind: "Adds" | "Blog" | "Podcast" | "Short" | "Video"
  ThumbSource: "custom" | "generated"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  DateTime: any
}

export interface NexusGenObjects {
  Account: { // root type
    authUid?: string | null; // String
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    defaultStation?: NexusGenRootTypes['Station'] | null; // Station
    id: string; // String!
    owner: string; // String!
    type: NexusGenEnums['AccountType']; // AccountType!
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  AuthUser: { // root type
    uid: string; // String!
  }
  CalculateTipsResult: { // root type
    tips: number; // Int!
  }
  Comment: { // root type
    commentId?: string | null; // String
    commentType: NexusGenEnums['CommentType']; // CommentType!
    content: string; // String!
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    creatorId: string; // String!
    id: string; // String!
    publishId: string; // String!
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  CreateWalletResult: { // root type
    address: string; // String!
    uid: string; // String!
  }
  DraftPublish: { // root type
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    creatorId: string; // String!
    id: string; // String!
    public: boolean; // Boolean!
    transcodeError: boolean; // Boolean!
    uploadError: boolean; // Boolean!
    uploading: boolean; // Boolean!
  }
  Edge: { // root type
    cursor?: string | null; // String
    node?: NexusGenRootTypes['Station'] | null; // Station
  }
  MintStationNFTResult: { // root type
    tokenId: number; // Int!
  }
  Mutation: {};
  PageInfo: { // root type
    endCursor?: string | null; // String
    hasNextPage?: boolean | null; // Boolean
  }
  PlaybackLink: { // root type
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    dash: string; // String!
    duration: number; // Float!
    hls: string; // String!
    id: string; // String!
    preview: string; // String!
    publishId: string; // String!
    thumbnail: string; // String!
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  Publish: { // root type
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    creatorId: string; // String!
    description?: string | null; // String
    filename?: string | null; // String
    id: string; // String!
    kind?: NexusGenEnums['PublishKind'] | null; // PublishKind
    primaryCategory?: NexusGenEnums['Category'] | null; // Category
    public: boolean; // Boolean!
    rawContentURI?: string | null; // String
    secondaryCategory?: NexusGenEnums['Category'] | null; // Category
    thumbSource: NexusGenEnums['ThumbSource']; // ThumbSource!
    thumbnail?: string | null; // String
    title?: string | null; // String
    transcodeError: boolean; // Boolean!
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
    uploadError: boolean; // Boolean!
    uploading: boolean; // Boolean!
    views?: number | null; // Int
  }
  Query: {};
  Response: { // root type
    edges: Array<NexusGenRootTypes['Edge'] | null>; // [Edge]!
    pageInfo: NexusGenRootTypes['PageInfo']; // PageInfo!
  }
  SendTipsResult: { // root type
    amount: string; // String!
    fee: string; // String!
    from: string; // String!
    to: string; // String!
  }
  Station: { // root type
    accountId: string; // String!
    bannerImage?: string | null; // String
    bannerImageRef?: string | null; // String
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    displayName: string; // String!
    id: string; // String!
    image?: string | null; // String
    imageRef?: string | null; // String
    name: string; // String!
    owner: string; // String!
    tokenId?: number | null; // Int
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  Tip: { // root type
    amount: string; // String!
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    fee: string; // String!
    from: string; // String!
    id: string; // String!
    publishId: string; // String!
    receiverId: string; // String!
    senderId: string; // String!
    to: string; // String!
  }
  WriteResult: { // root type
    status: string; // String!
  }
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  Account: { // field return type
    authUid: string | null; // String
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    defaultStation: NexusGenRootTypes['Station'] | null; // Station
    id: string; // String!
    owner: string; // String!
    stations: Array<NexusGenRootTypes['Station'] | null> | null; // [Station]
    type: NexusGenEnums['AccountType']; // AccountType!
    updatedAt: NexusGenScalars['DateTime'] | null; // DateTime
  }
  AuthUser: { // field return type
    uid: string; // String!
  }
  CalculateTipsResult: { // field return type
    tips: number; // Int!
  }
  Comment: { // field return type
    commentId: string | null; // String
    commentType: NexusGenEnums['CommentType']; // CommentType!
    commentsCount: number; // Int!
    content: string; // String!
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    creator: NexusGenRootTypes['Station'] | null; // Station
    creatorId: string; // String!
    disLiked: boolean | null; // Boolean
    disLikesCount: number; // Int!
    id: string; // String!
    liked: boolean | null; // Boolean
    likes: Array<NexusGenRootTypes['Station'] | null>; // [Station]!
    likesCount: number; // Int!
    publishId: string; // String!
    updatedAt: NexusGenScalars['DateTime'] | null; // DateTime
  }
  CreateWalletResult: { // field return type
    address: string; // String!
    uid: string; // String!
  }
  DraftPublish: { // field return type
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    creatorId: string; // String!
    id: string; // String!
    public: boolean; // Boolean!
    transcodeError: boolean; // Boolean!
    uploadError: boolean; // Boolean!
    uploading: boolean; // Boolean!
  }
  Edge: { // field return type
    cursor: string | null; // String
    node: NexusGenRootTypes['Station'] | null; // Station
  }
  MintStationNFTResult: { // field return type
    tokenId: number; // Int!
  }
  Mutation: { // field return type
    cacheSession: NexusGenRootTypes['WriteResult']; // WriteResult!
    calculateTips: NexusGenRootTypes['CalculateTipsResult'] | null; // CalculateTipsResult
    createAccount: NexusGenRootTypes['Account'] | null; // Account
    createDraftPublish: NexusGenRootTypes['DraftPublish'] | null; // DraftPublish
    createStation: NexusGenRootTypes['Station'] | null; // Station
    createTip: NexusGenRootTypes['Tip'] | null; // Tip
    createUser: NexusGenRootTypes['AuthUser'] | null; // AuthUser
    mintFirstStationNFT: NexusGenRootTypes['MintStationNFTResult'] | null; // MintStationNFTResult
    mintStationNFT: NexusGenRootTypes['MintStationNFTResult'] | null; // MintStationNFTResult
    sendTips: NexusGenRootTypes['SendTipsResult'] | null; // SendTipsResult
    updatePublish: NexusGenRootTypes['Publish'] | null; // Publish
    validateName: boolean; // Boolean!
  }
  PageInfo: { // field return type
    endCursor: string | null; // String
    hasNextPage: boolean | null; // Boolean
  }
  PlaybackLink: { // field return type
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    dash: string; // String!
    duration: number; // Float!
    hls: string; // String!
    id: string; // String!
    preview: string; // String!
    publishId: string; // String!
    thumbnail: string; // String!
    updatedAt: NexusGenScalars['DateTime'] | null; // DateTime
  }
  Publish: { // field return type
    commentsCount: number; // Int!
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    creator: NexusGenRootTypes['Station'] | null; // Station
    creatorId: string; // String!
    description: string | null; // String
    disLiked: boolean | null; // Boolean
    disLikesCount: number; // Int!
    filename: string | null; // String
    id: string; // String!
    kind: NexusGenEnums['PublishKind'] | null; // PublishKind
    lastComment: NexusGenRootTypes['Comment'] | null; // Comment
    liked: boolean | null; // Boolean
    likes: Array<NexusGenRootTypes['Station'] | null>; // [Station]!
    likesCount: number; // Int!
    playback: NexusGenRootTypes['PlaybackLink'] | null; // PlaybackLink
    primaryCategory: NexusGenEnums['Category'] | null; // Category
    public: boolean; // Boolean!
    rawContentURI: string | null; // String
    secondaryCategory: NexusGenEnums['Category'] | null; // Category
    thumbSource: NexusGenEnums['ThumbSource']; // ThumbSource!
    thumbnail: string | null; // String
    tips: Array<NexusGenRootTypes['Tip'] | null>; // [Tip]!
    tipsCount: number; // Int!
    title: string | null; // String
    transcodeError: boolean; // Boolean!
    updatedAt: NexusGenScalars['DateTime'] | null; // DateTime
    uploadError: boolean; // Boolean!
    uploading: boolean; // Boolean!
    views: number | null; // Int
  }
  Query: { // field return type
    fetchPublishes: Array<NexusGenRootTypes['Publish'] | null>; // [Publish]!
    getMyAccount: NexusGenRootTypes['Account'] | null; // Account
    getMyBalance: string; // String!
    getPublishById: NexusGenRootTypes['Publish'] | null; // Publish
    getStationById: NexusGenRootTypes['Station'] | null; // Station
    listCommentsByCommentId: Array<NexusGenRootTypes['Comment'] | null>; // [Comment]!
    listCommentsByPublishId: Array<NexusGenRootTypes['Comment'] | null>; // [Comment]!
  }
  Response: { // field return type
    edges: Array<NexusGenRootTypes['Edge'] | null>; // [Edge]!
    pageInfo: NexusGenRootTypes['PageInfo']; // PageInfo!
  }
  SendTipsResult: { // field return type
    amount: string; // String!
    fee: string; // String!
    from: string; // String!
    to: string; // String!
  }
  Station: { // field return type
    account: NexusGenRootTypes['Account'] | null; // Account
    accountId: string; // String!
    bannerImage: string | null; // String
    bannerImageRef: string | null; // String
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    displayName: string; // String!
    followers: NexusGenRootTypes['Station'][]; // [Station!]!
    followersCount: number; // Int!
    following: Array<NexusGenRootTypes['Station'] | null>; // [Station]!
    followingCount: number; // Int!
    id: string; // String!
    image: string | null; // String
    imageRef: string | null; // String
    isFollowing: boolean | null; // Boolean
    name: string; // String!
    owner: string; // String!
    publishesCount: number; // Int!
    tokenId: number | null; // Int
    updatedAt: NexusGenScalars['DateTime'] | null; // DateTime
  }
  Tip: { // field return type
    amount: string; // String!
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    fee: string; // String!
    from: string; // String!
    id: string; // String!
    publish: NexusGenRootTypes['Publish'] | null; // Publish
    publishId: string; // String!
    receiver: NexusGenRootTypes['Station'] | null; // Station
    receiverId: string; // String!
    sender: NexusGenRootTypes['Station'] | null; // Station
    senderId: string; // String!
    to: string; // String!
  }
  WriteResult: { // field return type
    status: string; // String!
  }
}

export interface NexusGenFieldTypeNames {
  Account: { // field return type name
    authUid: 'String'
    createdAt: 'DateTime'
    defaultStation: 'Station'
    id: 'String'
    owner: 'String'
    stations: 'Station'
    type: 'AccountType'
    updatedAt: 'DateTime'
  }
  AuthUser: { // field return type name
    uid: 'String'
  }
  CalculateTipsResult: { // field return type name
    tips: 'Int'
  }
  Comment: { // field return type name
    commentId: 'String'
    commentType: 'CommentType'
    commentsCount: 'Int'
    content: 'String'
    createdAt: 'DateTime'
    creator: 'Station'
    creatorId: 'String'
    disLiked: 'Boolean'
    disLikesCount: 'Int'
    id: 'String'
    liked: 'Boolean'
    likes: 'Station'
    likesCount: 'Int'
    publishId: 'String'
    updatedAt: 'DateTime'
  }
  CreateWalletResult: { // field return type name
    address: 'String'
    uid: 'String'
  }
  DraftPublish: { // field return type name
    createdAt: 'DateTime'
    creatorId: 'String'
    id: 'String'
    public: 'Boolean'
    transcodeError: 'Boolean'
    uploadError: 'Boolean'
    uploading: 'Boolean'
  }
  Edge: { // field return type name
    cursor: 'String'
    node: 'Station'
  }
  MintStationNFTResult: { // field return type name
    tokenId: 'Int'
  }
  Mutation: { // field return type name
    cacheSession: 'WriteResult'
    calculateTips: 'CalculateTipsResult'
    createAccount: 'Account'
    createDraftPublish: 'DraftPublish'
    createStation: 'Station'
    createTip: 'Tip'
    createUser: 'AuthUser'
    mintFirstStationNFT: 'MintStationNFTResult'
    mintStationNFT: 'MintStationNFTResult'
    sendTips: 'SendTipsResult'
    updatePublish: 'Publish'
    validateName: 'Boolean'
  }
  PageInfo: { // field return type name
    endCursor: 'String'
    hasNextPage: 'Boolean'
  }
  PlaybackLink: { // field return type name
    createdAt: 'DateTime'
    dash: 'String'
    duration: 'Float'
    hls: 'String'
    id: 'String'
    preview: 'String'
    publishId: 'String'
    thumbnail: 'String'
    updatedAt: 'DateTime'
  }
  Publish: { // field return type name
    commentsCount: 'Int'
    createdAt: 'DateTime'
    creator: 'Station'
    creatorId: 'String'
    description: 'String'
    disLiked: 'Boolean'
    disLikesCount: 'Int'
    filename: 'String'
    id: 'String'
    kind: 'PublishKind'
    lastComment: 'Comment'
    liked: 'Boolean'
    likes: 'Station'
    likesCount: 'Int'
    playback: 'PlaybackLink'
    primaryCategory: 'Category'
    public: 'Boolean'
    rawContentURI: 'String'
    secondaryCategory: 'Category'
    thumbSource: 'ThumbSource'
    thumbnail: 'String'
    tips: 'Tip'
    tipsCount: 'Int'
    title: 'String'
    transcodeError: 'Boolean'
    updatedAt: 'DateTime'
    uploadError: 'Boolean'
    uploading: 'Boolean'
    views: 'Int'
  }
  Query: { // field return type name
    fetchPublishes: 'Publish'
    getMyAccount: 'Account'
    getMyBalance: 'String'
    getPublishById: 'Publish'
    getStationById: 'Station'
    listCommentsByCommentId: 'Comment'
    listCommentsByPublishId: 'Comment'
  }
  Response: { // field return type name
    edges: 'Edge'
    pageInfo: 'PageInfo'
  }
  SendTipsResult: { // field return type name
    amount: 'String'
    fee: 'String'
    from: 'String'
    to: 'String'
  }
  Station: { // field return type name
    account: 'Account'
    accountId: 'String'
    bannerImage: 'String'
    bannerImageRef: 'String'
    createdAt: 'DateTime'
    displayName: 'String'
    followers: 'Station'
    followersCount: 'Int'
    following: 'Station'
    followingCount: 'Int'
    id: 'String'
    image: 'String'
    imageRef: 'String'
    isFollowing: 'Boolean'
    name: 'String'
    owner: 'String'
    publishesCount: 'Int'
    tokenId: 'Int'
    updatedAt: 'DateTime'
  }
  Tip: { // field return type name
    amount: 'String'
    createdAt: 'DateTime'
    fee: 'String'
    from: 'String'
    id: 'String'
    publish: 'Publish'
    publishId: 'String'
    receiver: 'Station'
    receiverId: 'String'
    sender: 'Station'
    senderId: 'String'
    to: 'String'
  }
  WriteResult: { // field return type name
    status: 'String'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    cacheSession: { // args
      input: NexusGenInputs['CacheSessionInput']; // CacheSessionInput!
    }
    calculateTips: { // args
      qty: number; // Int!
    }
    createAccount: { // args
      input?: NexusGenInputs['GetMyAccountInput'] | null; // GetMyAccountInput
    }
    createDraftPublish: { // args
      input: NexusGenInputs['CreateDraftPublishInput']; // CreateDraftPublishInput!
    }
    createStation: { // args
      input: NexusGenInputs['CreateStationInput']; // CreateStationInput!
    }
    createTip: { // args
      input: NexusGenInputs['CreateTipInput']; // CreateTipInput!
    }
    createUser: { // args
      address: string; // String!
    }
    mintFirstStationNFT: { // args
      input: NexusGenInputs['MintStationNFTInput']; // MintStationNFTInput!
    }
    mintStationNFT: { // args
      input: NexusGenInputs['MintStationNFTInput']; // MintStationNFTInput!
    }
    sendTips: { // args
      input: NexusGenInputs['SendTipsInput']; // SendTipsInput!
    }
    updatePublish: { // args
      input: NexusGenInputs['UpdatePublishInput']; // UpdatePublishInput!
    }
    validateName: { // args
      name: string; // String!
    }
  }
  Query: {
    getMyAccount: { // args
      input?: NexusGenInputs['GetMyAccountInput'] | null; // GetMyAccountInput
    }
    getMyBalance: { // args
      address: string; // String!
    }
    getPublishById: { // args
      id: string; // String!
    }
    getStationById: { // args
      input: NexusGenInputs['QueryByIdInput']; // QueryByIdInput!
    }
    listCommentsByCommentId: { // args
      input: NexusGenInputs['QueryByIdInput']; // QueryByIdInput!
    }
    listCommentsByPublishId: { // args
      input: NexusGenInputs['QueryByIdInput']; // QueryByIdInput!
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: Context;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}