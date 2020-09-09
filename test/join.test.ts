import { expect } from 'chai'
import 'mocha'
import { Join } from '../src/sql'

describe('Join', function() {
  it('should render a JOIN without type', function() {
    let join = new Join('table1', 'table0.id = table1.id')
    expect(join.sql()).to.equal('JOIN table1 ON table0.id = table1.id')
  })

  it('should render a JOIN with a type', function() {
    let join = new Join('INNER', 'table1', 'table0.id = table1.id')
    expect(join.sql()).to.equal('INNER JOIN table1 ON table0.id = table1.id')
  })
})