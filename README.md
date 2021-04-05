# Knight SQL by Coderitter

A data structure to work with SQL.

## Related packages

Use [knight-orm](https://github.com/c0deritter/knight-orm) if you are looking for a more powerful solution to access a database.

You can use [knight-sql-criteria-filler](https://github.com/c0deritter/knight-sql-criteria-filler) which uses [knight-criteria](https://github.com/c0deritter/knight-criteria) to fill SQL queries of this package. This is useful if you want to query a database through an API.

## Install

`npm install knight-sql`

## Overview

### Insert, Select, Update, Delete (ISUD)

```typescript
import sql from 'knight-sql'

sql.insertInto('table').value('name', 'Josa')
sql.select('*').from('table').where('id', 1)
sql.update('table').set('name', 'Sebastian').where('id', 1)
sql.deleteFrom('table').where('id', 1)
```

### Render to SQL and get values array

```typescript
let query = sql.select('*').from('table').where('id', 1)

// create MySQL string
query.mysql() == 'SELECT * FROM table WHERE id = ?'

// create PostgreSQL string
query.postgres() == 'SELECT * FROM table WHERE id = $1'

// get the values as an array
query.values() == [ 1 ]
```

### From

```typescript
// set a table
sql.select('*').from('table')

// add an alias
sql.select('*').from('table', 't')

// use an expression
sql.select('*').from('table t')
sql.select('*').from('table AS t')
```

### Join

```typescript
let query = sql.select('t1.id, t2.name').from('table1 t1').join('table2 t2', 't1.id = t2.table1Id')
let query = sql.select('t1.id, t2.name').from('table1 t1').join('table2', 't2', 't1.id = t2.table1Id')

query.sql() == 'SELECT t1.id, t2.name FROM table1 t1 JOIN table2 t2 ON t1.id = t2.table1Id'
```

```typescript
let query = sql.select('t1.id, t2.name').from('table1 t1').join('left', 'table2 t2', 't1.id = t2.table1Id')
let query = sql.select('t1.id, t2.name').from('table1 t1').join('left', 'table2', 't2', 't1.id = t2.table1Id')

query.sql() == 'SELECT t1.id, t2.name FROM table1 t1 LEFT JOIN table2 t2 ON t1.id = t2.table1Id'
```

### Where

```typescript
let query = sql.select('*').from('table').where('id', 1)

query.mysql() == 'SELECT * FROM table WHERE id = ?'
query.postgres() == 'SELECT * FROM table WHERE id = $1'

query.values() == [ 1 ]
```

```typescript
let query = sql.select('*').from('table').where('id', '>', 1)

query.sql() == 'SELECT * FROM table WHERE id > ?'
query.sql('postgres') == 'SELECT * FROM table WHERE id > $1'

query.values() == [ 1 ]
```

```typescript
sql.select('*').from('table').where('name', 'LIKE', '%ert%')
```

It can handle `null` values.

```typescript
sql.select('*').from('table').where('id IS NULL')
sql.select('*').from('table').where('id is null') // will be converted to uppercase
sql.select('*').from('table').where('id IS nOT nulL') // will be converted to uppercase
sql.select('*').from('table').where('id', 'NULL')
sql.select('*').from('table').where('id', 'NOT NULL')
sql.select('*').from('table').where('id', null)
sql.select('*').from('table').where('id', !null) // joke
```

It will convert an array to an appropriate SQL representation.

```typescript
sql.select('*').from('table').where('id IN', [ 1, 2, 3 ])
sql.select('*').from('table').where('id', 'IN', [ 1, 2, 3 ])
sql.select('*').from('table').where('id', [ 1, 2, 3 ])

query.myqsl() == 'SELECT * FROM table WHERE id IN (?, ?, ?)'
query.postgres() == 'SELECT * FROM table WHERE id IN ($1, $2, $3)'

query.values() == [ 1, 2, 3 ]
```

Various where statements are connected through the `AND` operator.

```typescript
let query = sql.select('*').from('table').where('id', [ 1, 2, 3]).where('name', 'LIKE', '%ert%')

query.sql() == 'SELECT * FROM table WHERE id IN [?, ?, ?] AND name LIKE \'%ert\''
query.sql('postgres') == 'SELECT * FROM table WHERE id IN ($1, $2, $3) AND name LIKE \'%ert\''

query.values() == [ 1, 2, 3, '%ert%' ]
```

### Order By, Limit, Offest

```typescript
sql.select('*').from('table').orderBy('id', 'DESC').limit(10).offset(100)
```

### Returning (Postgres)

```typescript
sql.select('*').from('table').returning('*')
```
