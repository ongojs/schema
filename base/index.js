"use strict";

/**
 * @author Ericson S. Weah  <ericson.weah@gmail.com> <https://github.com/eweah>  <+1.385.204.5167>
 *
 * @module Base
 * @kind class
 *
 * @extends Transform
 * @requires Transform
 * @requires createReadStream
 * @requires createWriteStream
 * @requires promises
 * @requires get
 * @requires request
 * @requires parse
 * @classdesc Base class
 */

// const { createReadStream, createWriteStream, promises } = require("fs");
const { createWriteStream, promises, existsSync,readdirSync,statSync } = require('fs');
const { join } = require('path');
const { Readable } = require('stream')
const  {get, request} = require('https');
const {parse} = require('url')

class Base extends require("stream").Transform {

  constructor(...arrayOfObjects) {

    super({ objectMode: true, encoding: "utf-8", autoDestroy: true });

    arrayOfObjects.forEach(option => {
        if(Object.keys(option).length > 0){
            Object.keys(option).forEach((key) => { if(!this[key]) this[key] = option[key];})
        }
    });

    // auto bind methods
    this.autobind(Base);
    // auto invoke methods
    this.autoinvoker(Base);
    // add other classes method if methods do not already exist. Argument order matters!
    // this.methodizer(..classList);
    //Set the maximum number of listeners to infinity
    this.setMaxListeners(Infinity);
  }

  path (path = '', base = './app/controllers/http') {
    return require('path').join(base, path)
  }

  /**
     * @name getFiles
     * @function
     *
     * @param {Object|Array} iterable iterable data to absorb
     * @param {Object} options Options provided to new stream.Readable([options]). By default, Readable.from() will set options.objectMode to true, unless this is explicitly opted out by setting options.objectMode to false.
     * 
     * @description creates readable streams out of iterators.


     * 
     * @return {Base}
     * 
     */
  getFiles(dirPath){
    {
      files = readdirSync(dirPath)
    
      arrayOfFiles = arrayOfFiles || []
    
      files.forEach(function(file) {
        if (statSync(dirPath + "/" + file).isDirectory()) {
          arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
          arrayOfFiles.push(join(__dirname, dirPath, "/", file))
        }
      })
      return arrayOfFiles
    }
  }

  /**
     * @name getFromIterable
     * @function
     *
     * @param {Object|Array} iterable iterable data to absorb
     * @param {Object} options Options provided to new stream.Readable([options]). By default, Readable.from() will set options.objectMode to true, unless this is explicitly opted out by setting options.objectMode to false.
     * 
     * @description creates readable streams out of iterators.


     * 
     * @return {Base}
     * 
     */
  async readdirRecursive(dirPath, files = []){
      try{
          const allFiles = await fs.promises.readdir(dirPath);
          if(allFiles){
              for await(let file of allFiles){
                  if((await fs.promises.stat(dirPath + "/" + file)).isDirectory()){
                      files = readdirRecursive(dirPath + "/" + file, files);
                  }else{
                      // files.push(path.join(__dirname, dirPath, "/", file)) 
                  }
              }
          }
          //return files;
      }catch(error){
          return error;
      }
  
   }
  /**
     * @name getFromIterable
     * @function
     *
     * @param {Object|Array} iterable iterable data to absorb
     * @param {Object} options Options provided to new stream.Readable([options]). By default, Readable.from() will set options.objectMode to true, unless this is explicitly opted out by setting options.objectMode to false.
     * 
     * @description creates readable streams out of iterators.


     * 
     * @return {Base}
     * 
     */

  getFromIterable(
    iterable = {} | [],
    options = { objectMode: true, encoding: "utf-8", autoDestroy: true }
  ) {
    return Base.from(JSON.stringify(iterable), options);
  }

   /**
   * @name buffer
   * @function
   *
   * @param {Object} data the data to JSON parse
   *
   * @description JSON parses the buffered data
   *
   * @return JSON parsed buffered data;
   *
   */
  buffer(data){
    return JSON.parse(Buffer(data));
  }


