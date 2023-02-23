import { GraphQLResolveInfo } from 'graphql';
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
};

export type Drink = {
  __typename?: 'Drink';
  caffeine?: Maybe<Scalars['Float']>;
  coefficient?: Maybe<Scalars['Float']>;
  entries?: Maybe<Array<Maybe<Entry>>>;
  icon: Scalars['String'];
  id: Scalars['ID'];
  ingredients?: Maybe<Array<Maybe<Ingredient>>>;
  name: Scalars['String'];
  sugar?: Maybe<Scalars['Float']>;
};


export type DrinkIngredientsArgs = {
  drinkId: Scalars['ID'];
};

export type Entry = {
  __typename?: 'Entry';
  drink: Drink;
  id: Scalars['ID'];
  timestamp: Scalars['String'];
  user: User;
  volume: Scalars['Float'];
};

export type Ingredient = {
  __typename?: 'Ingredient';
  drink?: Maybe<Drink>;
  id: Scalars['ID'];
  parts: Scalars['Int'];
};


export type IngredientDrinkArgs = {
  ingredientId: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  drink?: Maybe<Drink>;
  drinks?: Maybe<Array<Maybe<Drink>>>;
  entries?: Maybe<Array<Maybe<Entry>>>;
  ingredient?: Maybe<Ingredient>;
  ingredients?: Maybe<Array<Maybe<Ingredient>>>;
  user?: Maybe<User>;
  users?: Maybe<Array<Maybe<User>>>;
};


export type QueryDrinkArgs = {
  drinkId: Scalars['ID'];
};


export type QueryDrinksArgs = {
  userId?: InputMaybe<Scalars['ID']>;
};


export type QueryEntriesArgs = {
  drinkId?: InputMaybe<Scalars['ID']>;
};


export type QueryIngredientArgs = {
  ingredientId: Scalars['ID'];
};


export type QueryIngredientsArgs = {
  drinkId: Scalars['ID'];
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
  Drink: ResolverTypeWrapper<Drink>;
  Entry: ResolverTypeWrapper<Entry>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Ingredient: ResolverTypeWrapper<Ingredient>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  User: ResolverTypeWrapper<User>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean'];
  Drink: Drink;
  Entry: Entry;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Ingredient: Ingredient;
  Int: Scalars['Int'];
  Query: {};
  String: Scalars['String'];
  User: User;
}>;

export type DrinkResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Drink'] = ResolversParentTypes['Drink']> = ResolversObject<{
  caffeine?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  coefficient?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  entries?: Resolver<Maybe<Array<Maybe<ResolversTypes['Entry']>>>, ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ingredients?: Resolver<Maybe<Array<Maybe<ResolversTypes['Ingredient']>>>, ParentType, ContextType, RequireFields<DrinkIngredientsArgs, 'drinkId'>>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sugar?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EntryResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Entry'] = ResolversParentTypes['Entry']> = ResolversObject<{
  drink?: Resolver<ResolversTypes['Drink'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  volume?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IngredientResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Ingredient'] = ResolversParentTypes['Ingredient']> = ResolversObject<{
  drink?: Resolver<Maybe<ResolversTypes['Drink']>, ParentType, ContextType, RequireFields<IngredientDrinkArgs, 'ingredientId'>>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parts?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  drink?: Resolver<Maybe<ResolversTypes['Drink']>, ParentType, ContextType, RequireFields<QueryDrinkArgs, 'drinkId'>>;
  drinks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Drink']>>>, ParentType, ContextType, Partial<QueryDrinksArgs>>;
  entries?: Resolver<Maybe<Array<Maybe<ResolversTypes['Entry']>>>, ParentType, ContextType, Partial<QueryEntriesArgs>>;
  ingredient?: Resolver<Maybe<ResolversTypes['Ingredient']>, ParentType, ContextType, RequireFields<QueryIngredientArgs, 'ingredientId'>>;
  ingredients?: Resolver<Maybe<Array<Maybe<ResolversTypes['Ingredient']>>>, ParentType, ContextType, RequireFields<QueryIngredientsArgs, 'drinkId'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'userId'>>;
  users?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = AppContext> = ResolversObject<{
  Drink?: DrinkResolvers<ContextType>;
  Entry?: EntryResolvers<ContextType>;
  Ingredient?: IngredientResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

