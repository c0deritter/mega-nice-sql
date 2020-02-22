// https://ronsavage.github.io/SQL/sql-92.bnf.html

export default class {

  static select(select: string): Query {
    let query = new Query()
    query.select(select)
    return query
  }

  static insertInto(insertInto: string): Query {
    let query = new Query()
    query.insertInto(insertInto)
    return query
  }

  static update(update: string): Query {
    let query = new Query()
    query.update(update)
    return query
  }

  static deleteFrom(deleteFrom: string): Query {
    let query = new Query()
    query.deleteFrom(deleteFrom)
    return query
  }
}

export class Query {

  private _selects: string[] = []
  private _insertInto?: string
  private _values: Value[] = []
  private _update?: string
  private _deleteFrom?: string
  private _froms: string[] = []
  private _joins: Join[] = []
  private _wheres: Where[] = []
  private _orderBys: OrderBy[] = []
  private _limit?: number
  private _offset?: number
  private _returnings: string[] = []

  select(select: string): Query {
    this._selects.push(select)
    return this
  }

  insertInto(insertInto?: string): Query {
    this._insertInto = insertInto
    return this
  }

  update(update: string): Query {
    this._update = update
    return this
  }

  deleteFrom(deleteFrom: string): Query {
    this._deleteFrom = deleteFrom
    return this
  }

  from(from: string): Query {
    this._froms.push(from)
    return this
  }

  join(typeOrTable: string, tableOrOn: string, on?: string): Query {
    this._joins.push(new Join(typeOrTable, tableOrOn, on))
    return this
  }

  value(column: string, value: any): Query {
    this._values.push(new Value(column, value))
    return this
  }

  set(column: string, value: any): Query {
    this._values.push(new Value(column, value))
    return this
  }

  where(where: string, valueOrOperator?: any, value?: any): Query {
    this._wheres.push(new Where(where, valueOrOperator, value))
    return this
  }

  orderBy(orderBy: string, direction?: string): Query {
    let orderByObj = new OrderBy(orderBy, direction)
    this._orderBys.push(orderByObj)
    return this
  }

  limit(limit: number): Query {
    this._limit = limit
    return this
  }

  offset(offset: number): Query {
    this._offset = offset
    return this
  }

  returning(returning: string): Query {
    this._returnings.push(returning)
    return this
  }

  sql(db: string = 'mysql'): string {
    let sql = ''
    let parameterIndex = 1

    if (this._selects.length > 0) {
      sql += 'SELECT '
      let firstSelect = true

      for (let select of this._selects) {
        if (! firstSelect) {
          sql += ', '
        }

        sql += select
        firstSelect = false
      }
    }

    if (this._insertInto != undefined) {
      sql += 'INSERT INTO ' + this._insertInto
    }

    if (this._update != undefined) {
      sql += 'UPDATE ' + this._update
    }

    if (this._deleteFrom != undefined) {
      sql += 'DELETE FROM ' + this._deleteFrom
    }

    if (this._froms.length > 0) {
      sql += ' FROM '
      let firstFrom = true

      for (let from of this._froms) {
        if (! firstFrom) {
          sql += ', '
        }

        sql += from
        firstFrom = false
      }
    }

    for (let join of this._joins) {
      sql += ' ' + join.sql()
    }

    if (this._insertInto != undefined && this._values.length > 0) {
      sql += ' ('
      let firstValue = true

      for (let value of this._values) {
        if (! firstValue) {
          sql += ', '
        }
        
        sql += value.column
        firstValue = false
      }

      sql += ') VALUES ('

      firstValue = true
      for (let value of this._values) {
        if (! firstValue) {
          sql += ', '
        }
        
        sql += getParameterQueryString(db, parameterIndex)
        parameterIndex++
        firstValue = false
      }

      sql += ')'
    }
    else if (this._insertInto != undefined) {
      sql += ' DEFAULT VALUES'
    }

    if (this._update != undefined && this._values.length > 0) {
      sql += ' SET '
      let firstValue = true

      for (let value of this._values) {
        if (! firstValue) {
          sql += ', '
        }
        
        sql += value.column + ' = ' + getParameterQueryString(db, parameterIndex)
        parameterIndex++
        firstValue = false
      }
    }

    if (this._wheres.length > 0) {
      sql += ' WHERE '

      let firstWhere = true
      for (let where of this._wheres) {
        if (! firstWhere) {
          sql += ' AND '
        }

        let whereResult = <{ sql: string, parameterIndex: number }> where.sql(db, parameterIndex)
        parameterIndex = whereResult.parameterIndex
        sql += whereResult.sql
        firstWhere = false
      }
    }

    if (this._orderBys.length > 0) {
      sql += ' ORDER BY '
      let firstOrderBy = true

      for (let orderBy of this._orderBys) {
        if (! firstOrderBy) {
          sql += ', '
        }

        sql += orderBy.sql()
        firstOrderBy = false
      }
    }

    if (this._limit != undefined) {
      sql += ' LIMIT ' + getParameterQueryString(db, parameterIndex)
      parameterIndex++
    }
    
    if (this._offset != undefined) {
      sql += ' OFFSET ' + getParameterQueryString(db, parameterIndex)
      parameterIndex++
    }

    if (this._returnings.length > 0) {
      sql += ' RETURNING '
      let firstReturning = true

      for (let returning of this._returnings) {
        if (! firstReturning) {
          sql += ', '
        }

        sql += returning
        firstReturning = false
      }
    }
    
    if (sql.length > 0) {
      sql += ';'
    }

    return sql
  }

  values(): any[] {
    let values: any[] = []

    for (let value of this._values) {
      values.push(value.value)
    }

    for (let where of this._wheres) {
      values.push(...where.values())
    }

    if (this._limit != undefined) {
      values.push(this._limit)
    }

    if (this._offset != undefined) {
      values.push(this._offset)
    }

    return values
  }
}

