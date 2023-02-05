module.exports = (option = {}) => `'use strict';

/*
|--------------------------------------------------------------------------
| ${option.name} Schema
|--------------------------------------------------------------------------
|
| Here we you may add more options (keys) to your schema.
|
|
*/

const Schema  = require('@mongodb-model/db-schema');

const {makeSchema}  = new Schema;

module.exports = makeSchema("${option.name}",{

    /*
    |--------------------------------------------------------------------------------
    | Add your schema kyes or properties with their types and validations
    |--------------------------------------------------------------------------------
    |
    | The format is as follow: propertyName: "propertyType|validationType:value|validationType:value|boolean|..."
    | For example: 
    |   To add a property username of type string with min value 2, max value 3, and required, it will look like this: 
    |     username: "string|min:2|max:3|required"
    |
    |   To add a property email of type string with min value 4, max value 75, email address, and required , it will look like this: 
    |     email: "string|min:4|max:75|required|email"
    |
    |
    */

    username: "string|min:2|max:10|required",
    email: "string|min:4|max:75|required|email",

}, "${option.type}") ;
`

