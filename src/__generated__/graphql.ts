import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Drink as DrinkModel, Drink as BaseDrinkModel, Drink as MixedDrinkModel, Entry as EntryModel } from '.prisma/client';
import { DrinkHistory as DrinkHistoryModel } from '../types/models';
import { AppContext } from '../types/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = undefined | T;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Date scalar used for JS Date */
  Date: any;
  /** Icon scalar mapped to FontAwesome `IconName` type */
  Icon: any;
};

/** Base Drink used for all drinks */
export type BaseDrink = Drink & Node & {
  __typename?: 'BaseDrink';
  caffeine?: Maybe<Scalars['Float']>;
  coefficient?: Maybe<Scalars['Float']>;
  createdAt: Scalars['Date'];
  entries?: Maybe<Array<Entry>>;
  icon: Scalars['Icon'];
  id: Scalars['ID'];
  name: Scalars['String'];
  servingSize?: Maybe<Scalars['Float']>;
  sugar?: Maybe<Scalars['Float']>;
  user?: Maybe<User>;
};

/** Cache Control Scope enum */
export enum CacheControlScope {
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

/** Drink Interface for all drinks */
export type Drink = {
  caffeine?: Maybe<Scalars['Float']>;
  coefficient?: Maybe<Scalars['Float']>;
  createdAt: Scalars['Date'];
  entries?: Maybe<Array<Entry>>;
  icon: Scalars['Icon'];
  id: Scalars['ID'];
  name: Scalars['String'];
  servingSize?: Maybe<Scalars['Float']>;
  sugar?: Maybe<Scalars['Float']>;
  user?: Maybe<User>;
};

/** Input for Creating a new Drink */
export type DrinkCreateInput = {
  caffeine?: InputMaybe<Scalars['Float']>;
  coefficient?: InputMaybe<Scalars['Float']>;
  icon: Scalars['Icon'];
  ingredients?: InputMaybe<Array<IngredientInput>>;
  name: Scalars['String'];
  servingSize: Scalars['Float'];
  sugar?: InputMaybe<Scalars['Float']>;
};

/** Edge for Paginated Drinks */
export type DrinkEdge = {
  __typename?: 'DrinkEdge';
  cursor?: Maybe<Scalars['String']>;
  node: DrinkResult;
};

/** Input for Editing a Drink */
export type DrinkEditInput = {
  caffeine?: InputMaybe<Scalars['Float']>;
  coefficient?: InputMaybe<Scalars['Float']>;
  icon?: InputMaybe<Scalars['Icon']>;
  id: Scalars['ID'];
  ingredients?: InputMaybe<Array<IngredientInput>>;
  name?: InputMaybe<Scalars['String']>;
  servingSize?: InputMaybe<Scalars['Float']>;
  sugar?: InputMaybe<Scalars['Float']>;
};

/** Drink History to retreive summary of drink entries */
export type DrinkHistory = Node & {
  __typename?: 'DrinkHistory';
  count: Scalars['Int'];
  drink: DrinkResult;
  entries?: Maybe<EntriesPaginated>;
  id: Scalars['ID'];
  lastEntry?: Maybe<Scalars['Date']>;
  totalVolume: Scalars['Float'];
  waterVolume: Scalars['Float'];
};


/** Drink History to retreive summary of drink entries */
export type DrinkHistoryEntriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  distinct?: InputMaybe<Scalars['Boolean']>;
  drinkId?: InputMaybe<Scalars['ID']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<EntrySort>;
};

/** Edge for Paginated Drink History */
export type DrinkHistoryEdge = {
  __typename?: 'DrinkHistoryEdge';
  cursor: Scalars['String'];
  node: DrinkHistory;
};

/** Union of Mixed and Base Drinks */
export type DrinkResult = BaseDrink | MixedDrink;

/** Sorting input for Drinks */
export type DrinkSort = {
  createdAt?: InputMaybe<Sort>;
  name?: InputMaybe<Sort>;
};

/** Filter for the Drinks History query */
export type DrinksHistoryFilter = {
  hasEntries?: InputMaybe<Scalars['Boolean']>;
};

/** Paginated Drinks History list */
export type DrinksHistoryPaginated = PaginatedQuery & {
  __typename?: 'DrinksHistoryPaginated';
  edges: Array<DrinkHistoryEdge>;
  pageInfo?: Maybe<PageInfo>;
};

