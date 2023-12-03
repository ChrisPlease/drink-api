import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Drink as DrinkModel, Drink as BaseDrinkModel, Drink as MixedDrinkModel } from '.prisma/client';
import { ResolvedEntry as EntryModel, DrinkHistory as DrinkHistoryModel } from '../types/models';
import { AppContext } from '../types/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = undefined | T;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Date scalar used for JS Date */
  Date: { input: Date; output: Date; }
  /** Icon scalar mapped to FontAwesome `IconName` type */
  Icon: { input: any; output: any; }
};

/** Absolute ingredient used in drink, size is based on absolute volume (ounces) */
export type AbsoluteIngredient = DrinkIngredient & {
  __typename?: 'AbsoluteIngredient';
  drink?: Maybe<DrinkResult>;
  id: Scalars['ID']['output'];
  volume?: Maybe<Scalars['Float']['output']>;
};

/** Base Drink used for all drinks */
export type BaseDrink = Drink & Node & {
  __typename?: 'BaseDrink';
  createdAt: Scalars['Date']['output'];
  entries?: Maybe<EntriesPaginated>;
  icon: Scalars['Icon']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  nutrition?: Maybe<DrinkNutrition>;
  upc?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};


/** Base Drink used for all drinks */
export type BaseDrinkEntriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<EntryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<EntrySort>;
};

/** Comparison Enum */
export enum Comparison {
  Gt = 'GT',
  Gte = 'GTE',
  Lt = 'LT',
  Lte = 'LTE'
}

/** Drink Interface for all drinks */
export type Drink = {
  createdAt: Scalars['Date']['output'];
  entries?: Maybe<EntriesPaginated>;
  icon: Scalars['Icon']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  nutrition?: Maybe<DrinkNutrition>;
  user?: Maybe<User>;
};


/** Drink Interface for all drinks */
export type DrinkEntriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<EntryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<EntrySort>;
};

/** Input for Creating a new Drink */
export type DrinkCreateInput = {
  icon: Scalars['Icon']['input'];
  ingredients?: InputMaybe<Array<IngredientInput>>;
  name: Scalars['String']['input'];
  nutrition: DrinkNutritionInput;
  upc?: InputMaybe<Scalars['String']['input']>;
};

/** Edge for Paginated Drinks */
export type DrinkEdge = {
  __typename?: 'DrinkEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node: DrinkResult;
};

/** Input for Editing a Drink */
export type DrinkEditInput = {
  icon?: InputMaybe<Scalars['Icon']['input']>;
  id: Scalars['ID']['input'];
  ingredients?: InputMaybe<Array<IngredientInput>>;
  name?: InputMaybe<Scalars['String']['input']>;
  nutrition?: InputMaybe<DrinkNutritionInput>;
};

/** Filter for the Drinks query */
export type DrinkFilter = {
  id?: InputMaybe<IdFilter>;
  isMixedDrink?: InputMaybe<Scalars['Boolean']['input']>;
  isUserDrink?: InputMaybe<Scalars['Boolean']['input']>;
  nutrition?: InputMaybe<DrinkNutritionFilter>;
  search?: InputMaybe<Scalars['String']['input']>;
};

/** Drink History to retreive summary of drink entries */
export type DrinkHistory = Node & {
  __typename?: 'DrinkHistory';
  count: Scalars['Int']['output'];
  drink: DrinkResult;
  entries?: Maybe<EntriesPaginated>;
  id: Scalars['ID']['output'];
  volume: Scalars['Float']['output'];
  water: Scalars['Float']['output'];
};


/** Drink History to retreive summary of drink entries */
export type DrinkHistoryEntriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  drinkId?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<EntrySort>;
};

/** Edge for Paginated Drink History */
export type DrinkHistoryEdge = {
  __typename?: 'DrinkHistoryEdge';
  cursor: Scalars['String']['output'];
  node: DrinkHistory;
};

