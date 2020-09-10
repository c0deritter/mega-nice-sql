import { expect } from 'chai'
import 'mocha'
import { Query } from '../src/sql'

describe('Query', function() {
  describe('select', function() {
    it('should select a single column', function() {
      let query = new Query
      query.select('column')
      expect(query._selects.length).to.equal(1)
      expect(query._selects[0]).to.equal('column')
    })

    it('should select a single column with an alias', function() {
      let query = new Query
      query.select('column', 'c')
      expect(query._selects.length).to.equal(1)
      expect(query._selects[0]).to.equal('column c')
    })

    it('should select an expresssion', function() {
      let query = new Query
      query.select('column c')
      expect(query._selects.length).to.equal(1)
      expect(query._selects[0]).to.equal('column c')
    })
  })
})