/** Paginated list of drinks */
export type DrinksPaginated = PaginatedQuery & {
  __typename?: 'DrinksPaginated';
  edges: Array<DrinkEdge>;
  pageInfo?: Maybe<PageInfo>;
};

/** Paginated list of entries */
export type EntriesPaginated = PaginatedQuery & {
  __typename?: 'EntriesPaginated';
  edges: Array<EntryEdge>;
  pageInfo?: Maybe<PageInfo>;
};

/** Base Entry for logged drinks */
export type Entry = Node & {
  __typename?: 'Entry';
  caffeine: Scalars['Float'];
  drink?: Maybe<DrinkResult>;
  id: Scalars['ID'];
  servings: Scalars['Float'];
  sugar: Scalars['Float'];
  timestamp: Scalars['Date'];
  user?: Maybe<User>;
  volume: Scalars['Float'];
  waterContent: Scalars['Float'];
};

/** Edge for Paginated Entries */
export type EntryEdge = {
  __typename?: 'EntryEdge';
  cursor?: Maybe<Scalars['String']>;
  node: Entry;
};

/** Sorting input for Entries */
export type EntrySort = {
  drink?: InputMaybe<Sort>;
  timestamp?: InputMaybe<Sort>;
  volume?: InputMaybe<Sort>;
};

/** Base Ingredient used in Drink type */
export type Ingredient = {
  __typename?: 'Ingredient';
  drink?: Maybe<DrinkResult>;
  id: Scalars['ID'];
  parts: Scalars['Int'];
};

/** Input for Ingredient type */
export type IngredientInput = {
  drinkId: Scalars['ID'];
  parts: Scalars['Int'];
};

/** Mixed Drink when drink has ingredients */
export type MixedDrink = Drink & Node & {
  __typename?: 'MixedDrink';
  caffeine?: Maybe<Scalars['Float']>;
  coefficient?: Maybe<Scalars['Float']>;
  createdAt: Scalars['Date'];
  entries?: Maybe<Array<Entry>>;
  icon: Scalars['Icon'];
  id: Scalars['ID'];
  ingredients: Array<Ingredient>;
  name: Scalars['String'];
  servingSize?: Maybe<Scalars['Float']>;
  sugar?: Maybe<Scalars['Float']>;
  user?: Maybe<User>;
};

/** Root Mutations */
export type Mutation = {
  __typename?: 'Mutation';
  drinkCreate?: Maybe<DrinkResult>;
  drinkDelete?: Maybe<DrinkResult>;
  drinkEdit?: Maybe<DrinkResult>;
  entryCreate?: Maybe<Entry>;
  entryDelete?: Maybe<Entry>;
  userCreate?: Maybe<User>;
};


/** Root Mutations */
export type MutationDrinkCreateArgs = {
  drinkInput: DrinkCreateInput;
};


/** Root Mutations */
export type MutationDrinkDeleteArgs = {
  drinkId: Scalars['ID'];
};


/** Root Mutations */
export type MutationDrinkEditArgs = {
  drinkInput: DrinkEditInput;
};


/** Root Mutations */
export type MutationEntryCreateArgs = {
  drinkId: Scalars['ID'];
  volume: Scalars['Float'];
};


/** Root Mutations */
export type MutationEntryDeleteArgs = {
  entryId: Scalars['ID'];
};


/** Root Mutations */
export type MutationUserCreateArgs = {
  userId: Scalars['ID'];
};

/** Node interface for Paginated Queries */
export type Node = {
  id: Scalars['ID'];
};

/** Pagination List metadata */
export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPreviousPage?: Maybe<Scalars['Boolean']>;
  startCursor?: Maybe<Scalars['String']>;
};

/** Interface for paginated queries */
export type PaginatedQuery = {
  pageInfo?: Maybe<PageInfo>;
};

/** Root Queries */
export type Query = {
  __typename?: 'Query';
  /**  Get a drink by id  */
  drink?: Maybe<DrinkResult>;
  drinkHistory?: Maybe<DrinkHistory>;
  drinks?: Maybe<DrinksPaginated>;
  drinksHistory?: Maybe<DrinksHistoryPaginated>;
  entries?: Maybe<EntriesPaginated>;
  entry?: Maybe<Entry>;
  me?: Maybe<User>;
  node?: Maybe<Node>;
  user?: Maybe<User>;
  users?: Maybe<Array<User>>;
};


