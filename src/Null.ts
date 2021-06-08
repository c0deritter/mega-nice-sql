import { Predicate } from './Predicate'

export class Null extends Predicate {

  private static readonly regex = /(\w+)\s+IS\s+(NOT(?:\s+))?NULL/i
  private static readonly regexFromOperatorOn = /IS\s+(NOT(?:\s+))?NULL/i

  column: string
  not?: boolean

  constructor(column: string)
  constructor(column: string, not: boolean)
  constructor(alias: string, column: string)
  constructor(alias: string, column: string, not: boolean)

  constructor(arg1: string, arg2?: string|boolean, arg3?: boolean) {
    super()

    if (arg1 != undefined && arg2 == undefined && arg3 == undefined) {
      this.column = arg1
    }
    else if (arg1 != undefined && arg2 != undefined && arg3 == undefined) {
      if (typeof arg2 == 'boolean') {
        this.column = arg1
        this.not = arg2
      }
      else {
        this.alias = arg1
        this.column = arg2
      }
    }
    else {
      this.alias = arg1
      this.column = <string> arg2
      this.not = arg3!
    }

    if (this.column.indexOf('.') > -1) {
      let aliasAndColumn = this.column.split('.')
      this.alias = aliasAndColumn[0]
      this.column = aliasAndColumn[1]
    }
  }

  sql(db: string, options?: { alias?: string, parameterIndex?: number }): string | { sql: string, parameterIndex: number } {
    let alias: string = ''

    if (this.alias != undefined && this.alias.length > 0) {
      alias = this.alias + '.'
    }    
    else if (options != undefined && options.alias != undefined && options.alias.length > 0) {
      alias = options.alias + '.'
    }

    if (options == undefined || options.parameterIndex == undefined) {
      return alias + this.column + (this.not ? ' IS NOT NULL' : ' IS NULL')
    }
    else {
      return {
        sql: alias + this.column + (this.not ? ' IS NOT NULL' : ' IS NULL'),
        parameterIndex: options.parameterIndex
      }
    }
  }

  values(): any[] {
    return []
  }

  static isOperator(operator: string): boolean {
    operator = operator.toUpperCase()
    return typeof operator == 'string' && (operator == 'IS' || operator == 'IS NOT')
  }

  static parse(expression: string): Null|undefined {
    let result = this.regex.exec(expression)

    if (result != undefined) {
      let column = result[1]
      let not = result[2] == undefined ? false : true

      return new Null(column, not)
    }
  }

  static parseFromOperatorOn(column: string, expression: string): Null|undefined {
    let result = this.regexFromOperatorOn.exec(expression)

    if (result != undefined) {
      let not = result[1] == undefined ? false : true

      return new Null(column, not)
    }
  }
}