   /**
   * @name bufferToString
   * @function
   *
   * @param {Object} data the data to stringify
   *
   * @description Stringifies buffered json parsed data;
   *
   * @return stringified json parsed buffered data
   *
   */
  bufferToString(data){
    return JSON.parse(Buffer(data).toString());
  }

   /**
   * @name apiGet
   * @function
   *
   * @param {String} url the https request api endpoint url
   * @param {Object} options the https request option object
   * @param {Function} fn the callback function 
   * @param {Array} data the resulting object of the https request call;
   *
   * @description makes an https get request to an api endpoint
   *
   * @return stringified json parsed buffered data
   *
   */
   apiGet(url, options = {}, fn = (result, data) => {}, data = []){
      get(url, options, response => {
         response.on('data', chunk => {
            data.push(chunk);
         });
         response.on('error', error => {
            this.emit('apiGet-error', error);
         });
         response.on('end', () => {
            this.emit('apiGet', JSON.parse(Buffer.concat(data).toString()));
            fn(JSON.parse(Buffer.concat(data).toString()), data);
         });
      })
      return this;
   }


   /**
   * @name apiRequest
   * @function
   *
   * @param {String} url the https request api endpoint url
   * @param {Object} options the https request option object
   * @param {Function} fn the callback function 
   * @param {Array} data the resulting object of the https request call;
   *
   * @description makes an https request to an api endpoint
   *
   * @return stringified json parsed buffered data
   *
   */
   apiRequest(url, options, fn = (result, data) => {}, data = []){
        request(url, options, response => {
            response.on('data', chunk => {
                data.push(chunk);
             });
             response.on('error', error => {
                this.emit('apiRequest-error', error.message);
                fn(error.message, error)
             });
             response.on('end', () => {
                this.emit('apiRequest', JSON.parse(Buffer.concat(data).toString()));
                fn(JSON.parse(Buffer.concat(data).toString()), data);
             });
        })
   }


    /**
   * @name post
   * @function
   *
   * @param {String} url the https request api endpoint url
   * @param {Array} data the resulting object of the https request call;
   * @param {Object} headers the https request option object
   * @param {Function} fn the callback function 
   * @param {String} datum the resulting object of the https request call;
  
   *
   * @description makes an https post request to an api endpoint
   *
   * @return stringified json parsed buffered data
   *
   */


   post(url = parse(url), data = JSON.stringify(data), headers = {'Content-Type': 'application/json','Content-Length': data.length
   }, fn = (result, data) => {}, datum = ``){

     const req =  request({...url, method: 'POST', headers}, response => {
        response.on('data', chunk => {
            datum += chunk;
        })
        response.on('end', () => {
            this.emit('post', JSON.parse(datum));
            fn(JSON.parse(datum), datum);
        })
        response.on('error', error => {
            this.emit('error', error.message);
            fn(error.message, error);
        })
     })
     req.write(datum);
     req.end();
   }

   removeDuplicateListeners(event) {
    if (this.rawListeners(event).length > 1) {
      for (let i = 1; i < this.rawListeners(event).length; i++) {
        this.removeListener(event, this.rawListeners(event)[i]);
      }
    }
  }


    /**
   * @name autobinder
   * @function
   *
   * @param {Object|Function|Class} className the class whose methods to be bound to it
   *
   * @description auto sets and auto binds every and all methods for the corresponding class (except the constructor)
   *
   * @return does not return anything
   *
   */

     autobinder(className = {}) {
      for (let method of Object.getOwnPropertyNames(className.prototype)) {
        if (typeof this[method] === "function" && method !== "constructor") {
          this[method] = this[method].bind(this);
        }
      }
    }
  
    /**
     * @name autobind
     * @function
     *
     * @param {Object|Function|Class} className the class whose methods to be bound to it
     *
     * @description auto mounts and auto binds every and all methods for the corresponding class including
     *  itself(itself mounts and self binds)
     *
     * @return does not return anything
     *
     */
  