/** Root Queries */
export type QueryDrinkArgs = {
  drinkId: Scalars['ID'];
};


/** Root Queries */
export type QueryDrinkHistoryArgs = {
  drinkId: Scalars['ID'];
};


/** Root Queries */
export type QueryDrinksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<DrinkSort>;
  userId?: InputMaybe<Scalars['ID']>;
};


/** Root Queries */
export type QueryDrinksHistoryArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<DrinksHistoryFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Root Queries */
export type QueryEntriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  distinct?: InputMaybe<Scalars['Boolean']>;
  drinkId?: InputMaybe<Scalars['ID']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<EntrySort>;
};


/** Root Queries */
export type QueryEntryArgs = {
  entryId: Scalars['ID'];
};


/** Root Queries */
export type QueryNodeArgs = {
  id: Scalars['ID'];
};


/** Root Queries */
export type QueryUserArgs = {
  userId: Scalars['ID'];
};

/** Sort Enum */
export enum Sort {
  Asc = 'ASC',
  Desc = 'DESC'
}

/** Base user type */
export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type ResolversUnionTypes = ResolversObject<{
  DrinkResult: ( BaseDrinkModel ) | ( MixedDrinkModel );
}>;

/** Mapping of union parent types */
export type ResolversUnionParentTypes = ResolversObject<{
  DrinkResult: ( BaseDrinkModel ) | ( MixedDrinkModel );
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  BaseDrink: ResolverTypeWrapper<BaseDrinkModel>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CacheControlScope: CacheControlScope;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  Drink: ResolverTypeWrapper<DrinkModel>;
  DrinkCreateInput: DrinkCreateInput;
  DrinkEdge: ResolverTypeWrapper<Omit<DrinkEdge, 'node'> & { node: ResolversTypes['DrinkResult'] }>;
  DrinkEditInput: DrinkEditInput;
  DrinkHistory: ResolverTypeWrapper<DrinkHistoryModel>;
  DrinkHistoryEdge: ResolverTypeWrapper<Omit<DrinkHistoryEdge, 'node'> & { node: ResolversTypes['DrinkHistory'] }>;
  DrinkResult: ResolverTypeWrapper<ResolversUnionTypes['DrinkResult']>;
  DrinkSort: DrinkSort;
  DrinksHistoryFilter: DrinksHistoryFilter;
  DrinksHistoryPaginated: ResolverTypeWrapper<Omit<DrinksHistoryPaginated, 'edges'> & { edges: Array<ResolversTypes['DrinkHistoryEdge']> }>;
  DrinksPaginated: ResolverTypeWrapper<DrinksPaginated>;
  EntriesPaginated: ResolverTypeWrapper<Omit<EntriesPaginated, 'edges'> & { edges: Array<ResolversTypes['EntryEdge']> }>;
  Entry: ResolverTypeWrapper<EntryModel>;
  EntryEdge: ResolverTypeWrapper<Omit<EntryEdge, 'node'> & { node: ResolversTypes['Entry'] }>;
  EntrySort: EntrySort;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Icon: ResolverTypeWrapper<Scalars['Icon']>;
  Ingredient: ResolverTypeWrapper<Omit<Ingredient, 'drink'> & { drink?: Maybe<ResolversTypes['DrinkResult']> }>;
  IngredientInput: IngredientInput;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  MixedDrink: ResolverTypeWrapper<MixedDrinkModel>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolversTypes['BaseDrink'] | ResolversTypes['DrinkHistory'] | ResolversTypes['Entry'] | ResolversTypes['MixedDrink'];
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PaginatedQuery: ResolversTypes['DrinksHistoryPaginated'] | ResolversTypes['DrinksPaginated'] | ResolversTypes['EntriesPaginated'];
  Query: ResolverTypeWrapper<{}>;
  Sort: Sort;
  String: ResolverTypeWrapper<Scalars['String']>;
  User: ResolverTypeWrapper<User>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  BaseDrink: BaseDrinkModel;
  Boolean: Scalars['Boolean'];
  Date: Scalars['Date'];
  Drink: DrinkModel;
  DrinkCreateInput: DrinkCreateInput;
  DrinkEdge: Omit<DrinkEdge, 'node'> & { node: ResolversParentTypes['DrinkResult'] };
  DrinkEditInput: DrinkEditInput;
  DrinkHistory: DrinkHistoryModel;
  DrinkHistoryEdge: Omit<DrinkHistoryEdge, 'node'> & { node: ResolversParentTypes['DrinkHistory'] };
  DrinkResult: ResolversUnionParentTypes['DrinkResult'];
  DrinkSort: DrinkSort;
  DrinksHistoryFilter: DrinksHistoryFilter;
  DrinksHistoryPaginated: Omit<DrinksHistoryPaginated, 'edges'> & { edges: Array<ResolversParentTypes['DrinkHistoryEdge']> };
  DrinksPaginated: DrinksPaginated;
  EntriesPaginated: Omit<EntriesPaginated, 'edges'> & { edges: Array<ResolversParentTypes['EntryEdge']> };
  Entry: EntryModel;
  EntryEdge: Omit<EntryEdge, 'node'> & { node: ResolversParentTypes['Entry'] };
  EntrySort: EntrySort;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Icon: Scalars['Icon'];
  Ingredient: Omit<Ingredient, 'drink'> & { drink?: Maybe<ResolversParentTypes['DrinkResult']> };
  IngredientInput: IngredientInput;
  Int: Scalars['Int'];
  MixedDrink: MixedDrinkModel;
  Mutation: {};
  Node: ResolversParentTypes['BaseDrink'] | ResolversParentTypes['DrinkHistory'] | ResolversParentTypes['Entry'] | ResolversParentTypes['MixedDrink'];
  PageInfo: PageInfo;
  PaginatedQuery: ResolversParentTypes['DrinksHistoryPaginated'] | ResolversParentTypes['DrinksPaginated'] | ResolversParentTypes['EntriesPaginated'];
  Query: {};
  String: Scalars['String'];
  User: User;
}>;

