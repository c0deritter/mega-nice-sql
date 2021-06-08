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
