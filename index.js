"use strict";

/**
 * @author Ericson S. Weah  <ericson.weah@gmail.com> <https://github.com/eweah>  <+1.385.204.5167>
 *
 * @module Schema
 * @kind class
 *
 * @extends Schema
 * @requires Schema
 * @requires createReadStream
 * @requires createWriteStream
 *
 * @classdesc Schema class
 */

const { createReadStream, createWriteStream, promises } = require("fs");

const {join } = require('node:path');
const {existsSync} = require('fs')

const { exec } = require('node:child_process');
// const schema = require('./lib/schema')
const schema = require('./lib/native')

class Schema extends require("./base") {
  constructor(...arrayOfObjects) {

    super({ objectMode: true, encoding: "utf-8", autoDestroy: true });

    arrayOfObjects.forEach(option => {
        if(Object.keys(option).length > 0){
            Object.keys(option).forEach((key) => { if(!this[key]) this[key] = option[key];})
        }
    });

    // auto bind methods
    this.autobind(Schema);
    // auto invoke methods
    this.autoinvoker(Schema);
    // add other classes method if methods do not already exist. Argument order matters!
    // this.methodizer(..classList);
    //Set the maximum number of listeners to infinity
    this.setMaxListeners(Infinity);
  }

  types() {
    return [
      'double', 'string', 'object', 'array', 'objectId', 'data', 'bool',
      'null', 'regex', 'int', 'timestamp', 'long', 'decimal', 'uuid', 'bindData',
      'mixed'
    ]
  }



  cmd(cmdCommand = 'User'){ return cmdCommand.endsWith('s') ? cmdCommand.toLowerCase(): `${cmdCommand}s`.toLocaleLowerCase()};

  path(path = '/app/schemas'){return require('path').join(process.cwd(), path); }
  async addDirectory (path = this.path()) {
    if(!existsSync(path)){
      await require('fs').promises.mkdir(path, {recursive: true});
    }
  }

  checkForInstallation(){
    // exec('npm list @mongodb-model/db-schema', (error, stdout, stderr) => {
    //   if (error) {
    //     exec('yarn link @mongodb-model/db-schema', (err, sto, sdi) => {
    //         if(err) return error
    //         if(sto){
    //             console.log(sto)
    //         }
    //     })
    //   }
    // });
  }
  modelPath(command){
    const paths = command.split('/');
    paths.pop();
    const modelPath = '/app/schemas/'+paths.join('/');
    return this.path(modelPath)
  }
  modelName(command) {
    const paths = command.split('/');
    const name = paths.pop();
    return (name.charAt(0).toUpperCase() + name.slice(1)).split('=')[1];

  }
  collectionName(command){
    const paths = command.split('/');
    const name = paths.pop();
    return this.cmd(name);
  }
  hasType(type = 'object') {
  
    if(type && typeof(type) == 'string' && type.trim().length !== 0){
        if(type.startsWith('--type=')){
            if(this.types().includes(type.split('=')[1])){
              return true;
            }else{
              return false;
            }
          }else{
              return false;
          } 
    }else{
        return false;
    }
    
  }






 
  schemaType(type = '--type=object') {
    return this.hasType(type) ? type.split('=')[1]: 'object';
  }

  async makeSchema(command, type = 'object'){
    if(command.startsWith('--schema=')){
      command = command.split('--schema=')[1];
    }
    if(this.hasType){
      this.checkForInstallation();
      await this.addDirectory(this.modelPath(command));
      if(!this.modelName(command) || this.modelName(command) === undefined){
        if(command && command.split('/').length == 1){
          if(!existsSync(join(this.modelPath(command), `${command}.js`))){
            const writable = this.createWriteStream(join(this.modelPath(command), `${command}.js`));
            writable.write(schema({name: this.cmd(command), options: {}, type: this.schemaType(type) }));
            writable.end('');
            console.log(`\x1b[32m${this.cmd(command)} schema successfully created!\x1b[0m`);
          }else{
            console.log(`\x1b[32m${this.cmd(command)}\x1b[0m\x1b[31m schema already exists!\x1b[0m`);
          }
        }else{
          if(!existsSync(join(this.modelPath(command), `${command.split('/').pop()}.js`))){
            const writable = this.createWriteStream(join(this.modelPath(command), `${command.split('/').pop()}.js`));
            writable.write(schema({name: this.cmd(command), options: {}, type: this.schemaType(type) }));
            writable.end('');
            console.log(`\x1b[32m${this.cmd(command)} schema successfully created!\x1b[0m`);
          }else{
            console.log(`\x1b[32m${this.cmd(command)}\x1b[0m\x1b[31m schema already exists!\x1b[0m`);
          }
        }
      }else{
        if(!existsSync(join(this.modelPath(command), `${this.modelName(command)}.js`))){
          const writable = this.createWriteStream(join(this.modelPath(command), `${this.modelName(command)}.js`));
          writable.write(schema({name: this.cmd(this.modelName(command)),options: {}, type: this.schemaType(type) }));
          writable.end('');
          console.log(`\x1b[32m${this.cmd(this.modelName(command))} schema successfully created!\x1b[0m`);
        }else{
          console.log(`\x1b[32m${this.cmd(this.modelName(command))}\x1b[0m\x1b[31m schema already exists!\x1b[0m`);
        }
      }
    }else{
      return console.log('command make:schema', command)
    }

  }


