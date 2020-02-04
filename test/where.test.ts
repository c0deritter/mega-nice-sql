import { expect } from 'chai'
import 'mocha'
import { Where } from '../src/sql'

describe('Where', function() {
  describe('MySql', function() {
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