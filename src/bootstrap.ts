import 'reflect-metadata';
import * as nconf from 'nconf';
import * as fs from 'fs';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
import * as bodyParser from 'body-parser';
import TYPES from './constant/types';
import * as xml2js from 'xml2js';
import { Request, Response, Application, NextFunction } from 'express';


import { LoggerInstance, transports, LoggerOptions, WLogger } from './utils/logger';
import { IModels, Models } from './models/model';
import { IDataStore, DataStore, LocalDataStore } from './service/datastore';
import { IItemModuleManager, ItemModuleManager } from './models/item_module_manager';
import { IItemService, ItemService } from './service/item_service';

import { RequestType } from './controller/item_controller';
import  './controller/item_controller';

// ------------------------------------
// CONFIGURATION
// ------------------------------------

//
// Setup nconf to use (in-order):
//   1. Environment variables
//   2. Command-line arguments
//   3. A file located at 'path/to/config.json'
//
nconf.argv().env({separator:'__'})

// Check whether configuration file is found
let config_file : string = nconf.get('config_file') || './src/resources/OrchestratorRMServer.json.default';
if (!fs.existsSync(config_file)) {
  console.error("Default Configuration file " + config_file + " was not found! ");
  process.exit(1);
}
nconf.file({ file: config_file });

// Enable custom configuration file
config_file = './src/resources/OrchestratorRMServer.json.default';
if (fs.existsSync(config_file)) {
  console.error("Reading custom Configuration file " + config_file + " was not found! ");
  nconf.file({ file: config_file });
}

nconf.set('NODE_ENV', process.env.NODE_ENV)

// ------------------------------------
// CONFIGURE LOGGER
// ------------------------------------
const logger : LoggerInstance = new WLogger({
  level: nconf.get('LOGLEVEL'),
  transports: [
    new transports.Console({
      colorize: true,
      prettyPrint: true,
      timestamp: true
    })
  ]
})

// ------------------------------------
// CONTAINER CONFIGURATION
// ------------------------------------
const container = new Container();

container.bind<LoggerInstance>(TYPES.Logger).toConstantValue(logger);
if( process.env.NODE_ENV === 'production')
{
  // container.bind<IDataStore>(TYPES.DataStore).toConstantValue(
  //   new LocalDataStore(new WLogger())
  // );

  container.bind<IDataStore>(TYPES.DataStore).toConstantValue(
    new DataStore(container.get<LoggerInstance>(TYPES.Logger), {
      host   : nconf.get('REDIS:HOST'),
      port   : nconf.get('REDIS:PORT'),
      expire : nconf.get('REDIS:EXPIRE')
    })
  );

}else{
  container.bind<IDataStore>(TYPES.DataStore).toConstantValue(
    new DataStore(container.get<LoggerInstance>(TYPES.Logger), {
      host   : nconf.get('REDIS:HOST'),
      port   : nconf.get('REDIS:PORT'),
      expire : nconf.get('REDIS:EXPIRE')
    })
  );
}



if( nconf.get('NODE_ENV') === 'integration_test'){
  nconf.set('MYSQL','USING SQLITE FOR INTEGRATION TESTS')
  container.bind<IModels>(TYPES.Models).toConstantValue(new Models(
    "configuration","","",
    {
      dialect: 'sqlite',
      // disable logging; default: console.log
      storage: process.env.sqlfile,
      //logging: false
    }
    )
  );
}
else
{

  container.bind<IModels>(TYPES.Models).toConstantValue(new Models(
    "configuration",
    nconf.get("MYSQL:USER"),
    nconf.get("MYSQL:PASSWORD"),
    {
      host: nconf.get("MYSQL:HOST"),
      dialect: 'mysql',
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
      // disable logging; default: console.log
      logging: false
    }
    )
  );

}


container.bind<IItemModuleManager>(TYPES.ItemModuleManager).toConstantValue(new ItemModuleManager(
    container.get<IModels>(TYPES.Models),
    container.get<LoggerInstance>(TYPES.Logger)
));
container.bind<IItemService>(TYPES.ItemService).toConstantValue(
  new ItemService(
    container.get<IItemModuleManager>(TYPES.ItemModuleManager),
    container.get<IDataStore>(TYPES.DataStore),
    container.get<LoggerInstance>(TYPES.Logger)
  )
);



// ------------------------------------
// INITIALIZE APPLICATION
// ------------------------------------

const http_port  = nconf.get("HTTP_PORT")
logger.info('-------------------------------------')
logger.info('        ORCHESTRATOR GATEWAY         ')
logger.info('-------------------------------------')
logger.info('Listening at ' + http_port + ' for http')
fs.readFile(config_file, 'utf8', function (err : NodeJS.ErrnoException,data) {
   if (err) {
     return logger.error( err.message );
   }

   // Getting keys from '/etc/Orchestrator/OrchestratorAPIGateway.json' and printing JSON
   const data_json = JSON.parse(data);
   const result : { [key:string]:string; } = {};
   for (var p in data_json) {
     if( data_json.hasOwnProperty(p) ) {
       result[p] = nconf.get(p)
     }
   }

   logger.info('Configuration contents:\n' + JSON.stringify(result, null, '  '))
 });

var app = express();
 // start the server
 const server = new InversifyExpressServer(container,app);

 server.setConfig((app: Application) => {
   app.use(bodyParser.urlencoded({
     extended: true
   }));
   //Uncomment this to play with user controller that is working with jsons not binaries
   //app.use(bodyParser.json());
   app.use(bodyParser.text({
     type: () => true
   }));


   // Middleware for extracting data from url / body and set into request.data
    app.use((request: Request, response: Response, next : NextFunction) => {

// TODO: Check whether request is GET or POST_get_item_by

        // Check whether data in URL / body
        let data : string = "";
        if( request.body.length > 0 ){
          data = request.body;
        }else if( request.query.data != undefined ){
          data = request.query.data;
        }else{
          response.status(400).json( {response:'no data identified in request'} )
        }

        // Grab parameters
        if( data.length > 0 ){
          try{
            let json_data : any = JSON.parse(data)
            request.data = JSON.parse(data)
            request.request_type = RequestType.JSON;
            next();
          }catch{
            logger.debug("JSON cannot be parsed '" + request.body + "'. Proceeding to XML parsing ...")
            // Parse XML
            var parser = new xml2js.Parser({explicitArray : false});
            parser.parseString(data, (err :any, result: any) => {
              if( err == null ){
                request.data = result.data;
                request.request_type = RequestType.XML;
                next()
              }else{
                this.logger.error("Problems parsing " + result + " " + err)
                response.status(400).json( {response:'no possible to parse data either JSON or XML'} )
              }
            });
          }

        }

    });



 });

export const serverInstance = server.build();
serverInstance.listen(http_port);
console.log(`Server started on port ${http_port} :)`);