export type CacheControlDirectiveArgs = {
  inheritMaxAge?: Maybe<Scalars['Boolean']>;
  maxAge?: Maybe<Scalars['Int']>;
  scope?: Maybe<CacheControlScope>;
};

export type CacheControlDirectiveResolver<Result, Parent, ContextType = AppContext, Args = CacheControlDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type BaseDrinkResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['BaseDrink'] = ResolversParentTypes['BaseDrink']> = ResolversObject<{
  caffeine?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  coefficient?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  entries?: Resolver<Maybe<Array<ResolversTypes['Entry']>>, ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['Icon'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  servingSize?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  sugar?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type DrinkResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Drink'] = ResolversParentTypes['Drink']> = ResolversObject<{
  __resolveType: TypeResolveFn<'BaseDrink' | 'MixedDrink', ParentType, ContextType>;
  caffeine?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  coefficient?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  entries?: Resolver<Maybe<Array<ResolversTypes['Entry']>>, ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['Icon'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  servingSize?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  sugar?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
}>;

export type DrinkEdgeResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['DrinkEdge'] = ResolversParentTypes['DrinkEdge']> = ResolversObject<{
  cursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  node?: Resolver<ResolversTypes['DrinkResult'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DrinkHistoryResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['DrinkHistory'] = ResolversParentTypes['DrinkHistory']> = ResolversObject<{
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  drink?: Resolver<ResolversTypes['DrinkResult'], ParentType, ContextType>;
  entries?: Resolver<Maybe<ResolversTypes['EntriesPaginated']>, ParentType, ContextType, Partial<DrinkHistoryEntriesArgs>>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastEntry?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  totalVolume?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  waterVolume?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DrinkHistoryEdgeResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['DrinkHistoryEdge'] = ResolversParentTypes['DrinkHistoryEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['DrinkHistory'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DrinkResultResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['DrinkResult'] = ResolversParentTypes['DrinkResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'BaseDrink' | 'MixedDrink', ParentType, ContextType>;
}>;

export type DrinksHistoryPaginatedResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['DrinksHistoryPaginated'] = ResolversParentTypes['DrinksHistoryPaginated']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['DrinkHistoryEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DrinksPaginatedResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['DrinksPaginated'] = ResolversParentTypes['DrinksPaginated']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['DrinkEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EntriesPaginatedResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['EntriesPaginated'] = ResolversParentTypes['EntriesPaginated']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['EntryEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EntryResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Entry'] = ResolversParentTypes['Entry']> = ResolversObject<{
  caffeine?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  drink?: Resolver<Maybe<ResolversTypes['DrinkResult']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  servings?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  sugar?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  volume?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  waterContent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EntryEdgeResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['EntryEdge'] = ResolversParentTypes['EntryEdge']> = ResolversObject<{
  cursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface IconScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Icon'], any> {
  name: 'Icon';
}

export type IngredientResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Ingredient'] = ResolversParentTypes['Ingredient']> = ResolversObject<{
  drink?: Resolver<Maybe<ResolversTypes['DrinkResult']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parts?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MixedDrinkResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['MixedDrink'] = ResolversParentTypes['MixedDrink']> = ResolversObject<{
  caffeine?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  coefficient?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  entries?: Resolver<Maybe<Array<ResolversTypes['Entry']>>, ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['Icon'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ingredients?: Resolver<Array<ResolversTypes['Ingredient']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  servingSize?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  sugar?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  drinkCreate?: Resolver<Maybe<ResolversTypes['DrinkResult']>, ParentType, ContextType, RequireFields<MutationDrinkCreateArgs, 'drinkInput'>>;
  drinkDelete?: Resolver<Maybe<ResolversTypes['DrinkResult']>, ParentType, ContextType, RequireFields<MutationDrinkDeleteArgs, 'drinkId'>>;
  drinkEdit?: Resolver<Maybe<ResolversTypes['DrinkResult']>, ParentType, ContextType, RequireFields<MutationDrinkEditArgs, 'drinkInput'>>;
  entryCreate?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<MutationEntryCreateArgs, 'drinkId' | 'volume'>>;
  entryDelete?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<MutationEntryDeleteArgs, 'entryId'>>;
  userCreate?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUserCreateArgs, 'userId'>>;
}>;

export type NodeResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = ResolversObject<{
  __resolveType: TypeResolveFn<'BaseDrink' | 'DrinkHistory' | 'Entry' | 'MixedDrink', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type PageInfoResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PaginatedQueryResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['PaginatedQuery'] = ResolversParentTypes['PaginatedQuery']> = ResolversObject<{
  __resolveType: TypeResolveFn<'DrinksHistoryPaginated' | 'DrinksPaginated' | 'EntriesPaginated', ParentType, ContextType>;
  pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  drink?: Resolver<Maybe<ResolversTypes['DrinkResult']>, ParentType, ContextType, RequireFields<QueryDrinkArgs, 'drinkId'>>;
  drinkHistory?: Resolver<Maybe<ResolversTypes['DrinkHistory']>, ParentType, ContextType, RequireFields<QueryDrinkHistoryArgs, 'drinkId'>>;
  drinks?: Resolver<Maybe<ResolversTypes['DrinksPaginated']>, ParentType, ContextType, Partial<QueryDrinksArgs>>;
  drinksHistory?: Resolver<Maybe<ResolversTypes['DrinksHistoryPaginated']>, ParentType, ContextType, Partial<QueryDrinksHistoryArgs>>;
  entries?: Resolver<Maybe<ResolversTypes['EntriesPaginated']>, ParentType, ContextType, Partial<QueryEntriesArgs>>;
  entry?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryEntryArgs, 'entryId'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'userId'>>;
  users?: Resolver<Maybe<Array<ResolversTypes['User']>>, ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = AppContext> = ResolversObject<{
  BaseDrink?: BaseDrinkResolvers<ContextType>;
  Date?: GraphQLScalarType;
  Drink?: DrinkResolvers<ContextType>;
  DrinkEdge?: DrinkEdgeResolvers<ContextType>;
  DrinkHistory?: DrinkHistoryResolvers<ContextType>;
  DrinkHistoryEdge?: DrinkHistoryEdgeResolvers<ContextType>;
  DrinkResult?: DrinkResultResolvers<ContextType>;
  DrinksHistoryPaginated?: DrinksHistoryPaginatedResolvers<ContextType>;
  DrinksPaginated?: DrinksPaginatedResolvers<ContextType>;
  EntriesPaginated?: EntriesPaginatedResolvers<ContextType>;
  Entry?: EntryResolvers<ContextType>;
  EntryEdge?: EntryEdgeResolvers<ContextType>;
  Icon?: GraphQLScalarType;
  Ingredient?: IngredientResolvers<ContextType>;
  MixedDrink?: MixedDrinkResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PaginatedQuery?: PaginatedQueryResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = AppContext> = ResolversObject<{
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>;
}>;
