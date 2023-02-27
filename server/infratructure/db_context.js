const sqlite3 = require('sqlite3');
const Promise = require('bluebird');

class DBContext {  

  constructor(dbFilePath) {
    this.dbContext = new sqlite3.Database(dbFilePath, (err) => {  
      if (err) {
        console.log('Could not connect to database', err)   
      } else {
        console.log('Connected to database')   
      }
    })
  }

  runquery(sql, params = []) { 
    return new Promise((resolve, reject) => {   
      this.dbContext.run(sql, params, function (err) {  
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
}

module.exports = DBContext;