export class Join {
  type: string = ''
  table: string
  on?: string

  constructor(typeOrTable: string, tableOrOn: string, on?: string) {
    let upperCase = typeOrTable.trim().toUpperCase()

    if (upperCase.startsWith('INNER') || upperCase.startsWith('LEFT') || 
        upperCase.startsWith('RIGHT') || upperCase.startsWith('FULL')) {
      this.type = upperCase
      this.table = tableOrOn
      this.on = on
    }
    else {
      this.table = typeOrTable
      this.on = tableOrOn
    }
  }

  sql(): string {
    return this.type + ' JOIN ' + this.table + ' ON ' + this.on
  }
}

export class Where {

  mode: string = 'mysql'
  predicate: Predicate

  constructor(where: string)
  constructor(column: string, value: any)
  constructor(column: string, operator: string, value: any)
  constructor(column: string, expression: string)
  
  constructor(whereOrColumn: string, valueOrOperatorOrExpression?: any, value?: any) {
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
    // we got no second parameter which means the first one is a whole expression
    else {
      throw new Error('Not implemented')
    }
  }

  sql(db: string = 'mysql', parameterIndex?: number): string | { sql: string, parameterIndex: number } {
    let index
    if (parameterIndex == undefined) {
      index = 1
    }
    else {
      index = parameterIndex
    }

    let result = <{ sql: string, parameterIndex: number }> this.predicate.sql(db, index)

    if (parameterIndex == undefined) {
      return result.sql
    }
    else {
      return result
    }
  }

  values(): any[] {
    return this.predicate.values()
  }
}

abstract class Predicate {
  abstract sql(db: string, parameterIndex?: number): string | { sql: string, parameterIndex: number }
  abstract values(): any[]
}

class Comparison extends Predicate {

  private static readonly regex = /(\w+)\s+(=|<>|!=|>|>=|<|<=)\s+(')?([^']+)(')?/
  private static readonly regexFromOperatorOn = /(=|<>|!=|>|>=|<|<=)\s+(')?([^']+)(')?/

  column: string
  operator: string
  value?: any

  constructor(column: string, operator: string, value?: any) {
    super()

    this.column = column
    this.operator = operator
    this.value = value
  }

  sql(db: string, parameterIndex?: number): string | { sql: string, parameterIndex: number } {
    if (parameterIndex == undefined) {
      return this.column + ' ' + this.operator + ' ' + getParameterQueryString(db, 1)
    }
    else {
      return {
        sql: this.column + ' ' + this.operator + ' ' + getParameterQueryString(db, parameterIndex),
        parameterIndex: ++parameterIndex // ++ in front increases first and then assigns
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

class In extends Predicate {

  private static readonly regex = /(\w+)\s+IN\s+(\()([^\)]*)(\))/i
  private static readonly regexFromOperatorOn = /IN\s+(\()([^\)]*)(\))/i

  column: string
  valuesArray: any[]

  constructor(column: string, values: any[]) {
    super()

    this.column = column
    this.valuesArray = values
  }

  sql(db: string, parameterIndex?: number): string | { sql: string, parameterIndex: number } {
    let index
    if (parameterIndex == undefined) {
      index = 1
    }
    else {
      index = parameterIndex
    }

    let sql = this.column + ' IN ('

    if (this.valuesArray instanceof Array) {
      for (let i = 0; i < this.valuesArray.length; i++) {
        if (i > 0) {
          sql += ', '
        }

        sql += getParameterQueryString(db, index)
        index++
      }
    }

    sql += ')'

    if (parameterIndex == undefined) {
      return sql
    }
    else {
      return {
        sql: sql,
        parameterIndex: index
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
        if (rawValue.length > 0 && rawValue[0] == '\'') {
          values.push(rawValue.slice(1, rawValue.length - 2))
        }
        else {
          try {
            let value = parseFloat(rawValue)
            values.push(value)
          }
          catch (e) {
            values.push(rawValue)
          }
        }
      }
    }

    return values
  }
}

class Null extends Predicate {

  private static readonly regex = /(\w+)\s+IS\s+(NOT(?:\s+))?NULL/i
  private static readonly regexFromOperatorOn = /IS\s+(NOT(?:\s+))?NULL/i

  column: string
  not: boolean

  constructor(column: string, not: boolean = false) {
    super()

    this.column = column
    this.not = not
  }

  sql(db: string, parameterIndex?: number): string | { sql: string, parameterIndex: number } {
    if (parameterIndex == undefined) {
      return this.column + (this.not ? ' IS NOT NULL' : ' IS NULL')
    }
    else {
      return {
        sql: this.column + (this.not ? ' IS NOT NULL' : ' IS NULL'),
        parameterIndex: parameterIndex
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

export class Value {
  column: string
  value: any

  constructor(column: string, value: any) {
    this.column = column
    this.value = value
  }
}

export class OrderBy {

  column: string
  direction?: string

  constructor(column: string, direction?: string) {
    this.column = column
    this.direction = direction
  }

  sql(): string {
    if (this.direction != undefined) {
      if (this.direction.toLowerCase() == 'asc') {
        return this.column + ' ASC'
      }
      else if (this.direction.toLowerCase() == 'desc') {
        return this.column + ' DESC'
      }
      else {
        return this.column + ' ' + this.direction
      }
    }

    return this.column
  }
}

function getParameterQueryString(db: string, parameterIndex: number = 1): string {
  if (db == 'mysql' || db == 'mariadb') {
    return '?'
  }
  
  if (db == 'postgres') {
    return '$' + parameterIndex
  }

  return ''
}
