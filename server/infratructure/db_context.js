const sqlite3 = require('sqlite3');
const Promise = require('bluebird');

class DBContext {  

  constructor(dbFilePath) {
    this.db = new sqlite3.Database(dbFilePath, (err) => {  
      if (err) {
        console.log('Could not connect to database', err)   
      } else {
        console.log('Connected to database')   
      }
    })
  }

  runquery(sql, params = []) { 
    return new Promise((resolve, reject) => {   
      this.db.run(sql, params, function (err) {  
        if (err) {   
          console.log('Error running sql ' + sql)
          console.log(err)
          reject(err)
        } else {   
          resolve({ id: this.lastID })   
        }
      })
    })
  }

  async runMultiQuery( sqlParent, paramParents = [], sqlChildren, paramChildrens = []){
    await this.runquery(sqlParent, paramParents = []);
    return new Promise((resolve, reject) => {   
      this.db.run(sqlChildren, paramChildrens, function (err) {  
        if (err) {   
          console.log('Error running sql ' + sqlChildren)
          console.log(err)
          reject(err)
        } else {   
          resolve({ id: this.lastID })   
        }
      })
    })
  }

  getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          console.log('Error running sql: ' + sql)
          console.log(err)
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.log('Error running sql: ' + sql)
          console.log(err)
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }
}

module.exports = DBContext;