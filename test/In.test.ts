import { expect } from 'chai'
import 'mocha'
import { In } from '../src'

describe('In', function() {
  describe('constructor', function() {
    it('should initialize with column and values', function() {
      let in_ = new In('column', [ 1, 2 ])
      expect(in_.alias).to.be.undefined
      expect(in_.column).to.equal('column')
      expect(in_.valuesArray).to.deep.equal([ 1, 2 ])
    })

    it('should detect that there is an alias contained in the column', function() {
      let in_ = new In('alias.column', [ 1, 2 ])
      expect(in_.alias).to.equal('alias')
      expect(in_.column).to.equal('column')
      expect(in_.valuesArray).to.deep.equal([ 1, 2 ])
    })

    it('should initialize with alias, column and values', function() {
      let in_ = new In('alias', 'column', [ 1, 2 ])
      expect(in_.alias).to.equal('alias')
      expect(in_.column).to.equal('column')
      expect(in_.valuesArray).to.deep.equal([ 1, 2 ])
    })
  })

  describe('sql', function() {
    describe('mysql', function() {
      it('should render without alias', function() {
        let in_ = new In('column', [ 1, 2 ])
        expect(in_.sql('mysql')).to.equal('column IN (?, ?)')
      })
    
      it('should render with alias', function() {
        let in_ = new In('alias', 'column', [ 1, 2 ])
        expect(in_.sql('mysql')).to.equal('alias.column IN (?, ?)')
      })
  
      it('should not render the alias given through the parameter if there is already an alias', function() {
        let in_ = new In('alias1', 'column', [ 1, 2 ])
        expect(in_.sql('mysql', { alias: 'alias2' })).to.equal('alias1.column IN (?, ?)')
      })
  
      it('should render without alias with given parameterIndex', function() {
        let in_ = new In('column', [ 1, 2 ])
        expect((in_.sql('mysql', { parameterIndex: 3 }) as any).sql).to.equal('column IN (?, ?)')
      })
    
      it('should render with alias with given parameterIndex', function() {
        let in_ = new In('alias', 'column', [ 1, 2 ])
        expect((in_.sql('mysql', { parameterIndex: 3 }) as any).sql).to.equal('alias.column IN (?, ?)')
      })
  
      it('should not render the alias given through the parameter if there is already an alias with given parameterIndex', function() {
        let in_ = new In('alias1', 'column', [ 1, 2 ])
        expect((in_.sql('mysql', { alias: 'alias2', parameterIndex: 3 }) as any).sql).to.equal('alias1.column IN (?, ?)')
      })  
    })

    describe('postgres', function() {
      it('should render without alias', function() {
        let in_ = new In('column', [ 1, 2 ])
        expect(in_.sql('postgres')).to.equal('column IN ($1, $2)')
      })
    
      it('should render with alias', function() {
        let in_ = new In('alias', 'column', [ 1, 2 ])
        expect(in_.sql('postgres')).to.equal('alias.column IN ($1, $2)')
      })
  
      it('should not render the alias given through the parameter if there is already an alias', function() {
        let in_ = new In('alias1', 'column', [ 1, 2 ])
        expect(in_.sql('postgres', { alias: 'alias2' })).to.equal('alias1.column IN ($1, $2)')
      })
  
      it('should render without alias with given parameterIndex', function() {
        let in_ = new In('column', [ 1, 2 ])
        expect((in_.sql('postgres', { parameterIndex: 3 }) as any).sql).to.equal('column IN ($3, $4)')
      })
    
      it('should render with alias with given parameterIndex', function() {
        let in_ = new In('alias', 'column', [ 1, 2 ])
        expect((in_.sql('postgres', { parameterIndex: 3 }) as any).sql).to.equal('alias.column IN ($3, $4)')
      })
  
      it('should not render the alias given through the parameter if there is already an alias with given parameterIndex', function() {
        let in_ = new In('alias1', 'column', [ 1, 2 ])
        expect((in_.sql('postgres', { alias: 'alias2', parameterIndex: 3 }) as any).sql).to.equal('alias1.column IN ($3, $4)')
      })  
    })
  })
})