    autobind(className = {}) {
      this.autobinder = this.autobinder.bind(this);
      this.autobinder(className);
    }
  
    /**
     * @name methodizer
     * @function
     *
     * @param {Object|Array} classNameList the class whose methods to be bound to it
     *
     * @description get methods from all classes with in-class name list array and makes its own
     *
     * @return does not return anything
     *
     */
  
    methodizer(...classNamesList) {
      if (classNamesList.length === 0) return;
      for (let className of classNamesList) {
        for (let method of Object.getOwnPropertyNames(className.prototype)) {
          if (this[method] === undefined || !this[method]) {
            if (typeof className.prototype[method] === "function") {
              this[method] = className.prototype[method];
              // auto bind each method form className class to this
              this[method] = this[method].bind(this);
            }
          }
        }
      }
    }
  
        /**
     * @name methodizeProperty
     * @function
     *
     * @param {Object|Array} classNameList the class whose methods to be bound to it
     *
     * @description get methods from all classes with in-class name list array and makes its own
     *
     * @return does not return anything
     *
     */
  
         methodizeProperty(...objectWithMethodList) {
          if (objectWithMethodList.length === 0) return;
          objectWithMethodList.forEach(objectWithMethod => {
            Object.keys(objectWithMethod).forEach(method => {
              if(!this[method] || this[method] == undefined ) {
                this[method] = objectWithMethod[method];
                this[method] = this[method].bind(this);
              }
            })
          })
        }
    
          /**
         * @name methodizePrototype
         * @function
         *
         * @param {Object|Array} classNameList the class whose methods to be bound to it
         *
         * @description get methods from all classes with in-class name list array and makes its own
         *
         * @return does not return anything
         *
         */
        methodizePrototype(...objectWithMethodList){
          if (objectWithMethodList.length === 0) return;
          objectWithMethodList.forEach(objectWithMethod => {
            Object.keys(objectWithMethod).forEach(method => {
              if(!this[method] || this[method] == undefined ) {
                this[method] = objectWithMethod[method]
                this[method] = this[method].bind(this);
              }
            })
          })
        
        }
    /**
     * @name autoinvoker
     * @function
     *
     * @param {Object|Function|Class} className the class whose methods to be bound to it
     *
     * @description auto sets and auto invokes every and all methods for the corresponding class
     *
     * @return does not return anything
     *
     */
  
    autoinvoker(className = {}) {
      for (let method of Object.getOwnPropertyNames(className.prototype)) {
        this.autoinvoked().forEach((name) => {
          if (method === name) {
            this[method]();
          }
        });
      }
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
      return [""];
    }
  

  /**
   * @name _transform
   * @function
   *
   * @param {Buffer|String|Any} chunk The Buffer to be transformed, converted from the string passed to stream. write(). * If the stream's decode strings option is false or the stream is operating in object mode,
   * the chunk will not be converted & will be whatever was passed to stream. write().
   *
   * @param {String} encoding If the chunk is a string, then this is the encoding type.
   * If the chunk is a buffer, then this is the special value 'buffer'. Ignore it in that case.
   * @param {Function} fn A callback function (optionally with an error argument and data)
   *  to be called after the supplied chunk has been processed.
   *
   * @description This function MUST NOT be called by application code directly.
   *  It should be implemented by child classes and called by the internal Readable class methods only.
   *
   * @return does not return anything
   *
   */

  _transform(chunk, encoding = "utf-8", fn) {
    this.push(JSON.stringify(chunk));
    fn();
  }

  /**
   * @name _flush
   * @function
   *
   * @param {Function} fn A callback function (optionally with an error argument and data)
   *  to be called after the supplied chunk has been processed.
   *
   * @description This function MUST NOT be called by application code directly.
   *  It should be implemented by child classes and called by the internal Readable class methods only.
   *
   * @return does not return anything
   *
   */

