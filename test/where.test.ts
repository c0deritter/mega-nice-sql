import { expect } from 'chai'
import 'mocha'
import { Where } from '../src/sql'

describe('Where', function() {
  describe('MySql', function() {
    it('should render default equal where string', function() {
      let where = new Where('a')
      let sql = where.sql()
      expect(sql).to.equal('a = ?')
    })

    it('should render default equal where string when a value is given', function() {
      let where = new Where('a', 'aValue')
      let sql = where.sql()
      expect(sql).to.equal('a = ?')
    })

    it('should render a where string with a given operator', function() {
      let where = new Where('a', '>')
      let sql = where.sql()
      expect(sql).to.equal('a > ?')
    })

    it('should render a where string with a given operator when a value is given', function() {
      let where = new Where('a', '>', 'aValue')
      let sql = where.sql()
      expect(sql).to.equal('a > ?')
    })

    it('should render a IS NULL from a null value', function() {
      let where = new Where('a', null)
      let sql = where.sql()
      expect(sql).to.equal('a IS NULL')
    })

    it('should render a IS NULL when it is given in the where parameter', function() {
      let where = new Where('a IS NULL')
      let sql = where.sql()
      expect(sql).to.equal('a IS NULL')
    })

    it('should render a IS NULL when it is given in the value parameter', function() {
      let where = new Where('a', 'IS NULL')
      let sql = where.sql()
      expect(sql).to.equal('a IS NULL')
    })

    it('should render a IS NULL when it is given in the operator and value parameter', function() {
      let where = new Where('a', 'IS', 'NULL')
      let sql = where.sql()
      expect(sql).to.equal('a IS NULL')
    })

    it('should render a IS NOT NULL when it is given in the where parameter', function() {
      let where = new Where('a IS NOT NULL')
      let sql = where.sql()
      expect(sql).to.equal('a IS NOT NULL')
    })

    it('should render a IS NOT NULL when it is given in the value parameter', function() {
      let where = new Where('a', 'IS NOT NULL')
      let sql = where.sql()
      expect(sql).to.equal('a IS NOT NULL')
    })

    it('should render a IS NOT NULL when it is given in the operator and value parameter', function() {
      let where = new Where('a', 'IS NOT', 'NULL')
      let sql = where.sql()
      expect(sql).to.equal('a IS NOT NULL')
    })

    it('should render an IN operator', function() {
      let where = new Where('a', 'IN', [1, 2, 3, 4])
      let sql = where.sql()
      expect(sql).to.equal('a IN (?, ?, ?, ?)')
    })
  
    it('should render an empty IN operator', function() {
      let where = new Where('a', 'IN', [])
      let sql = where.sql()
      expect(sql).to.equal('a IN ()')
    })  
  })

  describe('PostgreSQL', function() {
    it('should render default equal where string', function() {
      let where = new Where('a')
      let sql = where.sql('postgres')
      expect(sql).to.equal('a = $1')
    })

    it('should render default equal where string when a value is given', function() {
      let where = new Where('a', 'aValue')
      let sql = where.sql('postgres')
      expect(sql).to.equal('a = $1')
    })

    it('should render a where string with a given operator', function() {
      let where = new Where('a', '>')
      let sql = where.sql('postgres')
      expect(sql).to.equal('a > $1')
    })

    it('should render a where string with a given operator when a value is given', function() {
      let where = new Where('a', '>', 'aValue')
      let sql = where.sql('postgres')
      expect(sql).to.equal('a > $1')
    })

    it('should render a IS NULL from a null value', function() {
      let where = new Where('a', null)
      let sql = where.sql('postgres')
      expect(sql).to.equal('a IS NULL')
    })

    it('should render a IS NULL when it stands in the where parameter', function() {
      let where = new Where('a IS NULL')
      let sql = where.sql('postgres')
      expect(sql).to.equal('a IS NULL')
    })

    it('should render a IS NULL when it stands in the value parameter', function() {
      let where = new Where('a', 'IS NULL')
      let sql = where.sql('postgres')
      expect(sql).to.equal('a IS NULL')
    })

    it('should render a IS NULL when it stands in the operator and value parameter', function() {
      let where = new Where('a', 'IS', 'NULL')
      let sql = where.sql('postgres')
      expect(sql).to.equal('a IS NULL')
    })

    it('should render a IS NOT NULL when it is given in the where parameter', function() {
      let where = new Where('a IS NOT NULL')
      let sql = where.sql('postgres')
      expect(sql).to.equal('a IS NOT NULL')
    })

    it('should render a IS NOT NULL when it is given in the value parameter', function() {
      let where = new Where('a', 'IS NOT NULL')
      let sql = where.sql('postgres')
      expect(sql).to.equal('a IS NOT NULL')
    })

    it('should render a IS NOT NULL when it is given in the operator and value parameter', function() {
      let where = new Where('a', 'IS NOT', 'NULL')
      let sql = where.sql('postgres')
      expect(sql).to.equal('a IS NOT NULL')
    })

    it('should render an IN operator', function() {
      let where = new Where('a', 'IN', [1, 2, 3, 4])
      let sql = where.sql('postgres')
      expect(sql).to.equal('a IN ($1, $2, $3, $4)')
    })
  
    it('should render an empty IN operator', function() {
      let where = new Where('a', 'IN', [])
      let sql = where.sql('postgres')
      expect(sql).to.equal('a IN ()')
    })  
  })
})