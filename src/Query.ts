import { From } from './From'
import { Join } from './Join'
import { OrderBy } from './OrderBy'
import { getParameterQueryString } from './tools'
import { Value } from './Value'
import { Where } from './Where'

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