  _flush(fn) {
    fn();
  }

  /**
   * @name _final
   * @function
   *
   * @param {Function} fn A callback function (optionally with an error argument and data)
   *  to be called after the supplied chunk has been processed.
   *
   * @description This function MUST NOT be called by application code directly.
   *  It should be implemented by child classes and called by the internal Readable class methods only.
   *
   * @return does not return anything
   *
   */

  _final(fn) {
    fn();
  }

  /**
    * @name destroy
    * @function
    * 
    * @param {Error} error Error which will be passed as payload in 'error' event
    * 

    * @description Destroy the stream. Optionally emit an 'error' event, and emit a 'close' event (unless emitClose is set to false). After this call, the readable stream will release any internal resources, and subsequent calls to push() will be ignored.
    * 
    * Once destroy() has been called any further calls will be a no-op and no further errors except _destroy() may be emitted as 'error'.

     Implementors should not override this method but instead implement readable._destroy().
    *    
    * @return Base
    * 
    */

  destroy(error) {}

  /**
       * @name pipe
       * @function
       * 
       * @param {Writable} destination The destination for writing data
       * 
       * @param {Object} options Pipe options
       *     @param {Boolean} end End the writer when the reader ends. Default: true.
  
       * @description Attaches a Writable stream to the readable, causing it to switch automatically into flowing mode and push all of its data to the attached Writable. The flow of data will be automatically managed so that the destination Writable stream is not overwhelmed by a faster Readable stream.
       * 
       * Returns a reference to the destination stream making it possible to set up chains of piped streams:
  
        Implementors should not override this method but instead implement readable._destroy().
       *    
       * @return {Writable} The destination, allowing for a chain of pipes if it is a Duplex or a Transform stream
       * 
       */

  pipe(destination, options = { end: true }) {}

  /**
       * @name read
       * @function
       * 
       * @param {Number} size Optional argument to specify how much data to read.
       * 
  
       * @description  Pulls some data out of the internal buffer and returns it. If no data is available to be read, null is returned. By default, the data will be returned as a Buffer object unless an encoding has been specified using the readable.encoding() method or the stream is operating in object mode.
  
      The optional size argument specifies a specific number of bytes to read. If size bytes are not available to be read, null will be returned unless the stream has ended, in which case, all of the data remaining in the internal buffer will be returned.
  
      If the size argument is not specified, all of the data contained in the internal buffer will be returned.
  
      The size argument must be less than or equal to 1 GiB.
  
      The readable.read() method should only be called on Readable streams operating in paused mode. In flowing mode, readable.read() is called automatically until the internal buffer is fully drained.
  
       * @return {String|Buffer|null|any}
       * 
       */

  read(size) {}

  /**
       * @name setEncoding
       * @function
       * 
       * @param {String} encoding The encoding to use.
       * 
       * @description sets the character encoding for data to read from the Readable stream.
       * 
       * By default, no encoding is assigned and stream data will be returned as Buffer objects. Setting an encoding causes the stream data to be returned as strings of the specified encoding rather than as Buffer objects. For instance, calling readable.set encoding('utf8') will cause the output data to be interpreted as UTF-8 data, and passed as strings. Calling readable.encoding('hex') will cause the data to be encoded in hexadecimal string format.
  
      The Readable stream will properly handle multi-byte characters delivered through the stream that would otherwise become improperly decoded if simply pulled from the stream as Buffer objects.
       *    
       * @return Base The destination, allowing for a chain of pipes if it is a Duplex or a Transform stream
       * 
       */

  setEncoding(encoding) {}

  /**
       * @name unpipe
       * @function
       * 
       * @param {Writable} destination The destination for writing data
       * 
    
       * @description detaches a Writable stream previously attached using the stream.pipe() method.
       * 
       *If the destination is not specified, then all pipes are detached.
  
        If the destination is specified, but no pipe is set up for it, then the method does nothing.
       *    
       * @return Base 
       * 
       */

  unpipe(e) {}

