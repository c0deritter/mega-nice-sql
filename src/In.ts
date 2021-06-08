import { Predicate } from './Predicate'
import { getParameterQueryString } from './tools'

export class In extends Predicate {

  private static readonly regex = /(\w+)\s+IN\s+\(([^\)]*)\)/i
  private static readonly regexFromOperatorOn = /IN\s+\(([^\)]*)\)/i

  column: string
  valuesArray: any[]

  constructor(column: string, values: any[])
  constructor(alias: string, column: string, values: any[])

  constructor(aliasOrColumn: string, columnOrValues: string|any[], values?: any[]) {
    super()

    if (values == undefined) {
      this.column = aliasOrColumn
      this.valuesArray = <any[]> columnOrValues
    }
    else {
      this.alias = aliasOrColumn
      this.column = <string> columnOrValues
      this.valuesArray = values
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

    let parameterIndex
    if (options == undefined || options.parameterIndex == undefined) {
      parameterIndex = 1
    }
    else {
      parameterIndex = options.parameterIndex
    }

    let sql = alias + this.column + ' IN ('

    if (this.valuesArray instanceof Array) {
      for (let i = 0; i < this.valuesArray.length; i++) {
        if (i > 0) {
          sql += ', '
        }

        sql += getParameterQueryString(db, parameterIndex)
        parameterIndex++
      }
    }

    sql += ')'

    if (options == undefined || options.parameterIndex == undefined) {
      return sql
    }
    else {
      return {
        sql: sql,
        parameterIndex: parameterIndex
      }
    }
  }

  values(): any[] {
    return this.valuesArray
  }

  static isOperator(operator: string) {
    return operator == 'IN'
  }

  static parse(expression: string): In|undefined {
    let result = this.regex.exec(expression)

    if (result != undefined) {
      let column = result[1]
      let valuesExpression = result[2]
      let values = this.convertToArray(valuesExpression)
      return new In(column, values)
    }
  }

  static parseFromOperatorOn(column: string, expression: string): In|undefined {
    let result = this.regexFromOperatorOn.exec(expression)

    if (result != undefined) {
      let valuesExpression = result[1]
      let values = this.convertToArray(valuesExpression)
      return new In(column, values)
    }
  }

  private static convertToArray(valuesExpression: string): any[] {
    let values: any[] = []
    if (valuesExpression.length > 0) {
      let rawValues = valuesExpression.split(',')

      for (let rawValue of rawValues) {
        rawValue = rawValue.trim()

        if (rawValue.length > 0) {
          if (rawValue[0] == '\'') {
            values.push(rawValue.slice(1, rawValue.length - 1))
          }
          else if (rawValue.toLowerCase() == 'true') {
            values.push(true)
          }
          else if (rawValue.toLowerCase() == 'false') {
            values.push(false)
          }
          else {
            let value = parseFloat(rawValue)
            if (! isNaN(value)) {
              values.push(value)
            }
            else {
              values.push(rawValue)
            }
          }
        } 
      }
    }

    return values
  }
}