/** Filter for the Drinks History query */
export type DrinkHistoryFilter = {
  hasEntries?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Date']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

/** Ingredient Interface to combine drink and ID */
export type DrinkIngredient = {
  drink?: Maybe<DrinkResult>;
  id: Scalars['ID']['output'];
};

/** Drink Health Nutrition field */
export type DrinkNutrition = Nutrition & {
  __typename?: 'DrinkNutrition';
  addedSugar?: Maybe<Scalars['Float']['output']>;
  caffeine?: Maybe<Scalars['Float']['output']>;
  calories?: Maybe<Scalars['Float']['output']>;
  carbohydrates?: Maybe<Scalars['Float']['output']>;
  cholesterol?: Maybe<Scalars['Float']['output']>;
  coefficient?: Maybe<Scalars['Float']['output']>;
  fiber?: Maybe<Scalars['Float']['output']>;
  imperialSize?: Maybe<Scalars['Int']['output']>;
  metricSize: Scalars['Int']['output'];
  potassium?: Maybe<Scalars['Float']['output']>;
  protein?: Maybe<Scalars['Float']['output']>;
  saturatedFat?: Maybe<Scalars['Float']['output']>;
  servingSize?: Maybe<Scalars['Float']['output']>;
  servingUnit?: Maybe<Scalars['String']['output']>;
  sodium?: Maybe<Scalars['Float']['output']>;
  sugar?: Maybe<Scalars['Float']['output']>;
  totalFat?: Maybe<Scalars['Float']['output']>;
};

/** Filter by drink nutrition */
export type DrinkNutritionFilter = {
  caffeine?: InputMaybe<Array<NumberFilter>>;
  coefficient?: InputMaybe<Array<NumberFilter>>;
  sugar?: InputMaybe<Array<NumberFilter>>;
};

/** Nutriton Input for creating and editing drinks */
export type DrinkNutritionInput = {
  addedSugar?: InputMaybe<Scalars['Float']['input']>;
  caffeine?: InputMaybe<Scalars['Float']['input']>;
  calories?: InputMaybe<Scalars['Float']['input']>;
  carbohydrates?: InputMaybe<Scalars['Float']['input']>;
  cholesterol?: InputMaybe<Scalars['Float']['input']>;
  coefficient?: InputMaybe<Scalars['Float']['input']>;
  fiber?: InputMaybe<Scalars['Float']['input']>;
  metricSize: Scalars['Int']['input'];
  potassium?: InputMaybe<Scalars['Float']['input']>;
  protein?: InputMaybe<Scalars['Float']['input']>;
  saturatedFat?: InputMaybe<Scalars['Float']['input']>;
  servingSize: Scalars['Float']['input'];
  servingUnit: Scalars['String']['input'];
  sodium?: InputMaybe<Scalars['Float']['input']>;
  sugar?: InputMaybe<Scalars['Float']['input']>;
  totalFat?: InputMaybe<Scalars['Float']['input']>;
};

/** Sorting input for Drink Nutrition */
export type DrinkNutritionSort = {
  coefficient?: InputMaybe<Sort>;
  protein?: InputMaybe<Sort>;
};

/** Union of Mixed and Base Drinks */
export type DrinkResult = BaseDrink | MixedDrink;

/** Sorting input for Drinks */
export type DrinkSort = {
  createdAt?: InputMaybe<Sort>;
  entries?: InputMaybe<Sort>;
  name?: InputMaybe<Sort>;
  nutrition?: InputMaybe<DrinkNutritionSort>;
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
  drink: DrinkResult;
  id: Scalars['ID']['output'];
  nutrition?: Maybe<EntryNutrition>;
  servings?: Maybe<Scalars['Float']['output']>;
  timestamp: Scalars['Date']['output'];
  user?: Maybe<User>;
  volume: Scalars['Float']['output'];
};

/** Edge for Paginated Entries */
export type EntryEdge = {
  __typename?: 'EntryEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node: Entry;
};

/** Filter for the Entries query */
export type EntryFilter = {
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Date']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Entry nutrition field.
 *
 * Contains water content and servings
 */
export type EntryNutrition = Nutrition & {
  __typename?: 'EntryNutrition';
  addedSugar?: Maybe<Scalars['Float']['output']>;
  caffeine?: Maybe<Scalars['Float']['output']>;
  calories?: Maybe<Scalars['Float']['output']>;
  carbohydrates?: Maybe<Scalars['Float']['output']>;
  cholesterol?: Maybe<Scalars['Float']['output']>;
  fiber?: Maybe<Scalars['Float']['output']>;
  potassium?: Maybe<Scalars['Float']['output']>;
  protein?: Maybe<Scalars['Float']['output']>;
  saturatedFat?: Maybe<Scalars['Float']['output']>;
  servings?: Maybe<Scalars['Float']['output']>;
  sodium?: Maybe<Scalars['Float']['output']>;
  sugar?: Maybe<Scalars['Float']['output']>;
  totalFat?: Maybe<Scalars['Float']['output']>;
  water?: Maybe<Scalars['Float']['output']>;
};

/** Sorting input for Entries */
export type EntrySort = {
  drink?: InputMaybe<Sort>;
  timestamp?: InputMaybe<Sort>;
  volume?: InputMaybe<Sort>;
};

/** ID Filter */
export type IdFilter = {
  in?: InputMaybe<Array<Scalars['ID']['input']>>;
};

/** Ingredient Union combines Absolute and Relative Ingredients */
export type Ingredient = AbsoluteIngredient | RelativeIngredient;

/** Input for Ingredient type */
export type IngredientInput = {
  drinkId: Scalars['ID']['input'];
  parts?: InputMaybe<Scalars['Int']['input']>;
  volume?: InputMaybe<Scalars['Float']['input']>;
};

/** Mixed Drink when drink has ingredients */
export type MixedDrink = Drink & Node & {
  __typename?: 'MixedDrink';
  createdAt: Scalars['Date']['output'];
  entries?: Maybe<EntriesPaginated>;
  icon: Scalars['Icon']['output'];
  id: Scalars['ID']['output'];
  ingredients: Array<Ingredient>;
  name: Scalars['String']['output'];
  nutrition?: Maybe<DrinkNutrition>;
  user?: Maybe<User>;
};


/** Mixed Drink when drink has ingredients */
export type MixedDrinkEntriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<EntryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<EntrySort>;
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
  id: Scalars['ID']['input'];
};


/** Root Mutations */
export type MutationDrinkEditArgs = {
  drinkInput: DrinkEditInput;
};


/** Root Mutations */
export type MutationEntryCreateArgs = {
  drinkId: Scalars['ID']['input'];
  unit?: InputMaybe<Scalars['String']['input']>;
  volume: Scalars['Float']['input'];
};


/** Root Mutations */
export type MutationEntryDeleteArgs = {
  id: Scalars['ID']['input'];
};


/** Root Mutations */
export type MutationUserCreateArgs = {
  id: Scalars['ID']['input'];
};

/** Node interface for Paginated Queries */
export type Node = {
  id: Scalars['ID']['output'];
};

/** Number filter to allow gte, or lte comparison */
export type NumberFilter = {
  comparison: Comparison;
  value: Scalars['Float']['input'];
};

/** Nutrition interface for both drinks and entries */
export type Nutrition = {
  addedSugar?: Maybe<Scalars['Float']['output']>;
  caffeine?: Maybe<Scalars['Float']['output']>;
  calories?: Maybe<Scalars['Float']['output']>;
  carbohydrates?: Maybe<Scalars['Float']['output']>;
  cholesterol?: Maybe<Scalars['Float']['output']>;
  fiber?: Maybe<Scalars['Float']['output']>;
  potassium?: Maybe<Scalars['Float']['output']>;
  protein?: Maybe<Scalars['Float']['output']>;
  saturatedFat?: Maybe<Scalars['Float']['output']>;
  sodium?: Maybe<Scalars['Float']['output']>;
  sugar?: Maybe<Scalars['Float']['output']>;
  totalFat?: Maybe<Scalars['Float']['output']>;
};

/** Pagination List metadata */
export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Interface for paginated queries */
export type PaginatedQuery = {
  pageInfo?: Maybe<PageInfo>;
};

/** Root Queries */
export type Query = {
  __typename?: 'Query';
  /**  Get drink by ID  */
  drink?: Maybe<DrinkResult>;
  drinkHistory?: Maybe<DrinkHistory>;
  drinkNutrition?: Maybe<DrinkResult>;
  /**  Get paginated drinks  */
  drinks?: Maybe<DrinksPaginated>;
  drinksHistory?: Maybe<DrinksHistoryPaginated>;
  /**  Get paginated entries  */
  entries?: Maybe<EntriesPaginated>;
  /**  Get Entry by ID  */
  entry?: Maybe<Entry>;
  me?: Maybe<User>;
  /**  Get node by ID  */
  node?: Maybe<Node>;
  user?: Maybe<User>;
  users?: Maybe<Array<User>>;
};


/** Root Queries */
export type QueryDrinkArgs = {
  id: Scalars['ID']['input'];
};


/** Root Queries */
export type QueryDrinkHistoryArgs = {
  id: Scalars['ID']['input'];
};


/** Root Queries */
export type QueryDrinkNutritionArgs = {
  upc: Scalars['String']['input'];
};


/** Root Queries */
export type QueryDrinksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<DrinkFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<DrinkSort>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


/** Root Queries */
export type QueryDrinksHistoryArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<DrinkHistoryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Queries */
export type QueryEntriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  drinkId?: InputMaybe<Scalars['ID']['input']>;
  filter?: InputMaybe<EntryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<EntrySort>;
};


