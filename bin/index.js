#!/usr/bin/env node

"use strict";

/**
 * @author Ericson S. Weah  <ericson.weah@gmail.com> <https://github.com/eweah>  <+1.385.204.5167>
 *
 * @module CLI
 * @kind class
 *
 * @extends Base
 * @requires Base
 *
 * @classdesc CLI class
 */


const Schema = require('../');

class CLI extends require("../base") {

  constructor(...arrayOfObjects) {

    super({ objectMode: true, encoding: "utf-8", autoDestroy: true });

    arrayOfObjects.forEach(option => {
        if(Object.keys(option).length > 0){
            Object.keys(option).forEach((key) => { if(!this[key]) this[key] = option[key];})
        }
    });

    // auto bind methods
    this.autobind(CLI);
    // auto invoke methods
    this.autoinvoker(CLI);
    // add other classes method if methods do not already exist. Argument order matters!
    // this.methodizer(..classList);
    //Set the maximum number of listeners to infinity
    this.setMaxListeners(Infinity);
  }


  command(index = 2){
    return process.argv[index]
 }
 commands(){
  switch(this.command(2)){
      case "make":
        if(this.command(3)){
          const  {makeSchema, hasType} =  new Schema({command: this.command(2)})
          if(this.command(4)){
              if(hasType(this.command(4))){
                makeSchema(this.command(3), this.command(4));
              }else{
                console.log(`invalid argument for make:schema ${this.command(3)}`);
              }
            
          }else{
            makeSchema(this.command(3));
          }
      
         }else{
          console.log('make:schema command');
         }
        break;
      case "man":
        console.log('make man page');
        break;
      case "help":
        console.log("help man page");
        break;
      default: 
        console.log("invalid command ...");
        break;
  }
}

  init(){
    this.commands();
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
      return ["init"];
    }

}

module.exports = new CLI;