  /**
       * @name unshift
       * @function
       * 
       * @param {Buffer|Uint8Array|String|Null|Any} chunk Chunk of data to unshift onto the read queue. For streams not operating in object mode, chunk must be a string, Buffer, Uint8Array or null. For object mode streams, the chunk may be any JavaScript value
       * 
       * @param {String} encoding  Encoding of string chunks. Must be a valid Buffer encoding, such as 'utf8' or 'ASCII.
       * 
    
       * @description Pushes a chunk of data back into the internal buffer. This is useful in certain situations where a stream is being consumed by code that needs to "un-consume" some amount of data that it has optimistically pulled out of the source so that the data can be passed on to some other party
  
       Passing chunk as null signals the end of the stream (EOF) and behaves the same as readable.push(null), after which no more data can be written. The EOF signal is put at the end of the buffer and any buffered data will still be flushed.
  
       The stream.unshift(chunk) method cannot be called after the 'end' event has been emitted or a runtime error will be thrown.
  
      Developers using stream.unshift() often should consider switching to the use of a Transform stream instead. See the API for stream implementers section for more information.
       *    
       * @return Base 
       * 
       */

  unshift(chunk, encoding) {}

  /**
       * @name wrap
       * @function
       * 
       * @param {Stream} stream An "old style" readable stream
       * 
      
       * @description Prior to Node.js 0.10, streams did not implement the entire stream module API as it is currently defined. (See Compatibility for more information.)
  
      When using an older Node.js library that emits 'data' events and has a stream.pause() method that is advisory only, the readable.wrap() method can be used to create a Readable stream that uses the old stream as its data source.
  
      It will rarely be necessary to use readable.wrap() but the method has been provided as a convenience for interacting with older Node.js applications and libraries.
       *    
       * @return Base 
       * 
       */

  wrap(stream) {}

  /**
       * @name _read
       * @function
       * 
       * @param {Number} size Number of bytes to read asynchronously
       * 
  
   
       * @description This function MUST NOT be called by application code directly. It should be implemented by child classes and called by the internal Readable class methods only.
       * 
       *All Readable stream implementations must provide an implementation of the readable._read() method to fetch data from the underlying resource.
  
      When readable._read() is called, if data is available from the resource, the implementation should begin pushing that data into the read queue using the this.push(data chunk) method. _read() should continue reading from the resource and pushing data until readable.push() returns false. Only when _read() is called again after it has stopped should it resume pushing additional data onto the queue.
      
      Once the readable._read() method has been called, it will not be called again until more data is pushed through the readable.push() method. Empty data such as empty buffers and strings will not cause readable._read() to be called.
  
      The size argument is advisory. For implementations where a "read" is a single operation, returns data can use the size argument to determine how much data to fetch. Other implementations may ignore this argument and simply provide data whenever it becomes available. There is no need to "wait" until size bytes are available before calling stream.push(chunk).
  
      The readable._read() method is prefixed with an underscore because it is internal to the class that defines it, and should never be called directly by user programs.
  
  
      
       * @return does not return anything
       * 
       */

  _read(size) {}

  /**
       * @name push
       * @function
       * 
       * @param {Buffer|Uint8Array|String|Null|Any} chunk Chunk of data to push into the read queue. For streams not operating in object mode, chunk must be a string, Buffer, or Uint8Array. For object mode streams, a chunk may be any JavaScript value.
       * 
       * @param {String} encoding Encoding of string chunks. Must be a valid Buffer encoding, such as 'utf8' or 'ASCII
       * 
   
       * @description  When the chunk is a Buffer, Uint8Array, or string, the chunk of data will be added to the internal queue for users of the stream to consume. Passing chunk as null signals the end of the stream (EOF), after which no more data can be written.
  
      When the Readable is operating in paused mode, the data added with readable.push() can be read out by calling the readable.read() method when the 'readable' event is emitted.
  
      When the Readable is operating in flowing mode, the data added with readable.push() will be delivered by emitting a 'data' event.
  
      The readable.push() method is designed to be as flexible as possible. For example, when wrapping a lower-level source that provides some form of pause/resume mechanism, and a data callback, the low-level source can be wrapped by the custom Readable instance:
  
       * 
       * @return {Boolean} false if the stream wishes for the calling code to wait for the 'drain' event to be emitted before continuing to write additional data; otherwise true.
       * 
       */

