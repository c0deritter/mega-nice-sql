export abstract class Predicate {
  alias?: string
  abstract sql(db: string, options: { alias?: string, parameterIndex?: number }): string | { sql: string, parameterIndex: number }
  abstract values(): any[]
}
