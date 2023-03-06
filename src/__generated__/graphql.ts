import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { AppContext } from '../types/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  Icon: any;
};

export type Drink = {
  __typename?: 'Drink';
  caffeine?: Maybe<Scalars['Float']>;
  coefficient?: Maybe<Scalars['Float']>;
  entries?: Maybe<Array<Maybe<Entry>>>;
  icon: Scalars['Icon'];
  id: Scalars['ID'];
  ingredients?: Maybe<Array<Maybe<Ingredient>>>;
  name: Scalars['String'];
  sugar?: Maybe<Scalars['Float']>;
  user?: Maybe<User>;
};

export type DrinkHistory = {
  __typename?: 'DrinkHistory';
  count: Scalars['Int'];
  drink: Drink;
  lastEntry?: Maybe<Scalars['Date']>;
  totalVolume: Scalars['Float'];
  waterVolume: Scalars['Float'];
};

export type DrinkInput = {
  caffeine?: InputMaybe<Scalars['String']>;
  coefficient?: InputMaybe<Scalars['String']>;
  icon: Scalars['Icon'];
  ingredients?: InputMaybe<Array<IngredientInput>>;
  name: Scalars['String'];
  servingSize?: InputMaybe<Scalars['String']>;
  sugar?: InputMaybe<Scalars['String']>;
};

export type Entry = {
  __typename?: 'Entry';
  caffeine: Scalars['Float'];
  drink?: Maybe<Drink>;
  id: Scalars['ID'];
  sugar: Scalars['Float'];
  timestamp: Scalars['Date'];
  user?: Maybe<User>;
  volume: Scalars['Float'];
  waterContent: Scalars['Float'];
};

export type Ingredient = {
  __typename?: 'Ingredient';
  drink?: Maybe<Drink>;
  id: Scalars['ID'];
  parts: Scalars['Int'];
};

export type IngredientInput = {
  drinkId: Scalars['ID'];
  parts: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  drinkCreate?: Maybe<Drink>;
  drinkDelete?: Maybe<Drink>;
  entryCreate?: Maybe<Entry>;
};


export type MutationDrinkCreateArgs = {
  drinkInput: DrinkInput;
};


export type MutationDrinkDeleteArgs = {
  drinkId: Scalars['ID'];
};


export type MutationEntryCreateArgs = {
  drinkId: Scalars['ID'];
  volume: Scalars['Float'];
};

export type Query = {
  __typename?: 'Query';
  currentUser?: Maybe<User>;
  drink?: Maybe<Drink>;
  drinkHistory?: Maybe<DrinkHistory>;
  drinks?: Maybe<Array<Maybe<Drink>>>;
  drinksHistory?: Maybe<Array<Maybe<DrinkHistory>>>;
  entries?: Maybe<Array<Maybe<Entry>>>;
  user?: Maybe<User>;
  users?: Maybe<Array<User>>;
};


export type QueryDrinkArgs = {
  drinkId: Scalars['ID'];
};


export type QueryDrinkHistoryArgs = {
  drinkId: Scalars['ID'];
};


export type QueryDrinksArgs = {
  userId?: InputMaybe<Scalars['ID']>;
};


export type QueryEntriesArgs = {
  distinct?: InputMaybe<Scalars['Boolean']>;
  drinkId?: InputMaybe<Scalars['ID']>;
};


export type QueryUserArgs = {
  userId: Scalars['ID'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  Drink: ResolverTypeWrapper<Drink>;
  DrinkHistory: ResolverTypeWrapper<DrinkHistory>;
  DrinkInput: DrinkInput;
  Entry: ResolverTypeWrapper<Entry>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Icon: ResolverTypeWrapper<Scalars['Icon']>;
  Ingredient: ResolverTypeWrapper<Ingredient>;
  IngredientInput: IngredientInput;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  User: ResolverTypeWrapper<User>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean'];
  Date: Scalars['Date'];
  Drink: Drink;
  DrinkHistory: DrinkHistory;
  DrinkInput: DrinkInput;
  Entry: Entry;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Icon: Scalars['Icon'];
  Ingredient: Ingredient;
  IngredientInput: IngredientInput;
  Int: Scalars['Int'];
  Mutation: {};
  Query: {};
  String: Scalars['String'];
  User: User;
}>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type DrinkResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Drink'] = ResolversParentTypes['Drink']> = ResolversObject<{
  caffeine?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  coefficient?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  entries?: Resolver<Maybe<Array<Maybe<ResolversTypes['Entry']>>>, ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['Icon'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ingredients?: Resolver<Maybe<Array<Maybe<ResolversTypes['Ingredient']>>>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sugar?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DrinkHistoryResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['DrinkHistory'] = ResolversParentTypes['DrinkHistory']> = ResolversObject<{
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  drink?: Resolver<ResolversTypes['Drink'], ParentType, ContextType>;
  lastEntry?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  totalVolume?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  waterVolume?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EntryResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Entry'] = ResolversParentTypes['Entry']> = ResolversObject<{
  caffeine?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  drink?: Resolver<Maybe<ResolversTypes['Drink']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sugar?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  volume?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  waterContent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface IconScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Icon'], any> {
  name: 'Icon';
}

export type IngredientResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Ingredient'] = ResolversParentTypes['Ingredient']> = ResolversObject<{
  drink?: Resolver<Maybe<ResolversTypes['Drink']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parts?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  drinkCreate?: Resolver<Maybe<ResolversTypes['Drink']>, ParentType, ContextType, RequireFields<MutationDrinkCreateArgs, 'drinkInput'>>;
  drinkDelete?: Resolver<Maybe<ResolversTypes['Drink']>, ParentType, ContextType, RequireFields<MutationDrinkDeleteArgs, 'drinkId'>>;
  entryCreate?: Resolver<Maybe<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<MutationEntryCreateArgs, 'drinkId' | 'volume'>>;
}>;

export type QueryResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  currentUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  drink?: Resolver<Maybe<ResolversTypes['Drink']>, ParentType, ContextType, RequireFields<QueryDrinkArgs, 'drinkId'>>;
  drinkHistory?: Resolver<Maybe<ResolversTypes['DrinkHistory']>, ParentType, ContextType, RequireFields<QueryDrinkHistoryArgs, 'drinkId'>>;
  drinks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Drink']>>>, ParentType, ContextType, Partial<QueryDrinksArgs>>;
  drinksHistory?: Resolver<Maybe<Array<Maybe<ResolversTypes['DrinkHistory']>>>, ParentType, ContextType>;
  entries?: Resolver<Maybe<Array<Maybe<ResolversTypes['Entry']>>>, ParentType, ContextType, Partial<QueryEntriesArgs>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'userId'>>;
  users?: Resolver<Maybe<Array<ResolversTypes['User']>>, ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = AppContext> = ResolversObject<{
  Date?: GraphQLScalarType;
  Drink?: DrinkResolvers<ContextType>;
  DrinkHistory?: DrinkHistoryResolvers<ContextType>;
  Entry?: EntryResolvers<ContextType>;
  Icon?: GraphQLScalarType;
  Ingredient?: IngredientResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

