import { Comparison } from './Comparison'
import { In } from './In'
import { Null } from './Null'
import { Predicate } from './Predicate'

export function where(expression: string, values: any[]): Where
export function where(column: string, value: any): Where
export function where(column: string, operator: string, value: any): Where
export function where(column: string, expression: string): Where
export function where(...where: Where[]): Where
export function where(logical: string, expression: string, values: any[]): Where
export function where(logical: string, column: string, value: any): Where
export function where(logical: string, column: string, operator: string, value: any): Where
export function where(logical: string, column: string, expression: string): Where
export function where(logical: string, ...where: Where[]): Where

export function where(...args: any[]): Where {
  return new Where(...args)
}

export class Where {

  logical: string = 'AND' // AND or OR or XOR
  predicate?: Predicate
  wheres?: Where[]
  expression?: string
  _values?: any[]

  constructor(expression: string, values: [])
  constructor(column: string, value: any)
  constructor(column: string, operator: string, value: any)
  constructor(column: string, expression: string)
  constructor(...where: Where[])
  constructor(logical: string, expression: string, values: [])
  constructor(logical: string, column: string, value: any)
  constructor(logical: string, column: string, operator: string, value: any)
  constructor(logical: string, column: string, expression: string)
  constructor(logical: string, ...where: Where[])
  
  constructor(...args: any[]) {
    if (args[0] instanceof Where || args.length >= 2 && args[1] instanceof Where) {
      let i = 0
      if (args[i] == 'OR' || args[i] == 'XOR' || args[i] == 'AND') {
        this.logical = args[i]
        i++
      }

      this.wheres = []
      for (; i < args.length; i++) {
        this.wheres.push(args[i])
      }
    }
    else if (args.length == 1) {
      this.expression = args[0]
    }
    else if ((args.length == 1 || args.length == 2) && typeof args[0] == 'string' && args[0].indexOf(' ') > -1) {
      this.expression = args[0]

      if (args.length == 2) {
        this._values = args[1]
      }
    }
    else if ((args.length == 2 || args.length == 3) && (args[0] == 'AND' || args[0] == 'OR' || args[0] == 'XOR') && typeof args[1] == 'string' && args[1].indexOf(' ') > -1) {
      this.logical = args[0]
      this.expression = args[1]

      if (args.length == 3) {
        this._values = args[2]
      }
    }
    else {
      let whereOrColumnOrLogical = args[0]
      let valueOrOperatorOrExpressionOrWhereOrColumn = args.length >= 2 ? args[1] : undefined
      let valueOrOperatorOrExpression = args.length >= 3 ? args[2] : undefined
      let value = args.length >= 4 ? args[3] : undefined
      let whereOrColumn

      if (whereOrColumnOrLogical == 'OR' || whereOrColumnOrLogical == 'XOR' || whereOrColumnOrLogical == 'AND') {
        this.logical = whereOrColumnOrLogical
        whereOrColumn = valueOrOperatorOrExpressionOrWhereOrColumn
      }
      else {
        whereOrColumn = whereOrColumnOrLogical
        value = valueOrOperatorOrExpression
        valueOrOperatorOrExpression = valueOrOperatorOrExpressionOrWhereOrColumn
      }
  
      // test if we got the second parameter
      if (valueOrOperatorOrExpression !== undefined) {
        let column
  
        // if we got a second parameter then the first one must be a column
        if (typeof whereOrColumn == 'string') {
          // trim the column
          column = whereOrColumn.trim()
        }
        else {
          // if the given column was not a string then there is something wrong
          throw new Error(`Given column is not of type string. ${whereOrColumn}`)
        }
  
        // test if we got the third parameter
        if (value !== undefined) {
          let operator
  
          // if we got the third parameter then the second one must be an operator
          if (typeof valueOrOperatorOrExpression == 'string') {
            // trim the operator
            operator = valueOrOperatorOrExpression.trim()
          }
          else {
            // if the given operator was not of type string then there is something wrong
            throw new Error(`Given operator was not of type string. ${valueOrOperatorOrExpression}`)
          }
  
          // if the value is exactly null or NULL as string and if so we will use the IS operator
          if (value === null || typeof value == 'string' && value.toUpperCase() == 'NULL') {
            if (Null.isOperator(operator)) {
              this.predicate = new Null(column, operator == 'IS NOT')
            }
            else if (operator == '=') {
              this.predicate = new Null(column)
            }
            else if (operator == '<>' || operator == '!=') {
              this.predicate = new Null(column, true)
            }
            else {
              // if the operator was neither = nor <> or != then there is something wrong
              throw new Error(`The given value was null but the given operator was neither '=' nor '<>' or '!='. ${operator}`)
            }
          }
          // if the value is an array we have to use the IN operator
          else if (value instanceof Array) {
            if (In.isOperator(operator)) {
              this.predicate = new In(column, value)
            }
            else {
              throw new Error(`The given operator does not work in conjunction with an array. Should be IN. ${operator}`)
            }
          }
          // if the value is anything else but NULL
          else {
            if (Comparison.isOperator(operator)) {
              this.predicate = new Comparison(column, operator, value)
            }
            else {
              throw new Error(`The given operator is unsupported. ${operator}`)
            }
          }
        }
        // we got no second parameter which either means we only got an operator without a value or we got an expression without a column in it
        else {
          // if the second parameter was a string we can test if it is an expression
          if (typeof valueOrOperatorOrExpression == 'string') {
            let expression = valueOrOperatorOrExpression.trim()
  
            let comparison = Comparison.parseFromOperatorOn(column, expression)
            if (comparison != undefined) {
              this.predicate = comparison
              return
            }
  
            let nullPredicate = Null.parseFromOperatorOn(column, expression)
            if (nullPredicate != undefined) {
              this.predicate = nullPredicate
              return
            }
  
            let inPredicate = In.parseFromOperatorOn(column, expression)
            if (inPredicate != null) {
              this.predicate = inPredicate
              return
            }
          }
  
          // if we still get here then we could not parse the expression and we can assume that we have been given a value
          let value = valueOrOperatorOrExpression
  
          // if the given value is exactly null or of type string and NULL then we use the IS operator
          if (value === null || typeof value == 'string' && value.toUpperCase() == 'NULL') {
            this.predicate = new Null(column)
          }
          // if the value is an array then we use the IN operator
          else if (value instanceof Array) {
            this.predicate = new In(column, value)
          }
          // anything else is a comparison with the = operator
          else {
            this.predicate = new Comparison(column, '=', value)
          }
        }
      }
    }
  }

