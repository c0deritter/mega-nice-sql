import { expect } from 'chai'
import 'mocha'
import { Comparison } from '../src'

describe('Comparison', function() {
  describe('constructor', function() {
    it('should initialize with column, operator and value', function() {
      let comparison1 = new Comparison('column', '=', 1)
      expect(comparison1.alias).to.be.undefined
      expect(comparison1.column).to.equal('column')
      expect(comparison1.operator).to.equal('=')
      expect(comparison1.value).to.equal(1)

      let comparison2 = new Comparison('column', 'IS', null)
      expect(comparison2.alias).to.be.undefined
      expect(comparison2.column).to.equal('column')
      expect(comparison2.operator).to.equal('IS')
      expect(comparison2.value).to.be.not.undefined
      expect(comparison2.value).to.be.null
    })

    it('should detect that there is an alias contained in the column', function() {
      let comparison1 = new Comparison('alias.column', '=', 1)
      expect(comparison1.alias).to.equal('alias')
      expect(comparison1.column).to.equal('column')
      expect(comparison1.operator).to.equal('=')
      expect(comparison1.value).to.equal(1)

      let comparison2 = new Comparison('alias.column', 'IS', null)
      expect(comparison2.alias).to.equal('alias')
      expect(comparison2.column).to.equal('column')
      expect(comparison2.operator).to.equal('IS')
      expect(comparison2.value).to.be.not.undefined
      expect(comparison2.value).to.be.null
    })

    it('should initialize with alias, column, operator and value', function() {
      let comparison1 = new Comparison('alias', 'column', '=', 1)
      expect(comparison1.alias).to.equal('alias')
      expect(comparison1.column).to.equal('column')
      expect(comparison1.operator).to.equal('=')
      expect(comparison1.value).to.equal(1)

      let comparison2 = new Comparison('alias', 'column', 'IS', null)
      expect(comparison2.alias).to.equal('alias')
      expect(comparison2.column).to.equal('column')
      expect(comparison2.operator).to.equal('IS')
      expect(comparison2.value).to.be.not.undefined
      expect(comparison2.value).to.be.null
    })
  })

  describe('sql', function() {
    describe('mysql', function() {
      it('should render without alias', function() {
        let comparison = new Comparison('column', '=', 1)
        expect(comparison.sql('mysql')).to.equal('column = ?')
      })
    
      it('should render with alias', function() {
        let comparison = new Comparison('alias', 'column', '=', 1)
        expect(comparison.sql('mysql')).to.equal('alias.column = ?')
      })
  
      it('should not render the alias given through the parameter if there is already an alias', function() {
        let comparison = new Comparison('alias1', 'column', '=', 1)
        expect(comparison.sql('mysql', { alias: 'alias2' })).to.equal('alias1.column = ?')
      })
  
      it('should render without alias with given parameterIndex', function() {
        let comparison = new Comparison('column', '=', 1)
        expect((comparison.sql('mysql', { parameterIndex: 3 }) as any).sql).to.equal('column = ?')
      })
    
      it('should render with alias with given parameterIndex', function() {
        let comparison = new Comparison('alias', 'column', '=', 1)
        expect((comparison.sql('mysql', { parameterIndex: 3 }) as any).sql).to.equal('alias.column = ?')
      })
  
      it('should not render the alias given through the parameter if there is already an alias with given parameterIndex', function() {
        let comparison = new Comparison('alias1', 'column', '=', 1)
        expect((comparison.sql('mysql', { alias: 'alias2', parameterIndex: 3 }) as any).sql).to.equal('alias1.column = ?')
      })  
    })

    describe('postgres', function() {
      it('should render without alias', function() {
        let comparison = new Comparison('column', '=', 1)
        expect(comparison.sql('postgres')).to.equal('column = $1')
      })
    
      it('should render with alias', function() {
        let comparison = new Comparison('alias', 'column', '=', 1)
        expect(comparison.sql('postgres')).to.equal('alias.column = $1')
      })
  
      it('should not render the alias given through the parameter if there is already an alias', function() {
        let comparison = new Comparison('alias1', 'column', '=', 1)
        expect(comparison.sql('postgres', { alias: 'alias2' })).to.equal('alias1.column = $1')
      })
  
      it('should render without alias with given parameterIndex', function() {
        let comparison = new Comparison('column', '=', 1)
        expect((comparison.sql('postgres', { parameterIndex: 3 }) as any).sql).to.equal('column = $3')
      })
    
      it('should render with alias with given parameterIndex', function() {
        let comparison = new Comparison('alias', 'column', '=', 1)
        expect((comparison.sql('postgres', { parameterIndex: 3 }) as any).sql).to.equal('alias.column = $3')
      })
  
      it('should not render the alias given through the parameter if there is already an alias with given parameterIndex', function() {
        let comparison = new Comparison('alias1', 'column', '=', 1)
        expect((comparison.sql('postgres', { alias: 'alias2', parameterIndex: 3 }) as any).sql).to.equal('alias1.column = $3')
      })  
    })
  })
})