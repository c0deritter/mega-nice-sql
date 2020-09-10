import { expect } from 'chai'
import 'mocha'
import { Where } from '../src/sql'

describe('Where', function() {
  describe('expression', function() {
    describe('MySql', function() {
      it('should render an expression', function() {
        let where = new Where('a > \'aValue\' OR b = 1 XOR c = FALSE')
        let sql = where.sql('mysql')
        let values = where.values()
        expect(sql).to.equal('a > \'aValue\' OR b = 1 XOR c = FALSE')
        expect(values).to.deep.equal([])
      })
  
      it('should render an expression with given values', function() {
        let where = new Where('a > \'aValue\' OR b = ? XOR c = ?', [ 1, false ])
        let sql = where.sql('mysql')
        let values = where.values()
        expect(sql).to.equal('a > \'aValue\' OR b = ? XOR c = ?')
        expect(values).to.deep.equal([ 1, false ])
      })
  
      it('should render an expression with a given logical', function() {
        let where = new Where('XOR', 'a > \'aValue\' OR b = 1 XOR c = FALSE')
        let sql = where.sql('mysql')
        let values = where.values()
        expect(sql).to.equal('a > \'aValue\' OR b = 1 XOR c = FALSE')
        expect(values).to.deep.equal([])
      })
  
      it('should render an expression with a given logical and values', function() {
        let where = new Where('XOR', 'a > \'aValue\' OR b = ? XOR c = ?', [ 1, false ])
        let sql = where.sql('mysql')
        let values = where.values()
        expect(sql).to.equal('a > \'aValue\' OR b = ? XOR c = ?')
        expect(values).to.deep.equal([ 1, false ])
      })

      it('should render an expression containing a sub select', function() {
        let where = new Where('a IN (SELECT b FROM c WHERE d = ?)', [ 1 ])
        let sql = where.sql('mysql')
        let values = where.values()
        expect(sql).to.equal('a IN (SELECT b FROM c WHERE d = ?)')
        expect(values).to.deep.equal([ 1 ])
      })
    })

    describe('PostgreSql', function() {
      it('should render an expression', function() {
        let where = new Where('a > \'aValue\' OR b = 1 XOR c = FALSE')
        let sql = where.sql('postgres')
        let values = where.values()
        expect(sql).to.equal('a > \'aValue\' OR b = 1 XOR c = FALSE')
        expect(values).to.deep.equal([])
      })
  
      it('should render an expression with given values', function() {
        let where = new Where('a > \'aValue\' OR b = $ XOR c = $', [ 1, false ])
        let sql = where.sql('postgres')
        let values = where.values()
        expect(sql).to.equal('a > \'aValue\' OR b = $1 XOR c = $2')
        expect(values).to.deep.equal([ 1, false ])
      })
  
      it('should render an expression with a given logical', function() {
        let where = new Where('XOR', 'a > \'aValue\' OR b = 1 XOR c = FALSE')
        let sql = where.sql('postgres')
        let values = where.values()
        expect(sql).to.equal('a > \'aValue\' OR b = 1 XOR c = FALSE')
        expect(values).to.deep.equal([])
      })
  
      it('should render an expression with a given logical and values', function() {
        let where = new Where('XOR', 'a > \'aValue\' OR b = $ XOR c = $', [ 1, false ])
        let sql = where.sql('postgres')
        let values = where.values()
        expect(sql).to.equal('a > \'aValue\' OR b = $1 XOR c = $2')
        expect(values).to.deep.equal([ 1, false ])
      })
      
      it('should render an expression containing a sub select', function() {
        let where = new Where('a IN (SELECT b FROM c WHERE d = $)', [ 1 ])
        let sql = where.sql('postgres')
        let values = where.values()
        expect(sql).to.equal('a IN (SELECT b FROM c WHERE d = $1)')
        expect(values).to.deep.equal([ 1 ])
      })
    })
  })

  describe('Comparison', function() {
    describe('MySql', function() {
      it('should render a comparison from a column and value', function() {
        let where = new Where('a', 'aValue')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a = ?')
      })
  
      it('should render a comparison from a column, operator and value', function() {
        let where = new Where('a', '>', 'aValue')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a > ?')
      })

      it('should render a comparison from a column and an expression having a string as value', function() {
        let where = new Where('a', '> \'aValue\'')
        let sql = where.sql('mysql')
        let values = where.values()
        expect(sql).to.equal('a > ?')
        expect(values).to.deep.equal(['aValue'])
      })

      it('should render a comparison from a column and an expression having a number as value', function() {
        let where = new Where('a', '> 1')
        let sql = where.sql('mysql')
        let values = where.values()
        expect(sql).to.equal('a > ?')
        expect(values).to.deep.equal([1])
      })

      it('should render a comparison from a logical, column and value', function() {
        let where = new Where('OR', 'a', 'aValue')
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a = ?')
      })
  
      it('should render a comparison from a logical, column, operator and value', function() {
        let where = new Where('OR', 'a', '>', 'aValue')
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a > ?')
      })

      it('should render a comparison from a logical, column and an expression having a string as value', function() {
        let where = new Where('OR', 'a', '> \'aValue\'')
        let sql = where.sql('mysql')
        let values = where.values()
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a > ?')
        expect(values).to.deep.equal(['aValue'])
      })

      it('should render a comparison from a logical, column and an expression having a number as value', function() {
        let where = new Where('OR', 'a', '> 1')
        let sql = where.sql('mysql')
        let values = where.values()
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a > ?')
        expect(values).to.deep.equal([1])
      })

      it('should render an alias if given', function() {
        let where = new Where('a', '1')
        let sql = where.sql('mysql', { alias: 't' })
        expect(sql).to.equal('t.a = ?')
      })
    })

    describe('PostgreSQL', function() {
      it('should render a comparison from a column and value', function() {
        let where = new Where('a', 'aValue')
        let sql = where.sql('postgres')
        expect(sql).to.equal('a = $1')
      })
  
      it('should render a comparison from a column, operator and value', function() {
        let where = new Where('a', '>', 'aValue')
        let sql = where.sql('postgres')
        expect(sql).to.equal('a > $1')
      })

      it('should render a comparison from a column and an expression having a string as value', function() {
        let where = new Where('a', '> \'aValue\'')
        let sql = where.sql('postgres')
        let values = where.values()
        expect(sql).to.equal('a > $1')
        expect(values).to.deep.equal(['aValue'])
      })

      it('should render a comparison from a column and an expression having number as value', function() {
        let where = new Where('a', '> 1')
        let sql = where.sql('postgres')
        let values = where.values()
        expect(sql).to.equal('a > $1')
        expect(values).to.deep.equal([1])
      })

      it('should render a comparison from a logical, column and value', function() {
        let where = new Where('OR', 'a', 'aValue')
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a = $1')
      })
  
      it('should render a comparison from a logical, column, operator and value', function() {
        let where = new Where('OR', 'a', '>', 'aValue')
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a > $1')
      })

      it('should render a comparison from a logical, column and an expression having a string as value', function() {
        let where = new Where('OR', 'a', '> \'aValue\'')
        let sql = where.sql('postgres')
        let values = where.values()
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a > $1')
        expect(values).to.deep.equal(['aValue'])
      })

      it('should render a comparison from a logical, column and an expression having a number as value', function() {
        let where = new Where('OR', 'a', '> 1')
        let sql = where.sql('postgres')
        let values = where.values()
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a > $1')
        expect(values).to.deep.equal([1])
      })

      it('should render an alias if given', function() {
        let where = new Where('a', '1')
        let sql = where.sql('postgres', { alias: 't' })
        expect(sql).to.equal('t.a = $1')
      })
    })
  })

  describe('Null', function() {
    describe('MySql', function() {
      it('should render a NULL predicate from column and null', function() {
        let where = new Where('a', null)
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from column and NULL', function() {
        let where = new Where('a', 'NULL')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from column, = and null', function() {
        let where = new Where('a', '=', null)
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from column, = and NULL', function() {
        let where = new Where('a', '=', 'NULL')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from column ,<> and null', function() {
        let where = new Where('a', '<>', null)
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from column, <> and NULL', function() {
        let where = new Where('a', '<>', 'NULL')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from column, != and null', function() {
        let where = new Where('a', '!=', null)
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from column, != and NULL', function() {
        let where = new Where('a', '!=', 'NULL')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from column, IS and null', function() {
        let where = new Where('a', 'IS', null)
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from column, IS and NULL', function() {
        let where = new Where('a', 'IS', 'NULL')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from column, IS NOT and null', function() {
        let where = new Where('a', 'IS NOT', null)
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NOT NULL')
      })  

      it('should render a NULL predicate from column, IS NOT and NULL', function() {
        let where = new Where('a', 'IS NOT', 'NULL')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NOT NULL')
      })  

      it('should render a NULL predicate from column and IS NULL expression', function() {
        let where = new Where('a', 'IS NULL')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from column and IS NOT NULL expression', function() {
        let where = new Where('a', 'IS NOT NULL')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from expression', function() {
        let where = new Where('a IS NULL')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from expression', function() {
        let where = new Where('a IS NOT NULL')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NOT NULL')
      })

      it('should render a NULL predicate from a logical, column and null', function() {
        let where = new Where('OR', 'a', null)
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical, column and NULL', function() {
        let where = new Where('OR', 'a', 'NULL')
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical, column, = and null', function() {
        let where = new Where('OR', 'a', '=', null)
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical, column, = and NULL', function() {
        let where = new Where('OR', 'a', '=', 'NULL')
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical, column ,<> and null', function() {
        let where = new Where('OR', 'a', '<>', null)
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from a logical, column, <> and NULL', function() {
        let where = new Where('OR', 'a', '<>', 'NULL')
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from a logical, column, != and null', function() {
        let where = new Where('OR', 'a', '!=', null)
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from a logical, column, != and NULL', function() {
        let where = new Where('OR', 'a', '!=', 'NULL')
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from a logical, column, IS and null', function() {
        let where = new Where('OR', 'a', 'IS', null)
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical, column, IS and NULL', function() {
        let where = new Where('OR', 'a', 'IS', 'NULL')
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical, column, IS NOT and null', function() {
        let where = new Where('OR', 'a', 'IS NOT', null)
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })  

      it('should render a NULL predicate from a logical, column, IS NOT and NULL', function() {
        let where = new Where('OR', 'a', 'IS NOT', 'NULL')
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })  

      it('should render a NULL predicate from a logical, column and IS NULL expression', function() {
        let where = new Where('OR', 'a', 'IS NULL')
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical, column and IS NOT NULL expression', function() {
        let where = new Where('OR', 'a', 'IS NOT NULL')
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from a logical and an IS NULL expression', function() {
        let where = new Where('OR', 'a IS NULL')
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical and an IS NOT NULL expression', function() {
        let where = new Where('OR', 'a IS NOT NULL')
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })

      it('should render an alias if given', function() {
        let where = new Where('a', null)
        let sql = where.sql('mysql', { alias: 't' })
        expect(sql).to.equal('t.a IS NULL')
      })
    })

    describe('PostgreSQL', function() {
      it('should render a NULL predicate from column and null', function() {
        let where = new Where('a', null)
        let sql = where.sql('postgres')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from column and NULL', function() {
        let where = new Where('a', 'NULL')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from column, = and null', function() {
        let where = new Where('a', '=', null)
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from column, = and NULL', function() {
        let where = new Where('a', '=', 'NULL')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from column ,<> and null', function() {
        let where = new Where('a', '<>', null)
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from column, <> and NULL', function() {
        let where = new Where('a', '<>', 'NULL')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from column, != and null', function() {
        let where = new Where('a', '!=', null)
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from column, != and NULL', function() {
        let where = new Where('a', '!=', 'NULL')
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from column, IS and null', function() {
        let where = new Where('a', 'IS', null)
        let sql = where.sql('postgres')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from column, IS and NULL', function() {
        let where = new Where('a', 'IS', 'NULL')
        let sql = where.sql('postgres')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from column, IS NOT and null', function() {
        let where = new Where('a', 'IS NOT', null)
        let sql = where.sql('postgres')
        expect(sql).to.equal('a IS NOT NULL')
      })    
  
      it('should render a NULL predicate from column, IS NOT and NULL', function() {
        let where = new Where('a', 'IS NOT', 'NULL')
        let sql = where.sql('postgres')
        expect(sql).to.equal('a IS NOT NULL')
      })    
  
      it('should render a NULL predicate from column and IS NULL expression', function() {
        let where = new Where('a', 'IS NULL')
        let sql = where.sql('postgres')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from column and IS NOT NULL expression', function() {
        let where = new Where('a', 'IS NOT NULL')
        let sql = where.sql('postgres')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from expression', function() {
        let where = new Where('a IS NULL')
        let sql = where.sql('postgres')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from expression', function() {
        let where = new Where('a IS NOT NULL')
        let sql = where.sql('postgres')
        expect(sql).to.equal('a IS NOT NULL')
      })

      it('should render a NULL predicate from a logical, column and null', function() {
        let where = new Where('OR', 'a', null)
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical, column and NULL', function() {
        let where = new Where('OR', 'a', 'NULL')
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical, column, = and null', function() {
        let where = new Where('OR', 'a', '=', null)
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical, column, = and NULL', function() {
        let where = new Where('OR', 'a', '=', 'NULL')
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical, column ,<> and null', function() {
        let where = new Where('OR', 'a', '<>', null)
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from a logical, column, <> and NULL', function() {
        let where = new Where('OR', 'a', '<>', 'NULL')
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from a logical, column, != and null', function() {
        let where = new Where('OR', 'a', '!=', null)
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from a logical, column, != and NULL', function() {
        let where = new Where('OR', 'a', '!=', 'NULL')
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from a logical, column, IS and null', function() {
        let where = new Where('OR', 'a', 'IS', null)
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical, column, IS and NULL', function() {
        let where = new Where('OR', 'a', 'IS', 'NULL')
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical, column, IS NOT and null', function() {
        let where = new Where('OR', 'a', 'IS NOT', null)
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })  

      it('should render a NULL predicate from a logical, column, IS NOT and NULL', function() {
        let where = new Where('OR', 'a', 'IS NOT', 'NULL')
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })  

      it('should render a NULL predicate from a logical, column and IS NULL expression', function() {
        let where = new Where('OR', 'a', 'IS NULL')
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical, column and IS NOT NULL expression', function() {
        let where = new Where('OR', 'a', 'IS NOT NULL')
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })
  
      it('should render a NULL predicate from a logical and an IS NULL expression', function() {
        let where = new Where('OR', 'a IS NULL')
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NULL')
      })
  
      it('should render a NULL predicate from a logical and an IS NOT NULL expression', function() {
        let where = new Where('OR', 'a IS NOT NULL')
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IS NOT NULL')
      })
      
      it('should render an alias if given', function() {
        let where = new Where('a', null)
        let sql = where.sql('postgres', { alias: 't' })
        expect(sql).to.equal('t.a IS NULL')
      })
    })
  })

  describe('IN', function() {
    describe('MySQL', function() {
      it('should render an IN predicate from column, IN and array', function() {
        let where = new Where('a', 'IN', [1, 2, 3, 4])
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IN (?, ?, ?, ?)')
      })
    
      it('should render an empty IN predicate from column, IN and array', function() {
        let where = new Where('a', 'IN', [])
        let sql = where.sql('mysql')
        expect(sql).to.equal('a IN ()')
      })

      it('should render an IN predicate from column and an expression with numbers as values', function() {
        let where = new Where('a', 'IN (1, 2, 3, 4)')
        let sql = where.sql('mysql')
        let values = where.values()
        expect(sql).to.equal('a IN (?, ?, ?, ?)')
        expect(values).to.deep.equal([1, 2, 3, 4])
      })
    
      it('should render an IN predicate from column and an expression with strings as values', function() {
        let where = new Where('a', 'IN (\'a\', \'b\', \'c\', \'d\')')
        let sql = where.sql('mysql')
        let values = where.values()
        expect(sql).to.equal('a IN (?, ?, ?, ?)')
        expect(values).to.deep.equal(['a', 'b', 'c', 'd'])
      })

      it('should render an IN predicate from column and an expression with booleans as values', function() {
        let where = new Where('a', 'IN (TRUE, false)')
        let sql = where.sql('mysql')
        let values = where.values()
        expect(sql).to.equal('a IN (?, ?)')
        expect(values).to.deep.equal([true, false])
      })      

      it('should render an IN predicate from a logical, column, IN and array', function() {
        let where = new Where('OR', 'a', 'IN', [1, 2, 3, 4])
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IN (?, ?, ?, ?)')
      })
    
      it('should render an empty IN predicate from a logical, column, IN and array', function() {
        let where = new Where('OR', 'a', 'IN', [])
        let sql = where.sql('mysql')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IN ()')
      })

      it('should render an IN predicate from a logical, column and an expression with numbers as values', function() {
        let where = new Where('OR', 'a', 'IN (1, 2, 3, 4)')
        let sql = where.sql('mysql')
        let values = where.values()
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IN (?, ?, ?, ?)')
        expect(values).to.deep.equal([1, 2, 3, 4])
      })
    
      it('should render an IN predicate from a logical, column and an expression with strings as values', function() {
        let where = new Where('OR', 'a', 'IN (\'a\', \'b\', \'c\', \'d\')')
        let sql = where.sql('mysql')
        let values = where.values()
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IN (?, ?, ?, ?)')
        expect(values).to.deep.equal(['a', 'b', 'c', 'd'])
      })

      it('should render an IN predicate from a logical, column and an expression with booleans as values', function() {
        let where = new Where('OR', 'a', 'IN (TRUE, false)')
        let sql = where.sql('mysql')
        let values = where.values()
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IN (?, ?)')
        expect(values).to.deep.equal([true, false])
      })

      it('should render an alias if given', function() {
        let where = new Where('a', [1, 2])
        let sql = where.sql('mysql', { alias: 't' })
        expect(sql).to.equal('t.a IN (?, ?)')
      })
    })

    describe('PostgreSQL', function() {
      it('should render an IN predicate from column, IN and array', function() {
        let where = new Where('a', 'IN', [1, 2, 3, 4])
        let sql = where.sql('postgres')
        expect(sql).to.equal('a IN ($1, $2, $3, $4)')
      })
    
      it('should render an empty IN predicate from column, IN and array', function() {
        let where = new Where('a', 'IN', [])
        let sql = where.sql('postgres')
        expect(sql).to.equal('a IN ()')
      })

      it('should render an IN predicate from column and an expression with numbers as values', function() {
        let where = new Where('a', 'IN (1, 2, 3, 4)')
        let sql = where.sql('postgres')
        let values = where.values()
        expect(sql).to.equal('a IN ($1, $2, $3, $4)')
        expect(values).to.deep.equal([1, 2, 3, 4])
      })
    
      it('should render an IN predicate from column and an expression with strings as values', function() {
        let where = new Where('a', 'IN (\'a\', \'b\', \'c\', \'d\')')
        let sql = where.sql('postgres')
        let values = where.values()
        expect(sql).to.equal('a IN ($1, $2, $3, $4)')
        expect(values).to.deep.equal(['a', 'b', 'c', 'd'])
      })

      it('should render an IN predicate from column and an expression with booleans as values', function() {
        let where = new Where('a', 'IN (TRUE, false)')
        let sql = where.sql('postgres')
        let values = where.values()
        expect(sql).to.equal('a IN ($1, $2)')
        expect(values).to.deep.equal([true, false])
      })

      it('should render an IN predicate from a logical, column, IN and array', function() {
        let where = new Where('OR', 'a', 'IN', [1, 2, 3, 4])
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IN ($1, $2, $3, $4)')
      })
    
      it('should render an empty IN predicate a logical, column, IN and array', function() {
        let where = new Where('OR', 'a', 'IN', [])
        let sql = where.sql('postgres')
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IN ()')
      })

      it('should render an IN predicate from a logical, column and an expression with numbers as values', function() {
        let where = new Where('OR', 'a', 'IN (1, 2, 3, 4)')
        let sql = where.sql('postgres')
        let values = where.values()
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IN ($1, $2, $3, $4)')
        expect(values).to.deep.equal([1, 2, 3, 4])
      })
    
      it('should render an IN predicate from a logical, column and an expression with strings as values', function() {
        let where = new Where('OR', 'a', 'IN (\'a\', \'b\', \'c\', \'d\')')
        let sql = where.sql('postgres')
        let values = where.values()
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IN ($1, $2, $3, $4)')
        expect(values).to.deep.equal(['a', 'b', 'c', 'd'])
      })

      it('should render an IN predicate from a logical, column and an expression with booleans as values', function() {
        let where = new Where('OR', 'a', 'IN (TRUE, false)')
        let sql = where.sql('postgres')
        let values = where.values()
        expect(where.logical).to.equal('OR')
        expect(sql).to.equal('a IN ($1, $2)')
        expect(values).to.deep.equal([true, false])
      })

      it('should render an alias if given', function() {
        let where = new Where('a', [1, 2])
        let sql = where.sql('postgres', { alias: 't' })
        expect(sql).to.equal('t.a IN ($1, $2)')
      })
    })
  })
})