  // async makeSchema(command, type = 'object'){
  //   if(command.startsWith('--schema=')){
  //     command = command.split('--schema=')[1];
  //   }
  //   if(this.hasType){
  //     this.checkForInstallation();
  //     await this.addDirectory(this.modelPath(command));
  //     if(!this.modelName(command) || this.modelName(command) === undefined){
  //       if(command && command.split('/').length == 1){
  //         if(!existsSync(join(this.modelPath(command), `${command}.js`))){
  //           const writable = this.createWriteStream(join(this.modelPath(command), `${command}.js`));
  //           writable.write(schema({name: this.cmd(command), options: {}, type: this.schemaType(type) }));
  //           writable.end('');
  //           console.log(`\x1b[32m${this.cmd(command)} schema successfully created!\x1b[0m`);
  //         }else{
  //           console.log(`\x1b[32m${this.cmd(command)}\x1b[0m\x1b[31m schema already exists!\x1b[0m`);
  //         }
  //       }else{
  //         if(!existsSync(join(this.modelPath(command), `${command.split('/').pop()}.js`))){
  //           const writable = this.createWriteStream(join(this.modelPath(command), `${command.split('/').pop()}.js`));
  //           writable.write(schema({name: this.cmd(command), options: {}, type: this.schemaType(type) }));
  //           writable.end('');
  //           console.log(`\x1b[32m${this.cmd(command)} schema successfully created!\x1b[0m`);
  //         }else{
  //           console.log(`\x1b[32m${this.cmd(command)}\x1b[0m\x1b[31m schema already exists!\x1b[0m`);
  //         }
  //       }
  //     }else{
  //       if(!existsSync(join(this.modelPath(command), `${this.modelName(command)}.js`))){
  //         const writable = this.createWriteStream(join(this.modelPath(command), `${this.modelName(command)}.js`));
  //         writable.write(schema({name: this.cmd(this.modelName(command)),options: {}, type: this.schemaType(type) }));
  //         writable.end('');
  //         console.log(`\x1b[32m${this.cmd(this.modelName(command))} schema successfully created!\x1b[0m`);
  //       }else{
  //         console.log(`\x1b[32m${this.cmd(this.modelName(command))}\x1b[0m\x1b[31m schema already exists!\x1b[0m`);
  //       }
  //     }
  //   }else{
  //     return console.log('command make:schema', command)
  //   }

  // }

  async makeNativeSchema(command, type = 'object'){
    if(command.startsWith('--schema=')){
      command = command.split('--schema=')[1];
    }
    if(this.hasType){
      this.checkForInstallation();
      await this.addDirectory(this.modelPath(command));
      if(!this.modelName(command) || this.modelName(command) === undefined){
        if(command && command.split('/').length == 1){
          if(!existsSync(join(this.modelPath(command), `${command}.js`))){
            const writable = this.createWriteStream(join(this.modelPath(command), `${command}.js`));
            writable.write(schema({name: this.cmd(command), options: {}, type: this.schemaType(type) }));
            writable.end('');
            console.log(`\x1b[32m${this.cmd(command)} schema successfully created!\x1b[0m`);
          }else{
            console.log(`\x1b[32m${this.cmd(command)}\x1b[0m\x1b[31m schema already exists!\x1b[0m`);
          }
        }else{
          if(!existsSync(join(this.modelPath(command), `${command.split('/').pop()}.js`))){
            const writable = this.createWriteStream(join(this.modelPath(command), `${command.split('/').pop()}.js`));
            writable.write(schema({name: this.cmd(command), options: {}, type: this.schemaType(type) }));
            writable.end('');
            console.log(`\x1b[32m${this.cmd(command)} schema successfully created!\x1b[0m`);
          }else{
            console.log(`\x1b[32m${this.cmd(command)}\x1b[0m\x1b[31m schema already exists!\x1b[0m`);
          }
        }
      }else{
        if(!existsSync(join(this.modelPath(command), `${this.modelName(command)}.js`))){
          const writable = this.createWriteStream(join(this.modelPath(command), `${this.modelName(command)}.js`));
          writable.write(schema({name: this.cmd(this.modelName(command)),options: {}, type: this.schemaType(type) }));
          writable.end('');
          console.log(`\x1b[32m${this.cmd(this.modelName(command))} schema successfully created!\x1b[0m`);
        }else{
          console.log(`\x1b[32m${this.cmd(this.modelName(command))}\x1b[0m\x1b[31m schema already exists!\x1b[0m`);
        }
      }
    }else{
      return console.log('command make:schema', command)
    }

  }


  async migrate(command, type = 'object'){
  
    if(this.hasType){
      if(this.modelName(command) !== undefined){
        this.checkForInstallation();
        await this.addDirectory(this.modelPath(command));
        if(existsSync(join(this.modelPath(command), `${this.modelName(command)}.js`))){
            const writable = this.createWriteStream(join(this.modelPath(command), `${this.modelName(command)}.js`));
            writable.write(schema({name: this.cmd(this.modelName(command)), type: this.schemaType(type) }));
            writable.end('');
            console.log(`\x1b[32m${this.modelName(command)} schema successfully created!\x1b[0m`);
          }else{
            console.log(`\x1b[32m${this.modelName(command)}\x1b[0m\x1b[31m schema already exists!\x1b[0m`);
          }
      }
    }else{
        return console.log('command make:schema', command)
    }
    
  }


  addDefault() {
    if (!this.createWriteStream) this.createWriteStream = createWriteStream;
    if (!this.createReadStream) this.createReadStream = createReadStream;
    if (!promises) this.promises = promises;
  }
  /**
   * @name autoinvoked
   * @function
   *
   * @param {Object|Function|Class} className the class whose methods to be bound to it
   *
   * @description auto sets the list of methods to be auto invoked
   *
   * @return does not return anything
   *
   */

  autoinvoked() {
    return ["addDefault"];
  }
  // makeSchema(command){
  //   console.log(command);
  // }

}

module.exports = Schema;

