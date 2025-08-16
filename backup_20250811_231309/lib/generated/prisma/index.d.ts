
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Portfolio
 * 
 */
export type Portfolio = $Result.DefaultSelection<Prisma.$PortfolioPayload>
/**
 * Model Holding
 * 
 */
export type Holding = $Result.DefaultSelection<Prisma.$HoldingPayload>
/**
 * Model Transaction
 * 
 */
export type Transaction = $Result.DefaultSelection<Prisma.$TransactionPayload>
/**
 * Model Income
 * 
 */
export type Income = $Result.DefaultSelection<Prisma.$IncomePayload>
/**
 * Model Expense
 * 
 */
export type Expense = $Result.DefaultSelection<Prisma.$ExpensePayload>
/**
 * Model StockPrice
 * 
 */
export type StockPrice = $Result.DefaultSelection<Prisma.$StockPricePayload>
/**
 * Model DividendSchedule
 * 
 */
export type DividendSchedule = $Result.DefaultSelection<Prisma.$DividendSchedulePayload>
/**
 * Model CalculationCache
 * 
 */
export type CalculationCache = $Result.DefaultSelection<Prisma.$CalculationCachePayload>
/**
 * Model UserSettings
 * 
 */
export type UserSettings = $Result.DefaultSelection<Prisma.$UserSettingsPayload>
/**
 * Model TaxProfile
 * 
 */
export type TaxProfile = $Result.DefaultSelection<Prisma.$TaxProfilePayload>
/**
 * Model FinancialGoal
 * 
 */
export type FinancialGoal = $Result.DefaultSelection<Prisma.$FinancialGoalPayload>
/**
 * Model PerformanceSnapshot
 * 
 */
export type PerformanceSnapshot = $Result.DefaultSelection<Prisma.$PerformanceSnapshotPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.portfolio`: Exposes CRUD operations for the **Portfolio** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Portfolios
    * const portfolios = await prisma.portfolio.findMany()
    * ```
    */
  get portfolio(): Prisma.PortfolioDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.holding`: Exposes CRUD operations for the **Holding** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Holdings
    * const holdings = await prisma.holding.findMany()
    * ```
    */
  get holding(): Prisma.HoldingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.transaction`: Exposes CRUD operations for the **Transaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Transactions
    * const transactions = await prisma.transaction.findMany()
    * ```
    */
  get transaction(): Prisma.TransactionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.income`: Exposes CRUD operations for the **Income** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Incomes
    * const incomes = await prisma.income.findMany()
    * ```
    */
  get income(): Prisma.IncomeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.expense`: Exposes CRUD operations for the **Expense** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Expenses
    * const expenses = await prisma.expense.findMany()
    * ```
    */
  get expense(): Prisma.ExpenseDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.stockPrice`: Exposes CRUD operations for the **StockPrice** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more StockPrices
    * const stockPrices = await prisma.stockPrice.findMany()
    * ```
    */
  get stockPrice(): Prisma.StockPriceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dividendSchedule`: Exposes CRUD operations for the **DividendSchedule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DividendSchedules
    * const dividendSchedules = await prisma.dividendSchedule.findMany()
    * ```
    */
  get dividendSchedule(): Prisma.DividendScheduleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.calculationCache`: Exposes CRUD operations for the **CalculationCache** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CalculationCaches
    * const calculationCaches = await prisma.calculationCache.findMany()
    * ```
    */
  get calculationCache(): Prisma.CalculationCacheDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userSettings`: Exposes CRUD operations for the **UserSettings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserSettings
    * const userSettings = await prisma.userSettings.findMany()
    * ```
    */
  get userSettings(): Prisma.UserSettingsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.taxProfile`: Exposes CRUD operations for the **TaxProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TaxProfiles
    * const taxProfiles = await prisma.taxProfile.findMany()
    * ```
    */
  get taxProfile(): Prisma.TaxProfileDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.financialGoal`: Exposes CRUD operations for the **FinancialGoal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FinancialGoals
    * const financialGoals = await prisma.financialGoal.findMany()
    * ```
    */
  get financialGoal(): Prisma.FinancialGoalDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.performanceSnapshot`: Exposes CRUD operations for the **PerformanceSnapshot** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PerformanceSnapshots
    * const performanceSnapshots = await prisma.performanceSnapshot.findMany()
    * ```
    */
  get performanceSnapshot(): Prisma.PerformanceSnapshotDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.13.0
   * Query Engine version: 361e86d0ea4987e9f53a565309b3eed797a6bcbd
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Portfolio: 'Portfolio',
    Holding: 'Holding',
    Transaction: 'Transaction',
    Income: 'Income',
    Expense: 'Expense',
    StockPrice: 'StockPrice',
    DividendSchedule: 'DividendSchedule',
    CalculationCache: 'CalculationCache',
    UserSettings: 'UserSettings',
    TaxProfile: 'TaxProfile',
    FinancialGoal: 'FinancialGoal',
    PerformanceSnapshot: 'PerformanceSnapshot'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "portfolio" | "holding" | "transaction" | "income" | "expense" | "stockPrice" | "dividendSchedule" | "calculationCache" | "userSettings" | "taxProfile" | "financialGoal" | "performanceSnapshot"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Portfolio: {
        payload: Prisma.$PortfolioPayload<ExtArgs>
        fields: Prisma.PortfolioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PortfolioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PortfolioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>
          }
          findFirst: {
            args: Prisma.PortfolioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PortfolioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>
          }
          findMany: {
            args: Prisma.PortfolioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>[]
          }
          create: {
            args: Prisma.PortfolioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>
          }
          createMany: {
            args: Prisma.PortfolioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PortfolioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>[]
          }
          delete: {
            args: Prisma.PortfolioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>
          }
          update: {
            args: Prisma.PortfolioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>
          }
          deleteMany: {
            args: Prisma.PortfolioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PortfolioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PortfolioUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>[]
          }
          upsert: {
            args: Prisma.PortfolioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortfolioPayload>
          }
          aggregate: {
            args: Prisma.PortfolioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePortfolio>
          }
          groupBy: {
            args: Prisma.PortfolioGroupByArgs<ExtArgs>
            result: $Utils.Optional<PortfolioGroupByOutputType>[]
          }
          count: {
            args: Prisma.PortfolioCountArgs<ExtArgs>
            result: $Utils.Optional<PortfolioCountAggregateOutputType> | number
          }
        }
      }
      Holding: {
        payload: Prisma.$HoldingPayload<ExtArgs>
        fields: Prisma.HoldingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.HoldingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoldingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.HoldingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoldingPayload>
          }
          findFirst: {
            args: Prisma.HoldingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoldingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.HoldingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoldingPayload>
          }
          findMany: {
            args: Prisma.HoldingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoldingPayload>[]
          }
          create: {
            args: Prisma.HoldingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoldingPayload>
          }
          createMany: {
            args: Prisma.HoldingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.HoldingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoldingPayload>[]
          }
          delete: {
            args: Prisma.HoldingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoldingPayload>
          }
          update: {
            args: Prisma.HoldingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoldingPayload>
          }
          deleteMany: {
            args: Prisma.HoldingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.HoldingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.HoldingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoldingPayload>[]
          }
          upsert: {
            args: Prisma.HoldingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HoldingPayload>
          }
          aggregate: {
            args: Prisma.HoldingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateHolding>
          }
          groupBy: {
            args: Prisma.HoldingGroupByArgs<ExtArgs>
            result: $Utils.Optional<HoldingGroupByOutputType>[]
          }
          count: {
            args: Prisma.HoldingCountArgs<ExtArgs>
            result: $Utils.Optional<HoldingCountAggregateOutputType> | number
          }
        }
      }
      Transaction: {
        payload: Prisma.$TransactionPayload<ExtArgs>
        fields: Prisma.TransactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TransactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TransactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findFirst: {
            args: Prisma.TransactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TransactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findMany: {
            args: Prisma.TransactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          create: {
            args: Prisma.TransactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          createMany: {
            args: Prisma.TransactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TransactionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          delete: {
            args: Prisma.TransactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          update: {
            args: Prisma.TransactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          deleteMany: {
            args: Prisma.TransactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TransactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TransactionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          upsert: {
            args: Prisma.TransactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          aggregate: {
            args: Prisma.TransactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTransaction>
          }
          groupBy: {
            args: Prisma.TransactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<TransactionGroupByOutputType>[]
          }
          count: {
            args: Prisma.TransactionCountArgs<ExtArgs>
            result: $Utils.Optional<TransactionCountAggregateOutputType> | number
          }
        }
      }
      Income: {
        payload: Prisma.$IncomePayload<ExtArgs>
        fields: Prisma.IncomeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IncomeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncomePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IncomeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncomePayload>
          }
          findFirst: {
            args: Prisma.IncomeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncomePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IncomeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncomePayload>
          }
          findMany: {
            args: Prisma.IncomeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncomePayload>[]
          }
          create: {
            args: Prisma.IncomeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncomePayload>
          }
          createMany: {
            args: Prisma.IncomeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IncomeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncomePayload>[]
          }
          delete: {
            args: Prisma.IncomeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncomePayload>
          }
          update: {
            args: Prisma.IncomeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncomePayload>
          }
          deleteMany: {
            args: Prisma.IncomeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IncomeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.IncomeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncomePayload>[]
          }
          upsert: {
            args: Prisma.IncomeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncomePayload>
          }
          aggregate: {
            args: Prisma.IncomeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIncome>
          }
          groupBy: {
            args: Prisma.IncomeGroupByArgs<ExtArgs>
            result: $Utils.Optional<IncomeGroupByOutputType>[]
          }
          count: {
            args: Prisma.IncomeCountArgs<ExtArgs>
            result: $Utils.Optional<IncomeCountAggregateOutputType> | number
          }
        }
      }
      Expense: {
        payload: Prisma.$ExpensePayload<ExtArgs>
        fields: Prisma.ExpenseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExpenseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExpenseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          findFirst: {
            args: Prisma.ExpenseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExpenseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          findMany: {
            args: Prisma.ExpenseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>[]
          }
          create: {
            args: Prisma.ExpenseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          createMany: {
            args: Prisma.ExpenseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ExpenseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>[]
          }
          delete: {
            args: Prisma.ExpenseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          update: {
            args: Prisma.ExpenseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          deleteMany: {
            args: Prisma.ExpenseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExpenseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ExpenseUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>[]
          }
          upsert: {
            args: Prisma.ExpenseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          aggregate: {
            args: Prisma.ExpenseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExpense>
          }
          groupBy: {
            args: Prisma.ExpenseGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExpenseGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExpenseCountArgs<ExtArgs>
            result: $Utils.Optional<ExpenseCountAggregateOutputType> | number
          }
        }
      }
      StockPrice: {
        payload: Prisma.$StockPricePayload<ExtArgs>
        fields: Prisma.StockPriceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StockPriceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPricePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StockPriceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPricePayload>
          }
          findFirst: {
            args: Prisma.StockPriceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPricePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StockPriceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPricePayload>
          }
          findMany: {
            args: Prisma.StockPriceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPricePayload>[]
          }
          create: {
            args: Prisma.StockPriceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPricePayload>
          }
          createMany: {
            args: Prisma.StockPriceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StockPriceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPricePayload>[]
          }
          delete: {
            args: Prisma.StockPriceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPricePayload>
          }
          update: {
            args: Prisma.StockPriceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPricePayload>
          }
          deleteMany: {
            args: Prisma.StockPriceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StockPriceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.StockPriceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPricePayload>[]
          }
          upsert: {
            args: Prisma.StockPriceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPricePayload>
          }
          aggregate: {
            args: Prisma.StockPriceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStockPrice>
          }
          groupBy: {
            args: Prisma.StockPriceGroupByArgs<ExtArgs>
            result: $Utils.Optional<StockPriceGroupByOutputType>[]
          }
          count: {
            args: Prisma.StockPriceCountArgs<ExtArgs>
            result: $Utils.Optional<StockPriceCountAggregateOutputType> | number
          }
        }
      }
      DividendSchedule: {
        payload: Prisma.$DividendSchedulePayload<ExtArgs>
        fields: Prisma.DividendScheduleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DividendScheduleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DividendSchedulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DividendScheduleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DividendSchedulePayload>
          }
          findFirst: {
            args: Prisma.DividendScheduleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DividendSchedulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DividendScheduleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DividendSchedulePayload>
          }
          findMany: {
            args: Prisma.DividendScheduleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DividendSchedulePayload>[]
          }
          create: {
            args: Prisma.DividendScheduleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DividendSchedulePayload>
          }
          createMany: {
            args: Prisma.DividendScheduleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DividendScheduleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DividendSchedulePayload>[]
          }
          delete: {
            args: Prisma.DividendScheduleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DividendSchedulePayload>
          }
          update: {
            args: Prisma.DividendScheduleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DividendSchedulePayload>
          }
          deleteMany: {
            args: Prisma.DividendScheduleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DividendScheduleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DividendScheduleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DividendSchedulePayload>[]
          }
          upsert: {
            args: Prisma.DividendScheduleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DividendSchedulePayload>
          }
          aggregate: {
            args: Prisma.DividendScheduleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDividendSchedule>
          }
          groupBy: {
            args: Prisma.DividendScheduleGroupByArgs<ExtArgs>
            result: $Utils.Optional<DividendScheduleGroupByOutputType>[]
          }
          count: {
            args: Prisma.DividendScheduleCountArgs<ExtArgs>
            result: $Utils.Optional<DividendScheduleCountAggregateOutputType> | number
          }
        }
      }
      CalculationCache: {
        payload: Prisma.$CalculationCachePayload<ExtArgs>
        fields: Prisma.CalculationCacheFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CalculationCacheFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CalculationCachePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CalculationCacheFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CalculationCachePayload>
          }
          findFirst: {
            args: Prisma.CalculationCacheFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CalculationCachePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CalculationCacheFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CalculationCachePayload>
          }
          findMany: {
            args: Prisma.CalculationCacheFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CalculationCachePayload>[]
          }
          create: {
            args: Prisma.CalculationCacheCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CalculationCachePayload>
          }
          createMany: {
            args: Prisma.CalculationCacheCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CalculationCacheCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CalculationCachePayload>[]
          }
          delete: {
            args: Prisma.CalculationCacheDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CalculationCachePayload>
          }
          update: {
            args: Prisma.CalculationCacheUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CalculationCachePayload>
          }
          deleteMany: {
            args: Prisma.CalculationCacheDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CalculationCacheUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CalculationCacheUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CalculationCachePayload>[]
          }
          upsert: {
            args: Prisma.CalculationCacheUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CalculationCachePayload>
          }
          aggregate: {
            args: Prisma.CalculationCacheAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCalculationCache>
          }
          groupBy: {
            args: Prisma.CalculationCacheGroupByArgs<ExtArgs>
            result: $Utils.Optional<CalculationCacheGroupByOutputType>[]
          }
          count: {
            args: Prisma.CalculationCacheCountArgs<ExtArgs>
            result: $Utils.Optional<CalculationCacheCountAggregateOutputType> | number
          }
        }
      }
      UserSettings: {
        payload: Prisma.$UserSettingsPayload<ExtArgs>
        fields: Prisma.UserSettingsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserSettingsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserSettingsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>
          }
          findFirst: {
            args: Prisma.UserSettingsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserSettingsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>
          }
          findMany: {
            args: Prisma.UserSettingsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>[]
          }
          create: {
            args: Prisma.UserSettingsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>
          }
          createMany: {
            args: Prisma.UserSettingsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserSettingsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>[]
          }
          delete: {
            args: Prisma.UserSettingsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>
          }
          update: {
            args: Prisma.UserSettingsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>
          }
          deleteMany: {
            args: Prisma.UserSettingsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserSettingsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserSettingsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>[]
          }
          upsert: {
            args: Prisma.UserSettingsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSettingsPayload>
          }
          aggregate: {
            args: Prisma.UserSettingsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserSettings>
          }
          groupBy: {
            args: Prisma.UserSettingsGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserSettingsGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserSettingsCountArgs<ExtArgs>
            result: $Utils.Optional<UserSettingsCountAggregateOutputType> | number
          }
        }
      }
      TaxProfile: {
        payload: Prisma.$TaxProfilePayload<ExtArgs>
        fields: Prisma.TaxProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TaxProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TaxProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxProfilePayload>
          }
          findFirst: {
            args: Prisma.TaxProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TaxProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxProfilePayload>
          }
          findMany: {
            args: Prisma.TaxProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxProfilePayload>[]
          }
          create: {
            args: Prisma.TaxProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxProfilePayload>
          }
          createMany: {
            args: Prisma.TaxProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TaxProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxProfilePayload>[]
          }
          delete: {
            args: Prisma.TaxProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxProfilePayload>
          }
          update: {
            args: Prisma.TaxProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxProfilePayload>
          }
          deleteMany: {
            args: Prisma.TaxProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TaxProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TaxProfileUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxProfilePayload>[]
          }
          upsert: {
            args: Prisma.TaxProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxProfilePayload>
          }
          aggregate: {
            args: Prisma.TaxProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTaxProfile>
          }
          groupBy: {
            args: Prisma.TaxProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<TaxProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.TaxProfileCountArgs<ExtArgs>
            result: $Utils.Optional<TaxProfileCountAggregateOutputType> | number
          }
        }
      }
      FinancialGoal: {
        payload: Prisma.$FinancialGoalPayload<ExtArgs>
        fields: Prisma.FinancialGoalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FinancialGoalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinancialGoalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FinancialGoalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinancialGoalPayload>
          }
          findFirst: {
            args: Prisma.FinancialGoalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinancialGoalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FinancialGoalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinancialGoalPayload>
          }
          findMany: {
            args: Prisma.FinancialGoalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinancialGoalPayload>[]
          }
          create: {
            args: Prisma.FinancialGoalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinancialGoalPayload>
          }
          createMany: {
            args: Prisma.FinancialGoalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FinancialGoalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinancialGoalPayload>[]
          }
          delete: {
            args: Prisma.FinancialGoalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinancialGoalPayload>
          }
          update: {
            args: Prisma.FinancialGoalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinancialGoalPayload>
          }
          deleteMany: {
            args: Prisma.FinancialGoalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FinancialGoalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FinancialGoalUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinancialGoalPayload>[]
          }
          upsert: {
            args: Prisma.FinancialGoalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FinancialGoalPayload>
          }
          aggregate: {
            args: Prisma.FinancialGoalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFinancialGoal>
          }
          groupBy: {
            args: Prisma.FinancialGoalGroupByArgs<ExtArgs>
            result: $Utils.Optional<FinancialGoalGroupByOutputType>[]
          }
          count: {
            args: Prisma.FinancialGoalCountArgs<ExtArgs>
            result: $Utils.Optional<FinancialGoalCountAggregateOutputType> | number
          }
        }
      }
      PerformanceSnapshot: {
        payload: Prisma.$PerformanceSnapshotPayload<ExtArgs>
        fields: Prisma.PerformanceSnapshotFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PerformanceSnapshotFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceSnapshotPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PerformanceSnapshotFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceSnapshotPayload>
          }
          findFirst: {
            args: Prisma.PerformanceSnapshotFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceSnapshotPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PerformanceSnapshotFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceSnapshotPayload>
          }
          findMany: {
            args: Prisma.PerformanceSnapshotFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceSnapshotPayload>[]
          }
          create: {
            args: Prisma.PerformanceSnapshotCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceSnapshotPayload>
          }
          createMany: {
            args: Prisma.PerformanceSnapshotCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PerformanceSnapshotCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceSnapshotPayload>[]
          }
          delete: {
            args: Prisma.PerformanceSnapshotDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceSnapshotPayload>
          }
          update: {
            args: Prisma.PerformanceSnapshotUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceSnapshotPayload>
          }
          deleteMany: {
            args: Prisma.PerformanceSnapshotDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PerformanceSnapshotUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PerformanceSnapshotUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceSnapshotPayload>[]
          }
          upsert: {
            args: Prisma.PerformanceSnapshotUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceSnapshotPayload>
          }
          aggregate: {
            args: Prisma.PerformanceSnapshotAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePerformanceSnapshot>
          }
          groupBy: {
            args: Prisma.PerformanceSnapshotGroupByArgs<ExtArgs>
            result: $Utils.Optional<PerformanceSnapshotGroupByOutputType>[]
          }
          count: {
            args: Prisma.PerformanceSnapshotCountArgs<ExtArgs>
            result: $Utils.Optional<PerformanceSnapshotCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    portfolio?: PortfolioOmit
    holding?: HoldingOmit
    transaction?: TransactionOmit
    income?: IncomeOmit
    expense?: ExpenseOmit
    stockPrice?: StockPriceOmit
    dividendSchedule?: DividendScheduleOmit
    calculationCache?: CalculationCacheOmit
    userSettings?: UserSettingsOmit
    taxProfile?: TaxProfileOmit
    financialGoal?: FinancialGoalOmit
    performanceSnapshot?: PerformanceSnapshotOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    portfolios: number
    incomes: number
    expenses: number
    transactions: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    portfolios?: boolean | UserCountOutputTypeCountPortfoliosArgs
    incomes?: boolean | UserCountOutputTypeCountIncomesArgs
    expenses?: boolean | UserCountOutputTypeCountExpensesArgs
    transactions?: boolean | UserCountOutputTypeCountTransactionsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPortfoliosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PortfolioWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountIncomesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IncomeWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountExpensesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExpenseWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTransactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
  }


  /**
   * Count Type PortfolioCountOutputType
   */

  export type PortfolioCountOutputType = {
    holdings: number
  }

  export type PortfolioCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    holdings?: boolean | PortfolioCountOutputTypeCountHoldingsArgs
  }

  // Custom InputTypes
  /**
   * PortfolioCountOutputType without action
   */
  export type PortfolioCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortfolioCountOutputType
     */
    select?: PortfolioCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PortfolioCountOutputType without action
   */
  export type PortfolioCountOutputTypeCountHoldingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HoldingWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    settings: string | null
    taxProfile: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    settings: string | null
    taxProfile: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    passwordHash: number
    settings: number
    taxProfile: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    settings?: true
    taxProfile?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    settings?: true
    taxProfile?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    settings?: true
    taxProfile?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    passwordHash: string
    settings: string | null
    taxProfile: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    settings?: boolean
    taxProfile?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    portfolios?: boolean | User$portfoliosArgs<ExtArgs>
    incomes?: boolean | User$incomesArgs<ExtArgs>
    expenses?: boolean | User$expensesArgs<ExtArgs>
    transactions?: boolean | User$transactionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    settings?: boolean
    taxProfile?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    settings?: boolean
    taxProfile?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    settings?: boolean
    taxProfile?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "passwordHash" | "settings" | "taxProfile" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    portfolios?: boolean | User$portfoliosArgs<ExtArgs>
    incomes?: boolean | User$incomesArgs<ExtArgs>
    expenses?: boolean | User$expensesArgs<ExtArgs>
    transactions?: boolean | User$transactionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      portfolios: Prisma.$PortfolioPayload<ExtArgs>[]
      incomes: Prisma.$IncomePayload<ExtArgs>[]
      expenses: Prisma.$ExpensePayload<ExtArgs>[]
      transactions: Prisma.$TransactionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      passwordHash: string
      settings: string | null
      taxProfile: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    portfolios<T extends User$portfoliosArgs<ExtArgs> = {}>(args?: Subset<T, User$portfoliosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortfolioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    incomes<T extends User$incomesArgs<ExtArgs> = {}>(args?: Subset<T, User$incomesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IncomePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    expenses<T extends User$expensesArgs<ExtArgs> = {}>(args?: Subset<T, User$expensesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    transactions<T extends User$transactionsArgs<ExtArgs> = {}>(args?: Subset<T, User$transactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly settings: FieldRef<"User", 'String'>
    readonly taxProfile: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.portfolios
   */
  export type User$portfoliosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortfolioInclude<ExtArgs> | null
    where?: PortfolioWhereInput
    orderBy?: PortfolioOrderByWithRelationInput | PortfolioOrderByWithRelationInput[]
    cursor?: PortfolioWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PortfolioScalarFieldEnum | PortfolioScalarFieldEnum[]
  }

  /**
   * User.incomes
   */
  export type User$incomesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Income
     */
    select?: IncomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Income
     */
    omit?: IncomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IncomeInclude<ExtArgs> | null
    where?: IncomeWhereInput
    orderBy?: IncomeOrderByWithRelationInput | IncomeOrderByWithRelationInput[]
    cursor?: IncomeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: IncomeScalarFieldEnum | IncomeScalarFieldEnum[]
  }

  /**
   * User.expenses
   */
  export type User$expensesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    where?: ExpenseWhereInput
    orderBy?: ExpenseOrderByWithRelationInput | ExpenseOrderByWithRelationInput[]
    cursor?: ExpenseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ExpenseScalarFieldEnum | ExpenseScalarFieldEnum[]
  }

  /**
   * User.transactions
   */
  export type User$transactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    cursor?: TransactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Portfolio
   */

  export type AggregatePortfolio = {
    _count: PortfolioCountAggregateOutputType | null
    _min: PortfolioMinAggregateOutputType | null
    _max: PortfolioMaxAggregateOutputType | null
  }

  export type PortfolioMinAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    type: string | null
    institution: string | null
    isPrimary: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PortfolioMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    type: string | null
    institution: string | null
    isPrimary: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PortfolioCountAggregateOutputType = {
    id: number
    userId: number
    name: number
    type: number
    institution: number
    isPrimary: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PortfolioMinAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    type?: true
    institution?: true
    isPrimary?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PortfolioMaxAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    type?: true
    institution?: true
    isPrimary?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PortfolioCountAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    type?: true
    institution?: true
    isPrimary?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PortfolioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Portfolio to aggregate.
     */
    where?: PortfolioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Portfolios to fetch.
     */
    orderBy?: PortfolioOrderByWithRelationInput | PortfolioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PortfolioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Portfolios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Portfolios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Portfolios
    **/
    _count?: true | PortfolioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PortfolioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PortfolioMaxAggregateInputType
  }

  export type GetPortfolioAggregateType<T extends PortfolioAggregateArgs> = {
        [P in keyof T & keyof AggregatePortfolio]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePortfolio[P]>
      : GetScalarType<T[P], AggregatePortfolio[P]>
  }




  export type PortfolioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PortfolioWhereInput
    orderBy?: PortfolioOrderByWithAggregationInput | PortfolioOrderByWithAggregationInput[]
    by: PortfolioScalarFieldEnum[] | PortfolioScalarFieldEnum
    having?: PortfolioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PortfolioCountAggregateInputType | true
    _min?: PortfolioMinAggregateInputType
    _max?: PortfolioMaxAggregateInputType
  }

  export type PortfolioGroupByOutputType = {
    id: string
    userId: string
    name: string
    type: string
    institution: string | null
    isPrimary: boolean
    createdAt: Date
    updatedAt: Date
    _count: PortfolioCountAggregateOutputType | null
    _min: PortfolioMinAggregateOutputType | null
    _max: PortfolioMaxAggregateOutputType | null
  }

  type GetPortfolioGroupByPayload<T extends PortfolioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PortfolioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PortfolioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PortfolioGroupByOutputType[P]>
            : GetScalarType<T[P], PortfolioGroupByOutputType[P]>
        }
      >
    >


  export type PortfolioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    type?: boolean
    institution?: boolean
    isPrimary?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    holdings?: boolean | Portfolio$holdingsArgs<ExtArgs>
    _count?: boolean | PortfolioCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["portfolio"]>

  export type PortfolioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    type?: boolean
    institution?: boolean
    isPrimary?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["portfolio"]>

  export type PortfolioSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    type?: boolean
    institution?: boolean
    isPrimary?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["portfolio"]>

  export type PortfolioSelectScalar = {
    id?: boolean
    userId?: boolean
    name?: boolean
    type?: boolean
    institution?: boolean
    isPrimary?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PortfolioOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "name" | "type" | "institution" | "isPrimary" | "createdAt" | "updatedAt", ExtArgs["result"]["portfolio"]>
  export type PortfolioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    holdings?: boolean | Portfolio$holdingsArgs<ExtArgs>
    _count?: boolean | PortfolioCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PortfolioIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PortfolioIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PortfolioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Portfolio"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      holdings: Prisma.$HoldingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      name: string
      type: string
      institution: string | null
      isPrimary: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["portfolio"]>
    composites: {}
  }

  type PortfolioGetPayload<S extends boolean | null | undefined | PortfolioDefaultArgs> = $Result.GetResult<Prisma.$PortfolioPayload, S>

  type PortfolioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PortfolioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PortfolioCountAggregateInputType | true
    }

  export interface PortfolioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Portfolio'], meta: { name: 'Portfolio' } }
    /**
     * Find zero or one Portfolio that matches the filter.
     * @param {PortfolioFindUniqueArgs} args - Arguments to find a Portfolio
     * @example
     * // Get one Portfolio
     * const portfolio = await prisma.portfolio.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PortfolioFindUniqueArgs>(args: SelectSubset<T, PortfolioFindUniqueArgs<ExtArgs>>): Prisma__PortfolioClient<$Result.GetResult<Prisma.$PortfolioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Portfolio that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PortfolioFindUniqueOrThrowArgs} args - Arguments to find a Portfolio
     * @example
     * // Get one Portfolio
     * const portfolio = await prisma.portfolio.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PortfolioFindUniqueOrThrowArgs>(args: SelectSubset<T, PortfolioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PortfolioClient<$Result.GetResult<Prisma.$PortfolioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Portfolio that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortfolioFindFirstArgs} args - Arguments to find a Portfolio
     * @example
     * // Get one Portfolio
     * const portfolio = await prisma.portfolio.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PortfolioFindFirstArgs>(args?: SelectSubset<T, PortfolioFindFirstArgs<ExtArgs>>): Prisma__PortfolioClient<$Result.GetResult<Prisma.$PortfolioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Portfolio that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortfolioFindFirstOrThrowArgs} args - Arguments to find a Portfolio
     * @example
     * // Get one Portfolio
     * const portfolio = await prisma.portfolio.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PortfolioFindFirstOrThrowArgs>(args?: SelectSubset<T, PortfolioFindFirstOrThrowArgs<ExtArgs>>): Prisma__PortfolioClient<$Result.GetResult<Prisma.$PortfolioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Portfolios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortfolioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Portfolios
     * const portfolios = await prisma.portfolio.findMany()
     * 
     * // Get first 10 Portfolios
     * const portfolios = await prisma.portfolio.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const portfolioWithIdOnly = await prisma.portfolio.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PortfolioFindManyArgs>(args?: SelectSubset<T, PortfolioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortfolioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Portfolio.
     * @param {PortfolioCreateArgs} args - Arguments to create a Portfolio.
     * @example
     * // Create one Portfolio
     * const Portfolio = await prisma.portfolio.create({
     *   data: {
     *     // ... data to create a Portfolio
     *   }
     * })
     * 
     */
    create<T extends PortfolioCreateArgs>(args: SelectSubset<T, PortfolioCreateArgs<ExtArgs>>): Prisma__PortfolioClient<$Result.GetResult<Prisma.$PortfolioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Portfolios.
     * @param {PortfolioCreateManyArgs} args - Arguments to create many Portfolios.
     * @example
     * // Create many Portfolios
     * const portfolio = await prisma.portfolio.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PortfolioCreateManyArgs>(args?: SelectSubset<T, PortfolioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Portfolios and returns the data saved in the database.
     * @param {PortfolioCreateManyAndReturnArgs} args - Arguments to create many Portfolios.
     * @example
     * // Create many Portfolios
     * const portfolio = await prisma.portfolio.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Portfolios and only return the `id`
     * const portfolioWithIdOnly = await prisma.portfolio.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PortfolioCreateManyAndReturnArgs>(args?: SelectSubset<T, PortfolioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortfolioPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Portfolio.
     * @param {PortfolioDeleteArgs} args - Arguments to delete one Portfolio.
     * @example
     * // Delete one Portfolio
     * const Portfolio = await prisma.portfolio.delete({
     *   where: {
     *     // ... filter to delete one Portfolio
     *   }
     * })
     * 
     */
    delete<T extends PortfolioDeleteArgs>(args: SelectSubset<T, PortfolioDeleteArgs<ExtArgs>>): Prisma__PortfolioClient<$Result.GetResult<Prisma.$PortfolioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Portfolio.
     * @param {PortfolioUpdateArgs} args - Arguments to update one Portfolio.
     * @example
     * // Update one Portfolio
     * const portfolio = await prisma.portfolio.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PortfolioUpdateArgs>(args: SelectSubset<T, PortfolioUpdateArgs<ExtArgs>>): Prisma__PortfolioClient<$Result.GetResult<Prisma.$PortfolioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Portfolios.
     * @param {PortfolioDeleteManyArgs} args - Arguments to filter Portfolios to delete.
     * @example
     * // Delete a few Portfolios
     * const { count } = await prisma.portfolio.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PortfolioDeleteManyArgs>(args?: SelectSubset<T, PortfolioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Portfolios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortfolioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Portfolios
     * const portfolio = await prisma.portfolio.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PortfolioUpdateManyArgs>(args: SelectSubset<T, PortfolioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Portfolios and returns the data updated in the database.
     * @param {PortfolioUpdateManyAndReturnArgs} args - Arguments to update many Portfolios.
     * @example
     * // Update many Portfolios
     * const portfolio = await prisma.portfolio.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Portfolios and only return the `id`
     * const portfolioWithIdOnly = await prisma.portfolio.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PortfolioUpdateManyAndReturnArgs>(args: SelectSubset<T, PortfolioUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortfolioPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Portfolio.
     * @param {PortfolioUpsertArgs} args - Arguments to update or create a Portfolio.
     * @example
     * // Update or create a Portfolio
     * const portfolio = await prisma.portfolio.upsert({
     *   create: {
     *     // ... data to create a Portfolio
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Portfolio we want to update
     *   }
     * })
     */
    upsert<T extends PortfolioUpsertArgs>(args: SelectSubset<T, PortfolioUpsertArgs<ExtArgs>>): Prisma__PortfolioClient<$Result.GetResult<Prisma.$PortfolioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Portfolios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortfolioCountArgs} args - Arguments to filter Portfolios to count.
     * @example
     * // Count the number of Portfolios
     * const count = await prisma.portfolio.count({
     *   where: {
     *     // ... the filter for the Portfolios we want to count
     *   }
     * })
    **/
    count<T extends PortfolioCountArgs>(
      args?: Subset<T, PortfolioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PortfolioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Portfolio.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortfolioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PortfolioAggregateArgs>(args: Subset<T, PortfolioAggregateArgs>): Prisma.PrismaPromise<GetPortfolioAggregateType<T>>

    /**
     * Group by Portfolio.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortfolioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PortfolioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PortfolioGroupByArgs['orderBy'] }
        : { orderBy?: PortfolioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PortfolioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPortfolioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Portfolio model
   */
  readonly fields: PortfolioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Portfolio.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PortfolioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    holdings<T extends Portfolio$holdingsArgs<ExtArgs> = {}>(args?: Subset<T, Portfolio$holdingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HoldingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Portfolio model
   */
  interface PortfolioFieldRefs {
    readonly id: FieldRef<"Portfolio", 'String'>
    readonly userId: FieldRef<"Portfolio", 'String'>
    readonly name: FieldRef<"Portfolio", 'String'>
    readonly type: FieldRef<"Portfolio", 'String'>
    readonly institution: FieldRef<"Portfolio", 'String'>
    readonly isPrimary: FieldRef<"Portfolio", 'Boolean'>
    readonly createdAt: FieldRef<"Portfolio", 'DateTime'>
    readonly updatedAt: FieldRef<"Portfolio", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Portfolio findUnique
   */
  export type PortfolioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortfolioInclude<ExtArgs> | null
    /**
     * Filter, which Portfolio to fetch.
     */
    where: PortfolioWhereUniqueInput
  }

  /**
   * Portfolio findUniqueOrThrow
   */
  export type PortfolioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortfolioInclude<ExtArgs> | null
    /**
     * Filter, which Portfolio to fetch.
     */
    where: PortfolioWhereUniqueInput
  }

  /**
   * Portfolio findFirst
   */
  export type PortfolioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortfolioInclude<ExtArgs> | null
    /**
     * Filter, which Portfolio to fetch.
     */
    where?: PortfolioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Portfolios to fetch.
     */
    orderBy?: PortfolioOrderByWithRelationInput | PortfolioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Portfolios.
     */
    cursor?: PortfolioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Portfolios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Portfolios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Portfolios.
     */
    distinct?: PortfolioScalarFieldEnum | PortfolioScalarFieldEnum[]
  }

  /**
   * Portfolio findFirstOrThrow
   */
  export type PortfolioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortfolioInclude<ExtArgs> | null
    /**
     * Filter, which Portfolio to fetch.
     */
    where?: PortfolioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Portfolios to fetch.
     */
    orderBy?: PortfolioOrderByWithRelationInput | PortfolioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Portfolios.
     */
    cursor?: PortfolioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Portfolios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Portfolios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Portfolios.
     */
    distinct?: PortfolioScalarFieldEnum | PortfolioScalarFieldEnum[]
  }

  /**
   * Portfolio findMany
   */
  export type PortfolioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortfolioInclude<ExtArgs> | null
    /**
     * Filter, which Portfolios to fetch.
     */
    where?: PortfolioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Portfolios to fetch.
     */
    orderBy?: PortfolioOrderByWithRelationInput | PortfolioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Portfolios.
     */
    cursor?: PortfolioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Portfolios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Portfolios.
     */
    skip?: number
    distinct?: PortfolioScalarFieldEnum | PortfolioScalarFieldEnum[]
  }

  /**
   * Portfolio create
   */
  export type PortfolioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortfolioInclude<ExtArgs> | null
    /**
     * The data needed to create a Portfolio.
     */
    data: XOR<PortfolioCreateInput, PortfolioUncheckedCreateInput>
  }

  /**
   * Portfolio createMany
   */
  export type PortfolioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Portfolios.
     */
    data: PortfolioCreateManyInput | PortfolioCreateManyInput[]
  }

  /**
   * Portfolio createManyAndReturn
   */
  export type PortfolioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null
    /**
     * The data used to create many Portfolios.
     */
    data: PortfolioCreateManyInput | PortfolioCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortfolioIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Portfolio update
   */
  export type PortfolioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortfolioInclude<ExtArgs> | null
    /**
     * The data needed to update a Portfolio.
     */
    data: XOR<PortfolioUpdateInput, PortfolioUncheckedUpdateInput>
    /**
     * Choose, which Portfolio to update.
     */
    where: PortfolioWhereUniqueInput
  }

  /**
   * Portfolio updateMany
   */
  export type PortfolioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Portfolios.
     */
    data: XOR<PortfolioUpdateManyMutationInput, PortfolioUncheckedUpdateManyInput>
    /**
     * Filter which Portfolios to update
     */
    where?: PortfolioWhereInput
    /**
     * Limit how many Portfolios to update.
     */
    limit?: number
  }

  /**
   * Portfolio updateManyAndReturn
   */
  export type PortfolioUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null
    /**
     * The data used to update Portfolios.
     */
    data: XOR<PortfolioUpdateManyMutationInput, PortfolioUncheckedUpdateManyInput>
    /**
     * Filter which Portfolios to update
     */
    where?: PortfolioWhereInput
    /**
     * Limit how many Portfolios to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortfolioIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Portfolio upsert
   */
  export type PortfolioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortfolioInclude<ExtArgs> | null
    /**
     * The filter to search for the Portfolio to update in case it exists.
     */
    where: PortfolioWhereUniqueInput
    /**
     * In case the Portfolio found by the `where` argument doesn't exist, create a new Portfolio with this data.
     */
    create: XOR<PortfolioCreateInput, PortfolioUncheckedCreateInput>
    /**
     * In case the Portfolio was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PortfolioUpdateInput, PortfolioUncheckedUpdateInput>
  }

  /**
   * Portfolio delete
   */
  export type PortfolioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortfolioInclude<ExtArgs> | null
    /**
     * Filter which Portfolio to delete.
     */
    where: PortfolioWhereUniqueInput
  }

  /**
   * Portfolio deleteMany
   */
  export type PortfolioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Portfolios to delete
     */
    where?: PortfolioWhereInput
    /**
     * Limit how many Portfolios to delete.
     */
    limit?: number
  }

  /**
   * Portfolio.holdings
   */
  export type Portfolio$holdingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Holding
     */
    select?: HoldingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Holding
     */
    omit?: HoldingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HoldingInclude<ExtArgs> | null
    where?: HoldingWhereInput
    orderBy?: HoldingOrderByWithRelationInput | HoldingOrderByWithRelationInput[]
    cursor?: HoldingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: HoldingScalarFieldEnum | HoldingScalarFieldEnum[]
  }

  /**
   * Portfolio without action
   */
  export type PortfolioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Portfolio
     */
    select?: PortfolioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Portfolio
     */
    omit?: PortfolioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortfolioInclude<ExtArgs> | null
  }


  /**
   * Model Holding
   */

  export type AggregateHolding = {
    _count: HoldingCountAggregateOutputType | null
    _avg: HoldingAvgAggregateOutputType | null
    _sum: HoldingSumAggregateOutputType | null
    _min: HoldingMinAggregateOutputType | null
    _max: HoldingMaxAggregateOutputType | null
  }

  export type HoldingAvgAggregateOutputType = {
    shares: number | null
    costBasis: number | null
    currentPrice: number | null
    dividendYield: number | null
  }

  export type HoldingSumAggregateOutputType = {
    shares: number | null
    costBasis: number | null
    currentPrice: number | null
    dividendYield: number | null
  }

  export type HoldingMinAggregateOutputType = {
    id: string | null
    portfolioId: string | null
    ticker: string | null
    shares: number | null
    costBasis: number | null
    purchaseDate: Date | null
    currentPrice: number | null
    dividendYield: number | null
    sector: string | null
    metadata: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type HoldingMaxAggregateOutputType = {
    id: string | null
    portfolioId: string | null
    ticker: string | null
    shares: number | null
    costBasis: number | null
    purchaseDate: Date | null
    currentPrice: number | null
    dividendYield: number | null
    sector: string | null
    metadata: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type HoldingCountAggregateOutputType = {
    id: number
    portfolioId: number
    ticker: number
    shares: number
    costBasis: number
    purchaseDate: number
    currentPrice: number
    dividendYield: number
    sector: number
    metadata: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type HoldingAvgAggregateInputType = {
    shares?: true
    costBasis?: true
    currentPrice?: true
    dividendYield?: true
  }

  export type HoldingSumAggregateInputType = {
    shares?: true
    costBasis?: true
    currentPrice?: true
    dividendYield?: true
  }

  export type HoldingMinAggregateInputType = {
    id?: true
    portfolioId?: true
    ticker?: true
    shares?: true
    costBasis?: true
    purchaseDate?: true
    currentPrice?: true
    dividendYield?: true
    sector?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
  }

  export type HoldingMaxAggregateInputType = {
    id?: true
    portfolioId?: true
    ticker?: true
    shares?: true
    costBasis?: true
    purchaseDate?: true
    currentPrice?: true
    dividendYield?: true
    sector?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
  }

  export type HoldingCountAggregateInputType = {
    id?: true
    portfolioId?: true
    ticker?: true
    shares?: true
    costBasis?: true
    purchaseDate?: true
    currentPrice?: true
    dividendYield?: true
    sector?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type HoldingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Holding to aggregate.
     */
    where?: HoldingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Holdings to fetch.
     */
    orderBy?: HoldingOrderByWithRelationInput | HoldingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: HoldingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Holdings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Holdings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Holdings
    **/
    _count?: true | HoldingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: HoldingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: HoldingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: HoldingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: HoldingMaxAggregateInputType
  }

  export type GetHoldingAggregateType<T extends HoldingAggregateArgs> = {
        [P in keyof T & keyof AggregateHolding]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHolding[P]>
      : GetScalarType<T[P], AggregateHolding[P]>
  }




  export type HoldingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HoldingWhereInput
    orderBy?: HoldingOrderByWithAggregationInput | HoldingOrderByWithAggregationInput[]
    by: HoldingScalarFieldEnum[] | HoldingScalarFieldEnum
    having?: HoldingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: HoldingCountAggregateInputType | true
    _avg?: HoldingAvgAggregateInputType
    _sum?: HoldingSumAggregateInputType
    _min?: HoldingMinAggregateInputType
    _max?: HoldingMaxAggregateInputType
  }

  export type HoldingGroupByOutputType = {
    id: string
    portfolioId: string
    ticker: string
    shares: number
    costBasis: number
    purchaseDate: Date
    currentPrice: number | null
    dividendYield: number | null
    sector: string | null
    metadata: string | null
    createdAt: Date
    updatedAt: Date
    _count: HoldingCountAggregateOutputType | null
    _avg: HoldingAvgAggregateOutputType | null
    _sum: HoldingSumAggregateOutputType | null
    _min: HoldingMinAggregateOutputType | null
    _max: HoldingMaxAggregateOutputType | null
  }

  type GetHoldingGroupByPayload<T extends HoldingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<HoldingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof HoldingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], HoldingGroupByOutputType[P]>
            : GetScalarType<T[P], HoldingGroupByOutputType[P]>
        }
      >
    >


  export type HoldingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    portfolioId?: boolean
    ticker?: boolean
    shares?: boolean
    costBasis?: boolean
    purchaseDate?: boolean
    currentPrice?: boolean
    dividendYield?: boolean
    sector?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    portfolio?: boolean | PortfolioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["holding"]>

  export type HoldingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    portfolioId?: boolean
    ticker?: boolean
    shares?: boolean
    costBasis?: boolean
    purchaseDate?: boolean
    currentPrice?: boolean
    dividendYield?: boolean
    sector?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    portfolio?: boolean | PortfolioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["holding"]>

  export type HoldingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    portfolioId?: boolean
    ticker?: boolean
    shares?: boolean
    costBasis?: boolean
    purchaseDate?: boolean
    currentPrice?: boolean
    dividendYield?: boolean
    sector?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    portfolio?: boolean | PortfolioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["holding"]>

  export type HoldingSelectScalar = {
    id?: boolean
    portfolioId?: boolean
    ticker?: boolean
    shares?: boolean
    costBasis?: boolean
    purchaseDate?: boolean
    currentPrice?: boolean
    dividendYield?: boolean
    sector?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type HoldingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "portfolioId" | "ticker" | "shares" | "costBasis" | "purchaseDate" | "currentPrice" | "dividendYield" | "sector" | "metadata" | "createdAt" | "updatedAt", ExtArgs["result"]["holding"]>
  export type HoldingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    portfolio?: boolean | PortfolioDefaultArgs<ExtArgs>
  }
  export type HoldingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    portfolio?: boolean | PortfolioDefaultArgs<ExtArgs>
  }
  export type HoldingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    portfolio?: boolean | PortfolioDefaultArgs<ExtArgs>
  }

  export type $HoldingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Holding"
    objects: {
      portfolio: Prisma.$PortfolioPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      portfolioId: string
      ticker: string
      shares: number
      costBasis: number
      purchaseDate: Date
      currentPrice: number | null
      dividendYield: number | null
      sector: string | null
      metadata: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["holding"]>
    composites: {}
  }

  type HoldingGetPayload<S extends boolean | null | undefined | HoldingDefaultArgs> = $Result.GetResult<Prisma.$HoldingPayload, S>

  type HoldingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<HoldingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: HoldingCountAggregateInputType | true
    }

  export interface HoldingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Holding'], meta: { name: 'Holding' } }
    /**
     * Find zero or one Holding that matches the filter.
     * @param {HoldingFindUniqueArgs} args - Arguments to find a Holding
     * @example
     * // Get one Holding
     * const holding = await prisma.holding.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends HoldingFindUniqueArgs>(args: SelectSubset<T, HoldingFindUniqueArgs<ExtArgs>>): Prisma__HoldingClient<$Result.GetResult<Prisma.$HoldingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Holding that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {HoldingFindUniqueOrThrowArgs} args - Arguments to find a Holding
     * @example
     * // Get one Holding
     * const holding = await prisma.holding.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends HoldingFindUniqueOrThrowArgs>(args: SelectSubset<T, HoldingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__HoldingClient<$Result.GetResult<Prisma.$HoldingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Holding that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoldingFindFirstArgs} args - Arguments to find a Holding
     * @example
     * // Get one Holding
     * const holding = await prisma.holding.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends HoldingFindFirstArgs>(args?: SelectSubset<T, HoldingFindFirstArgs<ExtArgs>>): Prisma__HoldingClient<$Result.GetResult<Prisma.$HoldingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Holding that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoldingFindFirstOrThrowArgs} args - Arguments to find a Holding
     * @example
     * // Get one Holding
     * const holding = await prisma.holding.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends HoldingFindFirstOrThrowArgs>(args?: SelectSubset<T, HoldingFindFirstOrThrowArgs<ExtArgs>>): Prisma__HoldingClient<$Result.GetResult<Prisma.$HoldingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Holdings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoldingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Holdings
     * const holdings = await prisma.holding.findMany()
     * 
     * // Get first 10 Holdings
     * const holdings = await prisma.holding.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const holdingWithIdOnly = await prisma.holding.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends HoldingFindManyArgs>(args?: SelectSubset<T, HoldingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HoldingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Holding.
     * @param {HoldingCreateArgs} args - Arguments to create a Holding.
     * @example
     * // Create one Holding
     * const Holding = await prisma.holding.create({
     *   data: {
     *     // ... data to create a Holding
     *   }
     * })
     * 
     */
    create<T extends HoldingCreateArgs>(args: SelectSubset<T, HoldingCreateArgs<ExtArgs>>): Prisma__HoldingClient<$Result.GetResult<Prisma.$HoldingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Holdings.
     * @param {HoldingCreateManyArgs} args - Arguments to create many Holdings.
     * @example
     * // Create many Holdings
     * const holding = await prisma.holding.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends HoldingCreateManyArgs>(args?: SelectSubset<T, HoldingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Holdings and returns the data saved in the database.
     * @param {HoldingCreateManyAndReturnArgs} args - Arguments to create many Holdings.
     * @example
     * // Create many Holdings
     * const holding = await prisma.holding.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Holdings and only return the `id`
     * const holdingWithIdOnly = await prisma.holding.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends HoldingCreateManyAndReturnArgs>(args?: SelectSubset<T, HoldingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HoldingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Holding.
     * @param {HoldingDeleteArgs} args - Arguments to delete one Holding.
     * @example
     * // Delete one Holding
     * const Holding = await prisma.holding.delete({
     *   where: {
     *     // ... filter to delete one Holding
     *   }
     * })
     * 
     */
    delete<T extends HoldingDeleteArgs>(args: SelectSubset<T, HoldingDeleteArgs<ExtArgs>>): Prisma__HoldingClient<$Result.GetResult<Prisma.$HoldingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Holding.
     * @param {HoldingUpdateArgs} args - Arguments to update one Holding.
     * @example
     * // Update one Holding
     * const holding = await prisma.holding.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends HoldingUpdateArgs>(args: SelectSubset<T, HoldingUpdateArgs<ExtArgs>>): Prisma__HoldingClient<$Result.GetResult<Prisma.$HoldingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Holdings.
     * @param {HoldingDeleteManyArgs} args - Arguments to filter Holdings to delete.
     * @example
     * // Delete a few Holdings
     * const { count } = await prisma.holding.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends HoldingDeleteManyArgs>(args?: SelectSubset<T, HoldingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Holdings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoldingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Holdings
     * const holding = await prisma.holding.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends HoldingUpdateManyArgs>(args: SelectSubset<T, HoldingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Holdings and returns the data updated in the database.
     * @param {HoldingUpdateManyAndReturnArgs} args - Arguments to update many Holdings.
     * @example
     * // Update many Holdings
     * const holding = await prisma.holding.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Holdings and only return the `id`
     * const holdingWithIdOnly = await prisma.holding.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends HoldingUpdateManyAndReturnArgs>(args: SelectSubset<T, HoldingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HoldingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Holding.
     * @param {HoldingUpsertArgs} args - Arguments to update or create a Holding.
     * @example
     * // Update or create a Holding
     * const holding = await prisma.holding.upsert({
     *   create: {
     *     // ... data to create a Holding
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Holding we want to update
     *   }
     * })
     */
    upsert<T extends HoldingUpsertArgs>(args: SelectSubset<T, HoldingUpsertArgs<ExtArgs>>): Prisma__HoldingClient<$Result.GetResult<Prisma.$HoldingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Holdings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoldingCountArgs} args - Arguments to filter Holdings to count.
     * @example
     * // Count the number of Holdings
     * const count = await prisma.holding.count({
     *   where: {
     *     // ... the filter for the Holdings we want to count
     *   }
     * })
    **/
    count<T extends HoldingCountArgs>(
      args?: Subset<T, HoldingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], HoldingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Holding.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoldingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends HoldingAggregateArgs>(args: Subset<T, HoldingAggregateArgs>): Prisma.PrismaPromise<GetHoldingAggregateType<T>>

    /**
     * Group by Holding.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HoldingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends HoldingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: HoldingGroupByArgs['orderBy'] }
        : { orderBy?: HoldingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, HoldingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHoldingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Holding model
   */
  readonly fields: HoldingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Holding.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__HoldingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    portfolio<T extends PortfolioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PortfolioDefaultArgs<ExtArgs>>): Prisma__PortfolioClient<$Result.GetResult<Prisma.$PortfolioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Holding model
   */
  interface HoldingFieldRefs {
    readonly id: FieldRef<"Holding", 'String'>
    readonly portfolioId: FieldRef<"Holding", 'String'>
    readonly ticker: FieldRef<"Holding", 'String'>
    readonly shares: FieldRef<"Holding", 'Float'>
    readonly costBasis: FieldRef<"Holding", 'Float'>
    readonly purchaseDate: FieldRef<"Holding", 'DateTime'>
    readonly currentPrice: FieldRef<"Holding", 'Float'>
    readonly dividendYield: FieldRef<"Holding", 'Float'>
    readonly sector: FieldRef<"Holding", 'String'>
    readonly metadata: FieldRef<"Holding", 'String'>
    readonly createdAt: FieldRef<"Holding", 'DateTime'>
    readonly updatedAt: FieldRef<"Holding", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Holding findUnique
   */
  export type HoldingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Holding
     */
    select?: HoldingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Holding
     */
    omit?: HoldingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HoldingInclude<ExtArgs> | null
    /**
     * Filter, which Holding to fetch.
     */
    where: HoldingWhereUniqueInput
  }

  /**
   * Holding findUniqueOrThrow
   */
  export type HoldingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Holding
     */
    select?: HoldingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Holding
     */
    omit?: HoldingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HoldingInclude<ExtArgs> | null
    /**
     * Filter, which Holding to fetch.
     */
    where: HoldingWhereUniqueInput
  }

  /**
   * Holding findFirst
   */
  export type HoldingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Holding
     */
    select?: HoldingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Holding
     */
    omit?: HoldingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HoldingInclude<ExtArgs> | null
    /**
     * Filter, which Holding to fetch.
     */
    where?: HoldingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Holdings to fetch.
     */
    orderBy?: HoldingOrderByWithRelationInput | HoldingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Holdings.
     */
    cursor?: HoldingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Holdings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Holdings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Holdings.
     */
    distinct?: HoldingScalarFieldEnum | HoldingScalarFieldEnum[]
  }

  /**
   * Holding findFirstOrThrow
   */
  export type HoldingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Holding
     */
    select?: HoldingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Holding
     */
    omit?: HoldingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HoldingInclude<ExtArgs> | null
    /**
     * Filter, which Holding to fetch.
     */
    where?: HoldingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Holdings to fetch.
     */
    orderBy?: HoldingOrderByWithRelationInput | HoldingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Holdings.
     */
    cursor?: HoldingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Holdings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Holdings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Holdings.
     */
    distinct?: HoldingScalarFieldEnum | HoldingScalarFieldEnum[]
  }

  /**
   * Holding findMany
   */
  export type HoldingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Holding
     */
    select?: HoldingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Holding
     */
    omit?: HoldingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HoldingInclude<ExtArgs> | null
    /**
     * Filter, which Holdings to fetch.
     */
    where?: HoldingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Holdings to fetch.
     */
    orderBy?: HoldingOrderByWithRelationInput | HoldingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Holdings.
     */
    cursor?: HoldingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Holdings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Holdings.
     */
    skip?: number
    distinct?: HoldingScalarFieldEnum | HoldingScalarFieldEnum[]
  }

  /**
   * Holding create
   */
  export type HoldingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Holding
     */
    select?: HoldingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Holding
     */
    omit?: HoldingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HoldingInclude<ExtArgs> | null
    /**
     * The data needed to create a Holding.
     */
    data: XOR<HoldingCreateInput, HoldingUncheckedCreateInput>
  }

  /**
   * Holding createMany
   */
  export type HoldingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Holdings.
     */
    data: HoldingCreateManyInput | HoldingCreateManyInput[]
  }

  /**
   * Holding createManyAndReturn
   */
  export type HoldingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Holding
     */
    select?: HoldingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Holding
     */
    omit?: HoldingOmit<ExtArgs> | null
    /**
     * The data used to create many Holdings.
     */
    data: HoldingCreateManyInput | HoldingCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HoldingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Holding update
   */
  export type HoldingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Holding
     */
    select?: HoldingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Holding
     */
    omit?: HoldingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HoldingInclude<ExtArgs> | null
    /**
     * The data needed to update a Holding.
     */
    data: XOR<HoldingUpdateInput, HoldingUncheckedUpdateInput>
    /**
     * Choose, which Holding to update.
     */
    where: HoldingWhereUniqueInput
  }

  /**
   * Holding updateMany
   */
  export type HoldingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Holdings.
     */
    data: XOR<HoldingUpdateManyMutationInput, HoldingUncheckedUpdateManyInput>
    /**
     * Filter which Holdings to update
     */
    where?: HoldingWhereInput
    /**
     * Limit how many Holdings to update.
     */
    limit?: number
  }

  /**
   * Holding updateManyAndReturn
   */
  export type HoldingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Holding
     */
    select?: HoldingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Holding
     */
    omit?: HoldingOmit<ExtArgs> | null
    /**
     * The data used to update Holdings.
     */
    data: XOR<HoldingUpdateManyMutationInput, HoldingUncheckedUpdateManyInput>
    /**
     * Filter which Holdings to update
     */
    where?: HoldingWhereInput
    /**
     * Limit how many Holdings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HoldingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Holding upsert
   */
  export type HoldingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Holding
     */
    select?: HoldingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Holding
     */
    omit?: HoldingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HoldingInclude<ExtArgs> | null
    /**
     * The filter to search for the Holding to update in case it exists.
     */
    where: HoldingWhereUniqueInput
    /**
     * In case the Holding found by the `where` argument doesn't exist, create a new Holding with this data.
     */
    create: XOR<HoldingCreateInput, HoldingUncheckedCreateInput>
    /**
     * In case the Holding was found with the provided `where` argument, update it with this data.
     */
    update: XOR<HoldingUpdateInput, HoldingUncheckedUpdateInput>
  }

  /**
   * Holding delete
   */
  export type HoldingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Holding
     */
    select?: HoldingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Holding
     */
    omit?: HoldingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HoldingInclude<ExtArgs> | null
    /**
     * Filter which Holding to delete.
     */
    where: HoldingWhereUniqueInput
  }

  /**
   * Holding deleteMany
   */
  export type HoldingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Holdings to delete
     */
    where?: HoldingWhereInput
    /**
     * Limit how many Holdings to delete.
     */
    limit?: number
  }

  /**
   * Holding without action
   */
  export type HoldingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Holding
     */
    select?: HoldingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Holding
     */
    omit?: HoldingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HoldingInclude<ExtArgs> | null
  }


  /**
   * Model Transaction
   */

  export type AggregateTransaction = {
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  export type TransactionAvgAggregateOutputType = {
    shares: number | null
    amount: number | null
  }

  export type TransactionSumAggregateOutputType = {
    shares: number | null
    amount: number | null
  }

  export type TransactionMinAggregateOutputType = {
    id: string | null
    userId: string | null
    portfolioId: string | null
    ticker: string | null
    type: string | null
    shares: number | null
    amount: number | null
    date: Date | null
    notes: string | null
    metadata: string | null
    createdAt: Date | null
  }

  export type TransactionMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    portfolioId: string | null
    ticker: string | null
    type: string | null
    shares: number | null
    amount: number | null
    date: Date | null
    notes: string | null
    metadata: string | null
    createdAt: Date | null
  }

  export type TransactionCountAggregateOutputType = {
    id: number
    userId: number
    portfolioId: number
    ticker: number
    type: number
    shares: number
    amount: number
    date: number
    notes: number
    metadata: number
    createdAt: number
    _all: number
  }


  export type TransactionAvgAggregateInputType = {
    shares?: true
    amount?: true
  }

  export type TransactionSumAggregateInputType = {
    shares?: true
    amount?: true
  }

  export type TransactionMinAggregateInputType = {
    id?: true
    userId?: true
    portfolioId?: true
    ticker?: true
    type?: true
    shares?: true
    amount?: true
    date?: true
    notes?: true
    metadata?: true
    createdAt?: true
  }

  export type TransactionMaxAggregateInputType = {
    id?: true
    userId?: true
    portfolioId?: true
    ticker?: true
    type?: true
    shares?: true
    amount?: true
    date?: true
    notes?: true
    metadata?: true
    createdAt?: true
  }

  export type TransactionCountAggregateInputType = {
    id?: true
    userId?: true
    portfolioId?: true
    ticker?: true
    type?: true
    shares?: true
    amount?: true
    date?: true
    notes?: true
    metadata?: true
    createdAt?: true
    _all?: true
  }

  export type TransactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transaction to aggregate.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Transactions
    **/
    _count?: true | TransactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TransactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TransactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TransactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TransactionMaxAggregateInputType
  }

  export type GetTransactionAggregateType<T extends TransactionAggregateArgs> = {
        [P in keyof T & keyof AggregateTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransaction[P]>
      : GetScalarType<T[P], AggregateTransaction[P]>
  }




  export type TransactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithAggregationInput | TransactionOrderByWithAggregationInput[]
    by: TransactionScalarFieldEnum[] | TransactionScalarFieldEnum
    having?: TransactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TransactionCountAggregateInputType | true
    _avg?: TransactionAvgAggregateInputType
    _sum?: TransactionSumAggregateInputType
    _min?: TransactionMinAggregateInputType
    _max?: TransactionMaxAggregateInputType
  }

  export type TransactionGroupByOutputType = {
    id: string
    userId: string
    portfolioId: string | null
    ticker: string
    type: string
    shares: number | null
    amount: number
    date: Date
    notes: string | null
    metadata: string | null
    createdAt: Date
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  type GetTransactionGroupByPayload<T extends TransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TransactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TransactionGroupByOutputType[P]>
            : GetScalarType<T[P], TransactionGroupByOutputType[P]>
        }
      >
    >


  export type TransactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    portfolioId?: boolean
    ticker?: boolean
    type?: boolean
    shares?: boolean
    amount?: boolean
    date?: boolean
    notes?: boolean
    metadata?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    portfolioId?: boolean
    ticker?: boolean
    type?: boolean
    shares?: boolean
    amount?: boolean
    date?: boolean
    notes?: boolean
    metadata?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    portfolioId?: boolean
    ticker?: boolean
    type?: boolean
    shares?: boolean
    amount?: boolean
    date?: boolean
    notes?: boolean
    metadata?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectScalar = {
    id?: boolean
    userId?: boolean
    portfolioId?: boolean
    ticker?: boolean
    type?: boolean
    shares?: boolean
    amount?: boolean
    date?: boolean
    notes?: boolean
    metadata?: boolean
    createdAt?: boolean
  }

  export type TransactionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "portfolioId" | "ticker" | "type" | "shares" | "amount" | "date" | "notes" | "metadata" | "createdAt", ExtArgs["result"]["transaction"]>
  export type TransactionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type TransactionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type TransactionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $TransactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Transaction"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      portfolioId: string | null
      ticker: string
      type: string
      shares: number | null
      amount: number
      date: Date
      notes: string | null
      metadata: string | null
      createdAt: Date
    }, ExtArgs["result"]["transaction"]>
    composites: {}
  }

  type TransactionGetPayload<S extends boolean | null | undefined | TransactionDefaultArgs> = $Result.GetResult<Prisma.$TransactionPayload, S>

  type TransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TransactionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TransactionCountAggregateInputType | true
    }

  export interface TransactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Transaction'], meta: { name: 'Transaction' } }
    /**
     * Find zero or one Transaction that matches the filter.
     * @param {TransactionFindUniqueArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionFindUniqueArgs>(args: SelectSubset<T, TransactionFindUniqueArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Transaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransactionFindUniqueOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionFindUniqueOrThrowArgs>(args: SelectSubset<T, TransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionFindFirstArgs>(args?: SelectSubset<T, TransactionFindFirstArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionFindFirstOrThrowArgs>(args?: SelectSubset<T, TransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Transactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Transactions
     * const transactions = await prisma.transaction.findMany()
     * 
     * // Get first 10 Transactions
     * const transactions = await prisma.transaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const transactionWithIdOnly = await prisma.transaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TransactionFindManyArgs>(args?: SelectSubset<T, TransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Transaction.
     * @param {TransactionCreateArgs} args - Arguments to create a Transaction.
     * @example
     * // Create one Transaction
     * const Transaction = await prisma.transaction.create({
     *   data: {
     *     // ... data to create a Transaction
     *   }
     * })
     * 
     */
    create<T extends TransactionCreateArgs>(args: SelectSubset<T, TransactionCreateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Transactions.
     * @param {TransactionCreateManyArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TransactionCreateManyArgs>(args?: SelectSubset<T, TransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Transactions and returns the data saved in the database.
     * @param {TransactionCreateManyAndReturnArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TransactionCreateManyAndReturnArgs>(args?: SelectSubset<T, TransactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Transaction.
     * @param {TransactionDeleteArgs} args - Arguments to delete one Transaction.
     * @example
     * // Delete one Transaction
     * const Transaction = await prisma.transaction.delete({
     *   where: {
     *     // ... filter to delete one Transaction
     *   }
     * })
     * 
     */
    delete<T extends TransactionDeleteArgs>(args: SelectSubset<T, TransactionDeleteArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Transaction.
     * @param {TransactionUpdateArgs} args - Arguments to update one Transaction.
     * @example
     * // Update one Transaction
     * const transaction = await prisma.transaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TransactionUpdateArgs>(args: SelectSubset<T, TransactionUpdateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Transactions.
     * @param {TransactionDeleteManyArgs} args - Arguments to filter Transactions to delete.
     * @example
     * // Delete a few Transactions
     * const { count } = await prisma.transaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TransactionDeleteManyArgs>(args?: SelectSubset<T, TransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TransactionUpdateManyArgs>(args: SelectSubset<T, TransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transactions and returns the data updated in the database.
     * @param {TransactionUpdateManyAndReturnArgs} args - Arguments to update many Transactions.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TransactionUpdateManyAndReturnArgs>(args: SelectSubset<T, TransactionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Transaction.
     * @param {TransactionUpsertArgs} args - Arguments to update or create a Transaction.
     * @example
     * // Update or create a Transaction
     * const transaction = await prisma.transaction.upsert({
     *   create: {
     *     // ... data to create a Transaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Transaction we want to update
     *   }
     * })
     */
    upsert<T extends TransactionUpsertArgs>(args: SelectSubset<T, TransactionUpsertArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCountArgs} args - Arguments to filter Transactions to count.
     * @example
     * // Count the number of Transactions
     * const count = await prisma.transaction.count({
     *   where: {
     *     // ... the filter for the Transactions we want to count
     *   }
     * })
    **/
    count<T extends TransactionCountArgs>(
      args?: Subset<T, TransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TransactionAggregateArgs>(args: Subset<T, TransactionAggregateArgs>): Prisma.PrismaPromise<GetTransactionAggregateType<T>>

    /**
     * Group by Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransactionGroupByArgs['orderBy'] }
        : { orderBy?: TransactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Transaction model
   */
  readonly fields: TransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Transaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Transaction model
   */
  interface TransactionFieldRefs {
    readonly id: FieldRef<"Transaction", 'String'>
    readonly userId: FieldRef<"Transaction", 'String'>
    readonly portfolioId: FieldRef<"Transaction", 'String'>
    readonly ticker: FieldRef<"Transaction", 'String'>
    readonly type: FieldRef<"Transaction", 'String'>
    readonly shares: FieldRef<"Transaction", 'Float'>
    readonly amount: FieldRef<"Transaction", 'Float'>
    readonly date: FieldRef<"Transaction", 'DateTime'>
    readonly notes: FieldRef<"Transaction", 'String'>
    readonly metadata: FieldRef<"Transaction", 'String'>
    readonly createdAt: FieldRef<"Transaction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Transaction findUnique
   */
  export type TransactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findUniqueOrThrow
   */
  export type TransactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findFirst
   */
  export type TransactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findFirstOrThrow
   */
  export type TransactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findMany
   */
  export type TransactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transactions to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction create
   */
  export type TransactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to create a Transaction.
     */
    data: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
  }

  /**
   * Transaction createMany
   */
  export type TransactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
  }

  /**
   * Transaction createManyAndReturn
   */
  export type TransactionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Transaction update
   */
  export type TransactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to update a Transaction.
     */
    data: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
    /**
     * Choose, which Transaction to update.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction updateMany
   */
  export type TransactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to update.
     */
    limit?: number
  }

  /**
   * Transaction updateManyAndReturn
   */
  export type TransactionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Transaction upsert
   */
  export type TransactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The filter to search for the Transaction to update in case it exists.
     */
    where: TransactionWhereUniqueInput
    /**
     * In case the Transaction found by the `where` argument doesn't exist, create a new Transaction with this data.
     */
    create: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
    /**
     * In case the Transaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
  }

  /**
   * Transaction delete
   */
  export type TransactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter which Transaction to delete.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction deleteMany
   */
  export type TransactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transactions to delete
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to delete.
     */
    limit?: number
  }

  /**
   * Transaction without action
   */
  export type TransactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
  }


  /**
   * Model Income
   */

  export type AggregateIncome = {
    _count: IncomeCountAggregateOutputType | null
    _avg: IncomeAvgAggregateOutputType | null
    _sum: IncomeSumAggregateOutputType | null
    _min: IncomeMinAggregateOutputType | null
    _max: IncomeMaxAggregateOutputType | null
  }

  export type IncomeAvgAggregateOutputType = {
    amount: number | null
  }

  export type IncomeSumAggregateOutputType = {
    amount: number | null
  }

  export type IncomeMinAggregateOutputType = {
    id: string | null
    userId: string | null
    source: string | null
    category: string | null
    amount: number | null
    date: Date | null
    recurring: boolean | null
    frequency: string | null
    taxable: boolean | null
    notes: string | null
    metadata: string | null
    createdAt: Date | null
  }

  export type IncomeMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    source: string | null
    category: string | null
    amount: number | null
    date: Date | null
    recurring: boolean | null
    frequency: string | null
    taxable: boolean | null
    notes: string | null
    metadata: string | null
    createdAt: Date | null
  }

  export type IncomeCountAggregateOutputType = {
    id: number
    userId: number
    source: number
    category: number
    amount: number
    date: number
    recurring: number
    frequency: number
    taxable: number
    notes: number
    metadata: number
    createdAt: number
    _all: number
  }


  export type IncomeAvgAggregateInputType = {
    amount?: true
  }

  export type IncomeSumAggregateInputType = {
    amount?: true
  }

  export type IncomeMinAggregateInputType = {
    id?: true
    userId?: true
    source?: true
    category?: true
    amount?: true
    date?: true
    recurring?: true
    frequency?: true
    taxable?: true
    notes?: true
    metadata?: true
    createdAt?: true
  }

  export type IncomeMaxAggregateInputType = {
    id?: true
    userId?: true
    source?: true
    category?: true
    amount?: true
    date?: true
    recurring?: true
    frequency?: true
    taxable?: true
    notes?: true
    metadata?: true
    createdAt?: true
  }

  export type IncomeCountAggregateInputType = {
    id?: true
    userId?: true
    source?: true
    category?: true
    amount?: true
    date?: true
    recurring?: true
    frequency?: true
    taxable?: true
    notes?: true
    metadata?: true
    createdAt?: true
    _all?: true
  }

  export type IncomeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Income to aggregate.
     */
    where?: IncomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Incomes to fetch.
     */
    orderBy?: IncomeOrderByWithRelationInput | IncomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IncomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Incomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Incomes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Incomes
    **/
    _count?: true | IncomeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IncomeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IncomeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IncomeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IncomeMaxAggregateInputType
  }

  export type GetIncomeAggregateType<T extends IncomeAggregateArgs> = {
        [P in keyof T & keyof AggregateIncome]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIncome[P]>
      : GetScalarType<T[P], AggregateIncome[P]>
  }




  export type IncomeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IncomeWhereInput
    orderBy?: IncomeOrderByWithAggregationInput | IncomeOrderByWithAggregationInput[]
    by: IncomeScalarFieldEnum[] | IncomeScalarFieldEnum
    having?: IncomeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IncomeCountAggregateInputType | true
    _avg?: IncomeAvgAggregateInputType
    _sum?: IncomeSumAggregateInputType
    _min?: IncomeMinAggregateInputType
    _max?: IncomeMaxAggregateInputType
  }

  export type IncomeGroupByOutputType = {
    id: string
    userId: string
    source: string
    category: string
    amount: number
    date: Date
    recurring: boolean
    frequency: string | null
    taxable: boolean
    notes: string | null
    metadata: string | null
    createdAt: Date
    _count: IncomeCountAggregateOutputType | null
    _avg: IncomeAvgAggregateOutputType | null
    _sum: IncomeSumAggregateOutputType | null
    _min: IncomeMinAggregateOutputType | null
    _max: IncomeMaxAggregateOutputType | null
  }

  type GetIncomeGroupByPayload<T extends IncomeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IncomeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IncomeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IncomeGroupByOutputType[P]>
            : GetScalarType<T[P], IncomeGroupByOutputType[P]>
        }
      >
    >


  export type IncomeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    source?: boolean
    category?: boolean
    amount?: boolean
    date?: boolean
    recurring?: boolean
    frequency?: boolean
    taxable?: boolean
    notes?: boolean
    metadata?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["income"]>

  export type IncomeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    source?: boolean
    category?: boolean
    amount?: boolean
    date?: boolean
    recurring?: boolean
    frequency?: boolean
    taxable?: boolean
    notes?: boolean
    metadata?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["income"]>

  export type IncomeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    source?: boolean
    category?: boolean
    amount?: boolean
    date?: boolean
    recurring?: boolean
    frequency?: boolean
    taxable?: boolean
    notes?: boolean
    metadata?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["income"]>

  export type IncomeSelectScalar = {
    id?: boolean
    userId?: boolean
    source?: boolean
    category?: boolean
    amount?: boolean
    date?: boolean
    recurring?: boolean
    frequency?: boolean
    taxable?: boolean
    notes?: boolean
    metadata?: boolean
    createdAt?: boolean
  }

  export type IncomeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "source" | "category" | "amount" | "date" | "recurring" | "frequency" | "taxable" | "notes" | "metadata" | "createdAt", ExtArgs["result"]["income"]>
  export type IncomeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type IncomeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type IncomeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $IncomePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Income"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      source: string
      category: string
      amount: number
      date: Date
      recurring: boolean
      frequency: string | null
      taxable: boolean
      notes: string | null
      metadata: string | null
      createdAt: Date
    }, ExtArgs["result"]["income"]>
    composites: {}
  }

  type IncomeGetPayload<S extends boolean | null | undefined | IncomeDefaultArgs> = $Result.GetResult<Prisma.$IncomePayload, S>

  type IncomeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<IncomeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: IncomeCountAggregateInputType | true
    }

  export interface IncomeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Income'], meta: { name: 'Income' } }
    /**
     * Find zero or one Income that matches the filter.
     * @param {IncomeFindUniqueArgs} args - Arguments to find a Income
     * @example
     * // Get one Income
     * const income = await prisma.income.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IncomeFindUniqueArgs>(args: SelectSubset<T, IncomeFindUniqueArgs<ExtArgs>>): Prisma__IncomeClient<$Result.GetResult<Prisma.$IncomePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Income that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {IncomeFindUniqueOrThrowArgs} args - Arguments to find a Income
     * @example
     * // Get one Income
     * const income = await prisma.income.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IncomeFindUniqueOrThrowArgs>(args: SelectSubset<T, IncomeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IncomeClient<$Result.GetResult<Prisma.$IncomePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Income that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncomeFindFirstArgs} args - Arguments to find a Income
     * @example
     * // Get one Income
     * const income = await prisma.income.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IncomeFindFirstArgs>(args?: SelectSubset<T, IncomeFindFirstArgs<ExtArgs>>): Prisma__IncomeClient<$Result.GetResult<Prisma.$IncomePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Income that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncomeFindFirstOrThrowArgs} args - Arguments to find a Income
     * @example
     * // Get one Income
     * const income = await prisma.income.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IncomeFindFirstOrThrowArgs>(args?: SelectSubset<T, IncomeFindFirstOrThrowArgs<ExtArgs>>): Prisma__IncomeClient<$Result.GetResult<Prisma.$IncomePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Incomes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncomeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Incomes
     * const incomes = await prisma.income.findMany()
     * 
     * // Get first 10 Incomes
     * const incomes = await prisma.income.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const incomeWithIdOnly = await prisma.income.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IncomeFindManyArgs>(args?: SelectSubset<T, IncomeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IncomePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Income.
     * @param {IncomeCreateArgs} args - Arguments to create a Income.
     * @example
     * // Create one Income
     * const Income = await prisma.income.create({
     *   data: {
     *     // ... data to create a Income
     *   }
     * })
     * 
     */
    create<T extends IncomeCreateArgs>(args: SelectSubset<T, IncomeCreateArgs<ExtArgs>>): Prisma__IncomeClient<$Result.GetResult<Prisma.$IncomePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Incomes.
     * @param {IncomeCreateManyArgs} args - Arguments to create many Incomes.
     * @example
     * // Create many Incomes
     * const income = await prisma.income.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IncomeCreateManyArgs>(args?: SelectSubset<T, IncomeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Incomes and returns the data saved in the database.
     * @param {IncomeCreateManyAndReturnArgs} args - Arguments to create many Incomes.
     * @example
     * // Create many Incomes
     * const income = await prisma.income.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Incomes and only return the `id`
     * const incomeWithIdOnly = await prisma.income.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IncomeCreateManyAndReturnArgs>(args?: SelectSubset<T, IncomeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IncomePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Income.
     * @param {IncomeDeleteArgs} args - Arguments to delete one Income.
     * @example
     * // Delete one Income
     * const Income = await prisma.income.delete({
     *   where: {
     *     // ... filter to delete one Income
     *   }
     * })
     * 
     */
    delete<T extends IncomeDeleteArgs>(args: SelectSubset<T, IncomeDeleteArgs<ExtArgs>>): Prisma__IncomeClient<$Result.GetResult<Prisma.$IncomePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Income.
     * @param {IncomeUpdateArgs} args - Arguments to update one Income.
     * @example
     * // Update one Income
     * const income = await prisma.income.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IncomeUpdateArgs>(args: SelectSubset<T, IncomeUpdateArgs<ExtArgs>>): Prisma__IncomeClient<$Result.GetResult<Prisma.$IncomePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Incomes.
     * @param {IncomeDeleteManyArgs} args - Arguments to filter Incomes to delete.
     * @example
     * // Delete a few Incomes
     * const { count } = await prisma.income.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IncomeDeleteManyArgs>(args?: SelectSubset<T, IncomeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Incomes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncomeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Incomes
     * const income = await prisma.income.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IncomeUpdateManyArgs>(args: SelectSubset<T, IncomeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Incomes and returns the data updated in the database.
     * @param {IncomeUpdateManyAndReturnArgs} args - Arguments to update many Incomes.
     * @example
     * // Update many Incomes
     * const income = await prisma.income.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Incomes and only return the `id`
     * const incomeWithIdOnly = await prisma.income.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends IncomeUpdateManyAndReturnArgs>(args: SelectSubset<T, IncomeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IncomePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Income.
     * @param {IncomeUpsertArgs} args - Arguments to update or create a Income.
     * @example
     * // Update or create a Income
     * const income = await prisma.income.upsert({
     *   create: {
     *     // ... data to create a Income
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Income we want to update
     *   }
     * })
     */
    upsert<T extends IncomeUpsertArgs>(args: SelectSubset<T, IncomeUpsertArgs<ExtArgs>>): Prisma__IncomeClient<$Result.GetResult<Prisma.$IncomePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Incomes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncomeCountArgs} args - Arguments to filter Incomes to count.
     * @example
     * // Count the number of Incomes
     * const count = await prisma.income.count({
     *   where: {
     *     // ... the filter for the Incomes we want to count
     *   }
     * })
    **/
    count<T extends IncomeCountArgs>(
      args?: Subset<T, IncomeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IncomeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Income.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncomeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IncomeAggregateArgs>(args: Subset<T, IncomeAggregateArgs>): Prisma.PrismaPromise<GetIncomeAggregateType<T>>

    /**
     * Group by Income.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncomeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IncomeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IncomeGroupByArgs['orderBy'] }
        : { orderBy?: IncomeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IncomeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIncomeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Income model
   */
  readonly fields: IncomeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Income.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IncomeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Income model
   */
  interface IncomeFieldRefs {
    readonly id: FieldRef<"Income", 'String'>
    readonly userId: FieldRef<"Income", 'String'>
    readonly source: FieldRef<"Income", 'String'>
    readonly category: FieldRef<"Income", 'String'>
    readonly amount: FieldRef<"Income", 'Float'>
    readonly date: FieldRef<"Income", 'DateTime'>
    readonly recurring: FieldRef<"Income", 'Boolean'>
    readonly frequency: FieldRef<"Income", 'String'>
    readonly taxable: FieldRef<"Income", 'Boolean'>
    readonly notes: FieldRef<"Income", 'String'>
    readonly metadata: FieldRef<"Income", 'String'>
    readonly createdAt: FieldRef<"Income", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Income findUnique
   */
  export type IncomeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Income
     */
    select?: IncomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Income
     */
    omit?: IncomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IncomeInclude<ExtArgs> | null
    /**
     * Filter, which Income to fetch.
     */
    where: IncomeWhereUniqueInput
  }

  /**
   * Income findUniqueOrThrow
   */
  export type IncomeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Income
     */
    select?: IncomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Income
     */
    omit?: IncomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IncomeInclude<ExtArgs> | null
    /**
     * Filter, which Income to fetch.
     */
    where: IncomeWhereUniqueInput
  }

  /**
   * Income findFirst
   */
  export type IncomeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Income
     */
    select?: IncomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Income
     */
    omit?: IncomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IncomeInclude<ExtArgs> | null
    /**
     * Filter, which Income to fetch.
     */
    where?: IncomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Incomes to fetch.
     */
    orderBy?: IncomeOrderByWithRelationInput | IncomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Incomes.
     */
    cursor?: IncomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Incomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Incomes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Incomes.
     */
    distinct?: IncomeScalarFieldEnum | IncomeScalarFieldEnum[]
  }

  /**
   * Income findFirstOrThrow
   */
  export type IncomeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Income
     */
    select?: IncomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Income
     */
    omit?: IncomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IncomeInclude<ExtArgs> | null
    /**
     * Filter, which Income to fetch.
     */
    where?: IncomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Incomes to fetch.
     */
    orderBy?: IncomeOrderByWithRelationInput | IncomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Incomes.
     */
    cursor?: IncomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Incomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Incomes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Incomes.
     */
    distinct?: IncomeScalarFieldEnum | IncomeScalarFieldEnum[]
  }

  /**
   * Income findMany
   */
  export type IncomeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Income
     */
    select?: IncomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Income
     */
    omit?: IncomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IncomeInclude<ExtArgs> | null
    /**
     * Filter, which Incomes to fetch.
     */
    where?: IncomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Incomes to fetch.
     */
    orderBy?: IncomeOrderByWithRelationInput | IncomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Incomes.
     */
    cursor?: IncomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Incomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Incomes.
     */
    skip?: number
    distinct?: IncomeScalarFieldEnum | IncomeScalarFieldEnum[]
  }

  /**
   * Income create
   */
  export type IncomeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Income
     */
    select?: IncomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Income
     */
    omit?: IncomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IncomeInclude<ExtArgs> | null
    /**
     * The data needed to create a Income.
     */
    data: XOR<IncomeCreateInput, IncomeUncheckedCreateInput>
  }

  /**
   * Income createMany
   */
  export type IncomeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Incomes.
     */
    data: IncomeCreateManyInput | IncomeCreateManyInput[]
  }

  /**
   * Income createManyAndReturn
   */
  export type IncomeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Income
     */
    select?: IncomeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Income
     */
    omit?: IncomeOmit<ExtArgs> | null
    /**
     * The data used to create many Incomes.
     */
    data: IncomeCreateManyInput | IncomeCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IncomeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Income update
   */
  export type IncomeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Income
     */
    select?: IncomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Income
     */
    omit?: IncomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IncomeInclude<ExtArgs> | null
    /**
     * The data needed to update a Income.
     */
    data: XOR<IncomeUpdateInput, IncomeUncheckedUpdateInput>
    /**
     * Choose, which Income to update.
     */
    where: IncomeWhereUniqueInput
  }

  /**
   * Income updateMany
   */
  export type IncomeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Incomes.
     */
    data: XOR<IncomeUpdateManyMutationInput, IncomeUncheckedUpdateManyInput>
    /**
     * Filter which Incomes to update
     */
    where?: IncomeWhereInput
    /**
     * Limit how many Incomes to update.
     */
    limit?: number
  }

  /**
   * Income updateManyAndReturn
   */
  export type IncomeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Income
     */
    select?: IncomeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Income
     */
    omit?: IncomeOmit<ExtArgs> | null
    /**
     * The data used to update Incomes.
     */
    data: XOR<IncomeUpdateManyMutationInput, IncomeUncheckedUpdateManyInput>
    /**
     * Filter which Incomes to update
     */
    where?: IncomeWhereInput
    /**
     * Limit how many Incomes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IncomeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Income upsert
   */
  export type IncomeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Income
     */
    select?: IncomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Income
     */
    omit?: IncomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IncomeInclude<ExtArgs> | null
    /**
     * The filter to search for the Income to update in case it exists.
     */
    where: IncomeWhereUniqueInput
    /**
     * In case the Income found by the `where` argument doesn't exist, create a new Income with this data.
     */
    create: XOR<IncomeCreateInput, IncomeUncheckedCreateInput>
    /**
     * In case the Income was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IncomeUpdateInput, IncomeUncheckedUpdateInput>
  }

  /**
   * Income delete
   */
  export type IncomeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Income
     */
    select?: IncomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Income
     */
    omit?: IncomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IncomeInclude<ExtArgs> | null
    /**
     * Filter which Income to delete.
     */
    where: IncomeWhereUniqueInput
  }

  /**
   * Income deleteMany
   */
  export type IncomeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Incomes to delete
     */
    where?: IncomeWhereInput
    /**
     * Limit how many Incomes to delete.
     */
    limit?: number
  }

  /**
   * Income without action
   */
  export type IncomeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Income
     */
    select?: IncomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Income
     */
    omit?: IncomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IncomeInclude<ExtArgs> | null
  }


  /**
   * Model Expense
   */

  export type AggregateExpense = {
    _count: ExpenseCountAggregateOutputType | null
    _avg: ExpenseAvgAggregateOutputType | null
    _sum: ExpenseSumAggregateOutputType | null
    _min: ExpenseMinAggregateOutputType | null
    _max: ExpenseMaxAggregateOutputType | null
  }

  export type ExpenseAvgAggregateOutputType = {
    amount: number | null
    priority: number | null
  }

  export type ExpenseSumAggregateOutputType = {
    amount: number | null
    priority: number | null
  }

  export type ExpenseMinAggregateOutputType = {
    id: string | null
    userId: string | null
    category: string | null
    merchant: string | null
    amount: number | null
    date: Date | null
    recurring: boolean | null
    frequency: string | null
    priority: number | null
    essential: boolean | null
    notes: string | null
    metadata: string | null
    createdAt: Date | null
  }

  export type ExpenseMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    category: string | null
    merchant: string | null
    amount: number | null
    date: Date | null
    recurring: boolean | null
    frequency: string | null
    priority: number | null
    essential: boolean | null
    notes: string | null
    metadata: string | null
    createdAt: Date | null
  }

  export type ExpenseCountAggregateOutputType = {
    id: number
    userId: number
    category: number
    merchant: number
    amount: number
    date: number
    recurring: number
    frequency: number
    priority: number
    essential: number
    notes: number
    metadata: number
    createdAt: number
    _all: number
  }


  export type ExpenseAvgAggregateInputType = {
    amount?: true
    priority?: true
  }

  export type ExpenseSumAggregateInputType = {
    amount?: true
    priority?: true
  }

  export type ExpenseMinAggregateInputType = {
    id?: true
    userId?: true
    category?: true
    merchant?: true
    amount?: true
    date?: true
    recurring?: true
    frequency?: true
    priority?: true
    essential?: true
    notes?: true
    metadata?: true
    createdAt?: true
  }

  export type ExpenseMaxAggregateInputType = {
    id?: true
    userId?: true
    category?: true
    merchant?: true
    amount?: true
    date?: true
    recurring?: true
    frequency?: true
    priority?: true
    essential?: true
    notes?: true
    metadata?: true
    createdAt?: true
  }

  export type ExpenseCountAggregateInputType = {
    id?: true
    userId?: true
    category?: true
    merchant?: true
    amount?: true
    date?: true
    recurring?: true
    frequency?: true
    priority?: true
    essential?: true
    notes?: true
    metadata?: true
    createdAt?: true
    _all?: true
  }

  export type ExpenseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Expense to aggregate.
     */
    where?: ExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expenses to fetch.
     */
    orderBy?: ExpenseOrderByWithRelationInput | ExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expenses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Expenses
    **/
    _count?: true | ExpenseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ExpenseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ExpenseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExpenseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExpenseMaxAggregateInputType
  }

  export type GetExpenseAggregateType<T extends ExpenseAggregateArgs> = {
        [P in keyof T & keyof AggregateExpense]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExpense[P]>
      : GetScalarType<T[P], AggregateExpense[P]>
  }




  export type ExpenseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExpenseWhereInput
    orderBy?: ExpenseOrderByWithAggregationInput | ExpenseOrderByWithAggregationInput[]
    by: ExpenseScalarFieldEnum[] | ExpenseScalarFieldEnum
    having?: ExpenseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExpenseCountAggregateInputType | true
    _avg?: ExpenseAvgAggregateInputType
    _sum?: ExpenseSumAggregateInputType
    _min?: ExpenseMinAggregateInputType
    _max?: ExpenseMaxAggregateInputType
  }

  export type ExpenseGroupByOutputType = {
    id: string
    userId: string
    category: string
    merchant: string | null
    amount: number
    date: Date
    recurring: boolean
    frequency: string | null
    priority: number
    essential: boolean
    notes: string | null
    metadata: string | null
    createdAt: Date
    _count: ExpenseCountAggregateOutputType | null
    _avg: ExpenseAvgAggregateOutputType | null
    _sum: ExpenseSumAggregateOutputType | null
    _min: ExpenseMinAggregateOutputType | null
    _max: ExpenseMaxAggregateOutputType | null
  }

  type GetExpenseGroupByPayload<T extends ExpenseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExpenseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExpenseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExpenseGroupByOutputType[P]>
            : GetScalarType<T[P], ExpenseGroupByOutputType[P]>
        }
      >
    >


  export type ExpenseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    category?: boolean
    merchant?: boolean
    amount?: boolean
    date?: boolean
    recurring?: boolean
    frequency?: boolean
    priority?: boolean
    essential?: boolean
    notes?: boolean
    metadata?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["expense"]>

  export type ExpenseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    category?: boolean
    merchant?: boolean
    amount?: boolean
    date?: boolean
    recurring?: boolean
    frequency?: boolean
    priority?: boolean
    essential?: boolean
    notes?: boolean
    metadata?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["expense"]>

  export type ExpenseSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    category?: boolean
    merchant?: boolean
    amount?: boolean
    date?: boolean
    recurring?: boolean
    frequency?: boolean
    priority?: boolean
    essential?: boolean
    notes?: boolean
    metadata?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["expense"]>

  export type ExpenseSelectScalar = {
    id?: boolean
    userId?: boolean
    category?: boolean
    merchant?: boolean
    amount?: boolean
    date?: boolean
    recurring?: boolean
    frequency?: boolean
    priority?: boolean
    essential?: boolean
    notes?: boolean
    metadata?: boolean
    createdAt?: boolean
  }

  export type ExpenseOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "category" | "merchant" | "amount" | "date" | "recurring" | "frequency" | "priority" | "essential" | "notes" | "metadata" | "createdAt", ExtArgs["result"]["expense"]>
  export type ExpenseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ExpenseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ExpenseIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ExpensePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Expense"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      category: string
      merchant: string | null
      amount: number
      date: Date
      recurring: boolean
      frequency: string | null
      priority: number
      essential: boolean
      notes: string | null
      metadata: string | null
      createdAt: Date
    }, ExtArgs["result"]["expense"]>
    composites: {}
  }

  type ExpenseGetPayload<S extends boolean | null | undefined | ExpenseDefaultArgs> = $Result.GetResult<Prisma.$ExpensePayload, S>

  type ExpenseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ExpenseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ExpenseCountAggregateInputType | true
    }

  export interface ExpenseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Expense'], meta: { name: 'Expense' } }
    /**
     * Find zero or one Expense that matches the filter.
     * @param {ExpenseFindUniqueArgs} args - Arguments to find a Expense
     * @example
     * // Get one Expense
     * const expense = await prisma.expense.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExpenseFindUniqueArgs>(args: SelectSubset<T, ExpenseFindUniqueArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Expense that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ExpenseFindUniqueOrThrowArgs} args - Arguments to find a Expense
     * @example
     * // Get one Expense
     * const expense = await prisma.expense.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExpenseFindUniqueOrThrowArgs>(args: SelectSubset<T, ExpenseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Expense that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseFindFirstArgs} args - Arguments to find a Expense
     * @example
     * // Get one Expense
     * const expense = await prisma.expense.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExpenseFindFirstArgs>(args?: SelectSubset<T, ExpenseFindFirstArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Expense that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseFindFirstOrThrowArgs} args - Arguments to find a Expense
     * @example
     * // Get one Expense
     * const expense = await prisma.expense.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExpenseFindFirstOrThrowArgs>(args?: SelectSubset<T, ExpenseFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Expenses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Expenses
     * const expenses = await prisma.expense.findMany()
     * 
     * // Get first 10 Expenses
     * const expenses = await prisma.expense.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const expenseWithIdOnly = await prisma.expense.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ExpenseFindManyArgs>(args?: SelectSubset<T, ExpenseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Expense.
     * @param {ExpenseCreateArgs} args - Arguments to create a Expense.
     * @example
     * // Create one Expense
     * const Expense = await prisma.expense.create({
     *   data: {
     *     // ... data to create a Expense
     *   }
     * })
     * 
     */
    create<T extends ExpenseCreateArgs>(args: SelectSubset<T, ExpenseCreateArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Expenses.
     * @param {ExpenseCreateManyArgs} args - Arguments to create many Expenses.
     * @example
     * // Create many Expenses
     * const expense = await prisma.expense.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExpenseCreateManyArgs>(args?: SelectSubset<T, ExpenseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Expenses and returns the data saved in the database.
     * @param {ExpenseCreateManyAndReturnArgs} args - Arguments to create many Expenses.
     * @example
     * // Create many Expenses
     * const expense = await prisma.expense.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Expenses and only return the `id`
     * const expenseWithIdOnly = await prisma.expense.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ExpenseCreateManyAndReturnArgs>(args?: SelectSubset<T, ExpenseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Expense.
     * @param {ExpenseDeleteArgs} args - Arguments to delete one Expense.
     * @example
     * // Delete one Expense
     * const Expense = await prisma.expense.delete({
     *   where: {
     *     // ... filter to delete one Expense
     *   }
     * })
     * 
     */
    delete<T extends ExpenseDeleteArgs>(args: SelectSubset<T, ExpenseDeleteArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Expense.
     * @param {ExpenseUpdateArgs} args - Arguments to update one Expense.
     * @example
     * // Update one Expense
     * const expense = await prisma.expense.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExpenseUpdateArgs>(args: SelectSubset<T, ExpenseUpdateArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Expenses.
     * @param {ExpenseDeleteManyArgs} args - Arguments to filter Expenses to delete.
     * @example
     * // Delete a few Expenses
     * const { count } = await prisma.expense.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExpenseDeleteManyArgs>(args?: SelectSubset<T, ExpenseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Expenses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Expenses
     * const expense = await prisma.expense.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExpenseUpdateManyArgs>(args: SelectSubset<T, ExpenseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Expenses and returns the data updated in the database.
     * @param {ExpenseUpdateManyAndReturnArgs} args - Arguments to update many Expenses.
     * @example
     * // Update many Expenses
     * const expense = await prisma.expense.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Expenses and only return the `id`
     * const expenseWithIdOnly = await prisma.expense.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ExpenseUpdateManyAndReturnArgs>(args: SelectSubset<T, ExpenseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Expense.
     * @param {ExpenseUpsertArgs} args - Arguments to update or create a Expense.
     * @example
     * // Update or create a Expense
     * const expense = await prisma.expense.upsert({
     *   create: {
     *     // ... data to create a Expense
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Expense we want to update
     *   }
     * })
     */
    upsert<T extends ExpenseUpsertArgs>(args: SelectSubset<T, ExpenseUpsertArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Expenses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseCountArgs} args - Arguments to filter Expenses to count.
     * @example
     * // Count the number of Expenses
     * const count = await prisma.expense.count({
     *   where: {
     *     // ... the filter for the Expenses we want to count
     *   }
     * })
    **/
    count<T extends ExpenseCountArgs>(
      args?: Subset<T, ExpenseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExpenseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Expense.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExpenseAggregateArgs>(args: Subset<T, ExpenseAggregateArgs>): Prisma.PrismaPromise<GetExpenseAggregateType<T>>

    /**
     * Group by Expense.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExpenseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExpenseGroupByArgs['orderBy'] }
        : { orderBy?: ExpenseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExpenseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExpenseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Expense model
   */
  readonly fields: ExpenseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Expense.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExpenseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Expense model
   */
  interface ExpenseFieldRefs {
    readonly id: FieldRef<"Expense", 'String'>
    readonly userId: FieldRef<"Expense", 'String'>
    readonly category: FieldRef<"Expense", 'String'>
    readonly merchant: FieldRef<"Expense", 'String'>
    readonly amount: FieldRef<"Expense", 'Float'>
    readonly date: FieldRef<"Expense", 'DateTime'>
    readonly recurring: FieldRef<"Expense", 'Boolean'>
    readonly frequency: FieldRef<"Expense", 'String'>
    readonly priority: FieldRef<"Expense", 'Int'>
    readonly essential: FieldRef<"Expense", 'Boolean'>
    readonly notes: FieldRef<"Expense", 'String'>
    readonly metadata: FieldRef<"Expense", 'String'>
    readonly createdAt: FieldRef<"Expense", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Expense findUnique
   */
  export type ExpenseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * Filter, which Expense to fetch.
     */
    where: ExpenseWhereUniqueInput
  }

  /**
   * Expense findUniqueOrThrow
   */
  export type ExpenseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * Filter, which Expense to fetch.
     */
    where: ExpenseWhereUniqueInput
  }

  /**
   * Expense findFirst
   */
  export type ExpenseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * Filter, which Expense to fetch.
     */
    where?: ExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expenses to fetch.
     */
    orderBy?: ExpenseOrderByWithRelationInput | ExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Expenses.
     */
    cursor?: ExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expenses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Expenses.
     */
    distinct?: ExpenseScalarFieldEnum | ExpenseScalarFieldEnum[]
  }

  /**
   * Expense findFirstOrThrow
   */
  export type ExpenseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * Filter, which Expense to fetch.
     */
    where?: ExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expenses to fetch.
     */
    orderBy?: ExpenseOrderByWithRelationInput | ExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Expenses.
     */
    cursor?: ExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expenses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Expenses.
     */
    distinct?: ExpenseScalarFieldEnum | ExpenseScalarFieldEnum[]
  }

  /**
   * Expense findMany
   */
  export type ExpenseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * Filter, which Expenses to fetch.
     */
    where?: ExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expenses to fetch.
     */
    orderBy?: ExpenseOrderByWithRelationInput | ExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Expenses.
     */
    cursor?: ExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expenses.
     */
    skip?: number
    distinct?: ExpenseScalarFieldEnum | ExpenseScalarFieldEnum[]
  }

  /**
   * Expense create
   */
  export type ExpenseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * The data needed to create a Expense.
     */
    data: XOR<ExpenseCreateInput, ExpenseUncheckedCreateInput>
  }

  /**
   * Expense createMany
   */
  export type ExpenseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Expenses.
     */
    data: ExpenseCreateManyInput | ExpenseCreateManyInput[]
  }

  /**
   * Expense createManyAndReturn
   */
  export type ExpenseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * The data used to create many Expenses.
     */
    data: ExpenseCreateManyInput | ExpenseCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Expense update
   */
  export type ExpenseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * The data needed to update a Expense.
     */
    data: XOR<ExpenseUpdateInput, ExpenseUncheckedUpdateInput>
    /**
     * Choose, which Expense to update.
     */
    where: ExpenseWhereUniqueInput
  }

  /**
   * Expense updateMany
   */
  export type ExpenseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Expenses.
     */
    data: XOR<ExpenseUpdateManyMutationInput, ExpenseUncheckedUpdateManyInput>
    /**
     * Filter which Expenses to update
     */
    where?: ExpenseWhereInput
    /**
     * Limit how many Expenses to update.
     */
    limit?: number
  }

  /**
   * Expense updateManyAndReturn
   */
  export type ExpenseUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * The data used to update Expenses.
     */
    data: XOR<ExpenseUpdateManyMutationInput, ExpenseUncheckedUpdateManyInput>
    /**
     * Filter which Expenses to update
     */
    where?: ExpenseWhereInput
    /**
     * Limit how many Expenses to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Expense upsert
   */
  export type ExpenseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * The filter to search for the Expense to update in case it exists.
     */
    where: ExpenseWhereUniqueInput
    /**
     * In case the Expense found by the `where` argument doesn't exist, create a new Expense with this data.
     */
    create: XOR<ExpenseCreateInput, ExpenseUncheckedCreateInput>
    /**
     * In case the Expense was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExpenseUpdateInput, ExpenseUncheckedUpdateInput>
  }

  /**
   * Expense delete
   */
  export type ExpenseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
    /**
     * Filter which Expense to delete.
     */
    where: ExpenseWhereUniqueInput
  }

  /**
   * Expense deleteMany
   */
  export type ExpenseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Expenses to delete
     */
    where?: ExpenseWhereInput
    /**
     * Limit how many Expenses to delete.
     */
    limit?: number
  }

  /**
   * Expense without action
   */
  export type ExpenseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExpenseInclude<ExtArgs> | null
  }


  /**
   * Model StockPrice
   */

  export type AggregateStockPrice = {
    _count: StockPriceCountAggregateOutputType | null
    _avg: StockPriceAvgAggregateOutputType | null
    _sum: StockPriceSumAggregateOutputType | null
    _min: StockPriceMinAggregateOutputType | null
    _max: StockPriceMaxAggregateOutputType | null
  }

  export type StockPriceAvgAggregateOutputType = {
    open: number | null
    high: number | null
    low: number | null
    close: number | null
    volume: number | null
    adjustedClose: number | null
  }

  export type StockPriceSumAggregateOutputType = {
    open: number | null
    high: number | null
    low: number | null
    close: number | null
    volume: number | null
    adjustedClose: number | null
  }

  export type StockPriceMinAggregateOutputType = {
    id: string | null
    ticker: string | null
    date: Date | null
    open: number | null
    high: number | null
    low: number | null
    close: number | null
    volume: number | null
    adjustedClose: number | null
    createdAt: Date | null
  }

  export type StockPriceMaxAggregateOutputType = {
    id: string | null
    ticker: string | null
    date: Date | null
    open: number | null
    high: number | null
    low: number | null
    close: number | null
    volume: number | null
    adjustedClose: number | null
    createdAt: Date | null
  }

  export type StockPriceCountAggregateOutputType = {
    id: number
    ticker: number
    date: number
    open: number
    high: number
    low: number
    close: number
    volume: number
    adjustedClose: number
    createdAt: number
    _all: number
  }


  export type StockPriceAvgAggregateInputType = {
    open?: true
    high?: true
    low?: true
    close?: true
    volume?: true
    adjustedClose?: true
  }

  export type StockPriceSumAggregateInputType = {
    open?: true
    high?: true
    low?: true
    close?: true
    volume?: true
    adjustedClose?: true
  }

  export type StockPriceMinAggregateInputType = {
    id?: true
    ticker?: true
    date?: true
    open?: true
    high?: true
    low?: true
    close?: true
    volume?: true
    adjustedClose?: true
    createdAt?: true
  }

  export type StockPriceMaxAggregateInputType = {
    id?: true
    ticker?: true
    date?: true
    open?: true
    high?: true
    low?: true
    close?: true
    volume?: true
    adjustedClose?: true
    createdAt?: true
  }

  export type StockPriceCountAggregateInputType = {
    id?: true
    ticker?: true
    date?: true
    open?: true
    high?: true
    low?: true
    close?: true
    volume?: true
    adjustedClose?: true
    createdAt?: true
    _all?: true
  }

  export type StockPriceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StockPrice to aggregate.
     */
    where?: StockPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StockPrices to fetch.
     */
    orderBy?: StockPriceOrderByWithRelationInput | StockPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StockPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StockPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StockPrices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned StockPrices
    **/
    _count?: true | StockPriceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: StockPriceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: StockPriceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StockPriceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StockPriceMaxAggregateInputType
  }

  export type GetStockPriceAggregateType<T extends StockPriceAggregateArgs> = {
        [P in keyof T & keyof AggregateStockPrice]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStockPrice[P]>
      : GetScalarType<T[P], AggregateStockPrice[P]>
  }




  export type StockPriceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StockPriceWhereInput
    orderBy?: StockPriceOrderByWithAggregationInput | StockPriceOrderByWithAggregationInput[]
    by: StockPriceScalarFieldEnum[] | StockPriceScalarFieldEnum
    having?: StockPriceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StockPriceCountAggregateInputType | true
    _avg?: StockPriceAvgAggregateInputType
    _sum?: StockPriceSumAggregateInputType
    _min?: StockPriceMinAggregateInputType
    _max?: StockPriceMaxAggregateInputType
  }

  export type StockPriceGroupByOutputType = {
    id: string
    ticker: string
    date: Date
    open: number
    high: number
    low: number
    close: number
    volume: number
    adjustedClose: number | null
    createdAt: Date
    _count: StockPriceCountAggregateOutputType | null
    _avg: StockPriceAvgAggregateOutputType | null
    _sum: StockPriceSumAggregateOutputType | null
    _min: StockPriceMinAggregateOutputType | null
    _max: StockPriceMaxAggregateOutputType | null
  }

  type GetStockPriceGroupByPayload<T extends StockPriceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StockPriceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StockPriceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StockPriceGroupByOutputType[P]>
            : GetScalarType<T[P], StockPriceGroupByOutputType[P]>
        }
      >
    >


  export type StockPriceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticker?: boolean
    date?: boolean
    open?: boolean
    high?: boolean
    low?: boolean
    close?: boolean
    volume?: boolean
    adjustedClose?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["stockPrice"]>

  export type StockPriceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticker?: boolean
    date?: boolean
    open?: boolean
    high?: boolean
    low?: boolean
    close?: boolean
    volume?: boolean
    adjustedClose?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["stockPrice"]>

  export type StockPriceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticker?: boolean
    date?: boolean
    open?: boolean
    high?: boolean
    low?: boolean
    close?: boolean
    volume?: boolean
    adjustedClose?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["stockPrice"]>

  export type StockPriceSelectScalar = {
    id?: boolean
    ticker?: boolean
    date?: boolean
    open?: boolean
    high?: boolean
    low?: boolean
    close?: boolean
    volume?: boolean
    adjustedClose?: boolean
    createdAt?: boolean
  }

  export type StockPriceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "ticker" | "date" | "open" | "high" | "low" | "close" | "volume" | "adjustedClose" | "createdAt", ExtArgs["result"]["stockPrice"]>

  export type $StockPricePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "StockPrice"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ticker: string
      date: Date
      open: number
      high: number
      low: number
      close: number
      volume: number
      adjustedClose: number | null
      createdAt: Date
    }, ExtArgs["result"]["stockPrice"]>
    composites: {}
  }

  type StockPriceGetPayload<S extends boolean | null | undefined | StockPriceDefaultArgs> = $Result.GetResult<Prisma.$StockPricePayload, S>

  type StockPriceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StockPriceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StockPriceCountAggregateInputType | true
    }

  export interface StockPriceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['StockPrice'], meta: { name: 'StockPrice' } }
    /**
     * Find zero or one StockPrice that matches the filter.
     * @param {StockPriceFindUniqueArgs} args - Arguments to find a StockPrice
     * @example
     * // Get one StockPrice
     * const stockPrice = await prisma.stockPrice.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StockPriceFindUniqueArgs>(args: SelectSubset<T, StockPriceFindUniqueArgs<ExtArgs>>): Prisma__StockPriceClient<$Result.GetResult<Prisma.$StockPricePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one StockPrice that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StockPriceFindUniqueOrThrowArgs} args - Arguments to find a StockPrice
     * @example
     * // Get one StockPrice
     * const stockPrice = await prisma.stockPrice.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StockPriceFindUniqueOrThrowArgs>(args: SelectSubset<T, StockPriceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StockPriceClient<$Result.GetResult<Prisma.$StockPricePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StockPrice that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockPriceFindFirstArgs} args - Arguments to find a StockPrice
     * @example
     * // Get one StockPrice
     * const stockPrice = await prisma.stockPrice.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StockPriceFindFirstArgs>(args?: SelectSubset<T, StockPriceFindFirstArgs<ExtArgs>>): Prisma__StockPriceClient<$Result.GetResult<Prisma.$StockPricePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StockPrice that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockPriceFindFirstOrThrowArgs} args - Arguments to find a StockPrice
     * @example
     * // Get one StockPrice
     * const stockPrice = await prisma.stockPrice.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StockPriceFindFirstOrThrowArgs>(args?: SelectSubset<T, StockPriceFindFirstOrThrowArgs<ExtArgs>>): Prisma__StockPriceClient<$Result.GetResult<Prisma.$StockPricePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more StockPrices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockPriceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StockPrices
     * const stockPrices = await prisma.stockPrice.findMany()
     * 
     * // Get first 10 StockPrices
     * const stockPrices = await prisma.stockPrice.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const stockPriceWithIdOnly = await prisma.stockPrice.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StockPriceFindManyArgs>(args?: SelectSubset<T, StockPriceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockPricePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a StockPrice.
     * @param {StockPriceCreateArgs} args - Arguments to create a StockPrice.
     * @example
     * // Create one StockPrice
     * const StockPrice = await prisma.stockPrice.create({
     *   data: {
     *     // ... data to create a StockPrice
     *   }
     * })
     * 
     */
    create<T extends StockPriceCreateArgs>(args: SelectSubset<T, StockPriceCreateArgs<ExtArgs>>): Prisma__StockPriceClient<$Result.GetResult<Prisma.$StockPricePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many StockPrices.
     * @param {StockPriceCreateManyArgs} args - Arguments to create many StockPrices.
     * @example
     * // Create many StockPrices
     * const stockPrice = await prisma.stockPrice.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StockPriceCreateManyArgs>(args?: SelectSubset<T, StockPriceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many StockPrices and returns the data saved in the database.
     * @param {StockPriceCreateManyAndReturnArgs} args - Arguments to create many StockPrices.
     * @example
     * // Create many StockPrices
     * const stockPrice = await prisma.stockPrice.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many StockPrices and only return the `id`
     * const stockPriceWithIdOnly = await prisma.stockPrice.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StockPriceCreateManyAndReturnArgs>(args?: SelectSubset<T, StockPriceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockPricePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a StockPrice.
     * @param {StockPriceDeleteArgs} args - Arguments to delete one StockPrice.
     * @example
     * // Delete one StockPrice
     * const StockPrice = await prisma.stockPrice.delete({
     *   where: {
     *     // ... filter to delete one StockPrice
     *   }
     * })
     * 
     */
    delete<T extends StockPriceDeleteArgs>(args: SelectSubset<T, StockPriceDeleteArgs<ExtArgs>>): Prisma__StockPriceClient<$Result.GetResult<Prisma.$StockPricePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one StockPrice.
     * @param {StockPriceUpdateArgs} args - Arguments to update one StockPrice.
     * @example
     * // Update one StockPrice
     * const stockPrice = await prisma.stockPrice.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StockPriceUpdateArgs>(args: SelectSubset<T, StockPriceUpdateArgs<ExtArgs>>): Prisma__StockPriceClient<$Result.GetResult<Prisma.$StockPricePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more StockPrices.
     * @param {StockPriceDeleteManyArgs} args - Arguments to filter StockPrices to delete.
     * @example
     * // Delete a few StockPrices
     * const { count } = await prisma.stockPrice.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StockPriceDeleteManyArgs>(args?: SelectSubset<T, StockPriceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StockPrices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockPriceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StockPrices
     * const stockPrice = await prisma.stockPrice.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StockPriceUpdateManyArgs>(args: SelectSubset<T, StockPriceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StockPrices and returns the data updated in the database.
     * @param {StockPriceUpdateManyAndReturnArgs} args - Arguments to update many StockPrices.
     * @example
     * // Update many StockPrices
     * const stockPrice = await prisma.stockPrice.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more StockPrices and only return the `id`
     * const stockPriceWithIdOnly = await prisma.stockPrice.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends StockPriceUpdateManyAndReturnArgs>(args: SelectSubset<T, StockPriceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockPricePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one StockPrice.
     * @param {StockPriceUpsertArgs} args - Arguments to update or create a StockPrice.
     * @example
     * // Update or create a StockPrice
     * const stockPrice = await prisma.stockPrice.upsert({
     *   create: {
     *     // ... data to create a StockPrice
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StockPrice we want to update
     *   }
     * })
     */
    upsert<T extends StockPriceUpsertArgs>(args: SelectSubset<T, StockPriceUpsertArgs<ExtArgs>>): Prisma__StockPriceClient<$Result.GetResult<Prisma.$StockPricePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of StockPrices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockPriceCountArgs} args - Arguments to filter StockPrices to count.
     * @example
     * // Count the number of StockPrices
     * const count = await prisma.stockPrice.count({
     *   where: {
     *     // ... the filter for the StockPrices we want to count
     *   }
     * })
    **/
    count<T extends StockPriceCountArgs>(
      args?: Subset<T, StockPriceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StockPriceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a StockPrice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockPriceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StockPriceAggregateArgs>(args: Subset<T, StockPriceAggregateArgs>): Prisma.PrismaPromise<GetStockPriceAggregateType<T>>

    /**
     * Group by StockPrice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockPriceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StockPriceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StockPriceGroupByArgs['orderBy'] }
        : { orderBy?: StockPriceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StockPriceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStockPriceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the StockPrice model
   */
  readonly fields: StockPriceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for StockPrice.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StockPriceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the StockPrice model
   */
  interface StockPriceFieldRefs {
    readonly id: FieldRef<"StockPrice", 'String'>
    readonly ticker: FieldRef<"StockPrice", 'String'>
    readonly date: FieldRef<"StockPrice", 'DateTime'>
    readonly open: FieldRef<"StockPrice", 'Float'>
    readonly high: FieldRef<"StockPrice", 'Float'>
    readonly low: FieldRef<"StockPrice", 'Float'>
    readonly close: FieldRef<"StockPrice", 'Float'>
    readonly volume: FieldRef<"StockPrice", 'Int'>
    readonly adjustedClose: FieldRef<"StockPrice", 'Float'>
    readonly createdAt: FieldRef<"StockPrice", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * StockPrice findUnique
   */
  export type StockPriceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockPrice
     */
    select?: StockPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StockPrice
     */
    omit?: StockPriceOmit<ExtArgs> | null
    /**
     * Filter, which StockPrice to fetch.
     */
    where: StockPriceWhereUniqueInput
  }

  /**
   * StockPrice findUniqueOrThrow
   */
  export type StockPriceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockPrice
     */
    select?: StockPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StockPrice
     */
    omit?: StockPriceOmit<ExtArgs> | null
    /**
     * Filter, which StockPrice to fetch.
     */
    where: StockPriceWhereUniqueInput
  }

  /**
   * StockPrice findFirst
   */
  export type StockPriceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockPrice
     */
    select?: StockPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StockPrice
     */
    omit?: StockPriceOmit<ExtArgs> | null
    /**
     * Filter, which StockPrice to fetch.
     */
    where?: StockPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StockPrices to fetch.
     */
    orderBy?: StockPriceOrderByWithRelationInput | StockPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StockPrices.
     */
    cursor?: StockPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StockPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StockPrices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StockPrices.
     */
    distinct?: StockPriceScalarFieldEnum | StockPriceScalarFieldEnum[]
  }

  /**
   * StockPrice findFirstOrThrow
   */
  export type StockPriceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockPrice
     */
    select?: StockPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StockPrice
     */
    omit?: StockPriceOmit<ExtArgs> | null
    /**
     * Filter, which StockPrice to fetch.
     */
    where?: StockPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StockPrices to fetch.
     */
    orderBy?: StockPriceOrderByWithRelationInput | StockPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StockPrices.
     */
    cursor?: StockPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StockPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StockPrices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StockPrices.
     */
    distinct?: StockPriceScalarFieldEnum | StockPriceScalarFieldEnum[]
  }

  /**
   * StockPrice findMany
   */
  export type StockPriceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockPrice
     */
    select?: StockPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StockPrice
     */
    omit?: StockPriceOmit<ExtArgs> | null
    /**
     * Filter, which StockPrices to fetch.
     */
    where?: StockPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StockPrices to fetch.
     */
    orderBy?: StockPriceOrderByWithRelationInput | StockPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing StockPrices.
     */
    cursor?: StockPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StockPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StockPrices.
     */
    skip?: number
    distinct?: StockPriceScalarFieldEnum | StockPriceScalarFieldEnum[]
  }

  /**
   * StockPrice create
   */
  export type StockPriceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockPrice
     */
    select?: StockPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StockPrice
     */
    omit?: StockPriceOmit<ExtArgs> | null
    /**
     * The data needed to create a StockPrice.
     */
    data: XOR<StockPriceCreateInput, StockPriceUncheckedCreateInput>
  }

  /**
   * StockPrice createMany
   */
  export type StockPriceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many StockPrices.
     */
    data: StockPriceCreateManyInput | StockPriceCreateManyInput[]
  }

  /**
   * StockPrice createManyAndReturn
   */
  export type StockPriceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockPrice
     */
    select?: StockPriceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StockPrice
     */
    omit?: StockPriceOmit<ExtArgs> | null
    /**
     * The data used to create many StockPrices.
     */
    data: StockPriceCreateManyInput | StockPriceCreateManyInput[]
  }

  /**
   * StockPrice update
   */
  export type StockPriceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockPrice
     */
    select?: StockPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StockPrice
     */
    omit?: StockPriceOmit<ExtArgs> | null
    /**
     * The data needed to update a StockPrice.
     */
    data: XOR<StockPriceUpdateInput, StockPriceUncheckedUpdateInput>
    /**
     * Choose, which StockPrice to update.
     */
    where: StockPriceWhereUniqueInput
  }

  /**
   * StockPrice updateMany
   */
  export type StockPriceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update StockPrices.
     */
    data: XOR<StockPriceUpdateManyMutationInput, StockPriceUncheckedUpdateManyInput>
    /**
     * Filter which StockPrices to update
     */
    where?: StockPriceWhereInput
    /**
     * Limit how many StockPrices to update.
     */
    limit?: number
  }

  /**
   * StockPrice updateManyAndReturn
   */
  export type StockPriceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockPrice
     */
    select?: StockPriceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StockPrice
     */
    omit?: StockPriceOmit<ExtArgs> | null
    /**
     * The data used to update StockPrices.
     */
    data: XOR<StockPriceUpdateManyMutationInput, StockPriceUncheckedUpdateManyInput>
    /**
     * Filter which StockPrices to update
     */
    where?: StockPriceWhereInput
    /**
     * Limit how many StockPrices to update.
     */
    limit?: number
  }

  /**
   * StockPrice upsert
   */
  export type StockPriceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockPrice
     */
    select?: StockPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StockPrice
     */
    omit?: StockPriceOmit<ExtArgs> | null
    /**
     * The filter to search for the StockPrice to update in case it exists.
     */
    where: StockPriceWhereUniqueInput
    /**
     * In case the StockPrice found by the `where` argument doesn't exist, create a new StockPrice with this data.
     */
    create: XOR<StockPriceCreateInput, StockPriceUncheckedCreateInput>
    /**
     * In case the StockPrice was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StockPriceUpdateInput, StockPriceUncheckedUpdateInput>
  }

  /**
   * StockPrice delete
   */
  export type StockPriceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockPrice
     */
    select?: StockPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StockPrice
     */
    omit?: StockPriceOmit<ExtArgs> | null
    /**
     * Filter which StockPrice to delete.
     */
    where: StockPriceWhereUniqueInput
  }

  /**
   * StockPrice deleteMany
   */
  export type StockPriceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StockPrices to delete
     */
    where?: StockPriceWhereInput
    /**
     * Limit how many StockPrices to delete.
     */
    limit?: number
  }

  /**
   * StockPrice without action
   */
  export type StockPriceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockPrice
     */
    select?: StockPriceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StockPrice
     */
    omit?: StockPriceOmit<ExtArgs> | null
  }


  /**
   * Model DividendSchedule
   */

  export type AggregateDividendSchedule = {
    _count: DividendScheduleCountAggregateOutputType | null
    _avg: DividendScheduleAvgAggregateOutputType | null
    _sum: DividendScheduleSumAggregateOutputType | null
    _min: DividendScheduleMinAggregateOutputType | null
    _max: DividendScheduleMaxAggregateOutputType | null
  }

  export type DividendScheduleAvgAggregateOutputType = {
    amount: number | null
  }

  export type DividendScheduleSumAggregateOutputType = {
    amount: number | null
  }

  export type DividendScheduleMinAggregateOutputType = {
    id: string | null
    ticker: string | null
    exDate: Date | null
    payDate: Date | null
    recordDate: Date | null
    amount: number | null
    frequency: string | null
    paymentType: string | null
    currency: string | null
    createdAt: Date | null
  }

  export type DividendScheduleMaxAggregateOutputType = {
    id: string | null
    ticker: string | null
    exDate: Date | null
    payDate: Date | null
    recordDate: Date | null
    amount: number | null
    frequency: string | null
    paymentType: string | null
    currency: string | null
    createdAt: Date | null
  }

  export type DividendScheduleCountAggregateOutputType = {
    id: number
    ticker: number
    exDate: number
    payDate: number
    recordDate: number
    amount: number
    frequency: number
    paymentType: number
    currency: number
    createdAt: number
    _all: number
  }


  export type DividendScheduleAvgAggregateInputType = {
    amount?: true
  }

  export type DividendScheduleSumAggregateInputType = {
    amount?: true
  }

  export type DividendScheduleMinAggregateInputType = {
    id?: true
    ticker?: true
    exDate?: true
    payDate?: true
    recordDate?: true
    amount?: true
    frequency?: true
    paymentType?: true
    currency?: true
    createdAt?: true
  }

  export type DividendScheduleMaxAggregateInputType = {
    id?: true
    ticker?: true
    exDate?: true
    payDate?: true
    recordDate?: true
    amount?: true
    frequency?: true
    paymentType?: true
    currency?: true
    createdAt?: true
  }

  export type DividendScheduleCountAggregateInputType = {
    id?: true
    ticker?: true
    exDate?: true
    payDate?: true
    recordDate?: true
    amount?: true
    frequency?: true
    paymentType?: true
    currency?: true
    createdAt?: true
    _all?: true
  }

  export type DividendScheduleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DividendSchedule to aggregate.
     */
    where?: DividendScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DividendSchedules to fetch.
     */
    orderBy?: DividendScheduleOrderByWithRelationInput | DividendScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DividendScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DividendSchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DividendSchedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DividendSchedules
    **/
    _count?: true | DividendScheduleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DividendScheduleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DividendScheduleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DividendScheduleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DividendScheduleMaxAggregateInputType
  }

  export type GetDividendScheduleAggregateType<T extends DividendScheduleAggregateArgs> = {
        [P in keyof T & keyof AggregateDividendSchedule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDividendSchedule[P]>
      : GetScalarType<T[P], AggregateDividendSchedule[P]>
  }




  export type DividendScheduleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DividendScheduleWhereInput
    orderBy?: DividendScheduleOrderByWithAggregationInput | DividendScheduleOrderByWithAggregationInput[]
    by: DividendScheduleScalarFieldEnum[] | DividendScheduleScalarFieldEnum
    having?: DividendScheduleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DividendScheduleCountAggregateInputType | true
    _avg?: DividendScheduleAvgAggregateInputType
    _sum?: DividendScheduleSumAggregateInputType
    _min?: DividendScheduleMinAggregateInputType
    _max?: DividendScheduleMaxAggregateInputType
  }

  export type DividendScheduleGroupByOutputType = {
    id: string
    ticker: string
    exDate: Date
    payDate: Date
    recordDate: Date | null
    amount: number
    frequency: string
    paymentType: string
    currency: string
    createdAt: Date
    _count: DividendScheduleCountAggregateOutputType | null
    _avg: DividendScheduleAvgAggregateOutputType | null
    _sum: DividendScheduleSumAggregateOutputType | null
    _min: DividendScheduleMinAggregateOutputType | null
    _max: DividendScheduleMaxAggregateOutputType | null
  }

  type GetDividendScheduleGroupByPayload<T extends DividendScheduleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DividendScheduleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DividendScheduleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DividendScheduleGroupByOutputType[P]>
            : GetScalarType<T[P], DividendScheduleGroupByOutputType[P]>
        }
      >
    >


  export type DividendScheduleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticker?: boolean
    exDate?: boolean
    payDate?: boolean
    recordDate?: boolean
    amount?: boolean
    frequency?: boolean
    paymentType?: boolean
    currency?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["dividendSchedule"]>

  export type DividendScheduleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticker?: boolean
    exDate?: boolean
    payDate?: boolean
    recordDate?: boolean
    amount?: boolean
    frequency?: boolean
    paymentType?: boolean
    currency?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["dividendSchedule"]>

  export type DividendScheduleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticker?: boolean
    exDate?: boolean
    payDate?: boolean
    recordDate?: boolean
    amount?: boolean
    frequency?: boolean
    paymentType?: boolean
    currency?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["dividendSchedule"]>

  export type DividendScheduleSelectScalar = {
    id?: boolean
    ticker?: boolean
    exDate?: boolean
    payDate?: boolean
    recordDate?: boolean
    amount?: boolean
    frequency?: boolean
    paymentType?: boolean
    currency?: boolean
    createdAt?: boolean
  }

  export type DividendScheduleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "ticker" | "exDate" | "payDate" | "recordDate" | "amount" | "frequency" | "paymentType" | "currency" | "createdAt", ExtArgs["result"]["dividendSchedule"]>

  export type $DividendSchedulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DividendSchedule"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ticker: string
      exDate: Date
      payDate: Date
      recordDate: Date | null
      amount: number
      frequency: string
      paymentType: string
      currency: string
      createdAt: Date
    }, ExtArgs["result"]["dividendSchedule"]>
    composites: {}
  }

  type DividendScheduleGetPayload<S extends boolean | null | undefined | DividendScheduleDefaultArgs> = $Result.GetResult<Prisma.$DividendSchedulePayload, S>

  type DividendScheduleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DividendScheduleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DividendScheduleCountAggregateInputType | true
    }

  export interface DividendScheduleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DividendSchedule'], meta: { name: 'DividendSchedule' } }
    /**
     * Find zero or one DividendSchedule that matches the filter.
     * @param {DividendScheduleFindUniqueArgs} args - Arguments to find a DividendSchedule
     * @example
     * // Get one DividendSchedule
     * const dividendSchedule = await prisma.dividendSchedule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DividendScheduleFindUniqueArgs>(args: SelectSubset<T, DividendScheduleFindUniqueArgs<ExtArgs>>): Prisma__DividendScheduleClient<$Result.GetResult<Prisma.$DividendSchedulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DividendSchedule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DividendScheduleFindUniqueOrThrowArgs} args - Arguments to find a DividendSchedule
     * @example
     * // Get one DividendSchedule
     * const dividendSchedule = await prisma.dividendSchedule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DividendScheduleFindUniqueOrThrowArgs>(args: SelectSubset<T, DividendScheduleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DividendScheduleClient<$Result.GetResult<Prisma.$DividendSchedulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DividendSchedule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DividendScheduleFindFirstArgs} args - Arguments to find a DividendSchedule
     * @example
     * // Get one DividendSchedule
     * const dividendSchedule = await prisma.dividendSchedule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DividendScheduleFindFirstArgs>(args?: SelectSubset<T, DividendScheduleFindFirstArgs<ExtArgs>>): Prisma__DividendScheduleClient<$Result.GetResult<Prisma.$DividendSchedulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DividendSchedule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DividendScheduleFindFirstOrThrowArgs} args - Arguments to find a DividendSchedule
     * @example
     * // Get one DividendSchedule
     * const dividendSchedule = await prisma.dividendSchedule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DividendScheduleFindFirstOrThrowArgs>(args?: SelectSubset<T, DividendScheduleFindFirstOrThrowArgs<ExtArgs>>): Prisma__DividendScheduleClient<$Result.GetResult<Prisma.$DividendSchedulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DividendSchedules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DividendScheduleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DividendSchedules
     * const dividendSchedules = await prisma.dividendSchedule.findMany()
     * 
     * // Get first 10 DividendSchedules
     * const dividendSchedules = await prisma.dividendSchedule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dividendScheduleWithIdOnly = await prisma.dividendSchedule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DividendScheduleFindManyArgs>(args?: SelectSubset<T, DividendScheduleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DividendSchedulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DividendSchedule.
     * @param {DividendScheduleCreateArgs} args - Arguments to create a DividendSchedule.
     * @example
     * // Create one DividendSchedule
     * const DividendSchedule = await prisma.dividendSchedule.create({
     *   data: {
     *     // ... data to create a DividendSchedule
     *   }
     * })
     * 
     */
    create<T extends DividendScheduleCreateArgs>(args: SelectSubset<T, DividendScheduleCreateArgs<ExtArgs>>): Prisma__DividendScheduleClient<$Result.GetResult<Prisma.$DividendSchedulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DividendSchedules.
     * @param {DividendScheduleCreateManyArgs} args - Arguments to create many DividendSchedules.
     * @example
     * // Create many DividendSchedules
     * const dividendSchedule = await prisma.dividendSchedule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DividendScheduleCreateManyArgs>(args?: SelectSubset<T, DividendScheduleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DividendSchedules and returns the data saved in the database.
     * @param {DividendScheduleCreateManyAndReturnArgs} args - Arguments to create many DividendSchedules.
     * @example
     * // Create many DividendSchedules
     * const dividendSchedule = await prisma.dividendSchedule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DividendSchedules and only return the `id`
     * const dividendScheduleWithIdOnly = await prisma.dividendSchedule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DividendScheduleCreateManyAndReturnArgs>(args?: SelectSubset<T, DividendScheduleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DividendSchedulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DividendSchedule.
     * @param {DividendScheduleDeleteArgs} args - Arguments to delete one DividendSchedule.
     * @example
     * // Delete one DividendSchedule
     * const DividendSchedule = await prisma.dividendSchedule.delete({
     *   where: {
     *     // ... filter to delete one DividendSchedule
     *   }
     * })
     * 
     */
    delete<T extends DividendScheduleDeleteArgs>(args: SelectSubset<T, DividendScheduleDeleteArgs<ExtArgs>>): Prisma__DividendScheduleClient<$Result.GetResult<Prisma.$DividendSchedulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DividendSchedule.
     * @param {DividendScheduleUpdateArgs} args - Arguments to update one DividendSchedule.
     * @example
     * // Update one DividendSchedule
     * const dividendSchedule = await prisma.dividendSchedule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DividendScheduleUpdateArgs>(args: SelectSubset<T, DividendScheduleUpdateArgs<ExtArgs>>): Prisma__DividendScheduleClient<$Result.GetResult<Prisma.$DividendSchedulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DividendSchedules.
     * @param {DividendScheduleDeleteManyArgs} args - Arguments to filter DividendSchedules to delete.
     * @example
     * // Delete a few DividendSchedules
     * const { count } = await prisma.dividendSchedule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DividendScheduleDeleteManyArgs>(args?: SelectSubset<T, DividendScheduleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DividendSchedules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DividendScheduleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DividendSchedules
     * const dividendSchedule = await prisma.dividendSchedule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DividendScheduleUpdateManyArgs>(args: SelectSubset<T, DividendScheduleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DividendSchedules and returns the data updated in the database.
     * @param {DividendScheduleUpdateManyAndReturnArgs} args - Arguments to update many DividendSchedules.
     * @example
     * // Update many DividendSchedules
     * const dividendSchedule = await prisma.dividendSchedule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DividendSchedules and only return the `id`
     * const dividendScheduleWithIdOnly = await prisma.dividendSchedule.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DividendScheduleUpdateManyAndReturnArgs>(args: SelectSubset<T, DividendScheduleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DividendSchedulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DividendSchedule.
     * @param {DividendScheduleUpsertArgs} args - Arguments to update or create a DividendSchedule.
     * @example
     * // Update or create a DividendSchedule
     * const dividendSchedule = await prisma.dividendSchedule.upsert({
     *   create: {
     *     // ... data to create a DividendSchedule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DividendSchedule we want to update
     *   }
     * })
     */
    upsert<T extends DividendScheduleUpsertArgs>(args: SelectSubset<T, DividendScheduleUpsertArgs<ExtArgs>>): Prisma__DividendScheduleClient<$Result.GetResult<Prisma.$DividendSchedulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DividendSchedules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DividendScheduleCountArgs} args - Arguments to filter DividendSchedules to count.
     * @example
     * // Count the number of DividendSchedules
     * const count = await prisma.dividendSchedule.count({
     *   where: {
     *     // ... the filter for the DividendSchedules we want to count
     *   }
     * })
    **/
    count<T extends DividendScheduleCountArgs>(
      args?: Subset<T, DividendScheduleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DividendScheduleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DividendSchedule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DividendScheduleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DividendScheduleAggregateArgs>(args: Subset<T, DividendScheduleAggregateArgs>): Prisma.PrismaPromise<GetDividendScheduleAggregateType<T>>

    /**
     * Group by DividendSchedule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DividendScheduleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DividendScheduleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DividendScheduleGroupByArgs['orderBy'] }
        : { orderBy?: DividendScheduleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DividendScheduleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDividendScheduleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DividendSchedule model
   */
  readonly fields: DividendScheduleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DividendSchedule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DividendScheduleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DividendSchedule model
   */
  interface DividendScheduleFieldRefs {
    readonly id: FieldRef<"DividendSchedule", 'String'>
    readonly ticker: FieldRef<"DividendSchedule", 'String'>
    readonly exDate: FieldRef<"DividendSchedule", 'DateTime'>
    readonly payDate: FieldRef<"DividendSchedule", 'DateTime'>
    readonly recordDate: FieldRef<"DividendSchedule", 'DateTime'>
    readonly amount: FieldRef<"DividendSchedule", 'Float'>
    readonly frequency: FieldRef<"DividendSchedule", 'String'>
    readonly paymentType: FieldRef<"DividendSchedule", 'String'>
    readonly currency: FieldRef<"DividendSchedule", 'String'>
    readonly createdAt: FieldRef<"DividendSchedule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DividendSchedule findUnique
   */
  export type DividendScheduleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DividendSchedule
     */
    select?: DividendScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DividendSchedule
     */
    omit?: DividendScheduleOmit<ExtArgs> | null
    /**
     * Filter, which DividendSchedule to fetch.
     */
    where: DividendScheduleWhereUniqueInput
  }

  /**
   * DividendSchedule findUniqueOrThrow
   */
  export type DividendScheduleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DividendSchedule
     */
    select?: DividendScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DividendSchedule
     */
    omit?: DividendScheduleOmit<ExtArgs> | null
    /**
     * Filter, which DividendSchedule to fetch.
     */
    where: DividendScheduleWhereUniqueInput
  }

  /**
   * DividendSchedule findFirst
   */
  export type DividendScheduleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DividendSchedule
     */
    select?: DividendScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DividendSchedule
     */
    omit?: DividendScheduleOmit<ExtArgs> | null
    /**
     * Filter, which DividendSchedule to fetch.
     */
    where?: DividendScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DividendSchedules to fetch.
     */
    orderBy?: DividendScheduleOrderByWithRelationInput | DividendScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DividendSchedules.
     */
    cursor?: DividendScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DividendSchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DividendSchedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DividendSchedules.
     */
    distinct?: DividendScheduleScalarFieldEnum | DividendScheduleScalarFieldEnum[]
  }

  /**
   * DividendSchedule findFirstOrThrow
   */
  export type DividendScheduleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DividendSchedule
     */
    select?: DividendScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DividendSchedule
     */
    omit?: DividendScheduleOmit<ExtArgs> | null
    /**
     * Filter, which DividendSchedule to fetch.
     */
    where?: DividendScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DividendSchedules to fetch.
     */
    orderBy?: DividendScheduleOrderByWithRelationInput | DividendScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DividendSchedules.
     */
    cursor?: DividendScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DividendSchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DividendSchedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DividendSchedules.
     */
    distinct?: DividendScheduleScalarFieldEnum | DividendScheduleScalarFieldEnum[]
  }

  /**
   * DividendSchedule findMany
   */
  export type DividendScheduleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DividendSchedule
     */
    select?: DividendScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DividendSchedule
     */
    omit?: DividendScheduleOmit<ExtArgs> | null
    /**
     * Filter, which DividendSchedules to fetch.
     */
    where?: DividendScheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DividendSchedules to fetch.
     */
    orderBy?: DividendScheduleOrderByWithRelationInput | DividendScheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DividendSchedules.
     */
    cursor?: DividendScheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DividendSchedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DividendSchedules.
     */
    skip?: number
    distinct?: DividendScheduleScalarFieldEnum | DividendScheduleScalarFieldEnum[]
  }

  /**
   * DividendSchedule create
   */
  export type DividendScheduleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DividendSchedule
     */
    select?: DividendScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DividendSchedule
     */
    omit?: DividendScheduleOmit<ExtArgs> | null
    /**
     * The data needed to create a DividendSchedule.
     */
    data: XOR<DividendScheduleCreateInput, DividendScheduleUncheckedCreateInput>
  }

  /**
   * DividendSchedule createMany
   */
  export type DividendScheduleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DividendSchedules.
     */
    data: DividendScheduleCreateManyInput | DividendScheduleCreateManyInput[]
  }

  /**
   * DividendSchedule createManyAndReturn
   */
  export type DividendScheduleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DividendSchedule
     */
    select?: DividendScheduleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DividendSchedule
     */
    omit?: DividendScheduleOmit<ExtArgs> | null
    /**
     * The data used to create many DividendSchedules.
     */
    data: DividendScheduleCreateManyInput | DividendScheduleCreateManyInput[]
  }

  /**
   * DividendSchedule update
   */
  export type DividendScheduleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DividendSchedule
     */
    select?: DividendScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DividendSchedule
     */
    omit?: DividendScheduleOmit<ExtArgs> | null
    /**
     * The data needed to update a DividendSchedule.
     */
    data: XOR<DividendScheduleUpdateInput, DividendScheduleUncheckedUpdateInput>
    /**
     * Choose, which DividendSchedule to update.
     */
    where: DividendScheduleWhereUniqueInput
  }

  /**
   * DividendSchedule updateMany
   */
  export type DividendScheduleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DividendSchedules.
     */
    data: XOR<DividendScheduleUpdateManyMutationInput, DividendScheduleUncheckedUpdateManyInput>
    /**
     * Filter which DividendSchedules to update
     */
    where?: DividendScheduleWhereInput
    /**
     * Limit how many DividendSchedules to update.
     */
    limit?: number
  }

  /**
   * DividendSchedule updateManyAndReturn
   */
  export type DividendScheduleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DividendSchedule
     */
    select?: DividendScheduleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DividendSchedule
     */
    omit?: DividendScheduleOmit<ExtArgs> | null
    /**
     * The data used to update DividendSchedules.
     */
    data: XOR<DividendScheduleUpdateManyMutationInput, DividendScheduleUncheckedUpdateManyInput>
    /**
     * Filter which DividendSchedules to update
     */
    where?: DividendScheduleWhereInput
    /**
     * Limit how many DividendSchedules to update.
     */
    limit?: number
  }

  /**
   * DividendSchedule upsert
   */
  export type DividendScheduleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DividendSchedule
     */
    select?: DividendScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DividendSchedule
     */
    omit?: DividendScheduleOmit<ExtArgs> | null
    /**
     * The filter to search for the DividendSchedule to update in case it exists.
     */
    where: DividendScheduleWhereUniqueInput
    /**
     * In case the DividendSchedule found by the `where` argument doesn't exist, create a new DividendSchedule with this data.
     */
    create: XOR<DividendScheduleCreateInput, DividendScheduleUncheckedCreateInput>
    /**
     * In case the DividendSchedule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DividendScheduleUpdateInput, DividendScheduleUncheckedUpdateInput>
  }

  /**
   * DividendSchedule delete
   */
  export type DividendScheduleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DividendSchedule
     */
    select?: DividendScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DividendSchedule
     */
    omit?: DividendScheduleOmit<ExtArgs> | null
    /**
     * Filter which DividendSchedule to delete.
     */
    where: DividendScheduleWhereUniqueInput
  }

  /**
   * DividendSchedule deleteMany
   */
  export type DividendScheduleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DividendSchedules to delete
     */
    where?: DividendScheduleWhereInput
    /**
     * Limit how many DividendSchedules to delete.
     */
    limit?: number
  }

  /**
   * DividendSchedule without action
   */
  export type DividendScheduleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DividendSchedule
     */
    select?: DividendScheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DividendSchedule
     */
    omit?: DividendScheduleOmit<ExtArgs> | null
  }


  /**
   * Model CalculationCache
   */

  export type AggregateCalculationCache = {
    _count: CalculationCacheCountAggregateOutputType | null
    _min: CalculationCacheMinAggregateOutputType | null
    _max: CalculationCacheMaxAggregateOutputType | null
  }

  export type CalculationCacheMinAggregateOutputType = {
    id: string | null
    cacheKey: string | null
    data: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type CalculationCacheMaxAggregateOutputType = {
    id: string | null
    cacheKey: string | null
    data: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type CalculationCacheCountAggregateOutputType = {
    id: number
    cacheKey: number
    data: number
    expiresAt: number
    createdAt: number
    _all: number
  }


  export type CalculationCacheMinAggregateInputType = {
    id?: true
    cacheKey?: true
    data?: true
    expiresAt?: true
    createdAt?: true
  }

  export type CalculationCacheMaxAggregateInputType = {
    id?: true
    cacheKey?: true
    data?: true
    expiresAt?: true
    createdAt?: true
  }

  export type CalculationCacheCountAggregateInputType = {
    id?: true
    cacheKey?: true
    data?: true
    expiresAt?: true
    createdAt?: true
    _all?: true
  }

  export type CalculationCacheAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CalculationCache to aggregate.
     */
    where?: CalculationCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CalculationCaches to fetch.
     */
    orderBy?: CalculationCacheOrderByWithRelationInput | CalculationCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CalculationCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CalculationCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CalculationCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CalculationCaches
    **/
    _count?: true | CalculationCacheCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CalculationCacheMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CalculationCacheMaxAggregateInputType
  }

  export type GetCalculationCacheAggregateType<T extends CalculationCacheAggregateArgs> = {
        [P in keyof T & keyof AggregateCalculationCache]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCalculationCache[P]>
      : GetScalarType<T[P], AggregateCalculationCache[P]>
  }




  export type CalculationCacheGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CalculationCacheWhereInput
    orderBy?: CalculationCacheOrderByWithAggregationInput | CalculationCacheOrderByWithAggregationInput[]
    by: CalculationCacheScalarFieldEnum[] | CalculationCacheScalarFieldEnum
    having?: CalculationCacheScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CalculationCacheCountAggregateInputType | true
    _min?: CalculationCacheMinAggregateInputType
    _max?: CalculationCacheMaxAggregateInputType
  }

  export type CalculationCacheGroupByOutputType = {
    id: string
    cacheKey: string
    data: string
    expiresAt: Date
    createdAt: Date
    _count: CalculationCacheCountAggregateOutputType | null
    _min: CalculationCacheMinAggregateOutputType | null
    _max: CalculationCacheMaxAggregateOutputType | null
  }

  type GetCalculationCacheGroupByPayload<T extends CalculationCacheGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CalculationCacheGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CalculationCacheGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CalculationCacheGroupByOutputType[P]>
            : GetScalarType<T[P], CalculationCacheGroupByOutputType[P]>
        }
      >
    >


  export type CalculationCacheSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cacheKey?: boolean
    data?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["calculationCache"]>

  export type CalculationCacheSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cacheKey?: boolean
    data?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["calculationCache"]>

  export type CalculationCacheSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cacheKey?: boolean
    data?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["calculationCache"]>

  export type CalculationCacheSelectScalar = {
    id?: boolean
    cacheKey?: boolean
    data?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }

  export type CalculationCacheOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "cacheKey" | "data" | "expiresAt" | "createdAt", ExtArgs["result"]["calculationCache"]>

  export type $CalculationCachePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CalculationCache"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      cacheKey: string
      data: string
      expiresAt: Date
      createdAt: Date
    }, ExtArgs["result"]["calculationCache"]>
    composites: {}
  }

  type CalculationCacheGetPayload<S extends boolean | null | undefined | CalculationCacheDefaultArgs> = $Result.GetResult<Prisma.$CalculationCachePayload, S>

  type CalculationCacheCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CalculationCacheFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CalculationCacheCountAggregateInputType | true
    }

  export interface CalculationCacheDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CalculationCache'], meta: { name: 'CalculationCache' } }
    /**
     * Find zero or one CalculationCache that matches the filter.
     * @param {CalculationCacheFindUniqueArgs} args - Arguments to find a CalculationCache
     * @example
     * // Get one CalculationCache
     * const calculationCache = await prisma.calculationCache.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CalculationCacheFindUniqueArgs>(args: SelectSubset<T, CalculationCacheFindUniqueArgs<ExtArgs>>): Prisma__CalculationCacheClient<$Result.GetResult<Prisma.$CalculationCachePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CalculationCache that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CalculationCacheFindUniqueOrThrowArgs} args - Arguments to find a CalculationCache
     * @example
     * // Get one CalculationCache
     * const calculationCache = await prisma.calculationCache.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CalculationCacheFindUniqueOrThrowArgs>(args: SelectSubset<T, CalculationCacheFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CalculationCacheClient<$Result.GetResult<Prisma.$CalculationCachePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CalculationCache that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CalculationCacheFindFirstArgs} args - Arguments to find a CalculationCache
     * @example
     * // Get one CalculationCache
     * const calculationCache = await prisma.calculationCache.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CalculationCacheFindFirstArgs>(args?: SelectSubset<T, CalculationCacheFindFirstArgs<ExtArgs>>): Prisma__CalculationCacheClient<$Result.GetResult<Prisma.$CalculationCachePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CalculationCache that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CalculationCacheFindFirstOrThrowArgs} args - Arguments to find a CalculationCache
     * @example
     * // Get one CalculationCache
     * const calculationCache = await prisma.calculationCache.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CalculationCacheFindFirstOrThrowArgs>(args?: SelectSubset<T, CalculationCacheFindFirstOrThrowArgs<ExtArgs>>): Prisma__CalculationCacheClient<$Result.GetResult<Prisma.$CalculationCachePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CalculationCaches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CalculationCacheFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CalculationCaches
     * const calculationCaches = await prisma.calculationCache.findMany()
     * 
     * // Get first 10 CalculationCaches
     * const calculationCaches = await prisma.calculationCache.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const calculationCacheWithIdOnly = await prisma.calculationCache.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CalculationCacheFindManyArgs>(args?: SelectSubset<T, CalculationCacheFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CalculationCachePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CalculationCache.
     * @param {CalculationCacheCreateArgs} args - Arguments to create a CalculationCache.
     * @example
     * // Create one CalculationCache
     * const CalculationCache = await prisma.calculationCache.create({
     *   data: {
     *     // ... data to create a CalculationCache
     *   }
     * })
     * 
     */
    create<T extends CalculationCacheCreateArgs>(args: SelectSubset<T, CalculationCacheCreateArgs<ExtArgs>>): Prisma__CalculationCacheClient<$Result.GetResult<Prisma.$CalculationCachePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CalculationCaches.
     * @param {CalculationCacheCreateManyArgs} args - Arguments to create many CalculationCaches.
     * @example
     * // Create many CalculationCaches
     * const calculationCache = await prisma.calculationCache.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CalculationCacheCreateManyArgs>(args?: SelectSubset<T, CalculationCacheCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CalculationCaches and returns the data saved in the database.
     * @param {CalculationCacheCreateManyAndReturnArgs} args - Arguments to create many CalculationCaches.
     * @example
     * // Create many CalculationCaches
     * const calculationCache = await prisma.calculationCache.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CalculationCaches and only return the `id`
     * const calculationCacheWithIdOnly = await prisma.calculationCache.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CalculationCacheCreateManyAndReturnArgs>(args?: SelectSubset<T, CalculationCacheCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CalculationCachePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CalculationCache.
     * @param {CalculationCacheDeleteArgs} args - Arguments to delete one CalculationCache.
     * @example
     * // Delete one CalculationCache
     * const CalculationCache = await prisma.calculationCache.delete({
     *   where: {
     *     // ... filter to delete one CalculationCache
     *   }
     * })
     * 
     */
    delete<T extends CalculationCacheDeleteArgs>(args: SelectSubset<T, CalculationCacheDeleteArgs<ExtArgs>>): Prisma__CalculationCacheClient<$Result.GetResult<Prisma.$CalculationCachePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CalculationCache.
     * @param {CalculationCacheUpdateArgs} args - Arguments to update one CalculationCache.
     * @example
     * // Update one CalculationCache
     * const calculationCache = await prisma.calculationCache.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CalculationCacheUpdateArgs>(args: SelectSubset<T, CalculationCacheUpdateArgs<ExtArgs>>): Prisma__CalculationCacheClient<$Result.GetResult<Prisma.$CalculationCachePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CalculationCaches.
     * @param {CalculationCacheDeleteManyArgs} args - Arguments to filter CalculationCaches to delete.
     * @example
     * // Delete a few CalculationCaches
     * const { count } = await prisma.calculationCache.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CalculationCacheDeleteManyArgs>(args?: SelectSubset<T, CalculationCacheDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CalculationCaches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CalculationCacheUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CalculationCaches
     * const calculationCache = await prisma.calculationCache.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CalculationCacheUpdateManyArgs>(args: SelectSubset<T, CalculationCacheUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CalculationCaches and returns the data updated in the database.
     * @param {CalculationCacheUpdateManyAndReturnArgs} args - Arguments to update many CalculationCaches.
     * @example
     * // Update many CalculationCaches
     * const calculationCache = await prisma.calculationCache.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CalculationCaches and only return the `id`
     * const calculationCacheWithIdOnly = await prisma.calculationCache.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CalculationCacheUpdateManyAndReturnArgs>(args: SelectSubset<T, CalculationCacheUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CalculationCachePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CalculationCache.
     * @param {CalculationCacheUpsertArgs} args - Arguments to update or create a CalculationCache.
     * @example
     * // Update or create a CalculationCache
     * const calculationCache = await prisma.calculationCache.upsert({
     *   create: {
     *     // ... data to create a CalculationCache
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CalculationCache we want to update
     *   }
     * })
     */
    upsert<T extends CalculationCacheUpsertArgs>(args: SelectSubset<T, CalculationCacheUpsertArgs<ExtArgs>>): Prisma__CalculationCacheClient<$Result.GetResult<Prisma.$CalculationCachePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CalculationCaches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CalculationCacheCountArgs} args - Arguments to filter CalculationCaches to count.
     * @example
     * // Count the number of CalculationCaches
     * const count = await prisma.calculationCache.count({
     *   where: {
     *     // ... the filter for the CalculationCaches we want to count
     *   }
     * })
    **/
    count<T extends CalculationCacheCountArgs>(
      args?: Subset<T, CalculationCacheCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CalculationCacheCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CalculationCache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CalculationCacheAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CalculationCacheAggregateArgs>(args: Subset<T, CalculationCacheAggregateArgs>): Prisma.PrismaPromise<GetCalculationCacheAggregateType<T>>

    /**
     * Group by CalculationCache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CalculationCacheGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CalculationCacheGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CalculationCacheGroupByArgs['orderBy'] }
        : { orderBy?: CalculationCacheGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CalculationCacheGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCalculationCacheGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CalculationCache model
   */
  readonly fields: CalculationCacheFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CalculationCache.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CalculationCacheClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CalculationCache model
   */
  interface CalculationCacheFieldRefs {
    readonly id: FieldRef<"CalculationCache", 'String'>
    readonly cacheKey: FieldRef<"CalculationCache", 'String'>
    readonly data: FieldRef<"CalculationCache", 'String'>
    readonly expiresAt: FieldRef<"CalculationCache", 'DateTime'>
    readonly createdAt: FieldRef<"CalculationCache", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CalculationCache findUnique
   */
  export type CalculationCacheFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CalculationCache
     */
    select?: CalculationCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CalculationCache
     */
    omit?: CalculationCacheOmit<ExtArgs> | null
    /**
     * Filter, which CalculationCache to fetch.
     */
    where: CalculationCacheWhereUniqueInput
  }

  /**
   * CalculationCache findUniqueOrThrow
   */
  export type CalculationCacheFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CalculationCache
     */
    select?: CalculationCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CalculationCache
     */
    omit?: CalculationCacheOmit<ExtArgs> | null
    /**
     * Filter, which CalculationCache to fetch.
     */
    where: CalculationCacheWhereUniqueInput
  }

  /**
   * CalculationCache findFirst
   */
  export type CalculationCacheFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CalculationCache
     */
    select?: CalculationCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CalculationCache
     */
    omit?: CalculationCacheOmit<ExtArgs> | null
    /**
     * Filter, which CalculationCache to fetch.
     */
    where?: CalculationCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CalculationCaches to fetch.
     */
    orderBy?: CalculationCacheOrderByWithRelationInput | CalculationCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CalculationCaches.
     */
    cursor?: CalculationCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CalculationCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CalculationCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CalculationCaches.
     */
    distinct?: CalculationCacheScalarFieldEnum | CalculationCacheScalarFieldEnum[]
  }

  /**
   * CalculationCache findFirstOrThrow
   */
  export type CalculationCacheFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CalculationCache
     */
    select?: CalculationCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CalculationCache
     */
    omit?: CalculationCacheOmit<ExtArgs> | null
    /**
     * Filter, which CalculationCache to fetch.
     */
    where?: CalculationCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CalculationCaches to fetch.
     */
    orderBy?: CalculationCacheOrderByWithRelationInput | CalculationCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CalculationCaches.
     */
    cursor?: CalculationCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CalculationCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CalculationCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CalculationCaches.
     */
    distinct?: CalculationCacheScalarFieldEnum | CalculationCacheScalarFieldEnum[]
  }

  /**
   * CalculationCache findMany
   */
  export type CalculationCacheFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CalculationCache
     */
    select?: CalculationCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CalculationCache
     */
    omit?: CalculationCacheOmit<ExtArgs> | null
    /**
     * Filter, which CalculationCaches to fetch.
     */
    where?: CalculationCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CalculationCaches to fetch.
     */
    orderBy?: CalculationCacheOrderByWithRelationInput | CalculationCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CalculationCaches.
     */
    cursor?: CalculationCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CalculationCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CalculationCaches.
     */
    skip?: number
    distinct?: CalculationCacheScalarFieldEnum | CalculationCacheScalarFieldEnum[]
  }

  /**
   * CalculationCache create
   */
  export type CalculationCacheCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CalculationCache
     */
    select?: CalculationCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CalculationCache
     */
    omit?: CalculationCacheOmit<ExtArgs> | null
    /**
     * The data needed to create a CalculationCache.
     */
    data: XOR<CalculationCacheCreateInput, CalculationCacheUncheckedCreateInput>
  }

  /**
   * CalculationCache createMany
   */
  export type CalculationCacheCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CalculationCaches.
     */
    data: CalculationCacheCreateManyInput | CalculationCacheCreateManyInput[]
  }

  /**
   * CalculationCache createManyAndReturn
   */
  export type CalculationCacheCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CalculationCache
     */
    select?: CalculationCacheSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CalculationCache
     */
    omit?: CalculationCacheOmit<ExtArgs> | null
    /**
     * The data used to create many CalculationCaches.
     */
    data: CalculationCacheCreateManyInput | CalculationCacheCreateManyInput[]
  }

  /**
   * CalculationCache update
   */
  export type CalculationCacheUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CalculationCache
     */
    select?: CalculationCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CalculationCache
     */
    omit?: CalculationCacheOmit<ExtArgs> | null
    /**
     * The data needed to update a CalculationCache.
     */
    data: XOR<CalculationCacheUpdateInput, CalculationCacheUncheckedUpdateInput>
    /**
     * Choose, which CalculationCache to update.
     */
    where: CalculationCacheWhereUniqueInput
  }

  /**
   * CalculationCache updateMany
   */
  export type CalculationCacheUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CalculationCaches.
     */
    data: XOR<CalculationCacheUpdateManyMutationInput, CalculationCacheUncheckedUpdateManyInput>
    /**
     * Filter which CalculationCaches to update
     */
    where?: CalculationCacheWhereInput
    /**
     * Limit how many CalculationCaches to update.
     */
    limit?: number
  }

  /**
   * CalculationCache updateManyAndReturn
   */
  export type CalculationCacheUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CalculationCache
     */
    select?: CalculationCacheSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CalculationCache
     */
    omit?: CalculationCacheOmit<ExtArgs> | null
    /**
     * The data used to update CalculationCaches.
     */
    data: XOR<CalculationCacheUpdateManyMutationInput, CalculationCacheUncheckedUpdateManyInput>
    /**
     * Filter which CalculationCaches to update
     */
    where?: CalculationCacheWhereInput
    /**
     * Limit how many CalculationCaches to update.
     */
    limit?: number
  }

  /**
   * CalculationCache upsert
   */
  export type CalculationCacheUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CalculationCache
     */
    select?: CalculationCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CalculationCache
     */
    omit?: CalculationCacheOmit<ExtArgs> | null
    /**
     * The filter to search for the CalculationCache to update in case it exists.
     */
    where: CalculationCacheWhereUniqueInput
    /**
     * In case the CalculationCache found by the `where` argument doesn't exist, create a new CalculationCache with this data.
     */
    create: XOR<CalculationCacheCreateInput, CalculationCacheUncheckedCreateInput>
    /**
     * In case the CalculationCache was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CalculationCacheUpdateInput, CalculationCacheUncheckedUpdateInput>
  }

  /**
   * CalculationCache delete
   */
  export type CalculationCacheDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CalculationCache
     */
    select?: CalculationCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CalculationCache
     */
    omit?: CalculationCacheOmit<ExtArgs> | null
    /**
     * Filter which CalculationCache to delete.
     */
    where: CalculationCacheWhereUniqueInput
  }

  /**
   * CalculationCache deleteMany
   */
  export type CalculationCacheDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CalculationCaches to delete
     */
    where?: CalculationCacheWhereInput
    /**
     * Limit how many CalculationCaches to delete.
     */
    limit?: number
  }

  /**
   * CalculationCache without action
   */
  export type CalculationCacheDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CalculationCache
     */
    select?: CalculationCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CalculationCache
     */
    omit?: CalculationCacheOmit<ExtArgs> | null
  }


  /**
   * Model UserSettings
   */

  export type AggregateUserSettings = {
    _count: UserSettingsCountAggregateOutputType | null
    _min: UserSettingsMinAggregateOutputType | null
    _max: UserSettingsMaxAggregateOutputType | null
  }

  export type UserSettingsMinAggregateOutputType = {
    id: string | null
    userId: string | null
    theme: string | null
    currency: string | null
    locale: string | null
    timezone: string | null
    notifications: string | null
    privacy: string | null
    features: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserSettingsMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    theme: string | null
    currency: string | null
    locale: string | null
    timezone: string | null
    notifications: string | null
    privacy: string | null
    features: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserSettingsCountAggregateOutputType = {
    id: number
    userId: number
    theme: number
    currency: number
    locale: number
    timezone: number
    notifications: number
    privacy: number
    features: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserSettingsMinAggregateInputType = {
    id?: true
    userId?: true
    theme?: true
    currency?: true
    locale?: true
    timezone?: true
    notifications?: true
    privacy?: true
    features?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserSettingsMaxAggregateInputType = {
    id?: true
    userId?: true
    theme?: true
    currency?: true
    locale?: true
    timezone?: true
    notifications?: true
    privacy?: true
    features?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserSettingsCountAggregateInputType = {
    id?: true
    userId?: true
    theme?: true
    currency?: true
    locale?: true
    timezone?: true
    notifications?: true
    privacy?: true
    features?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserSettingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserSettings to aggregate.
     */
    where?: UserSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSettings to fetch.
     */
    orderBy?: UserSettingsOrderByWithRelationInput | UserSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserSettings
    **/
    _count?: true | UserSettingsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserSettingsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserSettingsMaxAggregateInputType
  }

  export type GetUserSettingsAggregateType<T extends UserSettingsAggregateArgs> = {
        [P in keyof T & keyof AggregateUserSettings]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserSettings[P]>
      : GetScalarType<T[P], AggregateUserSettings[P]>
  }




  export type UserSettingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserSettingsWhereInput
    orderBy?: UserSettingsOrderByWithAggregationInput | UserSettingsOrderByWithAggregationInput[]
    by: UserSettingsScalarFieldEnum[] | UserSettingsScalarFieldEnum
    having?: UserSettingsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserSettingsCountAggregateInputType | true
    _min?: UserSettingsMinAggregateInputType
    _max?: UserSettingsMaxAggregateInputType
  }

  export type UserSettingsGroupByOutputType = {
    id: string
    userId: string
    theme: string
    currency: string
    locale: string
    timezone: string
    notifications: string | null
    privacy: string | null
    features: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserSettingsCountAggregateOutputType | null
    _min: UserSettingsMinAggregateOutputType | null
    _max: UserSettingsMaxAggregateOutputType | null
  }

  type GetUserSettingsGroupByPayload<T extends UserSettingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserSettingsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserSettingsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserSettingsGroupByOutputType[P]>
            : GetScalarType<T[P], UserSettingsGroupByOutputType[P]>
        }
      >
    >


  export type UserSettingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    theme?: boolean
    currency?: boolean
    locale?: boolean
    timezone?: boolean
    notifications?: boolean
    privacy?: boolean
    features?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userSettings"]>

  export type UserSettingsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    theme?: boolean
    currency?: boolean
    locale?: boolean
    timezone?: boolean
    notifications?: boolean
    privacy?: boolean
    features?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userSettings"]>

  export type UserSettingsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    theme?: boolean
    currency?: boolean
    locale?: boolean
    timezone?: boolean
    notifications?: boolean
    privacy?: boolean
    features?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userSettings"]>

  export type UserSettingsSelectScalar = {
    id?: boolean
    userId?: boolean
    theme?: boolean
    currency?: boolean
    locale?: boolean
    timezone?: boolean
    notifications?: boolean
    privacy?: boolean
    features?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserSettingsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "theme" | "currency" | "locale" | "timezone" | "notifications" | "privacy" | "features" | "createdAt" | "updatedAt", ExtArgs["result"]["userSettings"]>

  export type $UserSettingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserSettings"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      theme: string
      currency: string
      locale: string
      timezone: string
      notifications: string | null
      privacy: string | null
      features: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userSettings"]>
    composites: {}
  }

  type UserSettingsGetPayload<S extends boolean | null | undefined | UserSettingsDefaultArgs> = $Result.GetResult<Prisma.$UserSettingsPayload, S>

  type UserSettingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserSettingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserSettingsCountAggregateInputType | true
    }

  export interface UserSettingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserSettings'], meta: { name: 'UserSettings' } }
    /**
     * Find zero or one UserSettings that matches the filter.
     * @param {UserSettingsFindUniqueArgs} args - Arguments to find a UserSettings
     * @example
     * // Get one UserSettings
     * const userSettings = await prisma.userSettings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserSettingsFindUniqueArgs>(args: SelectSubset<T, UserSettingsFindUniqueArgs<ExtArgs>>): Prisma__UserSettingsClient<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserSettings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserSettingsFindUniqueOrThrowArgs} args - Arguments to find a UserSettings
     * @example
     * // Get one UserSettings
     * const userSettings = await prisma.userSettings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserSettingsFindUniqueOrThrowArgs>(args: SelectSubset<T, UserSettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserSettingsClient<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingsFindFirstArgs} args - Arguments to find a UserSettings
     * @example
     * // Get one UserSettings
     * const userSettings = await prisma.userSettings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserSettingsFindFirstArgs>(args?: SelectSubset<T, UserSettingsFindFirstArgs<ExtArgs>>): Prisma__UserSettingsClient<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserSettings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingsFindFirstOrThrowArgs} args - Arguments to find a UserSettings
     * @example
     * // Get one UserSettings
     * const userSettings = await prisma.userSettings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserSettingsFindFirstOrThrowArgs>(args?: SelectSubset<T, UserSettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserSettingsClient<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserSettings
     * const userSettings = await prisma.userSettings.findMany()
     * 
     * // Get first 10 UserSettings
     * const userSettings = await prisma.userSettings.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userSettingsWithIdOnly = await prisma.userSettings.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserSettingsFindManyArgs>(args?: SelectSubset<T, UserSettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserSettings.
     * @param {UserSettingsCreateArgs} args - Arguments to create a UserSettings.
     * @example
     * // Create one UserSettings
     * const UserSettings = await prisma.userSettings.create({
     *   data: {
     *     // ... data to create a UserSettings
     *   }
     * })
     * 
     */
    create<T extends UserSettingsCreateArgs>(args: SelectSubset<T, UserSettingsCreateArgs<ExtArgs>>): Prisma__UserSettingsClient<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserSettings.
     * @param {UserSettingsCreateManyArgs} args - Arguments to create many UserSettings.
     * @example
     * // Create many UserSettings
     * const userSettings = await prisma.userSettings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserSettingsCreateManyArgs>(args?: SelectSubset<T, UserSettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserSettings and returns the data saved in the database.
     * @param {UserSettingsCreateManyAndReturnArgs} args - Arguments to create many UserSettings.
     * @example
     * // Create many UserSettings
     * const userSettings = await prisma.userSettings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserSettings and only return the `id`
     * const userSettingsWithIdOnly = await prisma.userSettings.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserSettingsCreateManyAndReturnArgs>(args?: SelectSubset<T, UserSettingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserSettings.
     * @param {UserSettingsDeleteArgs} args - Arguments to delete one UserSettings.
     * @example
     * // Delete one UserSettings
     * const UserSettings = await prisma.userSettings.delete({
     *   where: {
     *     // ... filter to delete one UserSettings
     *   }
     * })
     * 
     */
    delete<T extends UserSettingsDeleteArgs>(args: SelectSubset<T, UserSettingsDeleteArgs<ExtArgs>>): Prisma__UserSettingsClient<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserSettings.
     * @param {UserSettingsUpdateArgs} args - Arguments to update one UserSettings.
     * @example
     * // Update one UserSettings
     * const userSettings = await prisma.userSettings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserSettingsUpdateArgs>(args: SelectSubset<T, UserSettingsUpdateArgs<ExtArgs>>): Prisma__UserSettingsClient<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserSettings.
     * @param {UserSettingsDeleteManyArgs} args - Arguments to filter UserSettings to delete.
     * @example
     * // Delete a few UserSettings
     * const { count } = await prisma.userSettings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserSettingsDeleteManyArgs>(args?: SelectSubset<T, UserSettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserSettings
     * const userSettings = await prisma.userSettings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserSettingsUpdateManyArgs>(args: SelectSubset<T, UserSettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserSettings and returns the data updated in the database.
     * @param {UserSettingsUpdateManyAndReturnArgs} args - Arguments to update many UserSettings.
     * @example
     * // Update many UserSettings
     * const userSettings = await prisma.userSettings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserSettings and only return the `id`
     * const userSettingsWithIdOnly = await prisma.userSettings.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserSettingsUpdateManyAndReturnArgs>(args: SelectSubset<T, UserSettingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserSettings.
     * @param {UserSettingsUpsertArgs} args - Arguments to update or create a UserSettings.
     * @example
     * // Update or create a UserSettings
     * const userSettings = await prisma.userSettings.upsert({
     *   create: {
     *     // ... data to create a UserSettings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserSettings we want to update
     *   }
     * })
     */
    upsert<T extends UserSettingsUpsertArgs>(args: SelectSubset<T, UserSettingsUpsertArgs<ExtArgs>>): Prisma__UserSettingsClient<$Result.GetResult<Prisma.$UserSettingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingsCountArgs} args - Arguments to filter UserSettings to count.
     * @example
     * // Count the number of UserSettings
     * const count = await prisma.userSettings.count({
     *   where: {
     *     // ... the filter for the UserSettings we want to count
     *   }
     * })
    **/
    count<T extends UserSettingsCountArgs>(
      args?: Subset<T, UserSettingsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserSettingsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserSettingsAggregateArgs>(args: Subset<T, UserSettingsAggregateArgs>): Prisma.PrismaPromise<GetUserSettingsAggregateType<T>>

    /**
     * Group by UserSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSettingsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserSettingsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserSettingsGroupByArgs['orderBy'] }
        : { orderBy?: UserSettingsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserSettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserSettings model
   */
  readonly fields: UserSettingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserSettings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserSettingsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserSettings model
   */
  interface UserSettingsFieldRefs {
    readonly id: FieldRef<"UserSettings", 'String'>
    readonly userId: FieldRef<"UserSettings", 'String'>
    readonly theme: FieldRef<"UserSettings", 'String'>
    readonly currency: FieldRef<"UserSettings", 'String'>
    readonly locale: FieldRef<"UserSettings", 'String'>
    readonly timezone: FieldRef<"UserSettings", 'String'>
    readonly notifications: FieldRef<"UserSettings", 'String'>
    readonly privacy: FieldRef<"UserSettings", 'String'>
    readonly features: FieldRef<"UserSettings", 'String'>
    readonly createdAt: FieldRef<"UserSettings", 'DateTime'>
    readonly updatedAt: FieldRef<"UserSettings", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserSettings findUnique
   */
  export type UserSettingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSettings
     */
    omit?: UserSettingsOmit<ExtArgs> | null
    /**
     * Filter, which UserSettings to fetch.
     */
    where: UserSettingsWhereUniqueInput
  }

  /**
   * UserSettings findUniqueOrThrow
   */
  export type UserSettingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSettings
     */
    omit?: UserSettingsOmit<ExtArgs> | null
    /**
     * Filter, which UserSettings to fetch.
     */
    where: UserSettingsWhereUniqueInput
  }

  /**
   * UserSettings findFirst
   */
  export type UserSettingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSettings
     */
    omit?: UserSettingsOmit<ExtArgs> | null
    /**
     * Filter, which UserSettings to fetch.
     */
    where?: UserSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSettings to fetch.
     */
    orderBy?: UserSettingsOrderByWithRelationInput | UserSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserSettings.
     */
    cursor?: UserSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserSettings.
     */
    distinct?: UserSettingsScalarFieldEnum | UserSettingsScalarFieldEnum[]
  }

  /**
   * UserSettings findFirstOrThrow
   */
  export type UserSettingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSettings
     */
    omit?: UserSettingsOmit<ExtArgs> | null
    /**
     * Filter, which UserSettings to fetch.
     */
    where?: UserSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSettings to fetch.
     */
    orderBy?: UserSettingsOrderByWithRelationInput | UserSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserSettings.
     */
    cursor?: UserSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserSettings.
     */
    distinct?: UserSettingsScalarFieldEnum | UserSettingsScalarFieldEnum[]
  }

  /**
   * UserSettings findMany
   */
  export type UserSettingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSettings
     */
    omit?: UserSettingsOmit<ExtArgs> | null
    /**
     * Filter, which UserSettings to fetch.
     */
    where?: UserSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSettings to fetch.
     */
    orderBy?: UserSettingsOrderByWithRelationInput | UserSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserSettings.
     */
    cursor?: UserSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSettings.
     */
    skip?: number
    distinct?: UserSettingsScalarFieldEnum | UserSettingsScalarFieldEnum[]
  }

  /**
   * UserSettings create
   */
  export type UserSettingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSettings
     */
    omit?: UserSettingsOmit<ExtArgs> | null
    /**
     * The data needed to create a UserSettings.
     */
    data: XOR<UserSettingsCreateInput, UserSettingsUncheckedCreateInput>
  }

  /**
   * UserSettings createMany
   */
  export type UserSettingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserSettings.
     */
    data: UserSettingsCreateManyInput | UserSettingsCreateManyInput[]
  }

  /**
   * UserSettings createManyAndReturn
   */
  export type UserSettingsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserSettings
     */
    omit?: UserSettingsOmit<ExtArgs> | null
    /**
     * The data used to create many UserSettings.
     */
    data: UserSettingsCreateManyInput | UserSettingsCreateManyInput[]
  }

  /**
   * UserSettings update
   */
  export type UserSettingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSettings
     */
    omit?: UserSettingsOmit<ExtArgs> | null
    /**
     * The data needed to update a UserSettings.
     */
    data: XOR<UserSettingsUpdateInput, UserSettingsUncheckedUpdateInput>
    /**
     * Choose, which UserSettings to update.
     */
    where: UserSettingsWhereUniqueInput
  }

  /**
   * UserSettings updateMany
   */
  export type UserSettingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserSettings.
     */
    data: XOR<UserSettingsUpdateManyMutationInput, UserSettingsUncheckedUpdateManyInput>
    /**
     * Filter which UserSettings to update
     */
    where?: UserSettingsWhereInput
    /**
     * Limit how many UserSettings to update.
     */
    limit?: number
  }

  /**
   * UserSettings updateManyAndReturn
   */
  export type UserSettingsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserSettings
     */
    omit?: UserSettingsOmit<ExtArgs> | null
    /**
     * The data used to update UserSettings.
     */
    data: XOR<UserSettingsUpdateManyMutationInput, UserSettingsUncheckedUpdateManyInput>
    /**
     * Filter which UserSettings to update
     */
    where?: UserSettingsWhereInput
    /**
     * Limit how many UserSettings to update.
     */
    limit?: number
  }

  /**
   * UserSettings upsert
   */
  export type UserSettingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSettings
     */
    omit?: UserSettingsOmit<ExtArgs> | null
    /**
     * The filter to search for the UserSettings to update in case it exists.
     */
    where: UserSettingsWhereUniqueInput
    /**
     * In case the UserSettings found by the `where` argument doesn't exist, create a new UserSettings with this data.
     */
    create: XOR<UserSettingsCreateInput, UserSettingsUncheckedCreateInput>
    /**
     * In case the UserSettings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserSettingsUpdateInput, UserSettingsUncheckedUpdateInput>
  }

  /**
   * UserSettings delete
   */
  export type UserSettingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSettings
     */
    omit?: UserSettingsOmit<ExtArgs> | null
    /**
     * Filter which UserSettings to delete.
     */
    where: UserSettingsWhereUniqueInput
  }

  /**
   * UserSettings deleteMany
   */
  export type UserSettingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserSettings to delete
     */
    where?: UserSettingsWhereInput
    /**
     * Limit how many UserSettings to delete.
     */
    limit?: number
  }

  /**
   * UserSettings without action
   */
  export type UserSettingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSettings
     */
    select?: UserSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSettings
     */
    omit?: UserSettingsOmit<ExtArgs> | null
  }


  /**
   * Model TaxProfile
   */

  export type AggregateTaxProfile = {
    _count: TaxProfileCountAggregateOutputType | null
    _avg: TaxProfileAvgAggregateOutputType | null
    _sum: TaxProfileSumAggregateOutputType | null
    _min: TaxProfileMinAggregateOutputType | null
    _max: TaxProfileMaxAggregateOutputType | null
  }

  export type TaxProfileAvgAggregateOutputType = {
    federalBracket: number | null
    stateBracket: number | null
    qualifiedDividendRate: number | null
    capitalGainsRate: number | null
    effectiveRate: number | null
    marginalRate: number | null
    taxYear: number | null
  }

  export type TaxProfileSumAggregateOutputType = {
    federalBracket: number | null
    stateBracket: number | null
    qualifiedDividendRate: number | null
    capitalGainsRate: number | null
    effectiveRate: number | null
    marginalRate: number | null
    taxYear: number | null
  }

  export type TaxProfileMinAggregateOutputType = {
    id: string | null
    userId: string | null
    state: string | null
    filingStatus: string | null
    federalBracket: number | null
    stateBracket: number | null
    qualifiedDividendRate: number | null
    capitalGainsRate: number | null
    effectiveRate: number | null
    marginalRate: number | null
    taxYear: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TaxProfileMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    state: string | null
    filingStatus: string | null
    federalBracket: number | null
    stateBracket: number | null
    qualifiedDividendRate: number | null
    capitalGainsRate: number | null
    effectiveRate: number | null
    marginalRate: number | null
    taxYear: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TaxProfileCountAggregateOutputType = {
    id: number
    userId: number
    state: number
    filingStatus: number
    federalBracket: number
    stateBracket: number
    qualifiedDividendRate: number
    capitalGainsRate: number
    effectiveRate: number
    marginalRate: number
    taxYear: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TaxProfileAvgAggregateInputType = {
    federalBracket?: true
    stateBracket?: true
    qualifiedDividendRate?: true
    capitalGainsRate?: true
    effectiveRate?: true
    marginalRate?: true
    taxYear?: true
  }

  export type TaxProfileSumAggregateInputType = {
    federalBracket?: true
    stateBracket?: true
    qualifiedDividendRate?: true
    capitalGainsRate?: true
    effectiveRate?: true
    marginalRate?: true
    taxYear?: true
  }

  export type TaxProfileMinAggregateInputType = {
    id?: true
    userId?: true
    state?: true
    filingStatus?: true
    federalBracket?: true
    stateBracket?: true
    qualifiedDividendRate?: true
    capitalGainsRate?: true
    effectiveRate?: true
    marginalRate?: true
    taxYear?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TaxProfileMaxAggregateInputType = {
    id?: true
    userId?: true
    state?: true
    filingStatus?: true
    federalBracket?: true
    stateBracket?: true
    qualifiedDividendRate?: true
    capitalGainsRate?: true
    effectiveRate?: true
    marginalRate?: true
    taxYear?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TaxProfileCountAggregateInputType = {
    id?: true
    userId?: true
    state?: true
    filingStatus?: true
    federalBracket?: true
    stateBracket?: true
    qualifiedDividendRate?: true
    capitalGainsRate?: true
    effectiveRate?: true
    marginalRate?: true
    taxYear?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TaxProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TaxProfile to aggregate.
     */
    where?: TaxProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaxProfiles to fetch.
     */
    orderBy?: TaxProfileOrderByWithRelationInput | TaxProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TaxProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaxProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaxProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TaxProfiles
    **/
    _count?: true | TaxProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TaxProfileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TaxProfileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TaxProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TaxProfileMaxAggregateInputType
  }

  export type GetTaxProfileAggregateType<T extends TaxProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateTaxProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTaxProfile[P]>
      : GetScalarType<T[P], AggregateTaxProfile[P]>
  }




  export type TaxProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaxProfileWhereInput
    orderBy?: TaxProfileOrderByWithAggregationInput | TaxProfileOrderByWithAggregationInput[]
    by: TaxProfileScalarFieldEnum[] | TaxProfileScalarFieldEnum
    having?: TaxProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TaxProfileCountAggregateInputType | true
    _avg?: TaxProfileAvgAggregateInputType
    _sum?: TaxProfileSumAggregateInputType
    _min?: TaxProfileMinAggregateInputType
    _max?: TaxProfileMaxAggregateInputType
  }

  export type TaxProfileGroupByOutputType = {
    id: string
    userId: string
    state: string | null
    filingStatus: string
    federalBracket: number
    stateBracket: number
    qualifiedDividendRate: number
    capitalGainsRate: number
    effectiveRate: number
    marginalRate: number
    taxYear: number
    createdAt: Date
    updatedAt: Date
    _count: TaxProfileCountAggregateOutputType | null
    _avg: TaxProfileAvgAggregateOutputType | null
    _sum: TaxProfileSumAggregateOutputType | null
    _min: TaxProfileMinAggregateOutputType | null
    _max: TaxProfileMaxAggregateOutputType | null
  }

  type GetTaxProfileGroupByPayload<T extends TaxProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TaxProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TaxProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TaxProfileGroupByOutputType[P]>
            : GetScalarType<T[P], TaxProfileGroupByOutputType[P]>
        }
      >
    >


  export type TaxProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    state?: boolean
    filingStatus?: boolean
    federalBracket?: boolean
    stateBracket?: boolean
    qualifiedDividendRate?: boolean
    capitalGainsRate?: boolean
    effectiveRate?: boolean
    marginalRate?: boolean
    taxYear?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["taxProfile"]>

  export type TaxProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    state?: boolean
    filingStatus?: boolean
    federalBracket?: boolean
    stateBracket?: boolean
    qualifiedDividendRate?: boolean
    capitalGainsRate?: boolean
    effectiveRate?: boolean
    marginalRate?: boolean
    taxYear?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["taxProfile"]>

  export type TaxProfileSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    state?: boolean
    filingStatus?: boolean
    federalBracket?: boolean
    stateBracket?: boolean
    qualifiedDividendRate?: boolean
    capitalGainsRate?: boolean
    effectiveRate?: boolean
    marginalRate?: boolean
    taxYear?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["taxProfile"]>

  export type TaxProfileSelectScalar = {
    id?: boolean
    userId?: boolean
    state?: boolean
    filingStatus?: boolean
    federalBracket?: boolean
    stateBracket?: boolean
    qualifiedDividendRate?: boolean
    capitalGainsRate?: boolean
    effectiveRate?: boolean
    marginalRate?: boolean
    taxYear?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TaxProfileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "state" | "filingStatus" | "federalBracket" | "stateBracket" | "qualifiedDividendRate" | "capitalGainsRate" | "effectiveRate" | "marginalRate" | "taxYear" | "createdAt" | "updatedAt", ExtArgs["result"]["taxProfile"]>

  export type $TaxProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TaxProfile"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      state: string | null
      filingStatus: string
      federalBracket: number
      stateBracket: number
      qualifiedDividendRate: number
      capitalGainsRate: number
      effectiveRate: number
      marginalRate: number
      taxYear: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["taxProfile"]>
    composites: {}
  }

  type TaxProfileGetPayload<S extends boolean | null | undefined | TaxProfileDefaultArgs> = $Result.GetResult<Prisma.$TaxProfilePayload, S>

  type TaxProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TaxProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TaxProfileCountAggregateInputType | true
    }

  export interface TaxProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TaxProfile'], meta: { name: 'TaxProfile' } }
    /**
     * Find zero or one TaxProfile that matches the filter.
     * @param {TaxProfileFindUniqueArgs} args - Arguments to find a TaxProfile
     * @example
     * // Get one TaxProfile
     * const taxProfile = await prisma.taxProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TaxProfileFindUniqueArgs>(args: SelectSubset<T, TaxProfileFindUniqueArgs<ExtArgs>>): Prisma__TaxProfileClient<$Result.GetResult<Prisma.$TaxProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TaxProfile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TaxProfileFindUniqueOrThrowArgs} args - Arguments to find a TaxProfile
     * @example
     * // Get one TaxProfile
     * const taxProfile = await prisma.taxProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TaxProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, TaxProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TaxProfileClient<$Result.GetResult<Prisma.$TaxProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TaxProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaxProfileFindFirstArgs} args - Arguments to find a TaxProfile
     * @example
     * // Get one TaxProfile
     * const taxProfile = await prisma.taxProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TaxProfileFindFirstArgs>(args?: SelectSubset<T, TaxProfileFindFirstArgs<ExtArgs>>): Prisma__TaxProfileClient<$Result.GetResult<Prisma.$TaxProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TaxProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaxProfileFindFirstOrThrowArgs} args - Arguments to find a TaxProfile
     * @example
     * // Get one TaxProfile
     * const taxProfile = await prisma.taxProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TaxProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, TaxProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__TaxProfileClient<$Result.GetResult<Prisma.$TaxProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TaxProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaxProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TaxProfiles
     * const taxProfiles = await prisma.taxProfile.findMany()
     * 
     * // Get first 10 TaxProfiles
     * const taxProfiles = await prisma.taxProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const taxProfileWithIdOnly = await prisma.taxProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TaxProfileFindManyArgs>(args?: SelectSubset<T, TaxProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaxProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TaxProfile.
     * @param {TaxProfileCreateArgs} args - Arguments to create a TaxProfile.
     * @example
     * // Create one TaxProfile
     * const TaxProfile = await prisma.taxProfile.create({
     *   data: {
     *     // ... data to create a TaxProfile
     *   }
     * })
     * 
     */
    create<T extends TaxProfileCreateArgs>(args: SelectSubset<T, TaxProfileCreateArgs<ExtArgs>>): Prisma__TaxProfileClient<$Result.GetResult<Prisma.$TaxProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TaxProfiles.
     * @param {TaxProfileCreateManyArgs} args - Arguments to create many TaxProfiles.
     * @example
     * // Create many TaxProfiles
     * const taxProfile = await prisma.taxProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TaxProfileCreateManyArgs>(args?: SelectSubset<T, TaxProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TaxProfiles and returns the data saved in the database.
     * @param {TaxProfileCreateManyAndReturnArgs} args - Arguments to create many TaxProfiles.
     * @example
     * // Create many TaxProfiles
     * const taxProfile = await prisma.taxProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TaxProfiles and only return the `id`
     * const taxProfileWithIdOnly = await prisma.taxProfile.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TaxProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, TaxProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaxProfilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TaxProfile.
     * @param {TaxProfileDeleteArgs} args - Arguments to delete one TaxProfile.
     * @example
     * // Delete one TaxProfile
     * const TaxProfile = await prisma.taxProfile.delete({
     *   where: {
     *     // ... filter to delete one TaxProfile
     *   }
     * })
     * 
     */
    delete<T extends TaxProfileDeleteArgs>(args: SelectSubset<T, TaxProfileDeleteArgs<ExtArgs>>): Prisma__TaxProfileClient<$Result.GetResult<Prisma.$TaxProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TaxProfile.
     * @param {TaxProfileUpdateArgs} args - Arguments to update one TaxProfile.
     * @example
     * // Update one TaxProfile
     * const taxProfile = await prisma.taxProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TaxProfileUpdateArgs>(args: SelectSubset<T, TaxProfileUpdateArgs<ExtArgs>>): Prisma__TaxProfileClient<$Result.GetResult<Prisma.$TaxProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TaxProfiles.
     * @param {TaxProfileDeleteManyArgs} args - Arguments to filter TaxProfiles to delete.
     * @example
     * // Delete a few TaxProfiles
     * const { count } = await prisma.taxProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TaxProfileDeleteManyArgs>(args?: SelectSubset<T, TaxProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TaxProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaxProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TaxProfiles
     * const taxProfile = await prisma.taxProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TaxProfileUpdateManyArgs>(args: SelectSubset<T, TaxProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TaxProfiles and returns the data updated in the database.
     * @param {TaxProfileUpdateManyAndReturnArgs} args - Arguments to update many TaxProfiles.
     * @example
     * // Update many TaxProfiles
     * const taxProfile = await prisma.taxProfile.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TaxProfiles and only return the `id`
     * const taxProfileWithIdOnly = await prisma.taxProfile.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TaxProfileUpdateManyAndReturnArgs>(args: SelectSubset<T, TaxProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaxProfilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TaxProfile.
     * @param {TaxProfileUpsertArgs} args - Arguments to update or create a TaxProfile.
     * @example
     * // Update or create a TaxProfile
     * const taxProfile = await prisma.taxProfile.upsert({
     *   create: {
     *     // ... data to create a TaxProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TaxProfile we want to update
     *   }
     * })
     */
    upsert<T extends TaxProfileUpsertArgs>(args: SelectSubset<T, TaxProfileUpsertArgs<ExtArgs>>): Prisma__TaxProfileClient<$Result.GetResult<Prisma.$TaxProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TaxProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaxProfileCountArgs} args - Arguments to filter TaxProfiles to count.
     * @example
     * // Count the number of TaxProfiles
     * const count = await prisma.taxProfile.count({
     *   where: {
     *     // ... the filter for the TaxProfiles we want to count
     *   }
     * })
    **/
    count<T extends TaxProfileCountArgs>(
      args?: Subset<T, TaxProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TaxProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TaxProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaxProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TaxProfileAggregateArgs>(args: Subset<T, TaxProfileAggregateArgs>): Prisma.PrismaPromise<GetTaxProfileAggregateType<T>>

    /**
     * Group by TaxProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaxProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TaxProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TaxProfileGroupByArgs['orderBy'] }
        : { orderBy?: TaxProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TaxProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTaxProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TaxProfile model
   */
  readonly fields: TaxProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TaxProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TaxProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TaxProfile model
   */
  interface TaxProfileFieldRefs {
    readonly id: FieldRef<"TaxProfile", 'String'>
    readonly userId: FieldRef<"TaxProfile", 'String'>
    readonly state: FieldRef<"TaxProfile", 'String'>
    readonly filingStatus: FieldRef<"TaxProfile", 'String'>
    readonly federalBracket: FieldRef<"TaxProfile", 'Float'>
    readonly stateBracket: FieldRef<"TaxProfile", 'Float'>
    readonly qualifiedDividendRate: FieldRef<"TaxProfile", 'Float'>
    readonly capitalGainsRate: FieldRef<"TaxProfile", 'Float'>
    readonly effectiveRate: FieldRef<"TaxProfile", 'Float'>
    readonly marginalRate: FieldRef<"TaxProfile", 'Float'>
    readonly taxYear: FieldRef<"TaxProfile", 'Int'>
    readonly createdAt: FieldRef<"TaxProfile", 'DateTime'>
    readonly updatedAt: FieldRef<"TaxProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TaxProfile findUnique
   */
  export type TaxProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxProfile
     */
    select?: TaxProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TaxProfile
     */
    omit?: TaxProfileOmit<ExtArgs> | null
    /**
     * Filter, which TaxProfile to fetch.
     */
    where: TaxProfileWhereUniqueInput
  }

  /**
   * TaxProfile findUniqueOrThrow
   */
  export type TaxProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxProfile
     */
    select?: TaxProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TaxProfile
     */
    omit?: TaxProfileOmit<ExtArgs> | null
    /**
     * Filter, which TaxProfile to fetch.
     */
    where: TaxProfileWhereUniqueInput
  }

  /**
   * TaxProfile findFirst
   */
  export type TaxProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxProfile
     */
    select?: TaxProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TaxProfile
     */
    omit?: TaxProfileOmit<ExtArgs> | null
    /**
     * Filter, which TaxProfile to fetch.
     */
    where?: TaxProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaxProfiles to fetch.
     */
    orderBy?: TaxProfileOrderByWithRelationInput | TaxProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TaxProfiles.
     */
    cursor?: TaxProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaxProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaxProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TaxProfiles.
     */
    distinct?: TaxProfileScalarFieldEnum | TaxProfileScalarFieldEnum[]
  }

  /**
   * TaxProfile findFirstOrThrow
   */
  export type TaxProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxProfile
     */
    select?: TaxProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TaxProfile
     */
    omit?: TaxProfileOmit<ExtArgs> | null
    /**
     * Filter, which TaxProfile to fetch.
     */
    where?: TaxProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaxProfiles to fetch.
     */
    orderBy?: TaxProfileOrderByWithRelationInput | TaxProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TaxProfiles.
     */
    cursor?: TaxProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaxProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaxProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TaxProfiles.
     */
    distinct?: TaxProfileScalarFieldEnum | TaxProfileScalarFieldEnum[]
  }

  /**
   * TaxProfile findMany
   */
  export type TaxProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxProfile
     */
    select?: TaxProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TaxProfile
     */
    omit?: TaxProfileOmit<ExtArgs> | null
    /**
     * Filter, which TaxProfiles to fetch.
     */
    where?: TaxProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaxProfiles to fetch.
     */
    orderBy?: TaxProfileOrderByWithRelationInput | TaxProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TaxProfiles.
     */
    cursor?: TaxProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaxProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaxProfiles.
     */
    skip?: number
    distinct?: TaxProfileScalarFieldEnum | TaxProfileScalarFieldEnum[]
  }

  /**
   * TaxProfile create
   */
  export type TaxProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxProfile
     */
    select?: TaxProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TaxProfile
     */
    omit?: TaxProfileOmit<ExtArgs> | null
    /**
     * The data needed to create a TaxProfile.
     */
    data: XOR<TaxProfileCreateInput, TaxProfileUncheckedCreateInput>
  }

  /**
   * TaxProfile createMany
   */
  export type TaxProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TaxProfiles.
     */
    data: TaxProfileCreateManyInput | TaxProfileCreateManyInput[]
  }

  /**
   * TaxProfile createManyAndReturn
   */
  export type TaxProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxProfile
     */
    select?: TaxProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TaxProfile
     */
    omit?: TaxProfileOmit<ExtArgs> | null
    /**
     * The data used to create many TaxProfiles.
     */
    data: TaxProfileCreateManyInput | TaxProfileCreateManyInput[]
  }

  /**
   * TaxProfile update
   */
  export type TaxProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxProfile
     */
    select?: TaxProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TaxProfile
     */
    omit?: TaxProfileOmit<ExtArgs> | null
    /**
     * The data needed to update a TaxProfile.
     */
    data: XOR<TaxProfileUpdateInput, TaxProfileUncheckedUpdateInput>
    /**
     * Choose, which TaxProfile to update.
     */
    where: TaxProfileWhereUniqueInput
  }

  /**
   * TaxProfile updateMany
   */
  export type TaxProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TaxProfiles.
     */
    data: XOR<TaxProfileUpdateManyMutationInput, TaxProfileUncheckedUpdateManyInput>
    /**
     * Filter which TaxProfiles to update
     */
    where?: TaxProfileWhereInput
    /**
     * Limit how many TaxProfiles to update.
     */
    limit?: number
  }

  /**
   * TaxProfile updateManyAndReturn
   */
  export type TaxProfileUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxProfile
     */
    select?: TaxProfileSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TaxProfile
     */
    omit?: TaxProfileOmit<ExtArgs> | null
    /**
     * The data used to update TaxProfiles.
     */
    data: XOR<TaxProfileUpdateManyMutationInput, TaxProfileUncheckedUpdateManyInput>
    /**
     * Filter which TaxProfiles to update
     */
    where?: TaxProfileWhereInput
    /**
     * Limit how many TaxProfiles to update.
     */
    limit?: number
  }

  /**
   * TaxProfile upsert
   */
  export type TaxProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxProfile
     */
    select?: TaxProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TaxProfile
     */
    omit?: TaxProfileOmit<ExtArgs> | null
    /**
     * The filter to search for the TaxProfile to update in case it exists.
     */
    where: TaxProfileWhereUniqueInput
    /**
     * In case the TaxProfile found by the `where` argument doesn't exist, create a new TaxProfile with this data.
     */
    create: XOR<TaxProfileCreateInput, TaxProfileUncheckedCreateInput>
    /**
     * In case the TaxProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TaxProfileUpdateInput, TaxProfileUncheckedUpdateInput>
  }

  /**
   * TaxProfile delete
   */
  export type TaxProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxProfile
     */
    select?: TaxProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TaxProfile
     */
    omit?: TaxProfileOmit<ExtArgs> | null
    /**
     * Filter which TaxProfile to delete.
     */
    where: TaxProfileWhereUniqueInput
  }

  /**
   * TaxProfile deleteMany
   */
  export type TaxProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TaxProfiles to delete
     */
    where?: TaxProfileWhereInput
    /**
     * Limit how many TaxProfiles to delete.
     */
    limit?: number
  }

  /**
   * TaxProfile without action
   */
  export type TaxProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxProfile
     */
    select?: TaxProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TaxProfile
     */
    omit?: TaxProfileOmit<ExtArgs> | null
  }


  /**
   * Model FinancialGoal
   */

  export type AggregateFinancialGoal = {
    _count: FinancialGoalCountAggregateOutputType | null
    _avg: FinancialGoalAvgAggregateOutputType | null
    _sum: FinancialGoalSumAggregateOutputType | null
    _min: FinancialGoalMinAggregateOutputType | null
    _max: FinancialGoalMaxAggregateOutputType | null
  }

  export type FinancialGoalAvgAggregateOutputType = {
    targetAmount: number | null
    currentAmount: number | null
    priority: number | null
  }

  export type FinancialGoalSumAggregateOutputType = {
    targetAmount: number | null
    currentAmount: number | null
    priority: number | null
  }

  export type FinancialGoalMinAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    description: string | null
    targetAmount: number | null
    currentAmount: number | null
    targetDate: Date | null
    category: string | null
    priority: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FinancialGoalMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    description: string | null
    targetAmount: number | null
    currentAmount: number | null
    targetDate: Date | null
    category: string | null
    priority: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FinancialGoalCountAggregateOutputType = {
    id: number
    userId: number
    name: number
    description: number
    targetAmount: number
    currentAmount: number
    targetDate: number
    category: number
    priority: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FinancialGoalAvgAggregateInputType = {
    targetAmount?: true
    currentAmount?: true
    priority?: true
  }

  export type FinancialGoalSumAggregateInputType = {
    targetAmount?: true
    currentAmount?: true
    priority?: true
  }

  export type FinancialGoalMinAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    description?: true
    targetAmount?: true
    currentAmount?: true
    targetDate?: true
    category?: true
    priority?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FinancialGoalMaxAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    description?: true
    targetAmount?: true
    currentAmount?: true
    targetDate?: true
    category?: true
    priority?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FinancialGoalCountAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    description?: true
    targetAmount?: true
    currentAmount?: true
    targetDate?: true
    category?: true
    priority?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FinancialGoalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FinancialGoal to aggregate.
     */
    where?: FinancialGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FinancialGoals to fetch.
     */
    orderBy?: FinancialGoalOrderByWithRelationInput | FinancialGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FinancialGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FinancialGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FinancialGoals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FinancialGoals
    **/
    _count?: true | FinancialGoalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FinancialGoalAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FinancialGoalSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FinancialGoalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FinancialGoalMaxAggregateInputType
  }

  export type GetFinancialGoalAggregateType<T extends FinancialGoalAggregateArgs> = {
        [P in keyof T & keyof AggregateFinancialGoal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFinancialGoal[P]>
      : GetScalarType<T[P], AggregateFinancialGoal[P]>
  }




  export type FinancialGoalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FinancialGoalWhereInput
    orderBy?: FinancialGoalOrderByWithAggregationInput | FinancialGoalOrderByWithAggregationInput[]
    by: FinancialGoalScalarFieldEnum[] | FinancialGoalScalarFieldEnum
    having?: FinancialGoalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FinancialGoalCountAggregateInputType | true
    _avg?: FinancialGoalAvgAggregateInputType
    _sum?: FinancialGoalSumAggregateInputType
    _min?: FinancialGoalMinAggregateInputType
    _max?: FinancialGoalMaxAggregateInputType
  }

  export type FinancialGoalGroupByOutputType = {
    id: string
    userId: string
    name: string
    description: string | null
    targetAmount: number
    currentAmount: number
    targetDate: Date | null
    category: string
    priority: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: FinancialGoalCountAggregateOutputType | null
    _avg: FinancialGoalAvgAggregateOutputType | null
    _sum: FinancialGoalSumAggregateOutputType | null
    _min: FinancialGoalMinAggregateOutputType | null
    _max: FinancialGoalMaxAggregateOutputType | null
  }

  type GetFinancialGoalGroupByPayload<T extends FinancialGoalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FinancialGoalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FinancialGoalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FinancialGoalGroupByOutputType[P]>
            : GetScalarType<T[P], FinancialGoalGroupByOutputType[P]>
        }
      >
    >


  export type FinancialGoalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    description?: boolean
    targetAmount?: boolean
    currentAmount?: boolean
    targetDate?: boolean
    category?: boolean
    priority?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["financialGoal"]>

  export type FinancialGoalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    description?: boolean
    targetAmount?: boolean
    currentAmount?: boolean
    targetDate?: boolean
    category?: boolean
    priority?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["financialGoal"]>

  export type FinancialGoalSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    description?: boolean
    targetAmount?: boolean
    currentAmount?: boolean
    targetDate?: boolean
    category?: boolean
    priority?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["financialGoal"]>

  export type FinancialGoalSelectScalar = {
    id?: boolean
    userId?: boolean
    name?: boolean
    description?: boolean
    targetAmount?: boolean
    currentAmount?: boolean
    targetDate?: boolean
    category?: boolean
    priority?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FinancialGoalOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "name" | "description" | "targetAmount" | "currentAmount" | "targetDate" | "category" | "priority" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["financialGoal"]>

  export type $FinancialGoalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FinancialGoal"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      name: string
      description: string | null
      targetAmount: number
      currentAmount: number
      targetDate: Date | null
      category: string
      priority: number
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["financialGoal"]>
    composites: {}
  }

  type FinancialGoalGetPayload<S extends boolean | null | undefined | FinancialGoalDefaultArgs> = $Result.GetResult<Prisma.$FinancialGoalPayload, S>

  type FinancialGoalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FinancialGoalFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FinancialGoalCountAggregateInputType | true
    }

  export interface FinancialGoalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FinancialGoal'], meta: { name: 'FinancialGoal' } }
    /**
     * Find zero or one FinancialGoal that matches the filter.
     * @param {FinancialGoalFindUniqueArgs} args - Arguments to find a FinancialGoal
     * @example
     * // Get one FinancialGoal
     * const financialGoal = await prisma.financialGoal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FinancialGoalFindUniqueArgs>(args: SelectSubset<T, FinancialGoalFindUniqueArgs<ExtArgs>>): Prisma__FinancialGoalClient<$Result.GetResult<Prisma.$FinancialGoalPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FinancialGoal that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FinancialGoalFindUniqueOrThrowArgs} args - Arguments to find a FinancialGoal
     * @example
     * // Get one FinancialGoal
     * const financialGoal = await prisma.financialGoal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FinancialGoalFindUniqueOrThrowArgs>(args: SelectSubset<T, FinancialGoalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FinancialGoalClient<$Result.GetResult<Prisma.$FinancialGoalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FinancialGoal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinancialGoalFindFirstArgs} args - Arguments to find a FinancialGoal
     * @example
     * // Get one FinancialGoal
     * const financialGoal = await prisma.financialGoal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FinancialGoalFindFirstArgs>(args?: SelectSubset<T, FinancialGoalFindFirstArgs<ExtArgs>>): Prisma__FinancialGoalClient<$Result.GetResult<Prisma.$FinancialGoalPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FinancialGoal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinancialGoalFindFirstOrThrowArgs} args - Arguments to find a FinancialGoal
     * @example
     * // Get one FinancialGoal
     * const financialGoal = await prisma.financialGoal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FinancialGoalFindFirstOrThrowArgs>(args?: SelectSubset<T, FinancialGoalFindFirstOrThrowArgs<ExtArgs>>): Prisma__FinancialGoalClient<$Result.GetResult<Prisma.$FinancialGoalPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FinancialGoals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinancialGoalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FinancialGoals
     * const financialGoals = await prisma.financialGoal.findMany()
     * 
     * // Get first 10 FinancialGoals
     * const financialGoals = await prisma.financialGoal.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const financialGoalWithIdOnly = await prisma.financialGoal.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FinancialGoalFindManyArgs>(args?: SelectSubset<T, FinancialGoalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FinancialGoalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FinancialGoal.
     * @param {FinancialGoalCreateArgs} args - Arguments to create a FinancialGoal.
     * @example
     * // Create one FinancialGoal
     * const FinancialGoal = await prisma.financialGoal.create({
     *   data: {
     *     // ... data to create a FinancialGoal
     *   }
     * })
     * 
     */
    create<T extends FinancialGoalCreateArgs>(args: SelectSubset<T, FinancialGoalCreateArgs<ExtArgs>>): Prisma__FinancialGoalClient<$Result.GetResult<Prisma.$FinancialGoalPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FinancialGoals.
     * @param {FinancialGoalCreateManyArgs} args - Arguments to create many FinancialGoals.
     * @example
     * // Create many FinancialGoals
     * const financialGoal = await prisma.financialGoal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FinancialGoalCreateManyArgs>(args?: SelectSubset<T, FinancialGoalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FinancialGoals and returns the data saved in the database.
     * @param {FinancialGoalCreateManyAndReturnArgs} args - Arguments to create many FinancialGoals.
     * @example
     * // Create many FinancialGoals
     * const financialGoal = await prisma.financialGoal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FinancialGoals and only return the `id`
     * const financialGoalWithIdOnly = await prisma.financialGoal.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FinancialGoalCreateManyAndReturnArgs>(args?: SelectSubset<T, FinancialGoalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FinancialGoalPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a FinancialGoal.
     * @param {FinancialGoalDeleteArgs} args - Arguments to delete one FinancialGoal.
     * @example
     * // Delete one FinancialGoal
     * const FinancialGoal = await prisma.financialGoal.delete({
     *   where: {
     *     // ... filter to delete one FinancialGoal
     *   }
     * })
     * 
     */
    delete<T extends FinancialGoalDeleteArgs>(args: SelectSubset<T, FinancialGoalDeleteArgs<ExtArgs>>): Prisma__FinancialGoalClient<$Result.GetResult<Prisma.$FinancialGoalPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FinancialGoal.
     * @param {FinancialGoalUpdateArgs} args - Arguments to update one FinancialGoal.
     * @example
     * // Update one FinancialGoal
     * const financialGoal = await prisma.financialGoal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FinancialGoalUpdateArgs>(args: SelectSubset<T, FinancialGoalUpdateArgs<ExtArgs>>): Prisma__FinancialGoalClient<$Result.GetResult<Prisma.$FinancialGoalPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FinancialGoals.
     * @param {FinancialGoalDeleteManyArgs} args - Arguments to filter FinancialGoals to delete.
     * @example
     * // Delete a few FinancialGoals
     * const { count } = await prisma.financialGoal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FinancialGoalDeleteManyArgs>(args?: SelectSubset<T, FinancialGoalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FinancialGoals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinancialGoalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FinancialGoals
     * const financialGoal = await prisma.financialGoal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FinancialGoalUpdateManyArgs>(args: SelectSubset<T, FinancialGoalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FinancialGoals and returns the data updated in the database.
     * @param {FinancialGoalUpdateManyAndReturnArgs} args - Arguments to update many FinancialGoals.
     * @example
     * // Update many FinancialGoals
     * const financialGoal = await prisma.financialGoal.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more FinancialGoals and only return the `id`
     * const financialGoalWithIdOnly = await prisma.financialGoal.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FinancialGoalUpdateManyAndReturnArgs>(args: SelectSubset<T, FinancialGoalUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FinancialGoalPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one FinancialGoal.
     * @param {FinancialGoalUpsertArgs} args - Arguments to update or create a FinancialGoal.
     * @example
     * // Update or create a FinancialGoal
     * const financialGoal = await prisma.financialGoal.upsert({
     *   create: {
     *     // ... data to create a FinancialGoal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FinancialGoal we want to update
     *   }
     * })
     */
    upsert<T extends FinancialGoalUpsertArgs>(args: SelectSubset<T, FinancialGoalUpsertArgs<ExtArgs>>): Prisma__FinancialGoalClient<$Result.GetResult<Prisma.$FinancialGoalPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FinancialGoals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinancialGoalCountArgs} args - Arguments to filter FinancialGoals to count.
     * @example
     * // Count the number of FinancialGoals
     * const count = await prisma.financialGoal.count({
     *   where: {
     *     // ... the filter for the FinancialGoals we want to count
     *   }
     * })
    **/
    count<T extends FinancialGoalCountArgs>(
      args?: Subset<T, FinancialGoalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FinancialGoalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FinancialGoal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinancialGoalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FinancialGoalAggregateArgs>(args: Subset<T, FinancialGoalAggregateArgs>): Prisma.PrismaPromise<GetFinancialGoalAggregateType<T>>

    /**
     * Group by FinancialGoal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FinancialGoalGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FinancialGoalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FinancialGoalGroupByArgs['orderBy'] }
        : { orderBy?: FinancialGoalGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FinancialGoalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFinancialGoalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FinancialGoal model
   */
  readonly fields: FinancialGoalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FinancialGoal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FinancialGoalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FinancialGoal model
   */
  interface FinancialGoalFieldRefs {
    readonly id: FieldRef<"FinancialGoal", 'String'>
    readonly userId: FieldRef<"FinancialGoal", 'String'>
    readonly name: FieldRef<"FinancialGoal", 'String'>
    readonly description: FieldRef<"FinancialGoal", 'String'>
    readonly targetAmount: FieldRef<"FinancialGoal", 'Float'>
    readonly currentAmount: FieldRef<"FinancialGoal", 'Float'>
    readonly targetDate: FieldRef<"FinancialGoal", 'DateTime'>
    readonly category: FieldRef<"FinancialGoal", 'String'>
    readonly priority: FieldRef<"FinancialGoal", 'Int'>
    readonly isActive: FieldRef<"FinancialGoal", 'Boolean'>
    readonly createdAt: FieldRef<"FinancialGoal", 'DateTime'>
    readonly updatedAt: FieldRef<"FinancialGoal", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FinancialGoal findUnique
   */
  export type FinancialGoalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinancialGoal
     */
    select?: FinancialGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinancialGoal
     */
    omit?: FinancialGoalOmit<ExtArgs> | null
    /**
     * Filter, which FinancialGoal to fetch.
     */
    where: FinancialGoalWhereUniqueInput
  }

  /**
   * FinancialGoal findUniqueOrThrow
   */
  export type FinancialGoalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinancialGoal
     */
    select?: FinancialGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinancialGoal
     */
    omit?: FinancialGoalOmit<ExtArgs> | null
    /**
     * Filter, which FinancialGoal to fetch.
     */
    where: FinancialGoalWhereUniqueInput
  }

  /**
   * FinancialGoal findFirst
   */
  export type FinancialGoalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinancialGoal
     */
    select?: FinancialGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinancialGoal
     */
    omit?: FinancialGoalOmit<ExtArgs> | null
    /**
     * Filter, which FinancialGoal to fetch.
     */
    where?: FinancialGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FinancialGoals to fetch.
     */
    orderBy?: FinancialGoalOrderByWithRelationInput | FinancialGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FinancialGoals.
     */
    cursor?: FinancialGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FinancialGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FinancialGoals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FinancialGoals.
     */
    distinct?: FinancialGoalScalarFieldEnum | FinancialGoalScalarFieldEnum[]
  }

  /**
   * FinancialGoal findFirstOrThrow
   */
  export type FinancialGoalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinancialGoal
     */
    select?: FinancialGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinancialGoal
     */
    omit?: FinancialGoalOmit<ExtArgs> | null
    /**
     * Filter, which FinancialGoal to fetch.
     */
    where?: FinancialGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FinancialGoals to fetch.
     */
    orderBy?: FinancialGoalOrderByWithRelationInput | FinancialGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FinancialGoals.
     */
    cursor?: FinancialGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FinancialGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FinancialGoals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FinancialGoals.
     */
    distinct?: FinancialGoalScalarFieldEnum | FinancialGoalScalarFieldEnum[]
  }

  /**
   * FinancialGoal findMany
   */
  export type FinancialGoalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinancialGoal
     */
    select?: FinancialGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinancialGoal
     */
    omit?: FinancialGoalOmit<ExtArgs> | null
    /**
     * Filter, which FinancialGoals to fetch.
     */
    where?: FinancialGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FinancialGoals to fetch.
     */
    orderBy?: FinancialGoalOrderByWithRelationInput | FinancialGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FinancialGoals.
     */
    cursor?: FinancialGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FinancialGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FinancialGoals.
     */
    skip?: number
    distinct?: FinancialGoalScalarFieldEnum | FinancialGoalScalarFieldEnum[]
  }

  /**
   * FinancialGoal create
   */
  export type FinancialGoalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinancialGoal
     */
    select?: FinancialGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinancialGoal
     */
    omit?: FinancialGoalOmit<ExtArgs> | null
    /**
     * The data needed to create a FinancialGoal.
     */
    data: XOR<FinancialGoalCreateInput, FinancialGoalUncheckedCreateInput>
  }

  /**
   * FinancialGoal createMany
   */
  export type FinancialGoalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FinancialGoals.
     */
    data: FinancialGoalCreateManyInput | FinancialGoalCreateManyInput[]
  }

  /**
   * FinancialGoal createManyAndReturn
   */
  export type FinancialGoalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinancialGoal
     */
    select?: FinancialGoalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FinancialGoal
     */
    omit?: FinancialGoalOmit<ExtArgs> | null
    /**
     * The data used to create many FinancialGoals.
     */
    data: FinancialGoalCreateManyInput | FinancialGoalCreateManyInput[]
  }

  /**
   * FinancialGoal update
   */
  export type FinancialGoalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinancialGoal
     */
    select?: FinancialGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinancialGoal
     */
    omit?: FinancialGoalOmit<ExtArgs> | null
    /**
     * The data needed to update a FinancialGoal.
     */
    data: XOR<FinancialGoalUpdateInput, FinancialGoalUncheckedUpdateInput>
    /**
     * Choose, which FinancialGoal to update.
     */
    where: FinancialGoalWhereUniqueInput
  }

  /**
   * FinancialGoal updateMany
   */
  export type FinancialGoalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FinancialGoals.
     */
    data: XOR<FinancialGoalUpdateManyMutationInput, FinancialGoalUncheckedUpdateManyInput>
    /**
     * Filter which FinancialGoals to update
     */
    where?: FinancialGoalWhereInput
    /**
     * Limit how many FinancialGoals to update.
     */
    limit?: number
  }

  /**
   * FinancialGoal updateManyAndReturn
   */
  export type FinancialGoalUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinancialGoal
     */
    select?: FinancialGoalSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FinancialGoal
     */
    omit?: FinancialGoalOmit<ExtArgs> | null
    /**
     * The data used to update FinancialGoals.
     */
    data: XOR<FinancialGoalUpdateManyMutationInput, FinancialGoalUncheckedUpdateManyInput>
    /**
     * Filter which FinancialGoals to update
     */
    where?: FinancialGoalWhereInput
    /**
     * Limit how many FinancialGoals to update.
     */
    limit?: number
  }

  /**
   * FinancialGoal upsert
   */
  export type FinancialGoalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinancialGoal
     */
    select?: FinancialGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinancialGoal
     */
    omit?: FinancialGoalOmit<ExtArgs> | null
    /**
     * The filter to search for the FinancialGoal to update in case it exists.
     */
    where: FinancialGoalWhereUniqueInput
    /**
     * In case the FinancialGoal found by the `where` argument doesn't exist, create a new FinancialGoal with this data.
     */
    create: XOR<FinancialGoalCreateInput, FinancialGoalUncheckedCreateInput>
    /**
     * In case the FinancialGoal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FinancialGoalUpdateInput, FinancialGoalUncheckedUpdateInput>
  }

  /**
   * FinancialGoal delete
   */
  export type FinancialGoalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinancialGoal
     */
    select?: FinancialGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinancialGoal
     */
    omit?: FinancialGoalOmit<ExtArgs> | null
    /**
     * Filter which FinancialGoal to delete.
     */
    where: FinancialGoalWhereUniqueInput
  }

  /**
   * FinancialGoal deleteMany
   */
  export type FinancialGoalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FinancialGoals to delete
     */
    where?: FinancialGoalWhereInput
    /**
     * Limit how many FinancialGoals to delete.
     */
    limit?: number
  }

  /**
   * FinancialGoal without action
   */
  export type FinancialGoalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FinancialGoal
     */
    select?: FinancialGoalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FinancialGoal
     */
    omit?: FinancialGoalOmit<ExtArgs> | null
  }


  /**
   * Model PerformanceSnapshot
   */

  export type AggregatePerformanceSnapshot = {
    _count: PerformanceSnapshotCountAggregateOutputType | null
    _avg: PerformanceSnapshotAvgAggregateOutputType | null
    _sum: PerformanceSnapshotSumAggregateOutputType | null
    _min: PerformanceSnapshotMinAggregateOutputType | null
    _max: PerformanceSnapshotMaxAggregateOutputType | null
  }

  export type PerformanceSnapshotAvgAggregateOutputType = {
    totalValue: number | null
    totalCostBasis: number | null
    totalGainLoss: number | null
    totalReturn: number | null
    dividendIncome: number | null
    spyPrice: number | null
    spyReturn: number | null
    monthlyIncome: number | null
    monthlyExpenses: number | null
    netIncome: number | null
  }

  export type PerformanceSnapshotSumAggregateOutputType = {
    totalValue: number | null
    totalCostBasis: number | null
    totalGainLoss: number | null
    totalReturn: number | null
    dividendIncome: number | null
    spyPrice: number | null
    spyReturn: number | null
    monthlyIncome: number | null
    monthlyExpenses: number | null
    netIncome: number | null
  }

  export type PerformanceSnapshotMinAggregateOutputType = {
    id: string | null
    userId: string | null
    date: Date | null
    totalValue: number | null
    totalCostBasis: number | null
    totalGainLoss: number | null
    totalReturn: number | null
    dividendIncome: number | null
    spyPrice: number | null
    spyReturn: number | null
    monthlyIncome: number | null
    monthlyExpenses: number | null
    netIncome: number | null
    createdAt: Date | null
  }

  export type PerformanceSnapshotMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    date: Date | null
    totalValue: number | null
    totalCostBasis: number | null
    totalGainLoss: number | null
    totalReturn: number | null
    dividendIncome: number | null
    spyPrice: number | null
    spyReturn: number | null
    monthlyIncome: number | null
    monthlyExpenses: number | null
    netIncome: number | null
    createdAt: Date | null
  }

  export type PerformanceSnapshotCountAggregateOutputType = {
    id: number
    userId: number
    date: number
    totalValue: number
    totalCostBasis: number
    totalGainLoss: number
    totalReturn: number
    dividendIncome: number
    spyPrice: number
    spyReturn: number
    monthlyIncome: number
    monthlyExpenses: number
    netIncome: number
    createdAt: number
    _all: number
  }


  export type PerformanceSnapshotAvgAggregateInputType = {
    totalValue?: true
    totalCostBasis?: true
    totalGainLoss?: true
    totalReturn?: true
    dividendIncome?: true
    spyPrice?: true
    spyReturn?: true
    monthlyIncome?: true
    monthlyExpenses?: true
    netIncome?: true
  }

  export type PerformanceSnapshotSumAggregateInputType = {
    totalValue?: true
    totalCostBasis?: true
    totalGainLoss?: true
    totalReturn?: true
    dividendIncome?: true
    spyPrice?: true
    spyReturn?: true
    monthlyIncome?: true
    monthlyExpenses?: true
    netIncome?: true
  }

  export type PerformanceSnapshotMinAggregateInputType = {
    id?: true
    userId?: true
    date?: true
    totalValue?: true
    totalCostBasis?: true
    totalGainLoss?: true
    totalReturn?: true
    dividendIncome?: true
    spyPrice?: true
    spyReturn?: true
    monthlyIncome?: true
    monthlyExpenses?: true
    netIncome?: true
    createdAt?: true
  }

  export type PerformanceSnapshotMaxAggregateInputType = {
    id?: true
    userId?: true
    date?: true
    totalValue?: true
    totalCostBasis?: true
    totalGainLoss?: true
    totalReturn?: true
    dividendIncome?: true
    spyPrice?: true
    spyReturn?: true
    monthlyIncome?: true
    monthlyExpenses?: true
    netIncome?: true
    createdAt?: true
  }

  export type PerformanceSnapshotCountAggregateInputType = {
    id?: true
    userId?: true
    date?: true
    totalValue?: true
    totalCostBasis?: true
    totalGainLoss?: true
    totalReturn?: true
    dividendIncome?: true
    spyPrice?: true
    spyReturn?: true
    monthlyIncome?: true
    monthlyExpenses?: true
    netIncome?: true
    createdAt?: true
    _all?: true
  }

  export type PerformanceSnapshotAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PerformanceSnapshot to aggregate.
     */
    where?: PerformanceSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PerformanceSnapshots to fetch.
     */
    orderBy?: PerformanceSnapshotOrderByWithRelationInput | PerformanceSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PerformanceSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PerformanceSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PerformanceSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PerformanceSnapshots
    **/
    _count?: true | PerformanceSnapshotCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PerformanceSnapshotAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PerformanceSnapshotSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PerformanceSnapshotMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PerformanceSnapshotMaxAggregateInputType
  }

  export type GetPerformanceSnapshotAggregateType<T extends PerformanceSnapshotAggregateArgs> = {
        [P in keyof T & keyof AggregatePerformanceSnapshot]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePerformanceSnapshot[P]>
      : GetScalarType<T[P], AggregatePerformanceSnapshot[P]>
  }




  export type PerformanceSnapshotGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PerformanceSnapshotWhereInput
    orderBy?: PerformanceSnapshotOrderByWithAggregationInput | PerformanceSnapshotOrderByWithAggregationInput[]
    by: PerformanceSnapshotScalarFieldEnum[] | PerformanceSnapshotScalarFieldEnum
    having?: PerformanceSnapshotScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PerformanceSnapshotCountAggregateInputType | true
    _avg?: PerformanceSnapshotAvgAggregateInputType
    _sum?: PerformanceSnapshotSumAggregateInputType
    _min?: PerformanceSnapshotMinAggregateInputType
    _max?: PerformanceSnapshotMaxAggregateInputType
  }

  export type PerformanceSnapshotGroupByOutputType = {
    id: string
    userId: string
    date: Date
    totalValue: number
    totalCostBasis: number
    totalGainLoss: number
    totalReturn: number
    dividendIncome: number
    spyPrice: number | null
    spyReturn: number | null
    monthlyIncome: number
    monthlyExpenses: number
    netIncome: number
    createdAt: Date
    _count: PerformanceSnapshotCountAggregateOutputType | null
    _avg: PerformanceSnapshotAvgAggregateOutputType | null
    _sum: PerformanceSnapshotSumAggregateOutputType | null
    _min: PerformanceSnapshotMinAggregateOutputType | null
    _max: PerformanceSnapshotMaxAggregateOutputType | null
  }

  type GetPerformanceSnapshotGroupByPayload<T extends PerformanceSnapshotGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PerformanceSnapshotGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PerformanceSnapshotGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PerformanceSnapshotGroupByOutputType[P]>
            : GetScalarType<T[P], PerformanceSnapshotGroupByOutputType[P]>
        }
      >
    >


  export type PerformanceSnapshotSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    date?: boolean
    totalValue?: boolean
    totalCostBasis?: boolean
    totalGainLoss?: boolean
    totalReturn?: boolean
    dividendIncome?: boolean
    spyPrice?: boolean
    spyReturn?: boolean
    monthlyIncome?: boolean
    monthlyExpenses?: boolean
    netIncome?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["performanceSnapshot"]>

  export type PerformanceSnapshotSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    date?: boolean
    totalValue?: boolean
    totalCostBasis?: boolean
    totalGainLoss?: boolean
    totalReturn?: boolean
    dividendIncome?: boolean
    spyPrice?: boolean
    spyReturn?: boolean
    monthlyIncome?: boolean
    monthlyExpenses?: boolean
    netIncome?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["performanceSnapshot"]>

  export type PerformanceSnapshotSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    date?: boolean
    totalValue?: boolean
    totalCostBasis?: boolean
    totalGainLoss?: boolean
    totalReturn?: boolean
    dividendIncome?: boolean
    spyPrice?: boolean
    spyReturn?: boolean
    monthlyIncome?: boolean
    monthlyExpenses?: boolean
    netIncome?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["performanceSnapshot"]>

  export type PerformanceSnapshotSelectScalar = {
    id?: boolean
    userId?: boolean
    date?: boolean
    totalValue?: boolean
    totalCostBasis?: boolean
    totalGainLoss?: boolean
    totalReturn?: boolean
    dividendIncome?: boolean
    spyPrice?: boolean
    spyReturn?: boolean
    monthlyIncome?: boolean
    monthlyExpenses?: boolean
    netIncome?: boolean
    createdAt?: boolean
  }

  export type PerformanceSnapshotOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "date" | "totalValue" | "totalCostBasis" | "totalGainLoss" | "totalReturn" | "dividendIncome" | "spyPrice" | "spyReturn" | "monthlyIncome" | "monthlyExpenses" | "netIncome" | "createdAt", ExtArgs["result"]["performanceSnapshot"]>

  export type $PerformanceSnapshotPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PerformanceSnapshot"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      date: Date
      totalValue: number
      totalCostBasis: number
      totalGainLoss: number
      totalReturn: number
      dividendIncome: number
      spyPrice: number | null
      spyReturn: number | null
      monthlyIncome: number
      monthlyExpenses: number
      netIncome: number
      createdAt: Date
    }, ExtArgs["result"]["performanceSnapshot"]>
    composites: {}
  }

  type PerformanceSnapshotGetPayload<S extends boolean | null | undefined | PerformanceSnapshotDefaultArgs> = $Result.GetResult<Prisma.$PerformanceSnapshotPayload, S>

  type PerformanceSnapshotCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PerformanceSnapshotFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PerformanceSnapshotCountAggregateInputType | true
    }

  export interface PerformanceSnapshotDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PerformanceSnapshot'], meta: { name: 'PerformanceSnapshot' } }
    /**
     * Find zero or one PerformanceSnapshot that matches the filter.
     * @param {PerformanceSnapshotFindUniqueArgs} args - Arguments to find a PerformanceSnapshot
     * @example
     * // Get one PerformanceSnapshot
     * const performanceSnapshot = await prisma.performanceSnapshot.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PerformanceSnapshotFindUniqueArgs>(args: SelectSubset<T, PerformanceSnapshotFindUniqueArgs<ExtArgs>>): Prisma__PerformanceSnapshotClient<$Result.GetResult<Prisma.$PerformanceSnapshotPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PerformanceSnapshot that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PerformanceSnapshotFindUniqueOrThrowArgs} args - Arguments to find a PerformanceSnapshot
     * @example
     * // Get one PerformanceSnapshot
     * const performanceSnapshot = await prisma.performanceSnapshot.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PerformanceSnapshotFindUniqueOrThrowArgs>(args: SelectSubset<T, PerformanceSnapshotFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PerformanceSnapshotClient<$Result.GetResult<Prisma.$PerformanceSnapshotPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PerformanceSnapshot that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceSnapshotFindFirstArgs} args - Arguments to find a PerformanceSnapshot
     * @example
     * // Get one PerformanceSnapshot
     * const performanceSnapshot = await prisma.performanceSnapshot.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PerformanceSnapshotFindFirstArgs>(args?: SelectSubset<T, PerformanceSnapshotFindFirstArgs<ExtArgs>>): Prisma__PerformanceSnapshotClient<$Result.GetResult<Prisma.$PerformanceSnapshotPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PerformanceSnapshot that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceSnapshotFindFirstOrThrowArgs} args - Arguments to find a PerformanceSnapshot
     * @example
     * // Get one PerformanceSnapshot
     * const performanceSnapshot = await prisma.performanceSnapshot.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PerformanceSnapshotFindFirstOrThrowArgs>(args?: SelectSubset<T, PerformanceSnapshotFindFirstOrThrowArgs<ExtArgs>>): Prisma__PerformanceSnapshotClient<$Result.GetResult<Prisma.$PerformanceSnapshotPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PerformanceSnapshots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceSnapshotFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PerformanceSnapshots
     * const performanceSnapshots = await prisma.performanceSnapshot.findMany()
     * 
     * // Get first 10 PerformanceSnapshots
     * const performanceSnapshots = await prisma.performanceSnapshot.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const performanceSnapshotWithIdOnly = await prisma.performanceSnapshot.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PerformanceSnapshotFindManyArgs>(args?: SelectSubset<T, PerformanceSnapshotFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PerformanceSnapshotPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PerformanceSnapshot.
     * @param {PerformanceSnapshotCreateArgs} args - Arguments to create a PerformanceSnapshot.
     * @example
     * // Create one PerformanceSnapshot
     * const PerformanceSnapshot = await prisma.performanceSnapshot.create({
     *   data: {
     *     // ... data to create a PerformanceSnapshot
     *   }
     * })
     * 
     */
    create<T extends PerformanceSnapshotCreateArgs>(args: SelectSubset<T, PerformanceSnapshotCreateArgs<ExtArgs>>): Prisma__PerformanceSnapshotClient<$Result.GetResult<Prisma.$PerformanceSnapshotPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PerformanceSnapshots.
     * @param {PerformanceSnapshotCreateManyArgs} args - Arguments to create many PerformanceSnapshots.
     * @example
     * // Create many PerformanceSnapshots
     * const performanceSnapshot = await prisma.performanceSnapshot.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PerformanceSnapshotCreateManyArgs>(args?: SelectSubset<T, PerformanceSnapshotCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PerformanceSnapshots and returns the data saved in the database.
     * @param {PerformanceSnapshotCreateManyAndReturnArgs} args - Arguments to create many PerformanceSnapshots.
     * @example
     * // Create many PerformanceSnapshots
     * const performanceSnapshot = await prisma.performanceSnapshot.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PerformanceSnapshots and only return the `id`
     * const performanceSnapshotWithIdOnly = await prisma.performanceSnapshot.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PerformanceSnapshotCreateManyAndReturnArgs>(args?: SelectSubset<T, PerformanceSnapshotCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PerformanceSnapshotPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PerformanceSnapshot.
     * @param {PerformanceSnapshotDeleteArgs} args - Arguments to delete one PerformanceSnapshot.
     * @example
     * // Delete one PerformanceSnapshot
     * const PerformanceSnapshot = await prisma.performanceSnapshot.delete({
     *   where: {
     *     // ... filter to delete one PerformanceSnapshot
     *   }
     * })
     * 
     */
    delete<T extends PerformanceSnapshotDeleteArgs>(args: SelectSubset<T, PerformanceSnapshotDeleteArgs<ExtArgs>>): Prisma__PerformanceSnapshotClient<$Result.GetResult<Prisma.$PerformanceSnapshotPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PerformanceSnapshot.
     * @param {PerformanceSnapshotUpdateArgs} args - Arguments to update one PerformanceSnapshot.
     * @example
     * // Update one PerformanceSnapshot
     * const performanceSnapshot = await prisma.performanceSnapshot.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PerformanceSnapshotUpdateArgs>(args: SelectSubset<T, PerformanceSnapshotUpdateArgs<ExtArgs>>): Prisma__PerformanceSnapshotClient<$Result.GetResult<Prisma.$PerformanceSnapshotPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PerformanceSnapshots.
     * @param {PerformanceSnapshotDeleteManyArgs} args - Arguments to filter PerformanceSnapshots to delete.
     * @example
     * // Delete a few PerformanceSnapshots
     * const { count } = await prisma.performanceSnapshot.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PerformanceSnapshotDeleteManyArgs>(args?: SelectSubset<T, PerformanceSnapshotDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PerformanceSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceSnapshotUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PerformanceSnapshots
     * const performanceSnapshot = await prisma.performanceSnapshot.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PerformanceSnapshotUpdateManyArgs>(args: SelectSubset<T, PerformanceSnapshotUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PerformanceSnapshots and returns the data updated in the database.
     * @param {PerformanceSnapshotUpdateManyAndReturnArgs} args - Arguments to update many PerformanceSnapshots.
     * @example
     * // Update many PerformanceSnapshots
     * const performanceSnapshot = await prisma.performanceSnapshot.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PerformanceSnapshots and only return the `id`
     * const performanceSnapshotWithIdOnly = await prisma.performanceSnapshot.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PerformanceSnapshotUpdateManyAndReturnArgs>(args: SelectSubset<T, PerformanceSnapshotUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PerformanceSnapshotPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PerformanceSnapshot.
     * @param {PerformanceSnapshotUpsertArgs} args - Arguments to update or create a PerformanceSnapshot.
     * @example
     * // Update or create a PerformanceSnapshot
     * const performanceSnapshot = await prisma.performanceSnapshot.upsert({
     *   create: {
     *     // ... data to create a PerformanceSnapshot
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PerformanceSnapshot we want to update
     *   }
     * })
     */
    upsert<T extends PerformanceSnapshotUpsertArgs>(args: SelectSubset<T, PerformanceSnapshotUpsertArgs<ExtArgs>>): Prisma__PerformanceSnapshotClient<$Result.GetResult<Prisma.$PerformanceSnapshotPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PerformanceSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceSnapshotCountArgs} args - Arguments to filter PerformanceSnapshots to count.
     * @example
     * // Count the number of PerformanceSnapshots
     * const count = await prisma.performanceSnapshot.count({
     *   where: {
     *     // ... the filter for the PerformanceSnapshots we want to count
     *   }
     * })
    **/
    count<T extends PerformanceSnapshotCountArgs>(
      args?: Subset<T, PerformanceSnapshotCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PerformanceSnapshotCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PerformanceSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceSnapshotAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PerformanceSnapshotAggregateArgs>(args: Subset<T, PerformanceSnapshotAggregateArgs>): Prisma.PrismaPromise<GetPerformanceSnapshotAggregateType<T>>

    /**
     * Group by PerformanceSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceSnapshotGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PerformanceSnapshotGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PerformanceSnapshotGroupByArgs['orderBy'] }
        : { orderBy?: PerformanceSnapshotGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PerformanceSnapshotGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPerformanceSnapshotGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PerformanceSnapshot model
   */
  readonly fields: PerformanceSnapshotFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PerformanceSnapshot.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PerformanceSnapshotClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PerformanceSnapshot model
   */
  interface PerformanceSnapshotFieldRefs {
    readonly id: FieldRef<"PerformanceSnapshot", 'String'>
    readonly userId: FieldRef<"PerformanceSnapshot", 'String'>
    readonly date: FieldRef<"PerformanceSnapshot", 'DateTime'>
    readonly totalValue: FieldRef<"PerformanceSnapshot", 'Float'>
    readonly totalCostBasis: FieldRef<"PerformanceSnapshot", 'Float'>
    readonly totalGainLoss: FieldRef<"PerformanceSnapshot", 'Float'>
    readonly totalReturn: FieldRef<"PerformanceSnapshot", 'Float'>
    readonly dividendIncome: FieldRef<"PerformanceSnapshot", 'Float'>
    readonly spyPrice: FieldRef<"PerformanceSnapshot", 'Float'>
    readonly spyReturn: FieldRef<"PerformanceSnapshot", 'Float'>
    readonly monthlyIncome: FieldRef<"PerformanceSnapshot", 'Float'>
    readonly monthlyExpenses: FieldRef<"PerformanceSnapshot", 'Float'>
    readonly netIncome: FieldRef<"PerformanceSnapshot", 'Float'>
    readonly createdAt: FieldRef<"PerformanceSnapshot", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PerformanceSnapshot findUnique
   */
  export type PerformanceSnapshotFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceSnapshot
     */
    select?: PerformanceSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceSnapshot
     */
    omit?: PerformanceSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which PerformanceSnapshot to fetch.
     */
    where: PerformanceSnapshotWhereUniqueInput
  }

  /**
   * PerformanceSnapshot findUniqueOrThrow
   */
  export type PerformanceSnapshotFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceSnapshot
     */
    select?: PerformanceSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceSnapshot
     */
    omit?: PerformanceSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which PerformanceSnapshot to fetch.
     */
    where: PerformanceSnapshotWhereUniqueInput
  }

  /**
   * PerformanceSnapshot findFirst
   */
  export type PerformanceSnapshotFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceSnapshot
     */
    select?: PerformanceSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceSnapshot
     */
    omit?: PerformanceSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which PerformanceSnapshot to fetch.
     */
    where?: PerformanceSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PerformanceSnapshots to fetch.
     */
    orderBy?: PerformanceSnapshotOrderByWithRelationInput | PerformanceSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PerformanceSnapshots.
     */
    cursor?: PerformanceSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PerformanceSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PerformanceSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PerformanceSnapshots.
     */
    distinct?: PerformanceSnapshotScalarFieldEnum | PerformanceSnapshotScalarFieldEnum[]
  }

  /**
   * PerformanceSnapshot findFirstOrThrow
   */
  export type PerformanceSnapshotFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceSnapshot
     */
    select?: PerformanceSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceSnapshot
     */
    omit?: PerformanceSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which PerformanceSnapshot to fetch.
     */
    where?: PerformanceSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PerformanceSnapshots to fetch.
     */
    orderBy?: PerformanceSnapshotOrderByWithRelationInput | PerformanceSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PerformanceSnapshots.
     */
    cursor?: PerformanceSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PerformanceSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PerformanceSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PerformanceSnapshots.
     */
    distinct?: PerformanceSnapshotScalarFieldEnum | PerformanceSnapshotScalarFieldEnum[]
  }

  /**
   * PerformanceSnapshot findMany
   */
  export type PerformanceSnapshotFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceSnapshot
     */
    select?: PerformanceSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceSnapshot
     */
    omit?: PerformanceSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which PerformanceSnapshots to fetch.
     */
    where?: PerformanceSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PerformanceSnapshots to fetch.
     */
    orderBy?: PerformanceSnapshotOrderByWithRelationInput | PerformanceSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PerformanceSnapshots.
     */
    cursor?: PerformanceSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PerformanceSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PerformanceSnapshots.
     */
    skip?: number
    distinct?: PerformanceSnapshotScalarFieldEnum | PerformanceSnapshotScalarFieldEnum[]
  }

  /**
   * PerformanceSnapshot create
   */
  export type PerformanceSnapshotCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceSnapshot
     */
    select?: PerformanceSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceSnapshot
     */
    omit?: PerformanceSnapshotOmit<ExtArgs> | null
    /**
     * The data needed to create a PerformanceSnapshot.
     */
    data: XOR<PerformanceSnapshotCreateInput, PerformanceSnapshotUncheckedCreateInput>
  }

  /**
   * PerformanceSnapshot createMany
   */
  export type PerformanceSnapshotCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PerformanceSnapshots.
     */
    data: PerformanceSnapshotCreateManyInput | PerformanceSnapshotCreateManyInput[]
  }

  /**
   * PerformanceSnapshot createManyAndReturn
   */
  export type PerformanceSnapshotCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceSnapshot
     */
    select?: PerformanceSnapshotSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceSnapshot
     */
    omit?: PerformanceSnapshotOmit<ExtArgs> | null
    /**
     * The data used to create many PerformanceSnapshots.
     */
    data: PerformanceSnapshotCreateManyInput | PerformanceSnapshotCreateManyInput[]
  }

  /**
   * PerformanceSnapshot update
   */
  export type PerformanceSnapshotUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceSnapshot
     */
    select?: PerformanceSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceSnapshot
     */
    omit?: PerformanceSnapshotOmit<ExtArgs> | null
    /**
     * The data needed to update a PerformanceSnapshot.
     */
    data: XOR<PerformanceSnapshotUpdateInput, PerformanceSnapshotUncheckedUpdateInput>
    /**
     * Choose, which PerformanceSnapshot to update.
     */
    where: PerformanceSnapshotWhereUniqueInput
  }

  /**
   * PerformanceSnapshot updateMany
   */
  export type PerformanceSnapshotUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PerformanceSnapshots.
     */
    data: XOR<PerformanceSnapshotUpdateManyMutationInput, PerformanceSnapshotUncheckedUpdateManyInput>
    /**
     * Filter which PerformanceSnapshots to update
     */
    where?: PerformanceSnapshotWhereInput
    /**
     * Limit how many PerformanceSnapshots to update.
     */
    limit?: number
  }

  /**
   * PerformanceSnapshot updateManyAndReturn
   */
  export type PerformanceSnapshotUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceSnapshot
     */
    select?: PerformanceSnapshotSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceSnapshot
     */
    omit?: PerformanceSnapshotOmit<ExtArgs> | null
    /**
     * The data used to update PerformanceSnapshots.
     */
    data: XOR<PerformanceSnapshotUpdateManyMutationInput, PerformanceSnapshotUncheckedUpdateManyInput>
    /**
     * Filter which PerformanceSnapshots to update
     */
    where?: PerformanceSnapshotWhereInput
    /**
     * Limit how many PerformanceSnapshots to update.
     */
    limit?: number
  }

  /**
   * PerformanceSnapshot upsert
   */
  export type PerformanceSnapshotUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceSnapshot
     */
    select?: PerformanceSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceSnapshot
     */
    omit?: PerformanceSnapshotOmit<ExtArgs> | null
    /**
     * The filter to search for the PerformanceSnapshot to update in case it exists.
     */
    where: PerformanceSnapshotWhereUniqueInput
    /**
     * In case the PerformanceSnapshot found by the `where` argument doesn't exist, create a new PerformanceSnapshot with this data.
     */
    create: XOR<PerformanceSnapshotCreateInput, PerformanceSnapshotUncheckedCreateInput>
    /**
     * In case the PerformanceSnapshot was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PerformanceSnapshotUpdateInput, PerformanceSnapshotUncheckedUpdateInput>
  }

  /**
   * PerformanceSnapshot delete
   */
  export type PerformanceSnapshotDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceSnapshot
     */
    select?: PerformanceSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceSnapshot
     */
    omit?: PerformanceSnapshotOmit<ExtArgs> | null
    /**
     * Filter which PerformanceSnapshot to delete.
     */
    where: PerformanceSnapshotWhereUniqueInput
  }

  /**
   * PerformanceSnapshot deleteMany
   */
  export type PerformanceSnapshotDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PerformanceSnapshots to delete
     */
    where?: PerformanceSnapshotWhereInput
    /**
     * Limit how many PerformanceSnapshots to delete.
     */
    limit?: number
  }

  /**
   * PerformanceSnapshot without action
   */
  export type PerformanceSnapshotDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceSnapshot
     */
    select?: PerformanceSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceSnapshot
     */
    omit?: PerformanceSnapshotOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    passwordHash: 'passwordHash',
    settings: 'settings',
    taxProfile: 'taxProfile',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const PortfolioScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    type: 'type',
    institution: 'institution',
    isPrimary: 'isPrimary',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PortfolioScalarFieldEnum = (typeof PortfolioScalarFieldEnum)[keyof typeof PortfolioScalarFieldEnum]


  export const HoldingScalarFieldEnum: {
    id: 'id',
    portfolioId: 'portfolioId',
    ticker: 'ticker',
    shares: 'shares',
    costBasis: 'costBasis',
    purchaseDate: 'purchaseDate',
    currentPrice: 'currentPrice',
    dividendYield: 'dividendYield',
    sector: 'sector',
    metadata: 'metadata',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type HoldingScalarFieldEnum = (typeof HoldingScalarFieldEnum)[keyof typeof HoldingScalarFieldEnum]


  export const TransactionScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    portfolioId: 'portfolioId',
    ticker: 'ticker',
    type: 'type',
    shares: 'shares',
    amount: 'amount',
    date: 'date',
    notes: 'notes',
    metadata: 'metadata',
    createdAt: 'createdAt'
  };

  export type TransactionScalarFieldEnum = (typeof TransactionScalarFieldEnum)[keyof typeof TransactionScalarFieldEnum]


  export const IncomeScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    source: 'source',
    category: 'category',
    amount: 'amount',
    date: 'date',
    recurring: 'recurring',
    frequency: 'frequency',
    taxable: 'taxable',
    notes: 'notes',
    metadata: 'metadata',
    createdAt: 'createdAt'
  };

  export type IncomeScalarFieldEnum = (typeof IncomeScalarFieldEnum)[keyof typeof IncomeScalarFieldEnum]


  export const ExpenseScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    category: 'category',
    merchant: 'merchant',
    amount: 'amount',
    date: 'date',
    recurring: 'recurring',
    frequency: 'frequency',
    priority: 'priority',
    essential: 'essential',
    notes: 'notes',
    metadata: 'metadata',
    createdAt: 'createdAt'
  };

  export type ExpenseScalarFieldEnum = (typeof ExpenseScalarFieldEnum)[keyof typeof ExpenseScalarFieldEnum]


  export const StockPriceScalarFieldEnum: {
    id: 'id',
    ticker: 'ticker',
    date: 'date',
    open: 'open',
    high: 'high',
    low: 'low',
    close: 'close',
    volume: 'volume',
    adjustedClose: 'adjustedClose',
    createdAt: 'createdAt'
  };

  export type StockPriceScalarFieldEnum = (typeof StockPriceScalarFieldEnum)[keyof typeof StockPriceScalarFieldEnum]


  export const DividendScheduleScalarFieldEnum: {
    id: 'id',
    ticker: 'ticker',
    exDate: 'exDate',
    payDate: 'payDate',
    recordDate: 'recordDate',
    amount: 'amount',
    frequency: 'frequency',
    paymentType: 'paymentType',
    currency: 'currency',
    createdAt: 'createdAt'
  };

  export type DividendScheduleScalarFieldEnum = (typeof DividendScheduleScalarFieldEnum)[keyof typeof DividendScheduleScalarFieldEnum]


  export const CalculationCacheScalarFieldEnum: {
    id: 'id',
    cacheKey: 'cacheKey',
    data: 'data',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
  };

  export type CalculationCacheScalarFieldEnum = (typeof CalculationCacheScalarFieldEnum)[keyof typeof CalculationCacheScalarFieldEnum]


  export const UserSettingsScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    theme: 'theme',
    currency: 'currency',
    locale: 'locale',
    timezone: 'timezone',
    notifications: 'notifications',
    privacy: 'privacy',
    features: 'features',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserSettingsScalarFieldEnum = (typeof UserSettingsScalarFieldEnum)[keyof typeof UserSettingsScalarFieldEnum]


  export const TaxProfileScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    state: 'state',
    filingStatus: 'filingStatus',
    federalBracket: 'federalBracket',
    stateBracket: 'stateBracket',
    qualifiedDividendRate: 'qualifiedDividendRate',
    capitalGainsRate: 'capitalGainsRate',
    effectiveRate: 'effectiveRate',
    marginalRate: 'marginalRate',
    taxYear: 'taxYear',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TaxProfileScalarFieldEnum = (typeof TaxProfileScalarFieldEnum)[keyof typeof TaxProfileScalarFieldEnum]


  export const FinancialGoalScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    description: 'description',
    targetAmount: 'targetAmount',
    currentAmount: 'currentAmount',
    targetDate: 'targetDate',
    category: 'category',
    priority: 'priority',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FinancialGoalScalarFieldEnum = (typeof FinancialGoalScalarFieldEnum)[keyof typeof FinancialGoalScalarFieldEnum]


  export const PerformanceSnapshotScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    date: 'date',
    totalValue: 'totalValue',
    totalCostBasis: 'totalCostBasis',
    totalGainLoss: 'totalGainLoss',
    totalReturn: 'totalReturn',
    dividendIncome: 'dividendIncome',
    spyPrice: 'spyPrice',
    spyReturn: 'spyReturn',
    monthlyIncome: 'monthlyIncome',
    monthlyExpenses: 'monthlyExpenses',
    netIncome: 'netIncome',
    createdAt: 'createdAt'
  };

  export type PerformanceSnapshotScalarFieldEnum = (typeof PerformanceSnapshotScalarFieldEnum)[keyof typeof PerformanceSnapshotScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    settings?: StringNullableFilter<"User"> | string | null
    taxProfile?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    portfolios?: PortfolioListRelationFilter
    incomes?: IncomeListRelationFilter
    expenses?: ExpenseListRelationFilter
    transactions?: TransactionListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    settings?: SortOrderInput | SortOrder
    taxProfile?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    portfolios?: PortfolioOrderByRelationAggregateInput
    incomes?: IncomeOrderByRelationAggregateInput
    expenses?: ExpenseOrderByRelationAggregateInput
    transactions?: TransactionOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    passwordHash?: StringFilter<"User"> | string
    settings?: StringNullableFilter<"User"> | string | null
    taxProfile?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    portfolios?: PortfolioListRelationFilter
    incomes?: IncomeListRelationFilter
    expenses?: ExpenseListRelationFilter
    transactions?: TransactionListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    settings?: SortOrderInput | SortOrder
    taxProfile?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    passwordHash?: StringWithAggregatesFilter<"User"> | string
    settings?: StringNullableWithAggregatesFilter<"User"> | string | null
    taxProfile?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type PortfolioWhereInput = {
    AND?: PortfolioWhereInput | PortfolioWhereInput[]
    OR?: PortfolioWhereInput[]
    NOT?: PortfolioWhereInput | PortfolioWhereInput[]
    id?: StringFilter<"Portfolio"> | string
    userId?: StringFilter<"Portfolio"> | string
    name?: StringFilter<"Portfolio"> | string
    type?: StringFilter<"Portfolio"> | string
    institution?: StringNullableFilter<"Portfolio"> | string | null
    isPrimary?: BoolFilter<"Portfolio"> | boolean
    createdAt?: DateTimeFilter<"Portfolio"> | Date | string
    updatedAt?: DateTimeFilter<"Portfolio"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    holdings?: HoldingListRelationFilter
  }

  export type PortfolioOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    institution?: SortOrderInput | SortOrder
    isPrimary?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    holdings?: HoldingOrderByRelationAggregateInput
  }

  export type PortfolioWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PortfolioWhereInput | PortfolioWhereInput[]
    OR?: PortfolioWhereInput[]
    NOT?: PortfolioWhereInput | PortfolioWhereInput[]
    userId?: StringFilter<"Portfolio"> | string
    name?: StringFilter<"Portfolio"> | string
    type?: StringFilter<"Portfolio"> | string
    institution?: StringNullableFilter<"Portfolio"> | string | null
    isPrimary?: BoolFilter<"Portfolio"> | boolean
    createdAt?: DateTimeFilter<"Portfolio"> | Date | string
    updatedAt?: DateTimeFilter<"Portfolio"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    holdings?: HoldingListRelationFilter
  }, "id">

  export type PortfolioOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    institution?: SortOrderInput | SortOrder
    isPrimary?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PortfolioCountOrderByAggregateInput
    _max?: PortfolioMaxOrderByAggregateInput
    _min?: PortfolioMinOrderByAggregateInput
  }

  export type PortfolioScalarWhereWithAggregatesInput = {
    AND?: PortfolioScalarWhereWithAggregatesInput | PortfolioScalarWhereWithAggregatesInput[]
    OR?: PortfolioScalarWhereWithAggregatesInput[]
    NOT?: PortfolioScalarWhereWithAggregatesInput | PortfolioScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Portfolio"> | string
    userId?: StringWithAggregatesFilter<"Portfolio"> | string
    name?: StringWithAggregatesFilter<"Portfolio"> | string
    type?: StringWithAggregatesFilter<"Portfolio"> | string
    institution?: StringNullableWithAggregatesFilter<"Portfolio"> | string | null
    isPrimary?: BoolWithAggregatesFilter<"Portfolio"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Portfolio"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Portfolio"> | Date | string
  }

  export type HoldingWhereInput = {
    AND?: HoldingWhereInput | HoldingWhereInput[]
    OR?: HoldingWhereInput[]
    NOT?: HoldingWhereInput | HoldingWhereInput[]
    id?: StringFilter<"Holding"> | string
    portfolioId?: StringFilter<"Holding"> | string
    ticker?: StringFilter<"Holding"> | string
    shares?: FloatFilter<"Holding"> | number
    costBasis?: FloatFilter<"Holding"> | number
    purchaseDate?: DateTimeFilter<"Holding"> | Date | string
    currentPrice?: FloatNullableFilter<"Holding"> | number | null
    dividendYield?: FloatNullableFilter<"Holding"> | number | null
    sector?: StringNullableFilter<"Holding"> | string | null
    metadata?: StringNullableFilter<"Holding"> | string | null
    createdAt?: DateTimeFilter<"Holding"> | Date | string
    updatedAt?: DateTimeFilter<"Holding"> | Date | string
    portfolio?: XOR<PortfolioScalarRelationFilter, PortfolioWhereInput>
  }

  export type HoldingOrderByWithRelationInput = {
    id?: SortOrder
    portfolioId?: SortOrder
    ticker?: SortOrder
    shares?: SortOrder
    costBasis?: SortOrder
    purchaseDate?: SortOrder
    currentPrice?: SortOrderInput | SortOrder
    dividendYield?: SortOrderInput | SortOrder
    sector?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    portfolio?: PortfolioOrderByWithRelationInput
  }

  export type HoldingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    portfolioId_ticker?: HoldingPortfolioIdTickerCompoundUniqueInput
    AND?: HoldingWhereInput | HoldingWhereInput[]
    OR?: HoldingWhereInput[]
    NOT?: HoldingWhereInput | HoldingWhereInput[]
    portfolioId?: StringFilter<"Holding"> | string
    ticker?: StringFilter<"Holding"> | string
    shares?: FloatFilter<"Holding"> | number
    costBasis?: FloatFilter<"Holding"> | number
    purchaseDate?: DateTimeFilter<"Holding"> | Date | string
    currentPrice?: FloatNullableFilter<"Holding"> | number | null
    dividendYield?: FloatNullableFilter<"Holding"> | number | null
    sector?: StringNullableFilter<"Holding"> | string | null
    metadata?: StringNullableFilter<"Holding"> | string | null
    createdAt?: DateTimeFilter<"Holding"> | Date | string
    updatedAt?: DateTimeFilter<"Holding"> | Date | string
    portfolio?: XOR<PortfolioScalarRelationFilter, PortfolioWhereInput>
  }, "id" | "portfolioId_ticker">

  export type HoldingOrderByWithAggregationInput = {
    id?: SortOrder
    portfolioId?: SortOrder
    ticker?: SortOrder
    shares?: SortOrder
    costBasis?: SortOrder
    purchaseDate?: SortOrder
    currentPrice?: SortOrderInput | SortOrder
    dividendYield?: SortOrderInput | SortOrder
    sector?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: HoldingCountOrderByAggregateInput
    _avg?: HoldingAvgOrderByAggregateInput
    _max?: HoldingMaxOrderByAggregateInput
    _min?: HoldingMinOrderByAggregateInput
    _sum?: HoldingSumOrderByAggregateInput
  }

  export type HoldingScalarWhereWithAggregatesInput = {
    AND?: HoldingScalarWhereWithAggregatesInput | HoldingScalarWhereWithAggregatesInput[]
    OR?: HoldingScalarWhereWithAggregatesInput[]
    NOT?: HoldingScalarWhereWithAggregatesInput | HoldingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Holding"> | string
    portfolioId?: StringWithAggregatesFilter<"Holding"> | string
    ticker?: StringWithAggregatesFilter<"Holding"> | string
    shares?: FloatWithAggregatesFilter<"Holding"> | number
    costBasis?: FloatWithAggregatesFilter<"Holding"> | number
    purchaseDate?: DateTimeWithAggregatesFilter<"Holding"> | Date | string
    currentPrice?: FloatNullableWithAggregatesFilter<"Holding"> | number | null
    dividendYield?: FloatNullableWithAggregatesFilter<"Holding"> | number | null
    sector?: StringNullableWithAggregatesFilter<"Holding"> | string | null
    metadata?: StringNullableWithAggregatesFilter<"Holding"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Holding"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Holding"> | Date | string
  }

  export type TransactionWhereInput = {
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    id?: StringFilter<"Transaction"> | string
    userId?: StringFilter<"Transaction"> | string
    portfolioId?: StringNullableFilter<"Transaction"> | string | null
    ticker?: StringFilter<"Transaction"> | string
    type?: StringFilter<"Transaction"> | string
    shares?: FloatNullableFilter<"Transaction"> | number | null
    amount?: FloatFilter<"Transaction"> | number
    date?: DateTimeFilter<"Transaction"> | Date | string
    notes?: StringNullableFilter<"Transaction"> | string | null
    metadata?: StringNullableFilter<"Transaction"> | string | null
    createdAt?: DateTimeFilter<"Transaction"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type TransactionOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    portfolioId?: SortOrderInput | SortOrder
    ticker?: SortOrder
    type?: SortOrder
    shares?: SortOrderInput | SortOrder
    amount?: SortOrder
    date?: SortOrder
    notes?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type TransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    userId?: StringFilter<"Transaction"> | string
    portfolioId?: StringNullableFilter<"Transaction"> | string | null
    ticker?: StringFilter<"Transaction"> | string
    type?: StringFilter<"Transaction"> | string
    shares?: FloatNullableFilter<"Transaction"> | number | null
    amount?: FloatFilter<"Transaction"> | number
    date?: DateTimeFilter<"Transaction"> | Date | string
    notes?: StringNullableFilter<"Transaction"> | string | null
    metadata?: StringNullableFilter<"Transaction"> | string | null
    createdAt?: DateTimeFilter<"Transaction"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type TransactionOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    portfolioId?: SortOrderInput | SortOrder
    ticker?: SortOrder
    type?: SortOrder
    shares?: SortOrderInput | SortOrder
    amount?: SortOrder
    date?: SortOrder
    notes?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: TransactionCountOrderByAggregateInput
    _avg?: TransactionAvgOrderByAggregateInput
    _max?: TransactionMaxOrderByAggregateInput
    _min?: TransactionMinOrderByAggregateInput
    _sum?: TransactionSumOrderByAggregateInput
  }

  export type TransactionScalarWhereWithAggregatesInput = {
    AND?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    OR?: TransactionScalarWhereWithAggregatesInput[]
    NOT?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Transaction"> | string
    userId?: StringWithAggregatesFilter<"Transaction"> | string
    portfolioId?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    ticker?: StringWithAggregatesFilter<"Transaction"> | string
    type?: StringWithAggregatesFilter<"Transaction"> | string
    shares?: FloatNullableWithAggregatesFilter<"Transaction"> | number | null
    amount?: FloatWithAggregatesFilter<"Transaction"> | number
    date?: DateTimeWithAggregatesFilter<"Transaction"> | Date | string
    notes?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    metadata?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Transaction"> | Date | string
  }

  export type IncomeWhereInput = {
    AND?: IncomeWhereInput | IncomeWhereInput[]
    OR?: IncomeWhereInput[]
    NOT?: IncomeWhereInput | IncomeWhereInput[]
    id?: StringFilter<"Income"> | string
    userId?: StringFilter<"Income"> | string
    source?: StringFilter<"Income"> | string
    category?: StringFilter<"Income"> | string
    amount?: FloatFilter<"Income"> | number
    date?: DateTimeFilter<"Income"> | Date | string
    recurring?: BoolFilter<"Income"> | boolean
    frequency?: StringNullableFilter<"Income"> | string | null
    taxable?: BoolFilter<"Income"> | boolean
    notes?: StringNullableFilter<"Income"> | string | null
    metadata?: StringNullableFilter<"Income"> | string | null
    createdAt?: DateTimeFilter<"Income"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type IncomeOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    category?: SortOrder
    amount?: SortOrder
    date?: SortOrder
    recurring?: SortOrder
    frequency?: SortOrderInput | SortOrder
    taxable?: SortOrder
    notes?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type IncomeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: IncomeWhereInput | IncomeWhereInput[]
    OR?: IncomeWhereInput[]
    NOT?: IncomeWhereInput | IncomeWhereInput[]
    userId?: StringFilter<"Income"> | string
    source?: StringFilter<"Income"> | string
    category?: StringFilter<"Income"> | string
    amount?: FloatFilter<"Income"> | number
    date?: DateTimeFilter<"Income"> | Date | string
    recurring?: BoolFilter<"Income"> | boolean
    frequency?: StringNullableFilter<"Income"> | string | null
    taxable?: BoolFilter<"Income"> | boolean
    notes?: StringNullableFilter<"Income"> | string | null
    metadata?: StringNullableFilter<"Income"> | string | null
    createdAt?: DateTimeFilter<"Income"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type IncomeOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    category?: SortOrder
    amount?: SortOrder
    date?: SortOrder
    recurring?: SortOrder
    frequency?: SortOrderInput | SortOrder
    taxable?: SortOrder
    notes?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: IncomeCountOrderByAggregateInput
    _avg?: IncomeAvgOrderByAggregateInput
    _max?: IncomeMaxOrderByAggregateInput
    _min?: IncomeMinOrderByAggregateInput
    _sum?: IncomeSumOrderByAggregateInput
  }

  export type IncomeScalarWhereWithAggregatesInput = {
    AND?: IncomeScalarWhereWithAggregatesInput | IncomeScalarWhereWithAggregatesInput[]
    OR?: IncomeScalarWhereWithAggregatesInput[]
    NOT?: IncomeScalarWhereWithAggregatesInput | IncomeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Income"> | string
    userId?: StringWithAggregatesFilter<"Income"> | string
    source?: StringWithAggregatesFilter<"Income"> | string
    category?: StringWithAggregatesFilter<"Income"> | string
    amount?: FloatWithAggregatesFilter<"Income"> | number
    date?: DateTimeWithAggregatesFilter<"Income"> | Date | string
    recurring?: BoolWithAggregatesFilter<"Income"> | boolean
    frequency?: StringNullableWithAggregatesFilter<"Income"> | string | null
    taxable?: BoolWithAggregatesFilter<"Income"> | boolean
    notes?: StringNullableWithAggregatesFilter<"Income"> | string | null
    metadata?: StringNullableWithAggregatesFilter<"Income"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Income"> | Date | string
  }

  export type ExpenseWhereInput = {
    AND?: ExpenseWhereInput | ExpenseWhereInput[]
    OR?: ExpenseWhereInput[]
    NOT?: ExpenseWhereInput | ExpenseWhereInput[]
    id?: StringFilter<"Expense"> | string
    userId?: StringFilter<"Expense"> | string
    category?: StringFilter<"Expense"> | string
    merchant?: StringNullableFilter<"Expense"> | string | null
    amount?: FloatFilter<"Expense"> | number
    date?: DateTimeFilter<"Expense"> | Date | string
    recurring?: BoolFilter<"Expense"> | boolean
    frequency?: StringNullableFilter<"Expense"> | string | null
    priority?: IntFilter<"Expense"> | number
    essential?: BoolFilter<"Expense"> | boolean
    notes?: StringNullableFilter<"Expense"> | string | null
    metadata?: StringNullableFilter<"Expense"> | string | null
    createdAt?: DateTimeFilter<"Expense"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type ExpenseOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    category?: SortOrder
    merchant?: SortOrderInput | SortOrder
    amount?: SortOrder
    date?: SortOrder
    recurring?: SortOrder
    frequency?: SortOrderInput | SortOrder
    priority?: SortOrder
    essential?: SortOrder
    notes?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type ExpenseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ExpenseWhereInput | ExpenseWhereInput[]
    OR?: ExpenseWhereInput[]
    NOT?: ExpenseWhereInput | ExpenseWhereInput[]
    userId?: StringFilter<"Expense"> | string
    category?: StringFilter<"Expense"> | string
    merchant?: StringNullableFilter<"Expense"> | string | null
    amount?: FloatFilter<"Expense"> | number
    date?: DateTimeFilter<"Expense"> | Date | string
    recurring?: BoolFilter<"Expense"> | boolean
    frequency?: StringNullableFilter<"Expense"> | string | null
    priority?: IntFilter<"Expense"> | number
    essential?: BoolFilter<"Expense"> | boolean
    notes?: StringNullableFilter<"Expense"> | string | null
    metadata?: StringNullableFilter<"Expense"> | string | null
    createdAt?: DateTimeFilter<"Expense"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type ExpenseOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    category?: SortOrder
    merchant?: SortOrderInput | SortOrder
    amount?: SortOrder
    date?: SortOrder
    recurring?: SortOrder
    frequency?: SortOrderInput | SortOrder
    priority?: SortOrder
    essential?: SortOrder
    notes?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ExpenseCountOrderByAggregateInput
    _avg?: ExpenseAvgOrderByAggregateInput
    _max?: ExpenseMaxOrderByAggregateInput
    _min?: ExpenseMinOrderByAggregateInput
    _sum?: ExpenseSumOrderByAggregateInput
  }

  export type ExpenseScalarWhereWithAggregatesInput = {
    AND?: ExpenseScalarWhereWithAggregatesInput | ExpenseScalarWhereWithAggregatesInput[]
    OR?: ExpenseScalarWhereWithAggregatesInput[]
    NOT?: ExpenseScalarWhereWithAggregatesInput | ExpenseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Expense"> | string
    userId?: StringWithAggregatesFilter<"Expense"> | string
    category?: StringWithAggregatesFilter<"Expense"> | string
    merchant?: StringNullableWithAggregatesFilter<"Expense"> | string | null
    amount?: FloatWithAggregatesFilter<"Expense"> | number
    date?: DateTimeWithAggregatesFilter<"Expense"> | Date | string
    recurring?: BoolWithAggregatesFilter<"Expense"> | boolean
    frequency?: StringNullableWithAggregatesFilter<"Expense"> | string | null
    priority?: IntWithAggregatesFilter<"Expense"> | number
    essential?: BoolWithAggregatesFilter<"Expense"> | boolean
    notes?: StringNullableWithAggregatesFilter<"Expense"> | string | null
    metadata?: StringNullableWithAggregatesFilter<"Expense"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Expense"> | Date | string
  }

  export type StockPriceWhereInput = {
    AND?: StockPriceWhereInput | StockPriceWhereInput[]
    OR?: StockPriceWhereInput[]
    NOT?: StockPriceWhereInput | StockPriceWhereInput[]
    id?: StringFilter<"StockPrice"> | string
    ticker?: StringFilter<"StockPrice"> | string
    date?: DateTimeFilter<"StockPrice"> | Date | string
    open?: FloatFilter<"StockPrice"> | number
    high?: FloatFilter<"StockPrice"> | number
    low?: FloatFilter<"StockPrice"> | number
    close?: FloatFilter<"StockPrice"> | number
    volume?: IntFilter<"StockPrice"> | number
    adjustedClose?: FloatNullableFilter<"StockPrice"> | number | null
    createdAt?: DateTimeFilter<"StockPrice"> | Date | string
  }

  export type StockPriceOrderByWithRelationInput = {
    id?: SortOrder
    ticker?: SortOrder
    date?: SortOrder
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    adjustedClose?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type StockPriceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    ticker_date?: StockPriceTickerDateCompoundUniqueInput
    AND?: StockPriceWhereInput | StockPriceWhereInput[]
    OR?: StockPriceWhereInput[]
    NOT?: StockPriceWhereInput | StockPriceWhereInput[]
    ticker?: StringFilter<"StockPrice"> | string
    date?: DateTimeFilter<"StockPrice"> | Date | string
    open?: FloatFilter<"StockPrice"> | number
    high?: FloatFilter<"StockPrice"> | number
    low?: FloatFilter<"StockPrice"> | number
    close?: FloatFilter<"StockPrice"> | number
    volume?: IntFilter<"StockPrice"> | number
    adjustedClose?: FloatNullableFilter<"StockPrice"> | number | null
    createdAt?: DateTimeFilter<"StockPrice"> | Date | string
  }, "id" | "ticker_date">

  export type StockPriceOrderByWithAggregationInput = {
    id?: SortOrder
    ticker?: SortOrder
    date?: SortOrder
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    adjustedClose?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: StockPriceCountOrderByAggregateInput
    _avg?: StockPriceAvgOrderByAggregateInput
    _max?: StockPriceMaxOrderByAggregateInput
    _min?: StockPriceMinOrderByAggregateInput
    _sum?: StockPriceSumOrderByAggregateInput
  }

  export type StockPriceScalarWhereWithAggregatesInput = {
    AND?: StockPriceScalarWhereWithAggregatesInput | StockPriceScalarWhereWithAggregatesInput[]
    OR?: StockPriceScalarWhereWithAggregatesInput[]
    NOT?: StockPriceScalarWhereWithAggregatesInput | StockPriceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"StockPrice"> | string
    ticker?: StringWithAggregatesFilter<"StockPrice"> | string
    date?: DateTimeWithAggregatesFilter<"StockPrice"> | Date | string
    open?: FloatWithAggregatesFilter<"StockPrice"> | number
    high?: FloatWithAggregatesFilter<"StockPrice"> | number
    low?: FloatWithAggregatesFilter<"StockPrice"> | number
    close?: FloatWithAggregatesFilter<"StockPrice"> | number
    volume?: IntWithAggregatesFilter<"StockPrice"> | number
    adjustedClose?: FloatNullableWithAggregatesFilter<"StockPrice"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"StockPrice"> | Date | string
  }

  export type DividendScheduleWhereInput = {
    AND?: DividendScheduleWhereInput | DividendScheduleWhereInput[]
    OR?: DividendScheduleWhereInput[]
    NOT?: DividendScheduleWhereInput | DividendScheduleWhereInput[]
    id?: StringFilter<"DividendSchedule"> | string
    ticker?: StringFilter<"DividendSchedule"> | string
    exDate?: DateTimeFilter<"DividendSchedule"> | Date | string
    payDate?: DateTimeFilter<"DividendSchedule"> | Date | string
    recordDate?: DateTimeNullableFilter<"DividendSchedule"> | Date | string | null
    amount?: FloatFilter<"DividendSchedule"> | number
    frequency?: StringFilter<"DividendSchedule"> | string
    paymentType?: StringFilter<"DividendSchedule"> | string
    currency?: StringFilter<"DividendSchedule"> | string
    createdAt?: DateTimeFilter<"DividendSchedule"> | Date | string
  }

  export type DividendScheduleOrderByWithRelationInput = {
    id?: SortOrder
    ticker?: SortOrder
    exDate?: SortOrder
    payDate?: SortOrder
    recordDate?: SortOrderInput | SortOrder
    amount?: SortOrder
    frequency?: SortOrder
    paymentType?: SortOrder
    currency?: SortOrder
    createdAt?: SortOrder
  }

  export type DividendScheduleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    ticker_exDate?: DividendScheduleTickerExDateCompoundUniqueInput
    AND?: DividendScheduleWhereInput | DividendScheduleWhereInput[]
    OR?: DividendScheduleWhereInput[]
    NOT?: DividendScheduleWhereInput | DividendScheduleWhereInput[]
    ticker?: StringFilter<"DividendSchedule"> | string
    exDate?: DateTimeFilter<"DividendSchedule"> | Date | string
    payDate?: DateTimeFilter<"DividendSchedule"> | Date | string
    recordDate?: DateTimeNullableFilter<"DividendSchedule"> | Date | string | null
    amount?: FloatFilter<"DividendSchedule"> | number
    frequency?: StringFilter<"DividendSchedule"> | string
    paymentType?: StringFilter<"DividendSchedule"> | string
    currency?: StringFilter<"DividendSchedule"> | string
    createdAt?: DateTimeFilter<"DividendSchedule"> | Date | string
  }, "id" | "ticker_exDate">

  export type DividendScheduleOrderByWithAggregationInput = {
    id?: SortOrder
    ticker?: SortOrder
    exDate?: SortOrder
    payDate?: SortOrder
    recordDate?: SortOrderInput | SortOrder
    amount?: SortOrder
    frequency?: SortOrder
    paymentType?: SortOrder
    currency?: SortOrder
    createdAt?: SortOrder
    _count?: DividendScheduleCountOrderByAggregateInput
    _avg?: DividendScheduleAvgOrderByAggregateInput
    _max?: DividendScheduleMaxOrderByAggregateInput
    _min?: DividendScheduleMinOrderByAggregateInput
    _sum?: DividendScheduleSumOrderByAggregateInput
  }

  export type DividendScheduleScalarWhereWithAggregatesInput = {
    AND?: DividendScheduleScalarWhereWithAggregatesInput | DividendScheduleScalarWhereWithAggregatesInput[]
    OR?: DividendScheduleScalarWhereWithAggregatesInput[]
    NOT?: DividendScheduleScalarWhereWithAggregatesInput | DividendScheduleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DividendSchedule"> | string
    ticker?: StringWithAggregatesFilter<"DividendSchedule"> | string
    exDate?: DateTimeWithAggregatesFilter<"DividendSchedule"> | Date | string
    payDate?: DateTimeWithAggregatesFilter<"DividendSchedule"> | Date | string
    recordDate?: DateTimeNullableWithAggregatesFilter<"DividendSchedule"> | Date | string | null
    amount?: FloatWithAggregatesFilter<"DividendSchedule"> | number
    frequency?: StringWithAggregatesFilter<"DividendSchedule"> | string
    paymentType?: StringWithAggregatesFilter<"DividendSchedule"> | string
    currency?: StringWithAggregatesFilter<"DividendSchedule"> | string
    createdAt?: DateTimeWithAggregatesFilter<"DividendSchedule"> | Date | string
  }

  export type CalculationCacheWhereInput = {
    AND?: CalculationCacheWhereInput | CalculationCacheWhereInput[]
    OR?: CalculationCacheWhereInput[]
    NOT?: CalculationCacheWhereInput | CalculationCacheWhereInput[]
    id?: StringFilter<"CalculationCache"> | string
    cacheKey?: StringFilter<"CalculationCache"> | string
    data?: StringFilter<"CalculationCache"> | string
    expiresAt?: DateTimeFilter<"CalculationCache"> | Date | string
    createdAt?: DateTimeFilter<"CalculationCache"> | Date | string
  }

  export type CalculationCacheOrderByWithRelationInput = {
    id?: SortOrder
    cacheKey?: SortOrder
    data?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type CalculationCacheWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    cacheKey?: string
    AND?: CalculationCacheWhereInput | CalculationCacheWhereInput[]
    OR?: CalculationCacheWhereInput[]
    NOT?: CalculationCacheWhereInput | CalculationCacheWhereInput[]
    data?: StringFilter<"CalculationCache"> | string
    expiresAt?: DateTimeFilter<"CalculationCache"> | Date | string
    createdAt?: DateTimeFilter<"CalculationCache"> | Date | string
  }, "id" | "cacheKey">

  export type CalculationCacheOrderByWithAggregationInput = {
    id?: SortOrder
    cacheKey?: SortOrder
    data?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    _count?: CalculationCacheCountOrderByAggregateInput
    _max?: CalculationCacheMaxOrderByAggregateInput
    _min?: CalculationCacheMinOrderByAggregateInput
  }

  export type CalculationCacheScalarWhereWithAggregatesInput = {
    AND?: CalculationCacheScalarWhereWithAggregatesInput | CalculationCacheScalarWhereWithAggregatesInput[]
    OR?: CalculationCacheScalarWhereWithAggregatesInput[]
    NOT?: CalculationCacheScalarWhereWithAggregatesInput | CalculationCacheScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CalculationCache"> | string
    cacheKey?: StringWithAggregatesFilter<"CalculationCache"> | string
    data?: StringWithAggregatesFilter<"CalculationCache"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"CalculationCache"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"CalculationCache"> | Date | string
  }

  export type UserSettingsWhereInput = {
    AND?: UserSettingsWhereInput | UserSettingsWhereInput[]
    OR?: UserSettingsWhereInput[]
    NOT?: UserSettingsWhereInput | UserSettingsWhereInput[]
    id?: StringFilter<"UserSettings"> | string
    userId?: StringFilter<"UserSettings"> | string
    theme?: StringFilter<"UserSettings"> | string
    currency?: StringFilter<"UserSettings"> | string
    locale?: StringFilter<"UserSettings"> | string
    timezone?: StringFilter<"UserSettings"> | string
    notifications?: StringNullableFilter<"UserSettings"> | string | null
    privacy?: StringNullableFilter<"UserSettings"> | string | null
    features?: StringNullableFilter<"UserSettings"> | string | null
    createdAt?: DateTimeFilter<"UserSettings"> | Date | string
    updatedAt?: DateTimeFilter<"UserSettings"> | Date | string
  }

  export type UserSettingsOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    theme?: SortOrder
    currency?: SortOrder
    locale?: SortOrder
    timezone?: SortOrder
    notifications?: SortOrderInput | SortOrder
    privacy?: SortOrderInput | SortOrder
    features?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSettingsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: UserSettingsWhereInput | UserSettingsWhereInput[]
    OR?: UserSettingsWhereInput[]
    NOT?: UserSettingsWhereInput | UserSettingsWhereInput[]
    theme?: StringFilter<"UserSettings"> | string
    currency?: StringFilter<"UserSettings"> | string
    locale?: StringFilter<"UserSettings"> | string
    timezone?: StringFilter<"UserSettings"> | string
    notifications?: StringNullableFilter<"UserSettings"> | string | null
    privacy?: StringNullableFilter<"UserSettings"> | string | null
    features?: StringNullableFilter<"UserSettings"> | string | null
    createdAt?: DateTimeFilter<"UserSettings"> | Date | string
    updatedAt?: DateTimeFilter<"UserSettings"> | Date | string
  }, "id" | "userId">

  export type UserSettingsOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    theme?: SortOrder
    currency?: SortOrder
    locale?: SortOrder
    timezone?: SortOrder
    notifications?: SortOrderInput | SortOrder
    privacy?: SortOrderInput | SortOrder
    features?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserSettingsCountOrderByAggregateInput
    _max?: UserSettingsMaxOrderByAggregateInput
    _min?: UserSettingsMinOrderByAggregateInput
  }

  export type UserSettingsScalarWhereWithAggregatesInput = {
    AND?: UserSettingsScalarWhereWithAggregatesInput | UserSettingsScalarWhereWithAggregatesInput[]
    OR?: UserSettingsScalarWhereWithAggregatesInput[]
    NOT?: UserSettingsScalarWhereWithAggregatesInput | UserSettingsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserSettings"> | string
    userId?: StringWithAggregatesFilter<"UserSettings"> | string
    theme?: StringWithAggregatesFilter<"UserSettings"> | string
    currency?: StringWithAggregatesFilter<"UserSettings"> | string
    locale?: StringWithAggregatesFilter<"UserSettings"> | string
    timezone?: StringWithAggregatesFilter<"UserSettings"> | string
    notifications?: StringNullableWithAggregatesFilter<"UserSettings"> | string | null
    privacy?: StringNullableWithAggregatesFilter<"UserSettings"> | string | null
    features?: StringNullableWithAggregatesFilter<"UserSettings"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"UserSettings"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserSettings"> | Date | string
  }

  export type TaxProfileWhereInput = {
    AND?: TaxProfileWhereInput | TaxProfileWhereInput[]
    OR?: TaxProfileWhereInput[]
    NOT?: TaxProfileWhereInput | TaxProfileWhereInput[]
    id?: StringFilter<"TaxProfile"> | string
    userId?: StringFilter<"TaxProfile"> | string
    state?: StringNullableFilter<"TaxProfile"> | string | null
    filingStatus?: StringFilter<"TaxProfile"> | string
    federalBracket?: FloatFilter<"TaxProfile"> | number
    stateBracket?: FloatFilter<"TaxProfile"> | number
    qualifiedDividendRate?: FloatFilter<"TaxProfile"> | number
    capitalGainsRate?: FloatFilter<"TaxProfile"> | number
    effectiveRate?: FloatFilter<"TaxProfile"> | number
    marginalRate?: FloatFilter<"TaxProfile"> | number
    taxYear?: IntFilter<"TaxProfile"> | number
    createdAt?: DateTimeFilter<"TaxProfile"> | Date | string
    updatedAt?: DateTimeFilter<"TaxProfile"> | Date | string
  }

  export type TaxProfileOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    state?: SortOrderInput | SortOrder
    filingStatus?: SortOrder
    federalBracket?: SortOrder
    stateBracket?: SortOrder
    qualifiedDividendRate?: SortOrder
    capitalGainsRate?: SortOrder
    effectiveRate?: SortOrder
    marginalRate?: SortOrder
    taxYear?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TaxProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: TaxProfileWhereInput | TaxProfileWhereInput[]
    OR?: TaxProfileWhereInput[]
    NOT?: TaxProfileWhereInput | TaxProfileWhereInput[]
    state?: StringNullableFilter<"TaxProfile"> | string | null
    filingStatus?: StringFilter<"TaxProfile"> | string
    federalBracket?: FloatFilter<"TaxProfile"> | number
    stateBracket?: FloatFilter<"TaxProfile"> | number
    qualifiedDividendRate?: FloatFilter<"TaxProfile"> | number
    capitalGainsRate?: FloatFilter<"TaxProfile"> | number
    effectiveRate?: FloatFilter<"TaxProfile"> | number
    marginalRate?: FloatFilter<"TaxProfile"> | number
    taxYear?: IntFilter<"TaxProfile"> | number
    createdAt?: DateTimeFilter<"TaxProfile"> | Date | string
    updatedAt?: DateTimeFilter<"TaxProfile"> | Date | string
  }, "id" | "userId">

  export type TaxProfileOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    state?: SortOrderInput | SortOrder
    filingStatus?: SortOrder
    federalBracket?: SortOrder
    stateBracket?: SortOrder
    qualifiedDividendRate?: SortOrder
    capitalGainsRate?: SortOrder
    effectiveRate?: SortOrder
    marginalRate?: SortOrder
    taxYear?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TaxProfileCountOrderByAggregateInput
    _avg?: TaxProfileAvgOrderByAggregateInput
    _max?: TaxProfileMaxOrderByAggregateInput
    _min?: TaxProfileMinOrderByAggregateInput
    _sum?: TaxProfileSumOrderByAggregateInput
  }

  export type TaxProfileScalarWhereWithAggregatesInput = {
    AND?: TaxProfileScalarWhereWithAggregatesInput | TaxProfileScalarWhereWithAggregatesInput[]
    OR?: TaxProfileScalarWhereWithAggregatesInput[]
    NOT?: TaxProfileScalarWhereWithAggregatesInput | TaxProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TaxProfile"> | string
    userId?: StringWithAggregatesFilter<"TaxProfile"> | string
    state?: StringNullableWithAggregatesFilter<"TaxProfile"> | string | null
    filingStatus?: StringWithAggregatesFilter<"TaxProfile"> | string
    federalBracket?: FloatWithAggregatesFilter<"TaxProfile"> | number
    stateBracket?: FloatWithAggregatesFilter<"TaxProfile"> | number
    qualifiedDividendRate?: FloatWithAggregatesFilter<"TaxProfile"> | number
    capitalGainsRate?: FloatWithAggregatesFilter<"TaxProfile"> | number
    effectiveRate?: FloatWithAggregatesFilter<"TaxProfile"> | number
    marginalRate?: FloatWithAggregatesFilter<"TaxProfile"> | number
    taxYear?: IntWithAggregatesFilter<"TaxProfile"> | number
    createdAt?: DateTimeWithAggregatesFilter<"TaxProfile"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TaxProfile"> | Date | string
  }

  export type FinancialGoalWhereInput = {
    AND?: FinancialGoalWhereInput | FinancialGoalWhereInput[]
    OR?: FinancialGoalWhereInput[]
    NOT?: FinancialGoalWhereInput | FinancialGoalWhereInput[]
    id?: StringFilter<"FinancialGoal"> | string
    userId?: StringFilter<"FinancialGoal"> | string
    name?: StringFilter<"FinancialGoal"> | string
    description?: StringNullableFilter<"FinancialGoal"> | string | null
    targetAmount?: FloatFilter<"FinancialGoal"> | number
    currentAmount?: FloatFilter<"FinancialGoal"> | number
    targetDate?: DateTimeNullableFilter<"FinancialGoal"> | Date | string | null
    category?: StringFilter<"FinancialGoal"> | string
    priority?: IntFilter<"FinancialGoal"> | number
    isActive?: BoolFilter<"FinancialGoal"> | boolean
    createdAt?: DateTimeFilter<"FinancialGoal"> | Date | string
    updatedAt?: DateTimeFilter<"FinancialGoal"> | Date | string
  }

  export type FinancialGoalOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    targetAmount?: SortOrder
    currentAmount?: SortOrder
    targetDate?: SortOrderInput | SortOrder
    category?: SortOrder
    priority?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FinancialGoalWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FinancialGoalWhereInput | FinancialGoalWhereInput[]
    OR?: FinancialGoalWhereInput[]
    NOT?: FinancialGoalWhereInput | FinancialGoalWhereInput[]
    userId?: StringFilter<"FinancialGoal"> | string
    name?: StringFilter<"FinancialGoal"> | string
    description?: StringNullableFilter<"FinancialGoal"> | string | null
    targetAmount?: FloatFilter<"FinancialGoal"> | number
    currentAmount?: FloatFilter<"FinancialGoal"> | number
    targetDate?: DateTimeNullableFilter<"FinancialGoal"> | Date | string | null
    category?: StringFilter<"FinancialGoal"> | string
    priority?: IntFilter<"FinancialGoal"> | number
    isActive?: BoolFilter<"FinancialGoal"> | boolean
    createdAt?: DateTimeFilter<"FinancialGoal"> | Date | string
    updatedAt?: DateTimeFilter<"FinancialGoal"> | Date | string
  }, "id">

  export type FinancialGoalOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    targetAmount?: SortOrder
    currentAmount?: SortOrder
    targetDate?: SortOrderInput | SortOrder
    category?: SortOrder
    priority?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FinancialGoalCountOrderByAggregateInput
    _avg?: FinancialGoalAvgOrderByAggregateInput
    _max?: FinancialGoalMaxOrderByAggregateInput
    _min?: FinancialGoalMinOrderByAggregateInput
    _sum?: FinancialGoalSumOrderByAggregateInput
  }

  export type FinancialGoalScalarWhereWithAggregatesInput = {
    AND?: FinancialGoalScalarWhereWithAggregatesInput | FinancialGoalScalarWhereWithAggregatesInput[]
    OR?: FinancialGoalScalarWhereWithAggregatesInput[]
    NOT?: FinancialGoalScalarWhereWithAggregatesInput | FinancialGoalScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FinancialGoal"> | string
    userId?: StringWithAggregatesFilter<"FinancialGoal"> | string
    name?: StringWithAggregatesFilter<"FinancialGoal"> | string
    description?: StringNullableWithAggregatesFilter<"FinancialGoal"> | string | null
    targetAmount?: FloatWithAggregatesFilter<"FinancialGoal"> | number
    currentAmount?: FloatWithAggregatesFilter<"FinancialGoal"> | number
    targetDate?: DateTimeNullableWithAggregatesFilter<"FinancialGoal"> | Date | string | null
    category?: StringWithAggregatesFilter<"FinancialGoal"> | string
    priority?: IntWithAggregatesFilter<"FinancialGoal"> | number
    isActive?: BoolWithAggregatesFilter<"FinancialGoal"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"FinancialGoal"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FinancialGoal"> | Date | string
  }

  export type PerformanceSnapshotWhereInput = {
    AND?: PerformanceSnapshotWhereInput | PerformanceSnapshotWhereInput[]
    OR?: PerformanceSnapshotWhereInput[]
    NOT?: PerformanceSnapshotWhereInput | PerformanceSnapshotWhereInput[]
    id?: StringFilter<"PerformanceSnapshot"> | string
    userId?: StringFilter<"PerformanceSnapshot"> | string
    date?: DateTimeFilter<"PerformanceSnapshot"> | Date | string
    totalValue?: FloatFilter<"PerformanceSnapshot"> | number
    totalCostBasis?: FloatFilter<"PerformanceSnapshot"> | number
    totalGainLoss?: FloatFilter<"PerformanceSnapshot"> | number
    totalReturn?: FloatFilter<"PerformanceSnapshot"> | number
    dividendIncome?: FloatFilter<"PerformanceSnapshot"> | number
    spyPrice?: FloatNullableFilter<"PerformanceSnapshot"> | number | null
    spyReturn?: FloatNullableFilter<"PerformanceSnapshot"> | number | null
    monthlyIncome?: FloatFilter<"PerformanceSnapshot"> | number
    monthlyExpenses?: FloatFilter<"PerformanceSnapshot"> | number
    netIncome?: FloatFilter<"PerformanceSnapshot"> | number
    createdAt?: DateTimeFilter<"PerformanceSnapshot"> | Date | string
  }

  export type PerformanceSnapshotOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    totalValue?: SortOrder
    totalCostBasis?: SortOrder
    totalGainLoss?: SortOrder
    totalReturn?: SortOrder
    dividendIncome?: SortOrder
    spyPrice?: SortOrderInput | SortOrder
    spyReturn?: SortOrderInput | SortOrder
    monthlyIncome?: SortOrder
    monthlyExpenses?: SortOrder
    netIncome?: SortOrder
    createdAt?: SortOrder
  }

  export type PerformanceSnapshotWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PerformanceSnapshotWhereInput | PerformanceSnapshotWhereInput[]
    OR?: PerformanceSnapshotWhereInput[]
    NOT?: PerformanceSnapshotWhereInput | PerformanceSnapshotWhereInput[]
    userId?: StringFilter<"PerformanceSnapshot"> | string
    date?: DateTimeFilter<"PerformanceSnapshot"> | Date | string
    totalValue?: FloatFilter<"PerformanceSnapshot"> | number
    totalCostBasis?: FloatFilter<"PerformanceSnapshot"> | number
    totalGainLoss?: FloatFilter<"PerformanceSnapshot"> | number
    totalReturn?: FloatFilter<"PerformanceSnapshot"> | number
    dividendIncome?: FloatFilter<"PerformanceSnapshot"> | number
    spyPrice?: FloatNullableFilter<"PerformanceSnapshot"> | number | null
    spyReturn?: FloatNullableFilter<"PerformanceSnapshot"> | number | null
    monthlyIncome?: FloatFilter<"PerformanceSnapshot"> | number
    monthlyExpenses?: FloatFilter<"PerformanceSnapshot"> | number
    netIncome?: FloatFilter<"PerformanceSnapshot"> | number
    createdAt?: DateTimeFilter<"PerformanceSnapshot"> | Date | string
  }, "id">

  export type PerformanceSnapshotOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    totalValue?: SortOrder
    totalCostBasis?: SortOrder
    totalGainLoss?: SortOrder
    totalReturn?: SortOrder
    dividendIncome?: SortOrder
    spyPrice?: SortOrderInput | SortOrder
    spyReturn?: SortOrderInput | SortOrder
    monthlyIncome?: SortOrder
    monthlyExpenses?: SortOrder
    netIncome?: SortOrder
    createdAt?: SortOrder
    _count?: PerformanceSnapshotCountOrderByAggregateInput
    _avg?: PerformanceSnapshotAvgOrderByAggregateInput
    _max?: PerformanceSnapshotMaxOrderByAggregateInput
    _min?: PerformanceSnapshotMinOrderByAggregateInput
    _sum?: PerformanceSnapshotSumOrderByAggregateInput
  }

  export type PerformanceSnapshotScalarWhereWithAggregatesInput = {
    AND?: PerformanceSnapshotScalarWhereWithAggregatesInput | PerformanceSnapshotScalarWhereWithAggregatesInput[]
    OR?: PerformanceSnapshotScalarWhereWithAggregatesInput[]
    NOT?: PerformanceSnapshotScalarWhereWithAggregatesInput | PerformanceSnapshotScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PerformanceSnapshot"> | string
    userId?: StringWithAggregatesFilter<"PerformanceSnapshot"> | string
    date?: DateTimeWithAggregatesFilter<"PerformanceSnapshot"> | Date | string
    totalValue?: FloatWithAggregatesFilter<"PerformanceSnapshot"> | number
    totalCostBasis?: FloatWithAggregatesFilter<"PerformanceSnapshot"> | number
    totalGainLoss?: FloatWithAggregatesFilter<"PerformanceSnapshot"> | number
    totalReturn?: FloatWithAggregatesFilter<"PerformanceSnapshot"> | number
    dividendIncome?: FloatWithAggregatesFilter<"PerformanceSnapshot"> | number
    spyPrice?: FloatNullableWithAggregatesFilter<"PerformanceSnapshot"> | number | null
    spyReturn?: FloatNullableWithAggregatesFilter<"PerformanceSnapshot"> | number | null
    monthlyIncome?: FloatWithAggregatesFilter<"PerformanceSnapshot"> | number
    monthlyExpenses?: FloatWithAggregatesFilter<"PerformanceSnapshot"> | number
    netIncome?: FloatWithAggregatesFilter<"PerformanceSnapshot"> | number
    createdAt?: DateTimeWithAggregatesFilter<"PerformanceSnapshot"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    passwordHash: string
    settings?: string | null
    taxProfile?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    portfolios?: PortfolioCreateNestedManyWithoutUserInput
    incomes?: IncomeCreateNestedManyWithoutUserInput
    expenses?: ExpenseCreateNestedManyWithoutUserInput
    transactions?: TransactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    passwordHash: string
    settings?: string | null
    taxProfile?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    portfolios?: PortfolioUncheckedCreateNestedManyWithoutUserInput
    incomes?: IncomeUncheckedCreateNestedManyWithoutUserInput
    expenses?: ExpenseUncheckedCreateNestedManyWithoutUserInput
    transactions?: TransactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    settings?: NullableStringFieldUpdateOperationsInput | string | null
    taxProfile?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    portfolios?: PortfolioUpdateManyWithoutUserNestedInput
    incomes?: IncomeUpdateManyWithoutUserNestedInput
    expenses?: ExpenseUpdateManyWithoutUserNestedInput
    transactions?: TransactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    settings?: NullableStringFieldUpdateOperationsInput | string | null
    taxProfile?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    portfolios?: PortfolioUncheckedUpdateManyWithoutUserNestedInput
    incomes?: IncomeUncheckedUpdateManyWithoutUserNestedInput
    expenses?: ExpenseUncheckedUpdateManyWithoutUserNestedInput
    transactions?: TransactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    passwordHash: string
    settings?: string | null
    taxProfile?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    settings?: NullableStringFieldUpdateOperationsInput | string | null
    taxProfile?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    settings?: NullableStringFieldUpdateOperationsInput | string | null
    taxProfile?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortfolioCreateInput = {
    id?: string
    name: string
    type: string
    institution?: string | null
    isPrimary?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutPortfoliosInput
    holdings?: HoldingCreateNestedManyWithoutPortfolioInput
  }

  export type PortfolioUncheckedCreateInput = {
    id?: string
    userId: string
    name: string
    type: string
    institution?: string | null
    isPrimary?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    holdings?: HoldingUncheckedCreateNestedManyWithoutPortfolioInput
  }

  export type PortfolioUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPortfoliosNestedInput
    holdings?: HoldingUpdateManyWithoutPortfolioNestedInput
  }

  export type PortfolioUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    holdings?: HoldingUncheckedUpdateManyWithoutPortfolioNestedInput
  }

  export type PortfolioCreateManyInput = {
    id?: string
    userId: string
    name: string
    type: string
    institution?: string | null
    isPrimary?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PortfolioUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortfolioUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HoldingCreateInput = {
    id?: string
    ticker: string
    shares: number
    costBasis: number
    purchaseDate: Date | string
    currentPrice?: number | null
    dividendYield?: number | null
    sector?: string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    portfolio: PortfolioCreateNestedOneWithoutHoldingsInput
  }

  export type HoldingUncheckedCreateInput = {
    id?: string
    portfolioId: string
    ticker: string
    shares: number
    costBasis: number
    purchaseDate: Date | string
    currentPrice?: number | null
    dividendYield?: number | null
    sector?: string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type HoldingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticker?: StringFieldUpdateOperationsInput | string
    shares?: FloatFieldUpdateOperationsInput | number
    costBasis?: FloatFieldUpdateOperationsInput | number
    purchaseDate?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    dividendYield?: NullableFloatFieldUpdateOperationsInput | number | null
    sector?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    portfolio?: PortfolioUpdateOneRequiredWithoutHoldingsNestedInput
  }

  export type HoldingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    portfolioId?: StringFieldUpdateOperationsInput | string
    ticker?: StringFieldUpdateOperationsInput | string
    shares?: FloatFieldUpdateOperationsInput | number
    costBasis?: FloatFieldUpdateOperationsInput | number
    purchaseDate?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    dividendYield?: NullableFloatFieldUpdateOperationsInput | number | null
    sector?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HoldingCreateManyInput = {
    id?: string
    portfolioId: string
    ticker: string
    shares: number
    costBasis: number
    purchaseDate: Date | string
    currentPrice?: number | null
    dividendYield?: number | null
    sector?: string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type HoldingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticker?: StringFieldUpdateOperationsInput | string
    shares?: FloatFieldUpdateOperationsInput | number
    costBasis?: FloatFieldUpdateOperationsInput | number
    purchaseDate?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    dividendYield?: NullableFloatFieldUpdateOperationsInput | number | null
    sector?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HoldingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    portfolioId?: StringFieldUpdateOperationsInput | string
    ticker?: StringFieldUpdateOperationsInput | string
    shares?: FloatFieldUpdateOperationsInput | number
    costBasis?: FloatFieldUpdateOperationsInput | number
    purchaseDate?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    dividendYield?: NullableFloatFieldUpdateOperationsInput | number | null
    sector?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionCreateInput = {
    id?: string
    portfolioId?: string | null
    ticker: string
    type: string
    shares?: number | null
    amount: number
    date: Date | string
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutTransactionsInput
  }

  export type TransactionUncheckedCreateInput = {
    id?: string
    userId: string
    portfolioId?: string | null
    ticker: string
    type: string
    shares?: number | null
    amount: number
    date: Date | string
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
  }

  export type TransactionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    portfolioId?: NullableStringFieldUpdateOperationsInput | string | null
    ticker?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    shares?: NullableFloatFieldUpdateOperationsInput | number | null
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutTransactionsNestedInput
  }

  export type TransactionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    portfolioId?: NullableStringFieldUpdateOperationsInput | string | null
    ticker?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    shares?: NullableFloatFieldUpdateOperationsInput | number | null
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionCreateManyInput = {
    id?: string
    userId: string
    portfolioId?: string | null
    ticker: string
    type: string
    shares?: number | null
    amount: number
    date: Date | string
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
  }

  export type TransactionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    portfolioId?: NullableStringFieldUpdateOperationsInput | string | null
    ticker?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    shares?: NullableFloatFieldUpdateOperationsInput | number | null
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    portfolioId?: NullableStringFieldUpdateOperationsInput | string | null
    ticker?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    shares?: NullableFloatFieldUpdateOperationsInput | number | null
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IncomeCreateInput = {
    id?: string
    source: string
    category: string
    amount: number
    date: Date | string
    recurring?: boolean
    frequency?: string | null
    taxable?: boolean
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutIncomesInput
  }

  export type IncomeUncheckedCreateInput = {
    id?: string
    userId: string
    source: string
    category: string
    amount: number
    date: Date | string
    recurring?: boolean
    frequency?: string | null
    taxable?: boolean
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
  }

  export type IncomeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    recurring?: BoolFieldUpdateOperationsInput | boolean
    frequency?: NullableStringFieldUpdateOperationsInput | string | null
    taxable?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutIncomesNestedInput
  }

  export type IncomeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    recurring?: BoolFieldUpdateOperationsInput | boolean
    frequency?: NullableStringFieldUpdateOperationsInput | string | null
    taxable?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IncomeCreateManyInput = {
    id?: string
    userId: string
    source: string
    category: string
    amount: number
    date: Date | string
    recurring?: boolean
    frequency?: string | null
    taxable?: boolean
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
  }

  export type IncomeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    recurring?: BoolFieldUpdateOperationsInput | boolean
    frequency?: NullableStringFieldUpdateOperationsInput | string | null
    taxable?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IncomeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    recurring?: BoolFieldUpdateOperationsInput | boolean
    frequency?: NullableStringFieldUpdateOperationsInput | string | null
    taxable?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExpenseCreateInput = {
    id?: string
    category: string
    merchant?: string | null
    amount: number
    date: Date | string
    recurring?: boolean
    frequency?: string | null
    priority?: number
    essential?: boolean
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutExpensesInput
  }

  export type ExpenseUncheckedCreateInput = {
    id?: string
    userId: string
    category: string
    merchant?: string | null
    amount: number
    date: Date | string
    recurring?: boolean
    frequency?: string | null
    priority?: number
    essential?: boolean
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
  }

  export type ExpenseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    merchant?: NullableStringFieldUpdateOperationsInput | string | null
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    recurring?: BoolFieldUpdateOperationsInput | boolean
    frequency?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: IntFieldUpdateOperationsInput | number
    essential?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutExpensesNestedInput
  }

  export type ExpenseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    merchant?: NullableStringFieldUpdateOperationsInput | string | null
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    recurring?: BoolFieldUpdateOperationsInput | boolean
    frequency?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: IntFieldUpdateOperationsInput | number
    essential?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExpenseCreateManyInput = {
    id?: string
    userId: string
    category: string
    merchant?: string | null
    amount: number
    date: Date | string
    recurring?: boolean
    frequency?: string | null
    priority?: number
    essential?: boolean
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
  }

  export type ExpenseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    merchant?: NullableStringFieldUpdateOperationsInput | string | null
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    recurring?: BoolFieldUpdateOperationsInput | boolean
    frequency?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: IntFieldUpdateOperationsInput | number
    essential?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExpenseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    merchant?: NullableStringFieldUpdateOperationsInput | string | null
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    recurring?: BoolFieldUpdateOperationsInput | boolean
    frequency?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: IntFieldUpdateOperationsInput | number
    essential?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockPriceCreateInput = {
    id?: string
    ticker: string
    date: Date | string
    open: number
    high: number
    low: number
    close: number
    volume: number
    adjustedClose?: number | null
    createdAt?: Date | string
  }

  export type StockPriceUncheckedCreateInput = {
    id?: string
    ticker: string
    date: Date | string
    open: number
    high: number
    low: number
    close: number
    volume: number
    adjustedClose?: number | null
    createdAt?: Date | string
  }

  export type StockPriceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticker?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    open?: FloatFieldUpdateOperationsInput | number
    high?: FloatFieldUpdateOperationsInput | number
    low?: FloatFieldUpdateOperationsInput | number
    close?: FloatFieldUpdateOperationsInput | number
    volume?: IntFieldUpdateOperationsInput | number
    adjustedClose?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockPriceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticker?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    open?: FloatFieldUpdateOperationsInput | number
    high?: FloatFieldUpdateOperationsInput | number
    low?: FloatFieldUpdateOperationsInput | number
    close?: FloatFieldUpdateOperationsInput | number
    volume?: IntFieldUpdateOperationsInput | number
    adjustedClose?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockPriceCreateManyInput = {
    id?: string
    ticker: string
    date: Date | string
    open: number
    high: number
    low: number
    close: number
    volume: number
    adjustedClose?: number | null
    createdAt?: Date | string
  }

  export type StockPriceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticker?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    open?: FloatFieldUpdateOperationsInput | number
    high?: FloatFieldUpdateOperationsInput | number
    low?: FloatFieldUpdateOperationsInput | number
    close?: FloatFieldUpdateOperationsInput | number
    volume?: IntFieldUpdateOperationsInput | number
    adjustedClose?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockPriceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticker?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    open?: FloatFieldUpdateOperationsInput | number
    high?: FloatFieldUpdateOperationsInput | number
    low?: FloatFieldUpdateOperationsInput | number
    close?: FloatFieldUpdateOperationsInput | number
    volume?: IntFieldUpdateOperationsInput | number
    adjustedClose?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DividendScheduleCreateInput = {
    id?: string
    ticker: string
    exDate: Date | string
    payDate: Date | string
    recordDate?: Date | string | null
    amount: number
    frequency: string
    paymentType: string
    currency?: string
    createdAt?: Date | string
  }

  export type DividendScheduleUncheckedCreateInput = {
    id?: string
    ticker: string
    exDate: Date | string
    payDate: Date | string
    recordDate?: Date | string | null
    amount: number
    frequency: string
    paymentType: string
    currency?: string
    createdAt?: Date | string
  }

  export type DividendScheduleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticker?: StringFieldUpdateOperationsInput | string
    exDate?: DateTimeFieldUpdateOperationsInput | Date | string
    payDate?: DateTimeFieldUpdateOperationsInput | Date | string
    recordDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    amount?: FloatFieldUpdateOperationsInput | number
    frequency?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DividendScheduleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticker?: StringFieldUpdateOperationsInput | string
    exDate?: DateTimeFieldUpdateOperationsInput | Date | string
    payDate?: DateTimeFieldUpdateOperationsInput | Date | string
    recordDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    amount?: FloatFieldUpdateOperationsInput | number
    frequency?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DividendScheduleCreateManyInput = {
    id?: string
    ticker: string
    exDate: Date | string
    payDate: Date | string
    recordDate?: Date | string | null
    amount: number
    frequency: string
    paymentType: string
    currency?: string
    createdAt?: Date | string
  }

  export type DividendScheduleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticker?: StringFieldUpdateOperationsInput | string
    exDate?: DateTimeFieldUpdateOperationsInput | Date | string
    payDate?: DateTimeFieldUpdateOperationsInput | Date | string
    recordDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    amount?: FloatFieldUpdateOperationsInput | number
    frequency?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DividendScheduleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticker?: StringFieldUpdateOperationsInput | string
    exDate?: DateTimeFieldUpdateOperationsInput | Date | string
    payDate?: DateTimeFieldUpdateOperationsInput | Date | string
    recordDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    amount?: FloatFieldUpdateOperationsInput | number
    frequency?: StringFieldUpdateOperationsInput | string
    paymentType?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CalculationCacheCreateInput = {
    id?: string
    cacheKey: string
    data: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type CalculationCacheUncheckedCreateInput = {
    id?: string
    cacheKey: string
    data: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type CalculationCacheUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    cacheKey?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CalculationCacheUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    cacheKey?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CalculationCacheCreateManyInput = {
    id?: string
    cacheKey: string
    data: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type CalculationCacheUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    cacheKey?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CalculationCacheUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    cacheKey?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSettingsCreateInput = {
    id?: string
    userId: string
    theme?: string
    currency?: string
    locale?: string
    timezone?: string
    notifications?: string | null
    privacy?: string | null
    features?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserSettingsUncheckedCreateInput = {
    id?: string
    userId: string
    theme?: string
    currency?: string
    locale?: string
    timezone?: string
    notifications?: string | null
    privacy?: string | null
    features?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserSettingsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    theme?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    locale?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    notifications?: NullableStringFieldUpdateOperationsInput | string | null
    privacy?: NullableStringFieldUpdateOperationsInput | string | null
    features?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSettingsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    theme?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    locale?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    notifications?: NullableStringFieldUpdateOperationsInput | string | null
    privacy?: NullableStringFieldUpdateOperationsInput | string | null
    features?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSettingsCreateManyInput = {
    id?: string
    userId: string
    theme?: string
    currency?: string
    locale?: string
    timezone?: string
    notifications?: string | null
    privacy?: string | null
    features?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserSettingsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    theme?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    locale?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    notifications?: NullableStringFieldUpdateOperationsInput | string | null
    privacy?: NullableStringFieldUpdateOperationsInput | string | null
    features?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSettingsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    theme?: StringFieldUpdateOperationsInput | string
    currency?: StringFieldUpdateOperationsInput | string
    locale?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    notifications?: NullableStringFieldUpdateOperationsInput | string | null
    privacy?: NullableStringFieldUpdateOperationsInput | string | null
    features?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaxProfileCreateInput = {
    id?: string
    userId: string
    state?: string | null
    filingStatus?: string
    federalBracket?: number
    stateBracket?: number
    qualifiedDividendRate?: number
    capitalGainsRate?: number
    effectiveRate?: number
    marginalRate?: number
    taxYear?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TaxProfileUncheckedCreateInput = {
    id?: string
    userId: string
    state?: string | null
    filingStatus?: string
    federalBracket?: number
    stateBracket?: number
    qualifiedDividendRate?: number
    capitalGainsRate?: number
    effectiveRate?: number
    marginalRate?: number
    taxYear?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TaxProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    state?: NullableStringFieldUpdateOperationsInput | string | null
    filingStatus?: StringFieldUpdateOperationsInput | string
    federalBracket?: FloatFieldUpdateOperationsInput | number
    stateBracket?: FloatFieldUpdateOperationsInput | number
    qualifiedDividendRate?: FloatFieldUpdateOperationsInput | number
    capitalGainsRate?: FloatFieldUpdateOperationsInput | number
    effectiveRate?: FloatFieldUpdateOperationsInput | number
    marginalRate?: FloatFieldUpdateOperationsInput | number
    taxYear?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaxProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    state?: NullableStringFieldUpdateOperationsInput | string | null
    filingStatus?: StringFieldUpdateOperationsInput | string
    federalBracket?: FloatFieldUpdateOperationsInput | number
    stateBracket?: FloatFieldUpdateOperationsInput | number
    qualifiedDividendRate?: FloatFieldUpdateOperationsInput | number
    capitalGainsRate?: FloatFieldUpdateOperationsInput | number
    effectiveRate?: FloatFieldUpdateOperationsInput | number
    marginalRate?: FloatFieldUpdateOperationsInput | number
    taxYear?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaxProfileCreateManyInput = {
    id?: string
    userId: string
    state?: string | null
    filingStatus?: string
    federalBracket?: number
    stateBracket?: number
    qualifiedDividendRate?: number
    capitalGainsRate?: number
    effectiveRate?: number
    marginalRate?: number
    taxYear?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TaxProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    state?: NullableStringFieldUpdateOperationsInput | string | null
    filingStatus?: StringFieldUpdateOperationsInput | string
    federalBracket?: FloatFieldUpdateOperationsInput | number
    stateBracket?: FloatFieldUpdateOperationsInput | number
    qualifiedDividendRate?: FloatFieldUpdateOperationsInput | number
    capitalGainsRate?: FloatFieldUpdateOperationsInput | number
    effectiveRate?: FloatFieldUpdateOperationsInput | number
    marginalRate?: FloatFieldUpdateOperationsInput | number
    taxYear?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaxProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    state?: NullableStringFieldUpdateOperationsInput | string | null
    filingStatus?: StringFieldUpdateOperationsInput | string
    federalBracket?: FloatFieldUpdateOperationsInput | number
    stateBracket?: FloatFieldUpdateOperationsInput | number
    qualifiedDividendRate?: FloatFieldUpdateOperationsInput | number
    capitalGainsRate?: FloatFieldUpdateOperationsInput | number
    effectiveRate?: FloatFieldUpdateOperationsInput | number
    marginalRate?: FloatFieldUpdateOperationsInput | number
    taxYear?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FinancialGoalCreateInput = {
    id?: string
    userId: string
    name: string
    description?: string | null
    targetAmount: number
    currentAmount?: number
    targetDate?: Date | string | null
    category: string
    priority?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FinancialGoalUncheckedCreateInput = {
    id?: string
    userId: string
    name: string
    description?: string | null
    targetAmount: number
    currentAmount?: number
    targetDate?: Date | string | null
    category: string
    priority?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FinancialGoalUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: FloatFieldUpdateOperationsInput | number
    currentAmount?: FloatFieldUpdateOperationsInput | number
    targetDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    category?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FinancialGoalUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: FloatFieldUpdateOperationsInput | number
    currentAmount?: FloatFieldUpdateOperationsInput | number
    targetDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    category?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FinancialGoalCreateManyInput = {
    id?: string
    userId: string
    name: string
    description?: string | null
    targetAmount: number
    currentAmount?: number
    targetDate?: Date | string | null
    category: string
    priority?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FinancialGoalUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: FloatFieldUpdateOperationsInput | number
    currentAmount?: FloatFieldUpdateOperationsInput | number
    targetDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    category?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FinancialGoalUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    targetAmount?: FloatFieldUpdateOperationsInput | number
    currentAmount?: FloatFieldUpdateOperationsInput | number
    targetDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    category?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PerformanceSnapshotCreateInput = {
    id?: string
    userId: string
    date: Date | string
    totalValue: number
    totalCostBasis: number
    totalGainLoss: number
    totalReturn: number
    dividendIncome: number
    spyPrice?: number | null
    spyReturn?: number | null
    monthlyIncome: number
    monthlyExpenses: number
    netIncome: number
    createdAt?: Date | string
  }

  export type PerformanceSnapshotUncheckedCreateInput = {
    id?: string
    userId: string
    date: Date | string
    totalValue: number
    totalCostBasis: number
    totalGainLoss: number
    totalReturn: number
    dividendIncome: number
    spyPrice?: number | null
    spyReturn?: number | null
    monthlyIncome: number
    monthlyExpenses: number
    netIncome: number
    createdAt?: Date | string
  }

  export type PerformanceSnapshotUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalValue?: FloatFieldUpdateOperationsInput | number
    totalCostBasis?: FloatFieldUpdateOperationsInput | number
    totalGainLoss?: FloatFieldUpdateOperationsInput | number
    totalReturn?: FloatFieldUpdateOperationsInput | number
    dividendIncome?: FloatFieldUpdateOperationsInput | number
    spyPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    spyReturn?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyIncome?: FloatFieldUpdateOperationsInput | number
    monthlyExpenses?: FloatFieldUpdateOperationsInput | number
    netIncome?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PerformanceSnapshotUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalValue?: FloatFieldUpdateOperationsInput | number
    totalCostBasis?: FloatFieldUpdateOperationsInput | number
    totalGainLoss?: FloatFieldUpdateOperationsInput | number
    totalReturn?: FloatFieldUpdateOperationsInput | number
    dividendIncome?: FloatFieldUpdateOperationsInput | number
    spyPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    spyReturn?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyIncome?: FloatFieldUpdateOperationsInput | number
    monthlyExpenses?: FloatFieldUpdateOperationsInput | number
    netIncome?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PerformanceSnapshotCreateManyInput = {
    id?: string
    userId: string
    date: Date | string
    totalValue: number
    totalCostBasis: number
    totalGainLoss: number
    totalReturn: number
    dividendIncome: number
    spyPrice?: number | null
    spyReturn?: number | null
    monthlyIncome: number
    monthlyExpenses: number
    netIncome: number
    createdAt?: Date | string
  }

  export type PerformanceSnapshotUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalValue?: FloatFieldUpdateOperationsInput | number
    totalCostBasis?: FloatFieldUpdateOperationsInput | number
    totalGainLoss?: FloatFieldUpdateOperationsInput | number
    totalReturn?: FloatFieldUpdateOperationsInput | number
    dividendIncome?: FloatFieldUpdateOperationsInput | number
    spyPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    spyReturn?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyIncome?: FloatFieldUpdateOperationsInput | number
    monthlyExpenses?: FloatFieldUpdateOperationsInput | number
    netIncome?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PerformanceSnapshotUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalValue?: FloatFieldUpdateOperationsInput | number
    totalCostBasis?: FloatFieldUpdateOperationsInput | number
    totalGainLoss?: FloatFieldUpdateOperationsInput | number
    totalReturn?: FloatFieldUpdateOperationsInput | number
    dividendIncome?: FloatFieldUpdateOperationsInput | number
    spyPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    spyReturn?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyIncome?: FloatFieldUpdateOperationsInput | number
    monthlyExpenses?: FloatFieldUpdateOperationsInput | number
    netIncome?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type PortfolioListRelationFilter = {
    every?: PortfolioWhereInput
    some?: PortfolioWhereInput
    none?: PortfolioWhereInput
  }

  export type IncomeListRelationFilter = {
    every?: IncomeWhereInput
    some?: IncomeWhereInput
    none?: IncomeWhereInput
  }

  export type ExpenseListRelationFilter = {
    every?: ExpenseWhereInput
    some?: ExpenseWhereInput
    none?: ExpenseWhereInput
  }

  export type TransactionListRelationFilter = {
    every?: TransactionWhereInput
    some?: TransactionWhereInput
    none?: TransactionWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type PortfolioOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type IncomeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ExpenseOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TransactionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    settings?: SortOrder
    taxProfile?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    settings?: SortOrder
    taxProfile?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    settings?: SortOrder
    taxProfile?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type HoldingListRelationFilter = {
    every?: HoldingWhereInput
    some?: HoldingWhereInput
    none?: HoldingWhereInput
  }

  export type HoldingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PortfolioCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    institution?: SortOrder
    isPrimary?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PortfolioMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    institution?: SortOrder
    isPrimary?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PortfolioMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    institution?: SortOrder
    isPrimary?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type PortfolioScalarRelationFilter = {
    is?: PortfolioWhereInput
    isNot?: PortfolioWhereInput
  }

  export type HoldingPortfolioIdTickerCompoundUniqueInput = {
    portfolioId: string
    ticker: string
  }

  export type HoldingCountOrderByAggregateInput = {
    id?: SortOrder
    portfolioId?: SortOrder
    ticker?: SortOrder
    shares?: SortOrder
    costBasis?: SortOrder
    purchaseDate?: SortOrder
    currentPrice?: SortOrder
    dividendYield?: SortOrder
    sector?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type HoldingAvgOrderByAggregateInput = {
    shares?: SortOrder
    costBasis?: SortOrder
    currentPrice?: SortOrder
    dividendYield?: SortOrder
  }

  export type HoldingMaxOrderByAggregateInput = {
    id?: SortOrder
    portfolioId?: SortOrder
    ticker?: SortOrder
    shares?: SortOrder
    costBasis?: SortOrder
    purchaseDate?: SortOrder
    currentPrice?: SortOrder
    dividendYield?: SortOrder
    sector?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type HoldingMinOrderByAggregateInput = {
    id?: SortOrder
    portfolioId?: SortOrder
    ticker?: SortOrder
    shares?: SortOrder
    costBasis?: SortOrder
    purchaseDate?: SortOrder
    currentPrice?: SortOrder
    dividendYield?: SortOrder
    sector?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type HoldingSumOrderByAggregateInput = {
    shares?: SortOrder
    costBasis?: SortOrder
    currentPrice?: SortOrder
    dividendYield?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type TransactionCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    portfolioId?: SortOrder
    ticker?: SortOrder
    type?: SortOrder
    shares?: SortOrder
    amount?: SortOrder
    date?: SortOrder
    notes?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type TransactionAvgOrderByAggregateInput = {
    shares?: SortOrder
    amount?: SortOrder
  }

  export type TransactionMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    portfolioId?: SortOrder
    ticker?: SortOrder
    type?: SortOrder
    shares?: SortOrder
    amount?: SortOrder
    date?: SortOrder
    notes?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type TransactionMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    portfolioId?: SortOrder
    ticker?: SortOrder
    type?: SortOrder
    shares?: SortOrder
    amount?: SortOrder
    date?: SortOrder
    notes?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type TransactionSumOrderByAggregateInput = {
    shares?: SortOrder
    amount?: SortOrder
  }

  export type IncomeCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    category?: SortOrder
    amount?: SortOrder
    date?: SortOrder
    recurring?: SortOrder
    frequency?: SortOrder
    taxable?: SortOrder
    notes?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type IncomeAvgOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type IncomeMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    category?: SortOrder
    amount?: SortOrder
    date?: SortOrder
    recurring?: SortOrder
    frequency?: SortOrder
    taxable?: SortOrder
    notes?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type IncomeMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    category?: SortOrder
    amount?: SortOrder
    date?: SortOrder
    recurring?: SortOrder
    frequency?: SortOrder
    taxable?: SortOrder
    notes?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type IncomeSumOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type ExpenseCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    category?: SortOrder
    merchant?: SortOrder
    amount?: SortOrder
    date?: SortOrder
    recurring?: SortOrder
    frequency?: SortOrder
    priority?: SortOrder
    essential?: SortOrder
    notes?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type ExpenseAvgOrderByAggregateInput = {
    amount?: SortOrder
    priority?: SortOrder
  }

  export type ExpenseMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    category?: SortOrder
    merchant?: SortOrder
    amount?: SortOrder
    date?: SortOrder
    recurring?: SortOrder
    frequency?: SortOrder
    priority?: SortOrder
    essential?: SortOrder
    notes?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type ExpenseMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    category?: SortOrder
    merchant?: SortOrder
    amount?: SortOrder
    date?: SortOrder
    recurring?: SortOrder
    frequency?: SortOrder
    priority?: SortOrder
    essential?: SortOrder
    notes?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type ExpenseSumOrderByAggregateInput = {
    amount?: SortOrder
    priority?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StockPriceTickerDateCompoundUniqueInput = {
    ticker: string
    date: Date | string
  }

  export type StockPriceCountOrderByAggregateInput = {
    id?: SortOrder
    ticker?: SortOrder
    date?: SortOrder
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    adjustedClose?: SortOrder
    createdAt?: SortOrder
  }

  export type StockPriceAvgOrderByAggregateInput = {
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    adjustedClose?: SortOrder
  }

  export type StockPriceMaxOrderByAggregateInput = {
    id?: SortOrder
    ticker?: SortOrder
    date?: SortOrder
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    adjustedClose?: SortOrder
    createdAt?: SortOrder
  }

  export type StockPriceMinOrderByAggregateInput = {
    id?: SortOrder
    ticker?: SortOrder
    date?: SortOrder
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    adjustedClose?: SortOrder
    createdAt?: SortOrder
  }

  export type StockPriceSumOrderByAggregateInput = {
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    adjustedClose?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DividendScheduleTickerExDateCompoundUniqueInput = {
    ticker: string
    exDate: Date | string
  }

  export type DividendScheduleCountOrderByAggregateInput = {
    id?: SortOrder
    ticker?: SortOrder
    exDate?: SortOrder
    payDate?: SortOrder
    recordDate?: SortOrder
    amount?: SortOrder
    frequency?: SortOrder
    paymentType?: SortOrder
    currency?: SortOrder
    createdAt?: SortOrder
  }

  export type DividendScheduleAvgOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type DividendScheduleMaxOrderByAggregateInput = {
    id?: SortOrder
    ticker?: SortOrder
    exDate?: SortOrder
    payDate?: SortOrder
    recordDate?: SortOrder
    amount?: SortOrder
    frequency?: SortOrder
    paymentType?: SortOrder
    currency?: SortOrder
    createdAt?: SortOrder
  }

  export type DividendScheduleMinOrderByAggregateInput = {
    id?: SortOrder
    ticker?: SortOrder
    exDate?: SortOrder
    payDate?: SortOrder
    recordDate?: SortOrder
    amount?: SortOrder
    frequency?: SortOrder
    paymentType?: SortOrder
    currency?: SortOrder
    createdAt?: SortOrder
  }

  export type DividendScheduleSumOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type CalculationCacheCountOrderByAggregateInput = {
    id?: SortOrder
    cacheKey?: SortOrder
    data?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type CalculationCacheMaxOrderByAggregateInput = {
    id?: SortOrder
    cacheKey?: SortOrder
    data?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type CalculationCacheMinOrderByAggregateInput = {
    id?: SortOrder
    cacheKey?: SortOrder
    data?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type UserSettingsCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    theme?: SortOrder
    currency?: SortOrder
    locale?: SortOrder
    timezone?: SortOrder
    notifications?: SortOrder
    privacy?: SortOrder
    features?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSettingsMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    theme?: SortOrder
    currency?: SortOrder
    locale?: SortOrder
    timezone?: SortOrder
    notifications?: SortOrder
    privacy?: SortOrder
    features?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSettingsMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    theme?: SortOrder
    currency?: SortOrder
    locale?: SortOrder
    timezone?: SortOrder
    notifications?: SortOrder
    privacy?: SortOrder
    features?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TaxProfileCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    state?: SortOrder
    filingStatus?: SortOrder
    federalBracket?: SortOrder
    stateBracket?: SortOrder
    qualifiedDividendRate?: SortOrder
    capitalGainsRate?: SortOrder
    effectiveRate?: SortOrder
    marginalRate?: SortOrder
    taxYear?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TaxProfileAvgOrderByAggregateInput = {
    federalBracket?: SortOrder
    stateBracket?: SortOrder
    qualifiedDividendRate?: SortOrder
    capitalGainsRate?: SortOrder
    effectiveRate?: SortOrder
    marginalRate?: SortOrder
    taxYear?: SortOrder
  }

  export type TaxProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    state?: SortOrder
    filingStatus?: SortOrder
    federalBracket?: SortOrder
    stateBracket?: SortOrder
    qualifiedDividendRate?: SortOrder
    capitalGainsRate?: SortOrder
    effectiveRate?: SortOrder
    marginalRate?: SortOrder
    taxYear?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TaxProfileMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    state?: SortOrder
    filingStatus?: SortOrder
    federalBracket?: SortOrder
    stateBracket?: SortOrder
    qualifiedDividendRate?: SortOrder
    capitalGainsRate?: SortOrder
    effectiveRate?: SortOrder
    marginalRate?: SortOrder
    taxYear?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TaxProfileSumOrderByAggregateInput = {
    federalBracket?: SortOrder
    stateBracket?: SortOrder
    qualifiedDividendRate?: SortOrder
    capitalGainsRate?: SortOrder
    effectiveRate?: SortOrder
    marginalRate?: SortOrder
    taxYear?: SortOrder
  }

  export type FinancialGoalCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    targetAmount?: SortOrder
    currentAmount?: SortOrder
    targetDate?: SortOrder
    category?: SortOrder
    priority?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FinancialGoalAvgOrderByAggregateInput = {
    targetAmount?: SortOrder
    currentAmount?: SortOrder
    priority?: SortOrder
  }

  export type FinancialGoalMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    targetAmount?: SortOrder
    currentAmount?: SortOrder
    targetDate?: SortOrder
    category?: SortOrder
    priority?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FinancialGoalMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    targetAmount?: SortOrder
    currentAmount?: SortOrder
    targetDate?: SortOrder
    category?: SortOrder
    priority?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FinancialGoalSumOrderByAggregateInput = {
    targetAmount?: SortOrder
    currentAmount?: SortOrder
    priority?: SortOrder
  }

  export type PerformanceSnapshotCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    totalValue?: SortOrder
    totalCostBasis?: SortOrder
    totalGainLoss?: SortOrder
    totalReturn?: SortOrder
    dividendIncome?: SortOrder
    spyPrice?: SortOrder
    spyReturn?: SortOrder
    monthlyIncome?: SortOrder
    monthlyExpenses?: SortOrder
    netIncome?: SortOrder
    createdAt?: SortOrder
  }

  export type PerformanceSnapshotAvgOrderByAggregateInput = {
    totalValue?: SortOrder
    totalCostBasis?: SortOrder
    totalGainLoss?: SortOrder
    totalReturn?: SortOrder
    dividendIncome?: SortOrder
    spyPrice?: SortOrder
    spyReturn?: SortOrder
    monthlyIncome?: SortOrder
    monthlyExpenses?: SortOrder
    netIncome?: SortOrder
  }

  export type PerformanceSnapshotMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    totalValue?: SortOrder
    totalCostBasis?: SortOrder
    totalGainLoss?: SortOrder
    totalReturn?: SortOrder
    dividendIncome?: SortOrder
    spyPrice?: SortOrder
    spyReturn?: SortOrder
    monthlyIncome?: SortOrder
    monthlyExpenses?: SortOrder
    netIncome?: SortOrder
    createdAt?: SortOrder
  }

  export type PerformanceSnapshotMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    totalValue?: SortOrder
    totalCostBasis?: SortOrder
    totalGainLoss?: SortOrder
    totalReturn?: SortOrder
    dividendIncome?: SortOrder
    spyPrice?: SortOrder
    spyReturn?: SortOrder
    monthlyIncome?: SortOrder
    monthlyExpenses?: SortOrder
    netIncome?: SortOrder
    createdAt?: SortOrder
  }

  export type PerformanceSnapshotSumOrderByAggregateInput = {
    totalValue?: SortOrder
    totalCostBasis?: SortOrder
    totalGainLoss?: SortOrder
    totalReturn?: SortOrder
    dividendIncome?: SortOrder
    spyPrice?: SortOrder
    spyReturn?: SortOrder
    monthlyIncome?: SortOrder
    monthlyExpenses?: SortOrder
    netIncome?: SortOrder
  }

  export type PortfolioCreateNestedManyWithoutUserInput = {
    create?: XOR<PortfolioCreateWithoutUserInput, PortfolioUncheckedCreateWithoutUserInput> | PortfolioCreateWithoutUserInput[] | PortfolioUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PortfolioCreateOrConnectWithoutUserInput | PortfolioCreateOrConnectWithoutUserInput[]
    createMany?: PortfolioCreateManyUserInputEnvelope
    connect?: PortfolioWhereUniqueInput | PortfolioWhereUniqueInput[]
  }

  export type IncomeCreateNestedManyWithoutUserInput = {
    create?: XOR<IncomeCreateWithoutUserInput, IncomeUncheckedCreateWithoutUserInput> | IncomeCreateWithoutUserInput[] | IncomeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: IncomeCreateOrConnectWithoutUserInput | IncomeCreateOrConnectWithoutUserInput[]
    createMany?: IncomeCreateManyUserInputEnvelope
    connect?: IncomeWhereUniqueInput | IncomeWhereUniqueInput[]
  }

  export type ExpenseCreateNestedManyWithoutUserInput = {
    create?: XOR<ExpenseCreateWithoutUserInput, ExpenseUncheckedCreateWithoutUserInput> | ExpenseCreateWithoutUserInput[] | ExpenseUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ExpenseCreateOrConnectWithoutUserInput | ExpenseCreateOrConnectWithoutUserInput[]
    createMany?: ExpenseCreateManyUserInputEnvelope
    connect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
  }

  export type TransactionCreateNestedManyWithoutUserInput = {
    create?: XOR<TransactionCreateWithoutUserInput, TransactionUncheckedCreateWithoutUserInput> | TransactionCreateWithoutUserInput[] | TransactionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutUserInput | TransactionCreateOrConnectWithoutUserInput[]
    createMany?: TransactionCreateManyUserInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type PortfolioUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<PortfolioCreateWithoutUserInput, PortfolioUncheckedCreateWithoutUserInput> | PortfolioCreateWithoutUserInput[] | PortfolioUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PortfolioCreateOrConnectWithoutUserInput | PortfolioCreateOrConnectWithoutUserInput[]
    createMany?: PortfolioCreateManyUserInputEnvelope
    connect?: PortfolioWhereUniqueInput | PortfolioWhereUniqueInput[]
  }

  export type IncomeUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<IncomeCreateWithoutUserInput, IncomeUncheckedCreateWithoutUserInput> | IncomeCreateWithoutUserInput[] | IncomeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: IncomeCreateOrConnectWithoutUserInput | IncomeCreateOrConnectWithoutUserInput[]
    createMany?: IncomeCreateManyUserInputEnvelope
    connect?: IncomeWhereUniqueInput | IncomeWhereUniqueInput[]
  }

  export type ExpenseUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ExpenseCreateWithoutUserInput, ExpenseUncheckedCreateWithoutUserInput> | ExpenseCreateWithoutUserInput[] | ExpenseUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ExpenseCreateOrConnectWithoutUserInput | ExpenseCreateOrConnectWithoutUserInput[]
    createMany?: ExpenseCreateManyUserInputEnvelope
    connect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
  }

  export type TransactionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<TransactionCreateWithoutUserInput, TransactionUncheckedCreateWithoutUserInput> | TransactionCreateWithoutUserInput[] | TransactionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutUserInput | TransactionCreateOrConnectWithoutUserInput[]
    createMany?: TransactionCreateManyUserInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type PortfolioUpdateManyWithoutUserNestedInput = {
    create?: XOR<PortfolioCreateWithoutUserInput, PortfolioUncheckedCreateWithoutUserInput> | PortfolioCreateWithoutUserInput[] | PortfolioUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PortfolioCreateOrConnectWithoutUserInput | PortfolioCreateOrConnectWithoutUserInput[]
    upsert?: PortfolioUpsertWithWhereUniqueWithoutUserInput | PortfolioUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PortfolioCreateManyUserInputEnvelope
    set?: PortfolioWhereUniqueInput | PortfolioWhereUniqueInput[]
    disconnect?: PortfolioWhereUniqueInput | PortfolioWhereUniqueInput[]
    delete?: PortfolioWhereUniqueInput | PortfolioWhereUniqueInput[]
    connect?: PortfolioWhereUniqueInput | PortfolioWhereUniqueInput[]
    update?: PortfolioUpdateWithWhereUniqueWithoutUserInput | PortfolioUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PortfolioUpdateManyWithWhereWithoutUserInput | PortfolioUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PortfolioScalarWhereInput | PortfolioScalarWhereInput[]
  }

  export type IncomeUpdateManyWithoutUserNestedInput = {
    create?: XOR<IncomeCreateWithoutUserInput, IncomeUncheckedCreateWithoutUserInput> | IncomeCreateWithoutUserInput[] | IncomeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: IncomeCreateOrConnectWithoutUserInput | IncomeCreateOrConnectWithoutUserInput[]
    upsert?: IncomeUpsertWithWhereUniqueWithoutUserInput | IncomeUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: IncomeCreateManyUserInputEnvelope
    set?: IncomeWhereUniqueInput | IncomeWhereUniqueInput[]
    disconnect?: IncomeWhereUniqueInput | IncomeWhereUniqueInput[]
    delete?: IncomeWhereUniqueInput | IncomeWhereUniqueInput[]
    connect?: IncomeWhereUniqueInput | IncomeWhereUniqueInput[]
    update?: IncomeUpdateWithWhereUniqueWithoutUserInput | IncomeUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: IncomeUpdateManyWithWhereWithoutUserInput | IncomeUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: IncomeScalarWhereInput | IncomeScalarWhereInput[]
  }

  export type ExpenseUpdateManyWithoutUserNestedInput = {
    create?: XOR<ExpenseCreateWithoutUserInput, ExpenseUncheckedCreateWithoutUserInput> | ExpenseCreateWithoutUserInput[] | ExpenseUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ExpenseCreateOrConnectWithoutUserInput | ExpenseCreateOrConnectWithoutUserInput[]
    upsert?: ExpenseUpsertWithWhereUniqueWithoutUserInput | ExpenseUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ExpenseCreateManyUserInputEnvelope
    set?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    disconnect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    delete?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    connect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    update?: ExpenseUpdateWithWhereUniqueWithoutUserInput | ExpenseUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ExpenseUpdateManyWithWhereWithoutUserInput | ExpenseUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ExpenseScalarWhereInput | ExpenseScalarWhereInput[]
  }

  export type TransactionUpdateManyWithoutUserNestedInput = {
    create?: XOR<TransactionCreateWithoutUserInput, TransactionUncheckedCreateWithoutUserInput> | TransactionCreateWithoutUserInput[] | TransactionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutUserInput | TransactionCreateOrConnectWithoutUserInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutUserInput | TransactionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: TransactionCreateManyUserInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutUserInput | TransactionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutUserInput | TransactionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type PortfolioUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<PortfolioCreateWithoutUserInput, PortfolioUncheckedCreateWithoutUserInput> | PortfolioCreateWithoutUserInput[] | PortfolioUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PortfolioCreateOrConnectWithoutUserInput | PortfolioCreateOrConnectWithoutUserInput[]
    upsert?: PortfolioUpsertWithWhereUniqueWithoutUserInput | PortfolioUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PortfolioCreateManyUserInputEnvelope
    set?: PortfolioWhereUniqueInput | PortfolioWhereUniqueInput[]
    disconnect?: PortfolioWhereUniqueInput | PortfolioWhereUniqueInput[]
    delete?: PortfolioWhereUniqueInput | PortfolioWhereUniqueInput[]
    connect?: PortfolioWhereUniqueInput | PortfolioWhereUniqueInput[]
    update?: PortfolioUpdateWithWhereUniqueWithoutUserInput | PortfolioUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PortfolioUpdateManyWithWhereWithoutUserInput | PortfolioUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PortfolioScalarWhereInput | PortfolioScalarWhereInput[]
  }

  export type IncomeUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<IncomeCreateWithoutUserInput, IncomeUncheckedCreateWithoutUserInput> | IncomeCreateWithoutUserInput[] | IncomeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: IncomeCreateOrConnectWithoutUserInput | IncomeCreateOrConnectWithoutUserInput[]
    upsert?: IncomeUpsertWithWhereUniqueWithoutUserInput | IncomeUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: IncomeCreateManyUserInputEnvelope
    set?: IncomeWhereUniqueInput | IncomeWhereUniqueInput[]
    disconnect?: IncomeWhereUniqueInput | IncomeWhereUniqueInput[]
    delete?: IncomeWhereUniqueInput | IncomeWhereUniqueInput[]
    connect?: IncomeWhereUniqueInput | IncomeWhereUniqueInput[]
    update?: IncomeUpdateWithWhereUniqueWithoutUserInput | IncomeUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: IncomeUpdateManyWithWhereWithoutUserInput | IncomeUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: IncomeScalarWhereInput | IncomeScalarWhereInput[]
  }

  export type ExpenseUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ExpenseCreateWithoutUserInput, ExpenseUncheckedCreateWithoutUserInput> | ExpenseCreateWithoutUserInput[] | ExpenseUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ExpenseCreateOrConnectWithoutUserInput | ExpenseCreateOrConnectWithoutUserInput[]
    upsert?: ExpenseUpsertWithWhereUniqueWithoutUserInput | ExpenseUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ExpenseCreateManyUserInputEnvelope
    set?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    disconnect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    delete?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    connect?: ExpenseWhereUniqueInput | ExpenseWhereUniqueInput[]
    update?: ExpenseUpdateWithWhereUniqueWithoutUserInput | ExpenseUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ExpenseUpdateManyWithWhereWithoutUserInput | ExpenseUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ExpenseScalarWhereInput | ExpenseScalarWhereInput[]
  }

  export type TransactionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<TransactionCreateWithoutUserInput, TransactionUncheckedCreateWithoutUserInput> | TransactionCreateWithoutUserInput[] | TransactionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutUserInput | TransactionCreateOrConnectWithoutUserInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutUserInput | TransactionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: TransactionCreateManyUserInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutUserInput | TransactionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutUserInput | TransactionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutPortfoliosInput = {
    create?: XOR<UserCreateWithoutPortfoliosInput, UserUncheckedCreateWithoutPortfoliosInput>
    connectOrCreate?: UserCreateOrConnectWithoutPortfoliosInput
    connect?: UserWhereUniqueInput
  }

  export type HoldingCreateNestedManyWithoutPortfolioInput = {
    create?: XOR<HoldingCreateWithoutPortfolioInput, HoldingUncheckedCreateWithoutPortfolioInput> | HoldingCreateWithoutPortfolioInput[] | HoldingUncheckedCreateWithoutPortfolioInput[]
    connectOrCreate?: HoldingCreateOrConnectWithoutPortfolioInput | HoldingCreateOrConnectWithoutPortfolioInput[]
    createMany?: HoldingCreateManyPortfolioInputEnvelope
    connect?: HoldingWhereUniqueInput | HoldingWhereUniqueInput[]
  }

  export type HoldingUncheckedCreateNestedManyWithoutPortfolioInput = {
    create?: XOR<HoldingCreateWithoutPortfolioInput, HoldingUncheckedCreateWithoutPortfolioInput> | HoldingCreateWithoutPortfolioInput[] | HoldingUncheckedCreateWithoutPortfolioInput[]
    connectOrCreate?: HoldingCreateOrConnectWithoutPortfolioInput | HoldingCreateOrConnectWithoutPortfolioInput[]
    createMany?: HoldingCreateManyPortfolioInputEnvelope
    connect?: HoldingWhereUniqueInput | HoldingWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutPortfoliosNestedInput = {
    create?: XOR<UserCreateWithoutPortfoliosInput, UserUncheckedCreateWithoutPortfoliosInput>
    connectOrCreate?: UserCreateOrConnectWithoutPortfoliosInput
    upsert?: UserUpsertWithoutPortfoliosInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPortfoliosInput, UserUpdateWithoutPortfoliosInput>, UserUncheckedUpdateWithoutPortfoliosInput>
  }

  export type HoldingUpdateManyWithoutPortfolioNestedInput = {
    create?: XOR<HoldingCreateWithoutPortfolioInput, HoldingUncheckedCreateWithoutPortfolioInput> | HoldingCreateWithoutPortfolioInput[] | HoldingUncheckedCreateWithoutPortfolioInput[]
    connectOrCreate?: HoldingCreateOrConnectWithoutPortfolioInput | HoldingCreateOrConnectWithoutPortfolioInput[]
    upsert?: HoldingUpsertWithWhereUniqueWithoutPortfolioInput | HoldingUpsertWithWhereUniqueWithoutPortfolioInput[]
    createMany?: HoldingCreateManyPortfolioInputEnvelope
    set?: HoldingWhereUniqueInput | HoldingWhereUniqueInput[]
    disconnect?: HoldingWhereUniqueInput | HoldingWhereUniqueInput[]
    delete?: HoldingWhereUniqueInput | HoldingWhereUniqueInput[]
    connect?: HoldingWhereUniqueInput | HoldingWhereUniqueInput[]
    update?: HoldingUpdateWithWhereUniqueWithoutPortfolioInput | HoldingUpdateWithWhereUniqueWithoutPortfolioInput[]
    updateMany?: HoldingUpdateManyWithWhereWithoutPortfolioInput | HoldingUpdateManyWithWhereWithoutPortfolioInput[]
    deleteMany?: HoldingScalarWhereInput | HoldingScalarWhereInput[]
  }

  export type HoldingUncheckedUpdateManyWithoutPortfolioNestedInput = {
    create?: XOR<HoldingCreateWithoutPortfolioInput, HoldingUncheckedCreateWithoutPortfolioInput> | HoldingCreateWithoutPortfolioInput[] | HoldingUncheckedCreateWithoutPortfolioInput[]
    connectOrCreate?: HoldingCreateOrConnectWithoutPortfolioInput | HoldingCreateOrConnectWithoutPortfolioInput[]
    upsert?: HoldingUpsertWithWhereUniqueWithoutPortfolioInput | HoldingUpsertWithWhereUniqueWithoutPortfolioInput[]
    createMany?: HoldingCreateManyPortfolioInputEnvelope
    set?: HoldingWhereUniqueInput | HoldingWhereUniqueInput[]
    disconnect?: HoldingWhereUniqueInput | HoldingWhereUniqueInput[]
    delete?: HoldingWhereUniqueInput | HoldingWhereUniqueInput[]
    connect?: HoldingWhereUniqueInput | HoldingWhereUniqueInput[]
    update?: HoldingUpdateWithWhereUniqueWithoutPortfolioInput | HoldingUpdateWithWhereUniqueWithoutPortfolioInput[]
    updateMany?: HoldingUpdateManyWithWhereWithoutPortfolioInput | HoldingUpdateManyWithWhereWithoutPortfolioInput[]
    deleteMany?: HoldingScalarWhereInput | HoldingScalarWhereInput[]
  }

  export type PortfolioCreateNestedOneWithoutHoldingsInput = {
    create?: XOR<PortfolioCreateWithoutHoldingsInput, PortfolioUncheckedCreateWithoutHoldingsInput>
    connectOrCreate?: PortfolioCreateOrConnectWithoutHoldingsInput
    connect?: PortfolioWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type PortfolioUpdateOneRequiredWithoutHoldingsNestedInput = {
    create?: XOR<PortfolioCreateWithoutHoldingsInput, PortfolioUncheckedCreateWithoutHoldingsInput>
    connectOrCreate?: PortfolioCreateOrConnectWithoutHoldingsInput
    upsert?: PortfolioUpsertWithoutHoldingsInput
    connect?: PortfolioWhereUniqueInput
    update?: XOR<XOR<PortfolioUpdateToOneWithWhereWithoutHoldingsInput, PortfolioUpdateWithoutHoldingsInput>, PortfolioUncheckedUpdateWithoutHoldingsInput>
  }

  export type UserCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<UserCreateWithoutTransactionsInput, UserUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTransactionsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutTransactionsNestedInput = {
    create?: XOR<UserCreateWithoutTransactionsInput, UserUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTransactionsInput
    upsert?: UserUpsertWithoutTransactionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTransactionsInput, UserUpdateWithoutTransactionsInput>, UserUncheckedUpdateWithoutTransactionsInput>
  }

  export type UserCreateNestedOneWithoutIncomesInput = {
    create?: XOR<UserCreateWithoutIncomesInput, UserUncheckedCreateWithoutIncomesInput>
    connectOrCreate?: UserCreateOrConnectWithoutIncomesInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutIncomesNestedInput = {
    create?: XOR<UserCreateWithoutIncomesInput, UserUncheckedCreateWithoutIncomesInput>
    connectOrCreate?: UserCreateOrConnectWithoutIncomesInput
    upsert?: UserUpsertWithoutIncomesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutIncomesInput, UserUpdateWithoutIncomesInput>, UserUncheckedUpdateWithoutIncomesInput>
  }

  export type UserCreateNestedOneWithoutExpensesInput = {
    create?: XOR<UserCreateWithoutExpensesInput, UserUncheckedCreateWithoutExpensesInput>
    connectOrCreate?: UserCreateOrConnectWithoutExpensesInput
    connect?: UserWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutExpensesNestedInput = {
    create?: XOR<UserCreateWithoutExpensesInput, UserUncheckedCreateWithoutExpensesInput>
    connectOrCreate?: UserCreateOrConnectWithoutExpensesInput
    upsert?: UserUpsertWithoutExpensesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutExpensesInput, UserUpdateWithoutExpensesInput>, UserUncheckedUpdateWithoutExpensesInput>
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type PortfolioCreateWithoutUserInput = {
    id?: string
    name: string
    type: string
    institution?: string | null
    isPrimary?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    holdings?: HoldingCreateNestedManyWithoutPortfolioInput
  }

  export type PortfolioUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    type: string
    institution?: string | null
    isPrimary?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    holdings?: HoldingUncheckedCreateNestedManyWithoutPortfolioInput
  }

  export type PortfolioCreateOrConnectWithoutUserInput = {
    where: PortfolioWhereUniqueInput
    create: XOR<PortfolioCreateWithoutUserInput, PortfolioUncheckedCreateWithoutUserInput>
  }

  export type PortfolioCreateManyUserInputEnvelope = {
    data: PortfolioCreateManyUserInput | PortfolioCreateManyUserInput[]
  }

  export type IncomeCreateWithoutUserInput = {
    id?: string
    source: string
    category: string
    amount: number
    date: Date | string
    recurring?: boolean
    frequency?: string | null
    taxable?: boolean
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
  }

  export type IncomeUncheckedCreateWithoutUserInput = {
    id?: string
    source: string
    category: string
    amount: number
    date: Date | string
    recurring?: boolean
    frequency?: string | null
    taxable?: boolean
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
  }

  export type IncomeCreateOrConnectWithoutUserInput = {
    where: IncomeWhereUniqueInput
    create: XOR<IncomeCreateWithoutUserInput, IncomeUncheckedCreateWithoutUserInput>
  }

  export type IncomeCreateManyUserInputEnvelope = {
    data: IncomeCreateManyUserInput | IncomeCreateManyUserInput[]
  }

  export type ExpenseCreateWithoutUserInput = {
    id?: string
    category: string
    merchant?: string | null
    amount: number
    date: Date | string
    recurring?: boolean
    frequency?: string | null
    priority?: number
    essential?: boolean
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
  }

  export type ExpenseUncheckedCreateWithoutUserInput = {
    id?: string
    category: string
    merchant?: string | null
    amount: number
    date: Date | string
    recurring?: boolean
    frequency?: string | null
    priority?: number
    essential?: boolean
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
  }

  export type ExpenseCreateOrConnectWithoutUserInput = {
    where: ExpenseWhereUniqueInput
    create: XOR<ExpenseCreateWithoutUserInput, ExpenseUncheckedCreateWithoutUserInput>
  }

  export type ExpenseCreateManyUserInputEnvelope = {
    data: ExpenseCreateManyUserInput | ExpenseCreateManyUserInput[]
  }

  export type TransactionCreateWithoutUserInput = {
    id?: string
    portfolioId?: string | null
    ticker: string
    type: string
    shares?: number | null
    amount: number
    date: Date | string
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
  }

  export type TransactionUncheckedCreateWithoutUserInput = {
    id?: string
    portfolioId?: string | null
    ticker: string
    type: string
    shares?: number | null
    amount: number
    date: Date | string
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
  }

  export type TransactionCreateOrConnectWithoutUserInput = {
    where: TransactionWhereUniqueInput
    create: XOR<TransactionCreateWithoutUserInput, TransactionUncheckedCreateWithoutUserInput>
  }

  export type TransactionCreateManyUserInputEnvelope = {
    data: TransactionCreateManyUserInput | TransactionCreateManyUserInput[]
  }

  export type PortfolioUpsertWithWhereUniqueWithoutUserInput = {
    where: PortfolioWhereUniqueInput
    update: XOR<PortfolioUpdateWithoutUserInput, PortfolioUncheckedUpdateWithoutUserInput>
    create: XOR<PortfolioCreateWithoutUserInput, PortfolioUncheckedCreateWithoutUserInput>
  }

  export type PortfolioUpdateWithWhereUniqueWithoutUserInput = {
    where: PortfolioWhereUniqueInput
    data: XOR<PortfolioUpdateWithoutUserInput, PortfolioUncheckedUpdateWithoutUserInput>
  }

  export type PortfolioUpdateManyWithWhereWithoutUserInput = {
    where: PortfolioScalarWhereInput
    data: XOR<PortfolioUpdateManyMutationInput, PortfolioUncheckedUpdateManyWithoutUserInput>
  }

  export type PortfolioScalarWhereInput = {
    AND?: PortfolioScalarWhereInput | PortfolioScalarWhereInput[]
    OR?: PortfolioScalarWhereInput[]
    NOT?: PortfolioScalarWhereInput | PortfolioScalarWhereInput[]
    id?: StringFilter<"Portfolio"> | string
    userId?: StringFilter<"Portfolio"> | string
    name?: StringFilter<"Portfolio"> | string
    type?: StringFilter<"Portfolio"> | string
    institution?: StringNullableFilter<"Portfolio"> | string | null
    isPrimary?: BoolFilter<"Portfolio"> | boolean
    createdAt?: DateTimeFilter<"Portfolio"> | Date | string
    updatedAt?: DateTimeFilter<"Portfolio"> | Date | string
  }

  export type IncomeUpsertWithWhereUniqueWithoutUserInput = {
    where: IncomeWhereUniqueInput
    update: XOR<IncomeUpdateWithoutUserInput, IncomeUncheckedUpdateWithoutUserInput>
    create: XOR<IncomeCreateWithoutUserInput, IncomeUncheckedCreateWithoutUserInput>
  }

  export type IncomeUpdateWithWhereUniqueWithoutUserInput = {
    where: IncomeWhereUniqueInput
    data: XOR<IncomeUpdateWithoutUserInput, IncomeUncheckedUpdateWithoutUserInput>
  }

  export type IncomeUpdateManyWithWhereWithoutUserInput = {
    where: IncomeScalarWhereInput
    data: XOR<IncomeUpdateManyMutationInput, IncomeUncheckedUpdateManyWithoutUserInput>
  }

  export type IncomeScalarWhereInput = {
    AND?: IncomeScalarWhereInput | IncomeScalarWhereInput[]
    OR?: IncomeScalarWhereInput[]
    NOT?: IncomeScalarWhereInput | IncomeScalarWhereInput[]
    id?: StringFilter<"Income"> | string
    userId?: StringFilter<"Income"> | string
    source?: StringFilter<"Income"> | string
    category?: StringFilter<"Income"> | string
    amount?: FloatFilter<"Income"> | number
    date?: DateTimeFilter<"Income"> | Date | string
    recurring?: BoolFilter<"Income"> | boolean
    frequency?: StringNullableFilter<"Income"> | string | null
    taxable?: BoolFilter<"Income"> | boolean
    notes?: StringNullableFilter<"Income"> | string | null
    metadata?: StringNullableFilter<"Income"> | string | null
    createdAt?: DateTimeFilter<"Income"> | Date | string
  }

  export type ExpenseUpsertWithWhereUniqueWithoutUserInput = {
    where: ExpenseWhereUniqueInput
    update: XOR<ExpenseUpdateWithoutUserInput, ExpenseUncheckedUpdateWithoutUserInput>
    create: XOR<ExpenseCreateWithoutUserInput, ExpenseUncheckedCreateWithoutUserInput>
  }

  export type ExpenseUpdateWithWhereUniqueWithoutUserInput = {
    where: ExpenseWhereUniqueInput
    data: XOR<ExpenseUpdateWithoutUserInput, ExpenseUncheckedUpdateWithoutUserInput>
  }

  export type ExpenseUpdateManyWithWhereWithoutUserInput = {
    where: ExpenseScalarWhereInput
    data: XOR<ExpenseUpdateManyMutationInput, ExpenseUncheckedUpdateManyWithoutUserInput>
  }

  export type ExpenseScalarWhereInput = {
    AND?: ExpenseScalarWhereInput | ExpenseScalarWhereInput[]
    OR?: ExpenseScalarWhereInput[]
    NOT?: ExpenseScalarWhereInput | ExpenseScalarWhereInput[]
    id?: StringFilter<"Expense"> | string
    userId?: StringFilter<"Expense"> | string
    category?: StringFilter<"Expense"> | string
    merchant?: StringNullableFilter<"Expense"> | string | null
    amount?: FloatFilter<"Expense"> | number
    date?: DateTimeFilter<"Expense"> | Date | string
    recurring?: BoolFilter<"Expense"> | boolean
    frequency?: StringNullableFilter<"Expense"> | string | null
    priority?: IntFilter<"Expense"> | number
    essential?: BoolFilter<"Expense"> | boolean
    notes?: StringNullableFilter<"Expense"> | string | null
    metadata?: StringNullableFilter<"Expense"> | string | null
    createdAt?: DateTimeFilter<"Expense"> | Date | string
  }

  export type TransactionUpsertWithWhereUniqueWithoutUserInput = {
    where: TransactionWhereUniqueInput
    update: XOR<TransactionUpdateWithoutUserInput, TransactionUncheckedUpdateWithoutUserInput>
    create: XOR<TransactionCreateWithoutUserInput, TransactionUncheckedCreateWithoutUserInput>
  }

  export type TransactionUpdateWithWhereUniqueWithoutUserInput = {
    where: TransactionWhereUniqueInput
    data: XOR<TransactionUpdateWithoutUserInput, TransactionUncheckedUpdateWithoutUserInput>
  }

  export type TransactionUpdateManyWithWhereWithoutUserInput = {
    where: TransactionScalarWhereInput
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyWithoutUserInput>
  }

  export type TransactionScalarWhereInput = {
    AND?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
    OR?: TransactionScalarWhereInput[]
    NOT?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
    id?: StringFilter<"Transaction"> | string
    userId?: StringFilter<"Transaction"> | string
    portfolioId?: StringNullableFilter<"Transaction"> | string | null
    ticker?: StringFilter<"Transaction"> | string
    type?: StringFilter<"Transaction"> | string
    shares?: FloatNullableFilter<"Transaction"> | number | null
    amount?: FloatFilter<"Transaction"> | number
    date?: DateTimeFilter<"Transaction"> | Date | string
    notes?: StringNullableFilter<"Transaction"> | string | null
    metadata?: StringNullableFilter<"Transaction"> | string | null
    createdAt?: DateTimeFilter<"Transaction"> | Date | string
  }

  export type UserCreateWithoutPortfoliosInput = {
    id?: string
    email: string
    passwordHash: string
    settings?: string | null
    taxProfile?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    incomes?: IncomeCreateNestedManyWithoutUserInput
    expenses?: ExpenseCreateNestedManyWithoutUserInput
    transactions?: TransactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPortfoliosInput = {
    id?: string
    email: string
    passwordHash: string
    settings?: string | null
    taxProfile?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    incomes?: IncomeUncheckedCreateNestedManyWithoutUserInput
    expenses?: ExpenseUncheckedCreateNestedManyWithoutUserInput
    transactions?: TransactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPortfoliosInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPortfoliosInput, UserUncheckedCreateWithoutPortfoliosInput>
  }

  export type HoldingCreateWithoutPortfolioInput = {
    id?: string
    ticker: string
    shares: number
    costBasis: number
    purchaseDate: Date | string
    currentPrice?: number | null
    dividendYield?: number | null
    sector?: string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type HoldingUncheckedCreateWithoutPortfolioInput = {
    id?: string
    ticker: string
    shares: number
    costBasis: number
    purchaseDate: Date | string
    currentPrice?: number | null
    dividendYield?: number | null
    sector?: string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type HoldingCreateOrConnectWithoutPortfolioInput = {
    where: HoldingWhereUniqueInput
    create: XOR<HoldingCreateWithoutPortfolioInput, HoldingUncheckedCreateWithoutPortfolioInput>
  }

  export type HoldingCreateManyPortfolioInputEnvelope = {
    data: HoldingCreateManyPortfolioInput | HoldingCreateManyPortfolioInput[]
  }

  export type UserUpsertWithoutPortfoliosInput = {
    update: XOR<UserUpdateWithoutPortfoliosInput, UserUncheckedUpdateWithoutPortfoliosInput>
    create: XOR<UserCreateWithoutPortfoliosInput, UserUncheckedCreateWithoutPortfoliosInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPortfoliosInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPortfoliosInput, UserUncheckedUpdateWithoutPortfoliosInput>
  }

  export type UserUpdateWithoutPortfoliosInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    settings?: NullableStringFieldUpdateOperationsInput | string | null
    taxProfile?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    incomes?: IncomeUpdateManyWithoutUserNestedInput
    expenses?: ExpenseUpdateManyWithoutUserNestedInput
    transactions?: TransactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPortfoliosInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    settings?: NullableStringFieldUpdateOperationsInput | string | null
    taxProfile?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    incomes?: IncomeUncheckedUpdateManyWithoutUserNestedInput
    expenses?: ExpenseUncheckedUpdateManyWithoutUserNestedInput
    transactions?: TransactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type HoldingUpsertWithWhereUniqueWithoutPortfolioInput = {
    where: HoldingWhereUniqueInput
    update: XOR<HoldingUpdateWithoutPortfolioInput, HoldingUncheckedUpdateWithoutPortfolioInput>
    create: XOR<HoldingCreateWithoutPortfolioInput, HoldingUncheckedCreateWithoutPortfolioInput>
  }

  export type HoldingUpdateWithWhereUniqueWithoutPortfolioInput = {
    where: HoldingWhereUniqueInput
    data: XOR<HoldingUpdateWithoutPortfolioInput, HoldingUncheckedUpdateWithoutPortfolioInput>
  }

  export type HoldingUpdateManyWithWhereWithoutPortfolioInput = {
    where: HoldingScalarWhereInput
    data: XOR<HoldingUpdateManyMutationInput, HoldingUncheckedUpdateManyWithoutPortfolioInput>
  }

  export type HoldingScalarWhereInput = {
    AND?: HoldingScalarWhereInput | HoldingScalarWhereInput[]
    OR?: HoldingScalarWhereInput[]
    NOT?: HoldingScalarWhereInput | HoldingScalarWhereInput[]
    id?: StringFilter<"Holding"> | string
    portfolioId?: StringFilter<"Holding"> | string
    ticker?: StringFilter<"Holding"> | string
    shares?: FloatFilter<"Holding"> | number
    costBasis?: FloatFilter<"Holding"> | number
    purchaseDate?: DateTimeFilter<"Holding"> | Date | string
    currentPrice?: FloatNullableFilter<"Holding"> | number | null
    dividendYield?: FloatNullableFilter<"Holding"> | number | null
    sector?: StringNullableFilter<"Holding"> | string | null
    metadata?: StringNullableFilter<"Holding"> | string | null
    createdAt?: DateTimeFilter<"Holding"> | Date | string
    updatedAt?: DateTimeFilter<"Holding"> | Date | string
  }

  export type PortfolioCreateWithoutHoldingsInput = {
    id?: string
    name: string
    type: string
    institution?: string | null
    isPrimary?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutPortfoliosInput
  }

  export type PortfolioUncheckedCreateWithoutHoldingsInput = {
    id?: string
    userId: string
    name: string
    type: string
    institution?: string | null
    isPrimary?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PortfolioCreateOrConnectWithoutHoldingsInput = {
    where: PortfolioWhereUniqueInput
    create: XOR<PortfolioCreateWithoutHoldingsInput, PortfolioUncheckedCreateWithoutHoldingsInput>
  }

  export type PortfolioUpsertWithoutHoldingsInput = {
    update: XOR<PortfolioUpdateWithoutHoldingsInput, PortfolioUncheckedUpdateWithoutHoldingsInput>
    create: XOR<PortfolioCreateWithoutHoldingsInput, PortfolioUncheckedCreateWithoutHoldingsInput>
    where?: PortfolioWhereInput
  }

  export type PortfolioUpdateToOneWithWhereWithoutHoldingsInput = {
    where?: PortfolioWhereInput
    data: XOR<PortfolioUpdateWithoutHoldingsInput, PortfolioUncheckedUpdateWithoutHoldingsInput>
  }

  export type PortfolioUpdateWithoutHoldingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPortfoliosNestedInput
  }

  export type PortfolioUncheckedUpdateWithoutHoldingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutTransactionsInput = {
    id?: string
    email: string
    passwordHash: string
    settings?: string | null
    taxProfile?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    portfolios?: PortfolioCreateNestedManyWithoutUserInput
    incomes?: IncomeCreateNestedManyWithoutUserInput
    expenses?: ExpenseCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTransactionsInput = {
    id?: string
    email: string
    passwordHash: string
    settings?: string | null
    taxProfile?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    portfolios?: PortfolioUncheckedCreateNestedManyWithoutUserInput
    incomes?: IncomeUncheckedCreateNestedManyWithoutUserInput
    expenses?: ExpenseUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTransactionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTransactionsInput, UserUncheckedCreateWithoutTransactionsInput>
  }

  export type UserUpsertWithoutTransactionsInput = {
    update: XOR<UserUpdateWithoutTransactionsInput, UserUncheckedUpdateWithoutTransactionsInput>
    create: XOR<UserCreateWithoutTransactionsInput, UserUncheckedCreateWithoutTransactionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTransactionsInput, UserUncheckedUpdateWithoutTransactionsInput>
  }

  export type UserUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    settings?: NullableStringFieldUpdateOperationsInput | string | null
    taxProfile?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    portfolios?: PortfolioUpdateManyWithoutUserNestedInput
    incomes?: IncomeUpdateManyWithoutUserNestedInput
    expenses?: ExpenseUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    settings?: NullableStringFieldUpdateOperationsInput | string | null
    taxProfile?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    portfolios?: PortfolioUncheckedUpdateManyWithoutUserNestedInput
    incomes?: IncomeUncheckedUpdateManyWithoutUserNestedInput
    expenses?: ExpenseUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutIncomesInput = {
    id?: string
    email: string
    passwordHash: string
    settings?: string | null
    taxProfile?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    portfolios?: PortfolioCreateNestedManyWithoutUserInput
    expenses?: ExpenseCreateNestedManyWithoutUserInput
    transactions?: TransactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutIncomesInput = {
    id?: string
    email: string
    passwordHash: string
    settings?: string | null
    taxProfile?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    portfolios?: PortfolioUncheckedCreateNestedManyWithoutUserInput
    expenses?: ExpenseUncheckedCreateNestedManyWithoutUserInput
    transactions?: TransactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutIncomesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutIncomesInput, UserUncheckedCreateWithoutIncomesInput>
  }

  export type UserUpsertWithoutIncomesInput = {
    update: XOR<UserUpdateWithoutIncomesInput, UserUncheckedUpdateWithoutIncomesInput>
    create: XOR<UserCreateWithoutIncomesInput, UserUncheckedCreateWithoutIncomesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutIncomesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutIncomesInput, UserUncheckedUpdateWithoutIncomesInput>
  }

  export type UserUpdateWithoutIncomesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    settings?: NullableStringFieldUpdateOperationsInput | string | null
    taxProfile?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    portfolios?: PortfolioUpdateManyWithoutUserNestedInput
    expenses?: ExpenseUpdateManyWithoutUserNestedInput
    transactions?: TransactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutIncomesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    settings?: NullableStringFieldUpdateOperationsInput | string | null
    taxProfile?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    portfolios?: PortfolioUncheckedUpdateManyWithoutUserNestedInput
    expenses?: ExpenseUncheckedUpdateManyWithoutUserNestedInput
    transactions?: TransactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutExpensesInput = {
    id?: string
    email: string
    passwordHash: string
    settings?: string | null
    taxProfile?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    portfolios?: PortfolioCreateNestedManyWithoutUserInput
    incomes?: IncomeCreateNestedManyWithoutUserInput
    transactions?: TransactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutExpensesInput = {
    id?: string
    email: string
    passwordHash: string
    settings?: string | null
    taxProfile?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    portfolios?: PortfolioUncheckedCreateNestedManyWithoutUserInput
    incomes?: IncomeUncheckedCreateNestedManyWithoutUserInput
    transactions?: TransactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutExpensesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutExpensesInput, UserUncheckedCreateWithoutExpensesInput>
  }

  export type UserUpsertWithoutExpensesInput = {
    update: XOR<UserUpdateWithoutExpensesInput, UserUncheckedUpdateWithoutExpensesInput>
    create: XOR<UserCreateWithoutExpensesInput, UserUncheckedCreateWithoutExpensesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutExpensesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutExpensesInput, UserUncheckedUpdateWithoutExpensesInput>
  }

  export type UserUpdateWithoutExpensesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    settings?: NullableStringFieldUpdateOperationsInput | string | null
    taxProfile?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    portfolios?: PortfolioUpdateManyWithoutUserNestedInput
    incomes?: IncomeUpdateManyWithoutUserNestedInput
    transactions?: TransactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutExpensesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    settings?: NullableStringFieldUpdateOperationsInput | string | null
    taxProfile?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    portfolios?: PortfolioUncheckedUpdateManyWithoutUserNestedInput
    incomes?: IncomeUncheckedUpdateManyWithoutUserNestedInput
    transactions?: TransactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type PortfolioCreateManyUserInput = {
    id?: string
    name: string
    type: string
    institution?: string | null
    isPrimary?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IncomeCreateManyUserInput = {
    id?: string
    source: string
    category: string
    amount: number
    date: Date | string
    recurring?: boolean
    frequency?: string | null
    taxable?: boolean
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
  }

  export type ExpenseCreateManyUserInput = {
    id?: string
    category: string
    merchant?: string | null
    amount: number
    date: Date | string
    recurring?: boolean
    frequency?: string | null
    priority?: number
    essential?: boolean
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
  }

  export type TransactionCreateManyUserInput = {
    id?: string
    portfolioId?: string | null
    ticker: string
    type: string
    shares?: number | null
    amount: number
    date: Date | string
    notes?: string | null
    metadata?: string | null
    createdAt?: Date | string
  }

  export type PortfolioUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    holdings?: HoldingUpdateManyWithoutPortfolioNestedInput
  }

  export type PortfolioUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    holdings?: HoldingUncheckedUpdateManyWithoutPortfolioNestedInput
  }

  export type PortfolioUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    institution?: NullableStringFieldUpdateOperationsInput | string | null
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IncomeUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    recurring?: BoolFieldUpdateOperationsInput | boolean
    frequency?: NullableStringFieldUpdateOperationsInput | string | null
    taxable?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IncomeUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    recurring?: BoolFieldUpdateOperationsInput | boolean
    frequency?: NullableStringFieldUpdateOperationsInput | string | null
    taxable?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IncomeUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    recurring?: BoolFieldUpdateOperationsInput | boolean
    frequency?: NullableStringFieldUpdateOperationsInput | string | null
    taxable?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExpenseUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    merchant?: NullableStringFieldUpdateOperationsInput | string | null
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    recurring?: BoolFieldUpdateOperationsInput | boolean
    frequency?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: IntFieldUpdateOperationsInput | number
    essential?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExpenseUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    merchant?: NullableStringFieldUpdateOperationsInput | string | null
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    recurring?: BoolFieldUpdateOperationsInput | boolean
    frequency?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: IntFieldUpdateOperationsInput | number
    essential?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExpenseUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    merchant?: NullableStringFieldUpdateOperationsInput | string | null
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    recurring?: BoolFieldUpdateOperationsInput | boolean
    frequency?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: IntFieldUpdateOperationsInput | number
    essential?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    portfolioId?: NullableStringFieldUpdateOperationsInput | string | null
    ticker?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    shares?: NullableFloatFieldUpdateOperationsInput | number | null
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    portfolioId?: NullableStringFieldUpdateOperationsInput | string | null
    ticker?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    shares?: NullableFloatFieldUpdateOperationsInput | number | null
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    portfolioId?: NullableStringFieldUpdateOperationsInput | string | null
    ticker?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    shares?: NullableFloatFieldUpdateOperationsInput | number | null
    amount?: FloatFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HoldingCreateManyPortfolioInput = {
    id?: string
    ticker: string
    shares: number
    costBasis: number
    purchaseDate: Date | string
    currentPrice?: number | null
    dividendYield?: number | null
    sector?: string | null
    metadata?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type HoldingUpdateWithoutPortfolioInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticker?: StringFieldUpdateOperationsInput | string
    shares?: FloatFieldUpdateOperationsInput | number
    costBasis?: FloatFieldUpdateOperationsInput | number
    purchaseDate?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    dividendYield?: NullableFloatFieldUpdateOperationsInput | number | null
    sector?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HoldingUncheckedUpdateWithoutPortfolioInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticker?: StringFieldUpdateOperationsInput | string
    shares?: FloatFieldUpdateOperationsInput | number
    costBasis?: FloatFieldUpdateOperationsInput | number
    purchaseDate?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    dividendYield?: NullableFloatFieldUpdateOperationsInput | number | null
    sector?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HoldingUncheckedUpdateManyWithoutPortfolioInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticker?: StringFieldUpdateOperationsInput | string
    shares?: FloatFieldUpdateOperationsInput | number
    costBasis?: FloatFieldUpdateOperationsInput | number
    purchaseDate?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    dividendYield?: NullableFloatFieldUpdateOperationsInput | number | null
    sector?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}