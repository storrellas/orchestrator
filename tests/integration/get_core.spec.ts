import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import * as request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import * as xml2js from 'xml2js';

process.env.NODE_ENV='integration_test'
process.env.sqlfile = './test.sqlite'

import { ModelsStub } from '../unit/model/fixtures.spec'
import { serverInstance } from '../../src/bootstrap';

var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('get_core_by_xxx', () => {
  let model         : ModelsStub;

  before(() => {
    console.log("Before each")
    model = new ModelsStub("configuration","","",
    {
      dialect: 'sqlite',
      // disable logging; default: console.log
      storage: process.env.sqlfile,
      //logging: false

    });
    // Generate entities
    return model.sync();
  })

  describe('get_core_by_campaign JSON', () => {

    //
    // function to JSON
    //
    function check_json(data: string) {
      try{
        JSON.parse( data )
      }catch{
        assert(false, "Should be JSON")
      }
    }

    it('get_core_by_campaign POST', (done) => {

      const data = {
        event:"get_core_by_campaign",
        id: model.campaign_guid
      }

      request(serverInstance)
      .post('')
      .send(data)
      .end((err, res) => {

  console.log( res.text )
        check_json(res.text)
        res.status.should.equal(200);
        done();
      });

    })


    it('get_core_by_campaign GET', (done) => {

      const data = {
        event:"get_core_by_campaign",
        id: model.campaign_guid
      }

      request(serverInstance)
      .get('?data='+JSON.stringify(data))
      .end((err, res) => {
        console.log( res.text )
        check_json(res.text)

        res.status.should.equal(200);
        done();
      });

    })

    it('get_core_by_campaign POST event api', (done) => {

      const data = {
        event:"api",
        e:"get_core_by_campaign",
        id: model.campaign_guid
      }

      request(serverInstance)
      .post('')
      .send(data)
      .end((err, res) => {

  console.log( res.text )
        check_json(res.text)
        res.status.should.equal(200);
        done();
      });

    })

  });


  describe('get_core_by_campaign', () => {

    //
    // function to check XML
    //
    function check_xml(data: string) {
      var parser = new xml2js.Parser({explicitArray : false});
      parser.parseString(data, (err :any, result: any) => {
        if( err == null ){
          // Do nothing
        }else{
          assert(false, "Should be XML")
        }
      });
    }


    it('get_core_by_campaign GET XML', (done) => {

      const data = {
        event:"get_core_by_campaign",
        id: model.campaign_guid
      }

      var xmlValues = new xml2js.Builder();
      const data_xml : string = xmlValues.buildObject({data: data});

      request(serverInstance)
      .get('?data='+data_xml)
      .end((err, res) => {
        check_xml(res.text)
        res.status.should.equal(200);
        done();
      });

    })

    it('get_core_by_campaign POST XML', (done) => {

      const data = {
        event:"get_core_by_campaign",
        id: model.campaign_guid
      }

      var xmlValues = new xml2js.Builder({headless: true});
      const data_xml : string = xmlValues.buildObject({data: data});
      request(serverInstance)
      .post('')
      .set('Content-Type', 'text/plain')
      .send(data_xml)
      .end((err, res) => {
        check_xml(res.text)
        res.status.should.equal(200);
        done();
      });

    })

  })



  after( () => {
    fs.unlink( process.env.sqlfile )
  })

});
