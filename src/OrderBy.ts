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
