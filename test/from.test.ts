import { expect } from 'chai'
import 'mocha'
import { From } from '../src'

describe('From', function() {
  describe('constructor', function() {
    it('should initialize with an expression', function() {
      let from1 = new From('table t')
      expect(from1.table).to.equal('table')
      expect(from1.alias).to.equal('t')

      let from2 = new From('table AS t')
      expect(from2.table).to.equal('table')
      expect(from2.alias).to.equal('t')

      let from3 = new From('table as t')
      expect(from3.table).to.equal('table')
      expect(from3.alias).to.equal('t')

      let from4 = new From('table As t')
      expect(from4.table).to.equal('table')
      expect(from4.alias).to.equal('t')

      let from5 = new From('table aS t')
      expect(from5.table).to.equal('table')
      expect(from5.alias).to.equal('t')
    })

    it('should initialize with table', function() {
      let from = new From('table')
      expect(from.table).to.equal('table')
      expect(from.alias).to.be.undefined
    })
    
    it('should initialize with table and alias', function() {
      let from = new From('table', 't')
      expect(from.table).to.equal('table')
      expect(from.alias).to.equal('t')
    })
  })

  describe('sql', function() {
    it('should render a FROM', function() {
      let from = new From('table')
      expect(from.sql()).to.equal('table')
    })
  
    it('should render a FROM with alias', function() {
      let from = new From('table', 't')
      expect(from.sql()).to.equal('table t')
    })
  })
})