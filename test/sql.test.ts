import { expect } from 'chai'
import 'mocha'
import sql, { where } from '../src/sql'

describe('sql', function() {
  describe('MySql', function() {
    describe('INSERT INTO', function() {
      it('should create an insert into SQL statement', function() {
        let query = sql.insertInto('table')
        query.value('a', 'a')
        query.value('b', 'b')
        let sqlString = query.mysql()
        expect(sqlString).to.equal('INSERT INTO table (a, b) VALUES (?, ?);')
      })
    
      it('should create an insert into SQL statement for an empty row', function() {
        let query = sql.insertInto('table')
        let sqlString = query.mysql()
        expect(sqlString).to.equal('INSERT INTO table DEFAULT VALUES;')
      })    
    })

    describe('SELECT', function() {
      it('should create a select SQL statement', function() {
        let query = sql.select('*').from('table').where('a', 'a').where('b', '>', 'b')
        let sqlString = query.mysql()
        expect(sqlString).to.equal('SELECT * FROM table WHERE a = ? AND b > ?;')
      })

      it('should create a select SQL statement with aliases', function() {
        let query = sql.select('*').from('table t').where('a', 'a').where('b', '>', 'b')
        let sqlString = query.mysql()
        expect(sqlString).to.equal('SELECT * FROM table t WHERE t.a = ? AND t.b > ?;')
      })

      it('should create a select SQL statement connected through OR', function() {
        let query = sql.select('*').from('table').where('a', 'a').where('OR', 'b', '>', 'b')
        let sqlString = query.mysql()
        expect(sqlString).to.equal('SELECT * FROM table WHERE a = ? OR b > ?;')
      })

      it('should handle sub wheres', function() {
        let query = sql.select('*').from('table').where(where('a', 'a'), where('XOR', 'b', 1)).where('OR', where('c', false))
        let sqlString = query.mysql()
        let values = query.values()
        expect(sqlString).to.equal('SELECT * FROM table WHERE (a = ? XOR b = ?) OR c = ?;')
        expect(values).to.deep.equal(['a', 1, false])
      })

      it('should create a select SQL statement without where criteria', function() {
        let query = sql.select('*').from('table')
        let sqlString = query.mysql()
        expect(sqlString).to.equal('SELECT * FROM table;')
      })
    })

    describe('DELETE FROM', function() {
      it('should create a DELETE FROM with the fine grained methods', function() {
        let query = sql.delete_().from('table')
        let sqlString = query.mysql()
        expect(sqlString).to.equal('DELETE FROM table;')
      })

      it('should create a DELETE FROM with the shortcut method', function() {
        let query = sql.deleteFrom('table')
        let sqlString = query.mysql()
        expect(sqlString).to.equal('DELETE FROM table;')
      })

      it('should create a DELETE table FROM', function() {
        let query = sql.delete_('table1').from('table2')
        let sqlString = query.mysql()
        expect(sqlString).to.equal('DELETE table1 FROM table2;')
      })
    })

    describe('USING', function() {
      it('should accept arbitrary many using statements', function() {
        let query = sql.deleteFrom('table1').using('table2', 'table3')
        let sqlString = query.mysql()
        expect(sqlString).to.equal('DELETE FROM table1 USING table2, table3;')
      })

      it('should accept a statement containing comma separated using statements', function() {
        let query = sql.deleteFrom('table1').using('table2,       table3')
        let sqlString = query.mysql()
        expect(sqlString).to.equal('DELETE FROM table1 USING table2, table3;')
      })

      it('should accept a mix of statements containing either one or comma separated using statements', function() {
        let query = sql.deleteFrom('table1').using('table2', 'table3,     table4', 'table5')
        let sqlString = query.mysql()
        expect(sqlString).to.equal('DELETE FROM table1 USING table2, table3, table4, table5;')
      })

      it('should eliminate duplicates', function() {
        let query = sql.deleteFrom('table1').using('table2', 'table3,     table2', 'table2')
        let sqlString = query.mysql()
        expect(sqlString).to.equal('DELETE FROM table1 USING table2, table3;')
      })
    })
  })

  describe('PostgreSQL', function() {
    describe('INSERT INTO', function() {
      it('should create an insert into SQL statement', function() {
        let query = sql.insertInto('table')
        query.value('a', 'a')
        query.value('b', 'b')
        let sqlString = query.postgres()
        expect(sqlString).to.equal('INSERT INTO table (a, b) VALUES ($1, $2);')
      })
    
      it('should create an insert into SQL statement for an empty row', function() {
        let query = sql.insertInto('table')
        let sqlString = query.postgres()
        expect(sqlString).to.equal('INSERT INTO table DEFAULT VALUES;')
      })    
    })

    describe('SELECT', function() {
      it('should create a select SQL statement', function() {
        let query = sql.select('*').from('table').where('a', 'a').where('b', '>', 'b')
        let sqlString = query.postgres()
        expect(sqlString).to.equal('SELECT * FROM table WHERE a = $1 AND b > $2;')
      })

      it('should create a select SQL statement connected through OR', function() {
        let query = sql.select('*').from('table').where('a', 'a').where('OR', 'b', '>', 'b')
        let sqlString = query.postgres()
        expect(sqlString).to.equal('SELECT * FROM table WHERE a = $1 OR b > $2;')
      })

      it('should create a select SQL statement without where criteria', function() {
        let query = sql.select('*').from('table')
        let sqlString = query.postgres()
        expect(sqlString).to.equal('SELECT * FROM table;')
      })
    })

    describe('DELETE FROM', function() {
      it('should create a DELETE FROM with the fine grained methods', function() {
        let query = sql.delete_().from('table')
        let sqlString = query.postgres()
        expect(sqlString).to.equal('DELETE FROM table;')
      })

      it('should create a DELETE FROM with the shortcut method', function() {
        let query = sql.deleteFrom('table')
        let sqlString = query.postgres()
        expect(sqlString).to.equal('DELETE FROM table;')
      })

      it('should create a DELETE table FROM', function() {
        let query = sql.delete_('table1').from('table2')
        let sqlString = query.postgres()
        expect(sqlString).to.equal('DELETE table1 FROM table2;')
      })
    })

    describe('USING', function() {
      it('should accept arbitrary many using statements', function() {
        let query = sql.deleteFrom('table1').using('table2', 'table3')
        let sqlString = query.postgres()
        expect(sqlString).to.equal('DELETE FROM table1 USING table2, table3;')
      })

      it('should accept a statement containing comma separated using statements', function() {
        let query = sql.deleteFrom('table1').using('table2,       table3')
        let sqlString = query.postgres()
        expect(sqlString).to.equal('DELETE FROM table1 USING table2, table3;')
      })

      it('should accept a mix of statements containing either one or comma separated using statements', function() {
        let query = sql.deleteFrom('table1').using('table2', 'table3,     table4', 'table5')
        let sqlString = query.postgres()
        expect(sqlString).to.equal('DELETE FROM table1 USING table2, table3, table4, table5;')
      })

      it('should eliminate duplicates', function() {
        let query = sql.deleteFrom('table1').using('table2', 'table3,     table2', 'table2')
        let sqlString = query.postgres()
        expect(sqlString).to.equal('DELETE FROM table1 USING table2, table3;')
      })
    })
  })
})