/** Root Queries */
export type QueryEntryArgs = {
  id: Scalars['ID']['input'];
};


/** Root Queries */
export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


/** Root Queries */
export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

/** Relative Ingredient used in drink, size is based on total drink serving size (parts) */
export type RelativeIngredient = DrinkIngredient & {
  __typename?: 'RelativeIngredient';
  drink?: Maybe<DrinkResult>;
  id: Scalars['ID']['output'];
  parts?: Maybe<Scalars['Float']['output']>;
};

/** Sort Enum */
export enum Sort {
  Asc = 'ASC',
  Desc = 'DESC'
}

/** Base user type */
export type User = Node & {
  __typename?: 'User';
  drinks?: Maybe<DrinksPaginated>;
  drinksHistory?: Maybe<DrinksHistoryPaginated>;
  entries?: Maybe<EntriesPaginated>;
  id: Scalars['ID']['output'];
};


/** Base user type */
export type UserDrinksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<DrinkFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<DrinkSort>;
};


/** Base user type */
export type UserDrinksHistoryArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<DrinkHistoryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Base user type */
export type UserEntriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  drinkId?: InputMaybe<Scalars['ID']['input']>;
  filter?: InputMaybe<EntryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<EntrySort>;
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
export type ResolversUnionTypes<RefType extends Record<string, unknown>> = ResolversObject<{
  DrinkResult: ( BaseDrinkModel ) | ( MixedDrinkModel );
  Ingredient: ( Omit<AbsoluteIngredient, 'drink'> & { drink?: Maybe<RefType['DrinkResult']> } ) | ( Omit<RelativeIngredient, 'drink'> & { drink?: Maybe<RefType['DrinkResult']> } );
}>;

