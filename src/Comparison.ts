import { Predicate } from './Predicate'
import { getParameterQueryString } from './tools'

export class Comparison extends Predicate {

  private static readonly regex = /(\w+)\s+(=|==|<>|!=|>|>=|<|<=)\s+(')?([^']+)(')?/
  private static readonly regexFromOperatorOn = /(=|==|<>|!=|>|>=|<|<=)\s+(')?([^']+)(')?/

  column: string
  operator: string
  value?: any

  constructor(column: string, operator: string, value?: any)
  constructor(alias: string, column: string, operator: string, value?: any)

  constructor(aliasOrColumn: string, columnOrOperator: string, operatorOrValue?: any, value?: any) {
    super()

    if (value === undefined) {
      this.column = aliasOrColumn
      this.operator = columnOrOperator
      this.value = operatorOrValue
    }
    else {
      this.alias = aliasOrColumn
      this.column = columnOrOperator
      this.operator = operatorOrValue
      this.value = value
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
      return alias + this.column + ' ' + this.operator + ' ' + getParameterQueryString(db, 1)
    }
    else {
      return {
        sql: alias + this.column + ' ' + this.operator + ' ' + getParameterQueryString(db, options.parameterIndex),
        parameterIndex: ++options.parameterIndex // ++ in front increases first and then assigns
      }
    }
  }

  values(): any[] {
    return [ this.value ]
  }

  static isOperator(operator: string): boolean {
    return operator == '=' ||
        operator == '<>' ||
        operator == '!=' ||
        operator == '>' ||
        operator == '>=' ||
        operator == '<' ||
        operator == '<='
  }

  static parse(expression: string): Comparison|undefined {
    let result = this.regex.exec(expression)

    if (result != undefined) {
      let column = result[1]
      let operator = result[2]
      let leftApostrophe = result[3]
      let value: string|number = result[4]
      let rightApostrophe = result[5]

      if (leftApostrophe == undefined) {
        try {
          value = parseInt(value)
        }
        catch (e) {}
      }

      return new Comparison(column, operator, value)
    }
  }

  static parseFromOperatorOn(column: string, expression: string): Comparison|undefined {
    let result = this.regexFromOperatorOn.exec(expression)

    if (result != undefined) {
      let operator = result[1]
      let leftApostrophe = result[2]
      let value: string|number = result[3]
      let rightApostrophe = result[4]

      if (leftApostrophe == undefined && rightApostrophe == undefined) {
        try {
          value = parseInt(value)
        }
        catch (e) {}
      }

      return new Comparison(column, operator, value)
    }
  }
}