  sql(db: string, options?: { alias?: string, parameterIndex?: number }): string | { sql: string, parameterIndex: number } {
    let parameterIndex
    let alias = options != undefined ? options.alias : undefined

    if (options != undefined && options.parameterIndex != undefined) {
      parameterIndex = options.parameterIndex
    }
    else {
      parameterIndex = 1
    }

    if (this.predicate) {
      let result = <{ sql: string, parameterIndex: number }> this.predicate.sql(db, {
        alias: alias,
        parameterIndex: parameterIndex
      })

      if (options == undefined || options.parameterIndex == undefined) {
        return result.sql
      }
      else {
        return result
      }  
    }
    else if (this.wheres != undefined) {
      let sql = ''
      
      if (this.wheres.length > 1) {
        sql += '('
      }

      let firstWhere = true
      for (let where of this.wheres) {
        if (! firstWhere) {
          sql += ' ' + where.logical + ' '
        }

        let result = <{ sql: string, parameterIndex: number }> where.sql(db, { alias: alias, parameterIndex: parameterIndex })
        sql += result.sql
        firstWhere = false
      }

      if (this.wheres.length > 1) {
        sql += ')'
      }

      if (options == undefined || options.parameterIndex == undefined) {
        return sql
      }
      else {
        return {
          sql: sql,
          parameterIndex: parameterIndex
        }
      }  
    }
    else {
      let expression = this.expression || ''

      if (db == 'postgres') {
        let indexOfParameter: number = 0

        while ((indexOfParameter = expression.indexOf('$', indexOfParameter)) > -1) {
          // check if there is a character after the $ and check if that is not already a number
          if (indexOfParameter + 1 < expression.length && ! Number.isNaN(parseInt(expression[indexOfParameter + 1]))) {
            indexOfParameter++
            continue
          }

          expression = expression.substr(0, indexOfParameter + 1) + parameterIndex + expression.substr(indexOfParameter + 1)
          parameterIndex++
          indexOfParameter++
        }
      }

      if (options == undefined || options.parameterIndex == undefined) {
        return expression
      }
      else {
        return {
          sql: expression,
          parameterIndex: parameterIndex
        }
      }
    }
  }

  values(): any[] {
    if (this.predicate) {
      return this.predicate.values()
    }
    else if (this.wheres != undefined) {
      let values: any[] = []

      for (let where of this.wheres) {
        values.push(...where.values())
      }

      return values
    }
    else if (this._values != undefined) {
      return this._values
    }

    return []
  }
}
