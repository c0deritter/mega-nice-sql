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
    let sql = ""
    let parameterIndex = 1

    if (this._selects.length > 0) {
      sql += "SELECT "
      let firstSelect = true

      for (let select of this._selects) {
        if (! firstSelect) {
          sql += ", "
        }

        sql += select
        firstSelect = false
      }
    }

    if (this._insertInto != undefined) {
      sql += "INSERT INTO " + this._insertInto
    }

    if (this._update != undefined) {
      sql += "UPDATE " + this._update
    }

    if (this._deleteFrom != undefined) {
      sql += "DELETE FROM " + this._deleteFrom
    }

    if (this._froms.length > 0) {
      sql += " FROM "
      let firstFrom = true

      for (let from of this._froms) {
        if (! firstFrom) {
          sql += ", "
        }

        sql += from
        firstFrom = false
      }
    }

    for (let join of this._joins) {
      sql += " " + join.sql()
    }

    if (this._insertInto != undefined && this._values.length > 0) {
      sql += " ("
      let firstValue = true

      for (let value of this._values) {
        if (! firstValue) {
          sql += ", "
        }
        
        sql += value.column
        firstValue = false
      }

      sql += ") VALUES ("

      firstValue = true
      for (let value of this._values) {
        if (! firstValue) {
          sql += ", "
        }
        
        sql += getParameterQueryString(db, parameterIndex)
        parameterIndex++
        firstValue = false
      }

      sql += ")"
    }
    else if (this._insertInto != undefined) {
      sql += " DEFAULT VALUES"
    }

    if (this._update != undefined && this._values.length > 0) {
      sql += " SET "
      let firstValue = true

      for (let value of this._values) {
        if (! firstValue) {
          sql += ", "
        }
        
        sql += value.column + " = " + getParameterQueryString(db, parameterIndex)
        parameterIndex++
        firstValue = false
      }
    }

    if (this._wheres.length > 0) {
      sql += " WHERE "

      let firstWhere = true
      for (let where of this._wheres) {
        if (! firstWhere) {
          sql += " AND "
        }

        let whereResult = <{ sql: string, varIndex: number }> where.sql(db, parameterIndex)
        parameterIndex = whereResult.varIndex
        sql += whereResult.sql
        firstWhere = false
      }
    }

    if (this._orderBys.length > 0) {
      sql += " ORDER BY "
      let firstOrderBy = true

      for (let orderBy of this._orderBys) {
        if (! firstOrderBy) {
          sql += ", "
        }

        sql += orderBy.sql()
        firstOrderBy = false
      }
    }

    if (this._limit != undefined) {
      sql += " LIMIT " + getParameterQueryString(db, parameterIndex)
      parameterIndex++
    }
    
    if (this._offset != undefined) {
      sql += " OFFSET " + getParameterQueryString(db, parameterIndex)
      parameterIndex++
    }

    if (this._returnings.length > 0) {
      sql += " RETURNING "
      let firstReturning = true

      for (let returning of this._returnings) {
        if (! firstReturning) {
          sql += ", "
        }

        sql += returning
        firstReturning = false
      }
    }
    
    if (sql.length > 0) {
      sql += ";"
    }

    return sql
  }

  values(): any[] {
    let values: any[] = []

    for (let value of this._values) {
      values.push(value.value)
    }

    for (let where of this._wheres) {
      if (where.operator == "IN") {
        if (where.value instanceof Array) {
          for (let value of where.value) {
            values.push(value)
          }
        }
        else {
          values.push(where.value)
        }
      }
      else if (! where.operator.endsWith("NULL")) {
        values.push(where.value)
      }
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
  type: string = ""
  table: string
  on?: string

  constructor(typeOrTable: string, tableOrOn: string, on?: string) {
    let upperCase = typeOrTable.trim().toUpperCase()

    if (upperCase.startsWith("INNER") || upperCase.startsWith("LEFT") || 
        upperCase.startsWith("RIGHT") || upperCase.startsWith("FULL")) {
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
    return this.type + " JOIN " + this.table + " ON " + this.on
  }
}

export class Where {

  private static readonly nullRegExp = /(\w+\bis\b\w+\bnull\b\w*)/i
  private static readonly notNullRegExp = /(\w+\bis\b\w+\bnot\b\w+\bnull\b\w*)/i
  private static readonly inRegExp = /(\w+\bin\b\w*)/i

  mode: string = 'mysql'
  column: string
  operator: string = "="
  value: any
  
  constructor(where: string, valueOrOperator?: any, value?: any) {
    if (where.search(Where.nullRegExp) > -1) {
      this.column = where.replace(Where.nullRegExp, "")
      this.operator = "IS NULL"
    }
    else if (where.search(Where.notNullRegExp) > -1) {
      this.column = where.replace(Where.notNullRegExp, "")
      this.operator = "IS NOT NULL"
    }
    else if (where.search(Where.inRegExp) > -1) {
      this.column = where.replace(Where.inRegExp, "")
      this.operator = "IN"
    }
    else {
      this.column = where
    }
    
    if (valueOrOperator !== undefined) {
      // 4 because LIKE is the longest supported operator
      if (typeof valueOrOperator == 'string' && valueOrOperator.length <= 4) {
        let upperCase = valueOrOperator.trim().toUpperCase()

        if (upperCase == "=" || upperCase == ">" || upperCase == "<" || upperCase == ">=" ||
            upperCase == "<=" || upperCase == "<>" || upperCase == "IN" || upperCase == "LIKE") {
          this.operator = upperCase
        }
        else {
          this.operator = "="
          this.value = valueOrOperator
        }
      }
      else if (valueOrOperator === null) {
        this.operator = "IS NULL"
      }
      else if (valueOrOperator instanceof Array) {
        this.operator = "IN"
        this.value = valueOrOperator
      }
      else {
        this.operator = "="
        this.value = valueOrOperator
      }
    }

    if (value != undefined) {
      this.value = value
    }
  }

  sql(db: string = 'mysql', parameterIndex?: number): string | { sql: string, varIndex: number } {
    let externalVarIndex = true

    if (parameterIndex == undefined) {
      parameterIndex = 1
      externalVarIndex = false
    }

    let sql = this.column + " " + this.operator

    if (this.operator == "IN") {
      sql += " ("

      if (this.value instanceof Array && this.value.length > 0) {

        let firstValue = true        
        for (let value of this.value) {
          if (! firstValue) {
            sql += ", "
          }

          sql += getParameterQueryString(db, parameterIndex)
          parameterIndex++
          firstValue = false
        }
      }

      sql += ")"
    }
    else if (! this.operator.endsWith("NULL")) {
      sql += " " + getParameterQueryString(db, parameterIndex)
      parameterIndex++
    }

    if (externalVarIndex) {
      return {
        sql: sql,
        varIndex: parameterIndex
      }
    }
    else {
      return sql
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
      if (this.direction.toLowerCase() == "asc") {
        return this.column + " ASC"
      }
      else if (this.direction.toLowerCase() == "desc") {
        return this.column + " DESC"
      }
      else {
        return this.column + " " + this.direction
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
