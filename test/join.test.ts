import { expect } from 'chai'
import 'mocha'
import { Join } from '../src'

describe('Join', function() {
  describe('constructor', function() {
    it('should initialize with type, table and on', function() {
      let join = new Join('INNER', 'table', 'id = table.id')
      expect(join.type).to.equal('INNER')
      expect(join.table).to.equal('table')
      expect(join.alias).to.be.undefined
      expect(join.on).to.equal('id = table.id')
    })

    it('should initialize with type, table, alias and on', function() {
      let join = new Join('INNER', 'table', 't', 'id = t.id')
      expect(join.type).to.equal('INNER')
      expect(join.table).to.equal('table')
      expect(join.alias).to.equal('t')
      expect(join.on).to.equal('id = t.id')
    })
    
    it('should initialize with table and on', function() {
      let join = new Join('table', 'id = table.id')
      expect(join.type).to.be.undefined
      expect(join.table).to.equal('table')
      expect(join.alias).to.be.undefined
      expect(join.on).to.equal('id = table.id')
    })

    it('should initialize with table, alias and on', function() {
      let join = new Join('table', 't', 'id = t.id')
      expect(join.type).to.be.undefined
      expect(join.table).to.equal('table')
      expect(join.alias).to.equal('t')
      expect(join.on).to.equal('id = t.id')
    })
  })

  describe('sql', function() {
    it('should render a JOIN without type', function() {
      let join = new Join('table1', 'table0.id = table1.id')
      expect(join.sql()).to.equal('JOIN table1 ON table0.id = table1.id')
    })
  
    it('should render a JOIN without type and with an alias', function() {
      let join = new Join('table1', 't1', 'table0.id = t1.id')
      expect(join.sql()).to.equal('JOIN table1 t1 ON table0.id = t1.id')
    })
  
    it('should render a JOIN with a type', function() {
      let join = new Join('INNER', 'table1', 'table0.id = table1.id')
      expect(join.sql()).to.equal('INNER JOIN table1 ON table0.id = table1.id')
    })

    it('should render a JOIN with a type and with an alias', function() {
      let join = new Join('INNER', 'table1', 't1', 'table0.id = t1.id')
      expect(join.sql()).to.equal('INNER JOIN table1 t1 ON table0.id = t1.id')
    })
  })
})