/** Mapping of interface types */
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = ResolversObject<{
  Drink: ( BaseDrinkModel ) | ( MixedDrinkModel );
  DrinkIngredient: ( Omit<AbsoluteIngredient, 'drink'> & { drink?: Maybe<RefType['DrinkResult']> } ) | ( Omit<RelativeIngredient, 'drink'> & { drink?: Maybe<RefType['DrinkResult']> } );
  Node: ( BaseDrinkModel ) | ( DrinkHistoryModel ) | ( EntryModel ) | ( MixedDrinkModel ) | ( Omit<User, 'drinksHistory' | 'entries'> & { drinksHistory?: Maybe<RefType['DrinksHistoryPaginated']>, entries?: Maybe<RefType['EntriesPaginated']> } );
  Nutrition: ( DrinkNutrition ) | ( EntryNutrition );
  PaginatedQuery: ( Omit<DrinksHistoryPaginated, 'edges'> & { edges: Array<RefType['DrinkHistoryEdge']> } ) | ( DrinksPaginated ) | ( Omit<EntriesPaginated, 'edges'> & { edges: Array<RefType['EntryEdge']> } );
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AbsoluteIngredient: ResolverTypeWrapper<Omit<AbsoluteIngredient, 'drink'> & { drink?: Maybe<ResolversTypes['DrinkResult']> }>;
  BaseDrink: ResolverTypeWrapper<BaseDrinkModel>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Comparison: Comparison;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  Drink: ResolverTypeWrapper<DrinkModel>;
  DrinkCreateInput: DrinkCreateInput;
  DrinkEdge: ResolverTypeWrapper<Omit<DrinkEdge, 'node'> & { node: ResolversTypes['DrinkResult'] }>;
  DrinkEditInput: DrinkEditInput;
  DrinkFilter: DrinkFilter;
  DrinkHistory: ResolverTypeWrapper<DrinkHistoryModel>;
  DrinkHistoryEdge: ResolverTypeWrapper<Omit<DrinkHistoryEdge, 'node'> & { node: ResolversTypes['DrinkHistory'] }>;
  DrinkHistoryFilter: DrinkHistoryFilter;
  DrinkIngredient: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['DrinkIngredient']>;
  DrinkNutrition: ResolverTypeWrapper<DrinkNutrition>;
  DrinkNutritionFilter: DrinkNutritionFilter;
  DrinkNutritionInput: DrinkNutritionInput;
  DrinkNutritionSort: DrinkNutritionSort;
  DrinkResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DrinkResult']>;
  DrinkSort: DrinkSort;
  DrinksHistoryPaginated: ResolverTypeWrapper<Omit<DrinksHistoryPaginated, 'edges'> & { edges: Array<ResolversTypes['DrinkHistoryEdge']> }>;
  DrinksPaginated: ResolverTypeWrapper<DrinksPaginated>;
  EntriesPaginated: ResolverTypeWrapper<Omit<EntriesPaginated, 'edges'> & { edges: Array<ResolversTypes['EntryEdge']> }>;
  Entry: ResolverTypeWrapper<EntryModel>;
  EntryEdge: ResolverTypeWrapper<Omit<EntryEdge, 'node'> & { node: ResolversTypes['Entry'] }>;
  EntryFilter: EntryFilter;
  EntryNutrition: ResolverTypeWrapper<EntryNutrition>;
  EntrySort: EntrySort;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  IDFilter: IdFilter;
  Icon: ResolverTypeWrapper<Scalars['Icon']['output']>;
  Ingredient: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['Ingredient']>;
  IngredientInput: IngredientInput;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  MixedDrink: ResolverTypeWrapper<MixedDrinkModel>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
  NumberFilter: NumberFilter;
  Nutrition: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Nutrition']>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PaginatedQuery: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['PaginatedQuery']>;
  Query: ResolverTypeWrapper<{}>;
  RelativeIngredient: ResolverTypeWrapper<Omit<RelativeIngredient, 'drink'> & { drink?: Maybe<ResolversTypes['DrinkResult']> }>;
  Sort: Sort;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  User: ResolverTypeWrapper<Omit<User, 'drinksHistory' | 'entries'> & { drinksHistory?: Maybe<ResolversTypes['DrinksHistoryPaginated']>, entries?: Maybe<ResolversTypes['EntriesPaginated']> }>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AbsoluteIngredient: Omit<AbsoluteIngredient, 'drink'> & { drink?: Maybe<ResolversParentTypes['DrinkResult']> };
  BaseDrink: BaseDrinkModel;
  Boolean: Scalars['Boolean']['output'];
  Date: Scalars['Date']['output'];
  Drink: DrinkModel;
  DrinkCreateInput: DrinkCreateInput;
  DrinkEdge: Omit<DrinkEdge, 'node'> & { node: ResolversParentTypes['DrinkResult'] };
  DrinkEditInput: DrinkEditInput;
  DrinkFilter: DrinkFilter;
  DrinkHistory: DrinkHistoryModel;
  DrinkHistoryEdge: Omit<DrinkHistoryEdge, 'node'> & { node: ResolversParentTypes['DrinkHistory'] };
  DrinkHistoryFilter: DrinkHistoryFilter;
  DrinkIngredient: ResolversInterfaceTypes<ResolversParentTypes>['DrinkIngredient'];
  DrinkNutrition: DrinkNutrition;
  DrinkNutritionFilter: DrinkNutritionFilter;
  DrinkNutritionInput: DrinkNutritionInput;
  DrinkNutritionSort: DrinkNutritionSort;
  DrinkResult: ResolversUnionTypes<ResolversParentTypes>['DrinkResult'];
  DrinkSort: DrinkSort;
  DrinksHistoryPaginated: Omit<DrinksHistoryPaginated, 'edges'> & { edges: Array<ResolversParentTypes['DrinkHistoryEdge']> };
  DrinksPaginated: DrinksPaginated;
  EntriesPaginated: Omit<EntriesPaginated, 'edges'> & { edges: Array<ResolversParentTypes['EntryEdge']> };
  Entry: EntryModel;
  EntryEdge: Omit<EntryEdge, 'node'> & { node: ResolversParentTypes['Entry'] };
  EntryFilter: EntryFilter;
  EntryNutrition: EntryNutrition;
  EntrySort: EntrySort;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  IDFilter: IdFilter;
  Icon: Scalars['Icon']['output'];
  Ingredient: ResolversUnionTypes<ResolversParentTypes>['Ingredient'];
  IngredientInput: IngredientInput;
  Int: Scalars['Int']['output'];
  MixedDrink: MixedDrinkModel;
  Mutation: {};
  Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
  NumberFilter: NumberFilter;
  Nutrition: ResolversInterfaceTypes<ResolversParentTypes>['Nutrition'];
  PageInfo: PageInfo;
  PaginatedQuery: ResolversInterfaceTypes<ResolversParentTypes>['PaginatedQuery'];
  Query: {};
  RelativeIngredient: Omit<RelativeIngredient, 'drink'> & { drink?: Maybe<ResolversParentTypes['DrinkResult']> };
  String: Scalars['String']['output'];
  User: Omit<User, 'drinksHistory' | 'entries'> & { drinksHistory?: Maybe<ResolversParentTypes['DrinksHistoryPaginated']>, entries?: Maybe<ResolversParentTypes['EntriesPaginated']> };
}>;

