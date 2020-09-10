import { expect } from 'chai'
import 'mocha'
import { Null } from '../src/sql'

describe('Null', function() {
  describe('constructor', function() {
    it('should initialize with column', function() {
      let null_ = new Null('column')
      expect(null_.alias).to.be.undefined
      expect(null_.column).to.equal('column')
      expect(null_.not).to.be.undefined
    })

    it('should initialize with column containing an alias', function() {
      let null_ = new Null('alias.column')
      expect(null_.alias).to.equal('alias')
      expect(null_.column).to.equal('column')
      expect(null_.not).to.be.undefined
    })

    it('should initialize with column and not', function() {
      let null_ = new Null('column', true)
      expect(null_.alias).to.be.undefined
      expect(null_.column).to.equal('column')
      expect(null_.not).to.be.true
    })

    it('should initialize with column containing and alias and not', function() {
      let null_ = new Null('alias.column', true)
      expect(null_.alias).to.equal('alias')
      expect(null_.column).to.equal('column')
      expect(null_.not).to.be.true
    })

    it('should initialize with alias and column', function() {
      let null_ = new Null('alias', 'column')
      expect(null_.alias).to.equal('alias')
      expect(null_.column).to.equal('column')
      expect(null_.not).to.be.undefined
    })

    it('should initialize with alias, column and not', function() {
      let null_ = new Null('alias', 'column', true)
      expect(null_.alias).to.equal('alias')
      expect(null_.column).to.equal('column')
      expect(null_.not).to.be.true
    })
  })

  describe('sql', function() {
    describe('mysql', function() {
      it('should render without alias', function() {
        let null1 = new Null('column')
        expect(null1.sql('mysql')).to.equal('column IS NULL')

        let null2 = new Null('column', true)
        expect(null2.sql('mysql')).to.equal('column IS NOT NULL')
      })
    
      it('should render with alias', function() {
        let null1 = new Null('alias', 'column')
        expect(null1.sql('mysql')).to.equal('alias.column IS NULL')

        let null2 = new Null('alias', 'column', true)
        expect(null2.sql('mysql')).to.equal('alias.column IS NOT NULL')
      })
  
      it('should not render the alias given through the parameter if there is already an alias', function() {
        let null1 = new Null('alias1', 'column')
        expect(null1.sql('mysql', { alias: 'alias2' })).to.equal('alias1.column IS NULL')

        let null2 = new Null('alias1', 'column', true)
        expect(null2.sql('mysql', { alias: 'alias2' })).to.equal('alias1.column IS NOT NULL')
      })
  
      it('should render without alias with given parameterIndex', function() {
        let null1 = new Null('column')
        expect((null1.sql('mysql', { parameterIndex: 3 }) as any).sql).to.equal('column IS NULL')

        let null2 = new Null('column', true)
        expect((null2.sql('mysql', { parameterIndex: 3 }) as any).sql).to.equal('column IS NOT NULL')
      })
    
      it('should render with alias with given parameterIndex', function() {
        let null1 = new Null('alias', 'column')
        expect((null1.sql('mysql', { parameterIndex: 3 }) as any).sql).to.equal('alias.column IS NULL')

        let null2 = new Null('alias', 'column', true)
        expect((null2.sql('mysql', { parameterIndex: 3 }) as any).sql).to.equal('alias.column IS NOT NULL')
      })
  
      it('should not render the alias given through the parameter if there is already an alias with given parameterIndex', function() {
        let null1 = new Null('alias1', 'column')
        expect((null1.sql('mysql', { alias: 'alias2', parameterIndex: 3 }) as any).sql).to.equal('alias1.column IS NULL')

        let null2 = new Null('alias1', 'column', true)
        expect((null2.sql('mysql', { alias: 'alias2', parameterIndex: 3 }) as any).sql).to.equal('alias1.column IS NOT NULL')
      })  
    })

    describe('postgres', function() {
      it('should render without alias', function() {
        let null1 = new Null('column')
        expect(null1.sql('postgres')).to.equal('column IS NULL')

        let null2 = new Null('column', true)
        expect(null2.sql('postgres')).to.equal('column IS NOT NULL')
      })
    
      it('should render with alias', function() {
        let null1 = new Null('alias', 'column')
        expect(null1.sql('postgres')).to.equal('alias.column IS NULL')

        let null2 = new Null('alias', 'column', true)
        expect(null2.sql('postgres')).to.equal('alias.column IS NOT NULL')
      })
  
      it('should not render the alias given through the parameter if there is already an alias', function() {
        let null1 = new Null('alias1', 'column')
        expect(null1.sql('postgres', { alias: 'alias2' })).to.equal('alias1.column IS NULL')

        let null2 = new Null('alias1', 'column', true)
        expect(null2.sql('postgres', { alias: 'alias2' })).to.equal('alias1.column IS NOT NULL')
      })
  
      it('should render without alias with given parameterIndex', function() {
        let null1 = new Null('column')
        expect((null1.sql('postgres', { parameterIndex: 3 }) as any).sql).to.equal('column IS NULL')

        let null2 = new Null('column', true)
        expect((null2.sql('postgres', { parameterIndex: 3 }) as any).sql).to.equal('column IS NOT NULL')
      })
    
      it('should render with alias with given parameterIndex', function() {
        let null1 = new Null('alias', 'column')
        expect((null1.sql('postgres', { parameterIndex: 3 }) as any).sql).to.equal('alias.column IS NULL')

        let null2 = new Null('alias', 'column', true)
        expect((null2.sql('postgres', { parameterIndex: 3 }) as any).sql).to.equal('alias.column IS NOT NULL')
      })
  
      it('should not render the alias given through the parameter if there is already an alias with given parameterIndex', function() {
        let null1 = new Null('alias1', 'column')
        expect((null1.sql('postgres', { alias: 'alias2', parameterIndex: 3 }) as any).sql).to.equal('alias1.column IS NULL')

        let null2 = new Null('alias1', 'column', true)
        expect((null2.sql('postgres', { alias: 'alias2', parameterIndex: 3 }) as any).sql).to.equal('alias1.column IS NOT NULL')
      })
    })
  })
})