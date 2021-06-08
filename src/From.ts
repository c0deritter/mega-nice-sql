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
