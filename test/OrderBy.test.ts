import { expect } from 'chai'
import 'mocha'
import { OrderBy } from '../src'

describe('OrderBy', function() {
  describe('constructor', function() {
    it('should initialize with column', function() {
      let orderBy_ = new OrderBy('column')
      expect(orderBy_.alias).to.be.undefined
      expect(orderBy_.column).to.equal('column')
      expect(orderBy_.direction).to.be.undefined
    })

    it('should initialize with column containing an alias', function() {
      let orderBy_ = new OrderBy('alias.column')
      expect(orderBy_.alias).to.equal('alias')
      expect(orderBy_.column).to.equal('column')
      expect(orderBy_.direction).to.be.undefined
    })

    it('should initialize with column and direction', function() {
      let orderBy_ = new OrderBy('column', 'DESC')
      expect(orderBy_.alias).to.be.undefined
      expect(orderBy_.column).to.equal('column')
      expect(orderBy_.direction).to.equal('DESC')
    })

    it('should initialize with column containing and alias and direction', function() {
      let orderBy_ = new OrderBy('alias.column', 'DESC')
      expect(orderBy_.alias).to.equal('alias')
      expect(orderBy_.column).to.equal('column')
      expect(orderBy_.direction).to.equal('DESC')
    })

    it('should initialize with alias and column', function() {
      let orderBy_ = new OrderBy('alias', 'column')
      expect(orderBy_.alias).to.equal('alias')
      expect(orderBy_.column).to.equal('column')
      expect(orderBy_.direction).to.be.undefined
    })

    it('should initialize with alias, column and direction', function() {
      let orderBy_ = new OrderBy('alias', 'column', 'DESC')
      expect(orderBy_.alias).to.equal('alias')
      expect(orderBy_.column).to.equal('column')
      expect(orderBy_.direction).to.equal('DESC')
    })
  })

  describe('sql', function() {
    describe('mysql', function() {
      it('should render without alias', function() {
        let orderBy1 = new OrderBy('column')
        expect(orderBy1.sql('mysql')).to.equal('column')

        let orderBy2 = new OrderBy('column', 'DESC')
        expect(orderBy2.sql('mysql')).to.equal('column DESC')
      })
    
      it('should render with alias', function() {
        let orderBy1 = new OrderBy('alias', 'column')
        expect(orderBy1.sql('mysql')).to.equal('alias.column')

        let orderBy2 = new OrderBy('alias', 'column', 'DESC')
        expect(orderBy2.sql('mysql')).to.equal('alias.column DESC')
      })
  
      it('should not render the alias given through the parameter if there is already an alias', function() {
        let orderBy1 = new OrderBy('alias1', 'column')
        expect(orderBy1.sql('mysql', { alias: 'alias2' })).to.equal('alias1.column')

        let orderBy2 = new OrderBy('alias1', 'column', 'DESC')
        expect(orderBy2.sql('mysql', { alias: 'alias2' })).to.equal('alias1.column DESC')
      })
  
      it('should render without alias with given parameterIndex', function() {
        let orderBy1 = new OrderBy('column')
        expect((orderBy1.sql('mysql', { parameterIndex: 3 }) as any).sql).to.equal('column')

        let orderBy2 = new OrderBy('column', 'DESC')
        expect((orderBy2.sql('mysql', { parameterIndex: 3 }) as any).sql).to.equal('column DESC')
      })
    
      it('should render with alias with given parameterIndex', function() {
        let orderBy1 = new OrderBy('alias', 'column')
        expect((orderBy1.sql('mysql', { parameterIndex: 3 }) as any).sql).to.equal('alias.column')

        let orderBy2 = new OrderBy('alias', 'column', 'DESC')
        expect((orderBy2.sql('mysql', { parameterIndex: 3 }) as any).sql).to.equal('alias.column DESC')
      })
  
      it('should not render the alias given through the parameter if there is already an alias with given parameterIndex', function() {
        let orderBy1 = new OrderBy('alias1', 'column')
        expect((orderBy1.sql('mysql', { alias: 'alias2', parameterIndex: 3 }) as any).sql).to.equal('alias1.column')

        let orderBy2 = new OrderBy('alias1', 'column', 'DESC')
        expect((orderBy2.sql('mysql', { alias: 'alias2', parameterIndex: 3 }) as any).sql).to.equal('alias1.column DESC')
      })  
    })

    describe('postgres', function() {
      it('should render without alias', function() {
        let orderBy1 = new OrderBy('column')
        expect(orderBy1.sql('postgres')).to.equal('column')

        let orderBy2 = new OrderBy('column', 'DESC')
        expect(orderBy2.sql('postgres')).to.equal('column DESC')
      })
    
      it('should render with alias', function() {
        let orderBy1 = new OrderBy('alias', 'column')
        expect(orderBy1.sql('postgres')).to.equal('alias.column')

        let orderBy2 = new OrderBy('alias', 'column', 'DESC')
        expect(orderBy2.sql('postgres')).to.equal('alias.column DESC')
      })
  
      it('should not render the alias given through the parameter if there is already an alias', function() {
        let orderBy1 = new OrderBy('alias1', 'column')
        expect(orderBy1.sql('postgres', { alias: 'alias2' })).to.equal('alias1.column')

        let orderBy2 = new OrderBy('alias1', 'column', 'DESC')
        expect(orderBy2.sql('postgres', { alias: 'alias2' })).to.equal('alias1.column DESC')
      })
  
      it('should render without alias with given parameterIndex', function() {
        let orderBy1 = new OrderBy('column')
        expect((orderBy1.sql('postgres', { parameterIndex: 3 }) as any).sql).to.equal('column')

        let orderBy2 = new OrderBy('column', 'DESC')
        expect((orderBy2.sql('postgres', { parameterIndex: 3 }) as any).sql).to.equal('column DESC')
      })
    
      it('should render with alias with given parameterIndex', function() {
        let orderBy1 = new OrderBy('alias', 'column')
        expect((orderBy1.sql('postgres', { parameterIndex: 3 }) as any).sql).to.equal('alias.column')

        let orderBy2 = new OrderBy('alias', 'column', 'DESC')
        expect((orderBy2.sql('postgres', { parameterIndex: 3 }) as any).sql).to.equal('alias.column DESC')
      })
  
      it('should not render the alias given through the parameter if there is already an alias with given parameterIndex', function() {
        let orderBy1 = new OrderBy('alias1', 'column')
        expect((orderBy1.sql('postgres', { alias: 'alias2', parameterIndex: 3 }) as any).sql).to.equal('alias1.column')

        let orderBy2 = new OrderBy('alias1', 'column', 'DESC')
        expect((orderBy2.sql('postgres', { alias: 'alias2', parameterIndex: 3 }) as any).sql).to.equal('alias1.column DESC')
      })
    })
  })
})