  push(chunk, encoding = "utf-8") {}

  /**
      * @name pipe
      * @function
      * 
      * @param {Writable} destination The destination for writing data
      * 
      * @param {Object} options Pipe options
      *     @param {Boolean} end End the writer when the reader ends. Default: true.
 
      * @description Attaches a Writable stream to the readable, causing it to switch automatically into flowing mode and push all of its data to the attached Writable. The flow of data will be automatically managed so that the destination Writable stream is not overwhelmed by a faster Readable stream.
      * 
      * Returns a reference to the destination stream making it possible to set up chains of piped streams:
 
       Implementors should not override this method but instead implement readable._destroy().
      *    
      * @return {Writable} The destination, allowing for a chain of pipes if it is a Duplex or a Transform stream
      * 
      */

  pipe(e, options = { end: true }) {}

  /**
      * @name unpipe
      * @function
      * 
      * @param {Writable} destination The destination for writing data
      * 
   
      * @description detaches a Writable stream previously attached using the stream.pipe() method.
      * 
      *If the destination is not specified, then all pipes are detached.
 
       If the destination is specified, but no pipe is set up for it, then the method does nothing.
      *    
      * @return Base 
      * 
      */

  unpipe(e) {}

  /**
      * @name unshift
      * @function
      * 
      * @param {Buffer|Uint8Array|String|Null|Any} chunk Chunk of data to unshift onto the read queue. For streams not operating in object mode, chunk must be a string, Buffer, Uint8Array or null. For object mode streams, the chunk may be any JavaScript value
      * 
      * @param {String} encoding  Encoding of string chunks. Must be a valid Buffer encoding, such as 'utf8' or 'ASCII.
      * 
   
      * @description Pushes a chunk of data back into the internal buffer. This is useful in certain situations where a stream is being consumed by code that needs to "un-consume" some amount of data that it has optimistically pulled out of the source so that the data can be passed on to some other party
 
      Passing chunk as null signals the end of the stream (EOF) and behaves the same as readable.push(null), after which no more data can be written. The EOF signal is put at the end of the buffer and any buffered data will still be flushed.
 
      The stream.unshift(chunk) method cannot be called after the 'end' event has been emitted or a runtime error will be thrown.
 
     Developers using stream.unshift() often should consider switching to the use of a Transform stream instead. See the API for stream implementers section for more information.
      *    
      * @return Base 
      * 
      */

  unshift(chunk, encoding) {}

  /**
      * @name wrap
      * @function
      * 
      * @param {Stream} stream An "old style" readable stream
      * 
     
      * @description Prior to Node.js 0.10, streams did not implement the entire stream module API as it is currently defined. (See Compatibility for more information.)
 
     When using an older Node.js library that emits 'data' events and has a stream.pause() method that is advisory only, the readable.wrap() method can be used to create a Readable stream that uses the old stream as its data source.
 
     It will rarely be necessary to use readable.wrap() but the method has been provided as a convenience for interacting with older Node.js applications and libraries.
      *    
      * @return Base 
      * 
      */

  wrap(stream) {}

  /**
      * @name _destroy
      * @function
      * 
      * @param {Error} error A possible error..
      * 
 
      * @param {Function} fn  A callback function that takes an optional error  argument.
      * 
      *  to be called after the supplied chunk has been processed.
      * 
      * @description The _destroy() method is called by writable.destroy(). It can be overridden by child classes but it must not be called directly.
      *    
      * @return does not return anything
      * 
      */

  _destroy(error, fn = () => {}) {}
}

module.exports = Base;