export type AbsoluteIngredientResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['AbsoluteIngredient'] = ResolversParentTypes['AbsoluteIngredient']> = ResolversObject<{
  drink?: Resolver<Maybe<ResolversTypes['DrinkResult']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  volume?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BaseDrinkResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['BaseDrink'] = ResolversParentTypes['BaseDrink']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  entries?: Resolver<Maybe<ResolversTypes['EntriesPaginated']>, ParentType, ContextType, Partial<BaseDrinkEntriesArgs>>;
  icon?: Resolver<ResolversTypes['Icon'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nutrition?: Resolver<Maybe<ResolversTypes['DrinkNutrition']>, ParentType, ContextType>;
  upc?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type DrinkResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Drink'] = ResolversParentTypes['Drink']> = ResolversObject<{
  __resolveType: TypeResolveFn<'BaseDrink' | 'MixedDrink', ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  entries?: Resolver<Maybe<ResolversTypes['EntriesPaginated']>, ParentType, ContextType, Partial<DrinkEntriesArgs>>;
  icon?: Resolver<ResolversTypes['Icon'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nutrition?: Resolver<Maybe<ResolversTypes['DrinkNutrition']>, ParentType, ContextType>;
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
  volume?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  water?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DrinkHistoryEdgeResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['DrinkHistoryEdge'] = ResolversParentTypes['DrinkHistoryEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['DrinkHistory'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DrinkIngredientResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['DrinkIngredient'] = ResolversParentTypes['DrinkIngredient']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AbsoluteIngredient' | 'RelativeIngredient', ParentType, ContextType>;
  drink?: Resolver<Maybe<ResolversTypes['DrinkResult']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type DrinkNutritionResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['DrinkNutrition'] = ResolversParentTypes['DrinkNutrition']> = ResolversObject<{
  addedSugar?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  caffeine?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  calories?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  carbohydrates?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  cholesterol?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  coefficient?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  fiber?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  imperialSize?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  metricSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  potassium?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  protein?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  saturatedFat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  servingSize?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  servingUnit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sodium?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  sugar?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  totalFat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
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
  drink?: Resolver<ResolversTypes['DrinkResult'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  nutrition?: Resolver<Maybe<ResolversTypes['EntryNutrition']>, ParentType, ContextType>;
  servings?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  volume?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EntryEdgeResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['EntryEdge'] = ResolversParentTypes['EntryEdge']> = ResolversObject<{
  cursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Entry'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EntryNutritionResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['EntryNutrition'] = ResolversParentTypes['EntryNutrition']> = ResolversObject<{
  addedSugar?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  caffeine?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  calories?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  carbohydrates?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  cholesterol?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  fiber?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  potassium?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  protein?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  saturatedFat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  servings?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  sodium?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  sugar?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  totalFat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  water?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface IconScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Icon'], any> {
  name: 'Icon';
}

export type IngredientResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Ingredient'] = ResolversParentTypes['Ingredient']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AbsoluteIngredient' | 'RelativeIngredient', ParentType, ContextType>;
}>;

export type MixedDrinkResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['MixedDrink'] = ResolversParentTypes['MixedDrink']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  entries?: Resolver<Maybe<ResolversTypes['EntriesPaginated']>, ParentType, ContextType, Partial<MixedDrinkEntriesArgs>>;
  icon?: Resolver<ResolversTypes['Icon'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ingredients?: Resolver<Array<ResolversTypes['Ingredient']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nutrition?: Resolver<Maybe<ResolversTypes['DrinkNutrition']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  drinkCreate?: Resolver<Maybe<ResolversTypes['DrinkResult']>, ParentType, ContextType, RequireFields<MutationDrinkCreateArgs, 'drinkInput'>>;
  drinkDelete?: Resolver<Maybe<ResolversTypes['DrinkResult']>, ParentType, ContextType, RequireFields<MutationDrinkDeleteArgs, 'id'>>;
  drinkEdit?: Resolver<Maybe<ResolversTypes['DrinkResult']>, ParentType, ContextType, RequireFields<MutationDrinkEditArgs, 'drinkInput'>>;
  entryCreate?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<MutationEntryCreateArgs, 'drinkId' | 'volume'>>;
  entryDelete?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<MutationEntryDeleteArgs, 'id'>>;
  userCreate?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUserCreateArgs, 'id'>>;
}>;

export type NodeResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = ResolversObject<{
  __resolveType: TypeResolveFn<'BaseDrink' | 'DrinkHistory' | 'Entry' | 'MixedDrink' | 'User', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type NutritionResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Nutrition'] = ResolversParentTypes['Nutrition']> = ResolversObject<{
  __resolveType: TypeResolveFn<'DrinkNutrition' | 'EntryNutrition', ParentType, ContextType>;
  addedSugar?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  caffeine?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  calories?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  carbohydrates?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  cholesterol?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  fiber?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  potassium?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  protein?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  saturatedFat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  sodium?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  sugar?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  totalFat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
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
  drink?: Resolver<Maybe<ResolversTypes['DrinkResult']>, ParentType, ContextType, RequireFields<QueryDrinkArgs, 'id'>>;
  drinkHistory?: Resolver<Maybe<ResolversTypes['DrinkHistory']>, ParentType, ContextType, RequireFields<QueryDrinkHistoryArgs, 'id'>>;
  drinkNutrition?: Resolver<Maybe<ResolversTypes['DrinkResult']>, ParentType, ContextType, RequireFields<QueryDrinkNutritionArgs, 'upc'>>;
  drinks?: Resolver<Maybe<ResolversTypes['DrinksPaginated']>, ParentType, ContextType, Partial<QueryDrinksArgs>>;
  drinksHistory?: Resolver<Maybe<ResolversTypes['DrinksHistoryPaginated']>, ParentType, ContextType, Partial<QueryDrinksHistoryArgs>>;
  entries?: Resolver<Maybe<ResolversTypes['EntriesPaginated']>, ParentType, ContextType, Partial<QueryEntriesArgs>>;
  entry?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryEntryArgs, 'id'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<Maybe<Array<ResolversTypes['User']>>, ParentType, ContextType>;
}>;

export type RelativeIngredientResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['RelativeIngredient'] = ResolversParentTypes['RelativeIngredient']> = ResolversObject<{
  drink?: Resolver<Maybe<ResolversTypes['DrinkResult']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parts?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  drinks?: Resolver<Maybe<ResolversTypes['DrinksPaginated']>, ParentType, ContextType, Partial<UserDrinksArgs>>;
  drinksHistory?: Resolver<Maybe<ResolversTypes['DrinksHistoryPaginated']>, ParentType, ContextType, Partial<UserDrinksHistoryArgs>>;
  entries?: Resolver<Maybe<ResolversTypes['EntriesPaginated']>, ParentType, ContextType, Partial<UserEntriesArgs>>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = AppContext> = ResolversObject<{
  AbsoluteIngredient?: AbsoluteIngredientResolvers<ContextType>;
  BaseDrink?: BaseDrinkResolvers<ContextType>;
  Date?: GraphQLScalarType;
  Drink?: DrinkResolvers<ContextType>;
  DrinkEdge?: DrinkEdgeResolvers<ContextType>;
  DrinkHistory?: DrinkHistoryResolvers<ContextType>;
  DrinkHistoryEdge?: DrinkHistoryEdgeResolvers<ContextType>;
  DrinkIngredient?: DrinkIngredientResolvers<ContextType>;
  DrinkNutrition?: DrinkNutritionResolvers<ContextType>;
  DrinkResult?: DrinkResultResolvers<ContextType>;
  DrinksHistoryPaginated?: DrinksHistoryPaginatedResolvers<ContextType>;
  DrinksPaginated?: DrinksPaginatedResolvers<ContextType>;
  EntriesPaginated?: EntriesPaginatedResolvers<ContextType>;
  Entry?: EntryResolvers<ContextType>;
  EntryEdge?: EntryEdgeResolvers<ContextType>;
  EntryNutrition?: EntryNutritionResolvers<ContextType>;
  Icon?: GraphQLScalarType;
  Ingredient?: IngredientResolvers<ContextType>;
  MixedDrink?: MixedDrinkResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  Nutrition?: NutritionResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PaginatedQuery?: PaginatedQueryResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RelativeIngredient?: RelativeIngredientResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

