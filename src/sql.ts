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

  static delete_(delete_?: string) {
    let query = new Query()
    query.delete_(delete_)
    return query
  }

  static deleteFrom(from: string): Query {
    let query = new Query()
    query.deleteFrom(from)
    return query
  }
}

export class Query {

  private static readonly asRegex = /(\w+)\s+(AS)?\s?(\w+)/i

  _selects: string[] = []
  _insertInto?: string
  _values: Value[] = []
  _update?: string
  _delete?: string
  _froms: From[] = []
  _joins: Join[] = []
  _usings: string[] = []
  _wheres: Where[] = []
  _orderBys: OrderBy[] = []
  _limit?: number
  _offset?: number
  _returnings: string[] = []

  select(expression: string): Query
  select(column: string, alias?: string): Query

  select(expressionOrColumn: string, alias?: string): Query {
    expressionOrColumn = expressionOrColumn.trim()

    if (expressionOrColumn.indexOf(' ') == -1) {
      if (alias == undefined || alias.length == 0) {
        this._selects.push(expressionOrColumn)
      }
      else {
        this._selects.push(expressionOrColumn + ' ' + alias)
      }
    }
    else {
      let result = Query.asRegex.exec(expressionOrColumn)

      if (result != undefined) {
        let table = result[1]
        let alias = result[3]

        this._selects.push(table + ' ' + alias)
      }
      else {
        throw new Error('Given expression did not match the expected syntax: ' + expressionOrColumn)
      }      
    }

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

  delete_(delete_?: string): Query {
    this._delete = delete_ == undefined ? '' : delete_
    return this
  }

  deleteFrom(expressionOrTable: string, alias?: string): Query {
    this._delete = ''
    this._froms.push(new From(expressionOrTable, alias))
    return this
  }

  from(expression: string): Query
  from(table: string, alias?: string): Query

  from(expressionOrTable: string, alias?: string): Query {
    this._froms.push(new From(expressionOrTable, alias))
    return this
  }

  join(type: string, table: string, on: string): Query
  join(type: string, table: string, alias: string, on: string): Query
  join(table: string, on: string): Query
  join(table: string, alias: string, on: string): Query

  join(typeOrTable: string, tableOrOnOrAlias: string, onOrAlias?: string, on?: string): Query {
    this._joins.push(new Join(typeOrTable, tableOrOnOrAlias, onOrAlias as any, on as any))
    return this
  }

  /**
   * A USING statement like this: DELETE FROM A USING B, C
    * Supported in PostgreSQL 9.1+ (https://stackoverflow.com/questions/11753904/postgresql-delete-with-inner-join)
   */
  using(...usings: string[]): Query {
    for (let using of usings) {
      if (using.indexOf(',')) {
        let splits = using.split(',')

        for (let split of splits) {
          let trimmed = split.trim()

          if (this._usings.indexOf(trimmed) == -1) {
            this._usings.push(trimmed)
          }
        }
      }
      else {
        let trimmed = using.trim()

        if (this._usings.indexOf(trimmed) == -1) {
          this._usings.push(trimmed)
        }
      }
    }
    
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

  where(expression: string, values: any[]): Query
  where(column: string, value: any): Query
  where(column: string, operator: string, value: any): Query
  where(column: string, expression: string): Query
  where(...where: Where[]): Query
  where(logical: string, expression: string, values: any[]): Query
  where(logical: string, column: string, value: any): Query
  where(logical: string, column: string, operator: string, value: any): Query
  where(logical: string, column: string, expression: string): Query
  where(logical: string, ...where: Where[]): Query
  
  where(...args: any[]): Query {
    this._wheres.push(new Where(...args))
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

  postgres(): string {
    return this.sql('postgres')
  }

  mysql(): string {
    return this.sql('mysql')
  }

  maria(): string {
    return this.sql('mysql')
  }

  sql(db: string): string {
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

    if (this._delete != undefined) {
      sql += 'DELETE' + (this._delete.length > 0 ? ' ' + this._delete : '')
    }

    if (this._froms.length > 0) {
      sql += ' FROM '
      let firstFrom = true

      for (let from of this._froms) {
        if (! firstFrom) {
          sql += ', '
        }

        sql += from.sql()
        firstFrom = false
      }
    }

    if (this._usings.length > 0) {
      let usings = this._usings.join(', ')
      sql += ' USING ' + usings
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

    // we determine if there is exactly one From because if there is
    // we want to prepend the alias to every column name
    let onlyFrom: From|undefined = undefined

    if (this._froms.length == 1) {
      onlyFrom = this._froms[0]
    }

    if (this._wheres.length > 0) {
      sql += ' WHERE '

      let firstWhere = true
      for (let where of this._wheres) {
        if (! firstWhere) {
          sql += ' ' + where.logical + ' '
        }

        let whereResult = <{ sql: string, parameterIndex: number }> where.sql(db, {
          alias: onlyFrom != undefined ? onlyFrom.alias : undefined,
          parameterIndex: parameterIndex
        })

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

        let orderByResult = <{ sql: string, parameterIndex: number }> orderBy.sql(db, {
          alias: onlyFrom != undefined ? onlyFrom.alias : undefined,
          parameterIndex: parameterIndex
        })
        
        parameterIndex = orderByResult.parameterIndex
        sql += orderByResult.sql
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

export class From {

  private static readonly regex = /(\w+)\s+(AS)?\s?(\w+)/i

  table!: string
  alias?: string

  constructor(expression: string)
  constructor(table: string, alias?: string)

  constructor(expressionOrTable: string, alias?: string) {
    if (expressionOrTable.indexOf(' ') == -1) {
      this.table = expressionOrTable
      this.alias = alias
    }
    else {
      let result = From.regex.exec(expressionOrTable)

      if (result != undefined) {
        this.table = result[1]
        this.alias = result[3]
      }
      else {
        throw new Error('Given expression did not match the expected syntax: ' + expressionOrTable)
      }
    }
  }

  sql(): string {
    return this.table + (this.alias != undefined && this.alias.length > 0 ? ' ' + this.alias : '')
  }
}

export class Join {

  type?: string
  table: string
  alias?: string
  on?: string

  constructor(type: string, table: string, on: string)
  constructor(type: string, table: string, alias: string, on: string)
  constructor(table: string, on: string)
  constructor(table: string, alias: string, on: string)

  constructor(typeOrTable: string, tableOrOnOrAlias: string, onOrAlias?: string, on?: string) {
    let upperCase = typeOrTable.toUpperCase()

    if (upperCase.startsWith('INNER') || upperCase.startsWith('LEFT') || 
        upperCase.startsWith('RIGHT') || upperCase.startsWith('FULL')) {
      this.type = upperCase
      this.table = tableOrOnOrAlias

      if (onOrAlias != undefined && on == undefined) {
        this.on = onOrAlias
      }
      else if (onOrAlias != undefined && on != undefined) {
        this.alias = onOrAlias
        this.on = on
      }
    }
    else {
      this.table = typeOrTable

      if (onOrAlias == undefined) {
        this.on = tableOrOnOrAlias
      }
      else {
        this.alias = tableOrOnOrAlias
        this.on = onOrAlias
      }
    }
  }

  sql(): string {
    return (this.type != undefined && this.type.length > 0 ? this.type + ' ' : '') +
      'JOIN ' +
      this.table +
      (this.alias != undefined && this.alias.length > 0 ? ' ' + this.alias : '') +
      ' ON ' + this.on
  }
}

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

export abstract class Predicate {
  alias?: string
  abstract sql(db: string, options: { alias?: string, parameterIndex?: number }): string | { sql: string, parameterIndex: number }
  abstract values(): any[]
}

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
    let alias: string = ""

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

export class Value {
  column: string
  value: any

  constructor(column: string, value: any) {
    this.column = column
    this.value = value
  }
}

export class OrderBy {

  alias?: string
  column: string
  direction?: string

  constructor(column: string, direction?: string)
  constructor(alias: string, column: string, direction?: string)

  constructor(arg1: string, arg2?: string, arg3?: string) {
    if (arg1 != undefined && arg2 == undefined && arg3 == undefined) {
      this.column = arg1
    }
    else if (arg1 != undefined && arg2 != undefined && arg3 == undefined) {
      if (arg2.toUpperCase() == 'ASC' || arg2.toUpperCase() == 'DESC') {
        this.column = arg1
        this.direction = arg2
      }
      else {
        this.alias = arg1
        this.column = arg2
      }
    }
    else {
      this.alias = arg1
      this.column = arg2!
      this.direction = arg3
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

    let sql: string|undefined = undefined

    if (this.direction != undefined) {
      if (this.direction.toUpperCase() == 'ASC') {
        sql = alias + this.column + ' ASC'
      }
      else if (this.direction.toUpperCase() == 'DESC') {
        sql = alias + this.column + ' DESC'
      }
      else if (this.direction.length > 0) {
        sql = alias + this.column + ' ' + this.direction
      }
      else {
        sql = alias + this.column
      }
    }
    else {
      sql = alias + this.column
    }

    if (options == undefined || options.parameterIndex == undefined) {
      return sql
    }
    else {
      return {
        sql: sql,
        parameterIndex: options.parameterIndex
      }
    }
  }
}

function getParameterQueryString(db: string, parameterIndex: number = 1): string {
  if (db == 'mysql' || db == 'maria') {
    return '?'
  }
  
  if (db == 'postgres') {
    return '$' + parameterIndex
  }

  return ''
}
