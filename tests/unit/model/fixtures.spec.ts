import * as uuid from 'uuid';

import { Models } from '../../../src/models/model';
import * as Sequelize from 'sequelize';


export class ModelsStub extends Models{

  public core_id                : number = 1;
  public rtv_id                 : number = 4;
  public customer_guid          : string = uuid();
  public campaign_guid          : string = uuid();
  public campaign_outbound_guid : string = uuid();
  public branchgroup_guid       : string = uuid();
  public branch_guid            : string = uuid();
  public branch_outbound_guid   : string = uuid();
  public vagroup_guid           : string = uuid();
  public vacenter_guid          : string = uuid();
  public user_guid              : string = uuid();
  public service_id             : number = 1234;
  public ip                     : string = "127.0.0.1";
  public webport                : number = 80;
  public secure_webport         : number = 443;
  public core_port              : number = 9889;
  public webcontrol_port        : number = 9880;

  constructor(database : string, user : string, password : string, options: Sequelize.Options ) {
    super(database, user, password, options)
  }

  public sync() : Promise<void>{

    return new Promise<void>( (resolve, reject) => {

      this.sequelize.sync({ force: true}).then( () => {

        return this.models['WCoreServerTypesModel'].bulkCreate([
          { idWCoreServerType : 1,  Description : "PBX",  },
          { idWCoreServerType : 2,  Description : "RTV",  },
          { idWCoreServerType : 3,  Description : "RM",   },
          { idWCoreServerType : 11, Description : "LM",   },
          { idWCoreServerType : 14, Description : "GARI", },
          { idWCoreServerType : 20, Description : "ACM",  },
          { idWCoreServerType : 25, Description : "KPI",  },
        ]);

      })
      .then( () =>{
        return this.models['WCoresModel'].bulkCreate([
          { idWCore : this.core_id,    Description : "dummy cores", },
        ]);
      })
      .then( () =>{
        return this.models['WCoreModulesModel'].bulkCreate([
          {
            idWCore               : this.core_id,
            idWCoreServerType     : 11,
            ip                    : this.ip,
            WebPort               : this.webport,
            SecureWebPort         : this.secure_webport,
            CorePort              : this.core_port,
            WebControlPort        : this.webcontrol_port
          },
          {
            idWCore               : this.core_id,
            idWCoreServerType     : 14,
            ip                    : this.ip,
            WebPort               : this.webport,
            SecureWebPort         : this.secure_webport,
            CorePort              : this.core_port,
            WebControlPort        : this.webcontrol_port
          },
          {
            idWCore               : this.core_id,
            idWCoreServerType     : 20,
            ip                    : this.ip,
            WebPort               : this.webport,
            SecureWebPort         : this.secure_webport,
            CorePort              : this.core_port,
            WebControlPort        : this.webcontrol_port
          },
          {
            idWCore               : this.core_id,
            idWCoreServerType     : 25,
            ip                    : this.ip,
            WebPort               : this.webport,
            SecureWebPort         : this.secure_webport,
            CorePort              : this.core_port,
            WebControlPort        : this.webcontrol_port
          }
        ]);
      })
      .then( () => {
        return this.models['WRTVModel'].bulkCreate([
          {
            idWRTV                : this.rtv_id,
            Description           : "dummy rtv 1",
            ip                    : this.ip,
            WebPort               : this.webport,
            SecureWebPort         : this.secure_webport,
            CorePort              : this.core_port,
            WebControlPort        : this.webcontrol_port,
            Type                  : 0
          },
          {
            idWRTV                : 5,
            Description           : "dummy rtv 2",
            ip                    : this.ip,
            WebPort               : this.webport,
            SecureWebPort         : this.secure_webport,
            CorePort              : this.core_port,
            WebControlPort        : this.webcontrol_port,
            Type                  : 0
          },
        ]);
      })
      .then( () => {
        return this.models['WCustomerModel'].bulkCreate([
          {
            guid                  : this.customer_guid,
            name                  : "dummy customer",
            enabled               : 1,
            IdBusinessSector      : 1
          },
        ]);
      })

      .then( () => {
        return this.models['WZoneCountryModel'].bulkCreate([
          {
            idWZone               : 1,
            Country_A2            : "ES",
            TimeZoneCode          : "BST",
            idWCore               : 1,
            idWRTV_Default        : 4
          },
        ]);
      })

      .then( () => {
        return this.models['WCampaignModel'].bulkCreate([
          {
            guid                  : this.campaign_guid,
            WCustomer             : this.customer_guid,
            name                  : "dummy campaign",
            enabled               : 1,
            WGmtTable             : uuid(),
            Description           : "",
            StartDate             : Date(),
            ExpirationDate        : Date(),
            Outbound              : this.campaign_outbound_guid,
            LeadProcessingEnabled : true,
            InvalidMonkey         : true,
            NegativeMonkey        : true,
            PositiveMonkey        : true,
            GariEnabled           : true,
            Country               : "ES",
            idWZone               : this.core_id,
            WTimeZone             : "abc",
            Product               : "dummy product",
            IpFilter              : false,
            AgentReserveEnabled   : false,
          },
        ]);
      })

      .then( () => {
        return this.models['WBranchGroupModel'].bulkCreate([
          {
            guid                  : this.branchgroup_guid,
            WCampaign             : this.campaign_guid,
            name                  : "dummy branchgroup",
            scripturl             : "",
            maxcalls              : 1,
            maxtime               : 1,
            maxscheduletime       : 1,
            balancemethod         : 1,
            CreationDate          : Date(),
            enabled               : 1,
            Type                  : 0,
            MaxAttendees          : 100,
            WowzaRTV              : "",
            SecondsToFirstHop     : 1,
            SecondsToNextHops     : 1
          },
        ]);
      })
      .then( () => {
        return this.models['WBranchModel'].bulkCreate([
          {
            guid                  : this.branch_guid,
            WCampaign             : this.campaign_guid,
            WBranchGroup          : this.branchgroup_guid,
            name                  : "dummy Branch",
            enabled               : 1,
            Channel               : 1,
            WAgency               : "Generic Agency",
            Outbound              : this.branch_outbound_guid
          },
        ]);
      })

      .then( () => {
        return this.models['WVACenterModel'].bulkCreate([
          {
            guid                  : this.vacenter_guid,
            name                  : "dummy vacenter",
            enabled               : 1
          },
        ]);
      })

      .then( () => {
        return this.models['WVAGroupModel'].bulkCreate([
          {
            IdVAGroup             : this.vagroup_guid,
            Name                  : "dummy vagroup",
            IdVACenter            : this.vacenter_guid,
            queuesize             : 0,
            free_va               : 0,
            WGmtTable             : uuid(),
            VATeamTypeId          : 1
          },
        ]);
      })

      .then( () => {
        return this.models['WUserModel'].bulkCreate([
          {
            IdUser                : this.user_guid,
            IdUserType            : uuid(),
            Name                  : "dummy",
            Surname               : "user",
            Email                 : "dummy@user.com",
            Password              : "",
            ForgotPasswordURL     : "",
            ForgotPasswordDate    : Date(),
            ForgotPasswordSalt    : "",
            Mobile                : "",
            Birthday              : Date(),
            Introduction          : "",
            Active                : 1,
            LastPasswordUpdate    : Date(),
            UserAccount           : "",
            Phone                 : ""
          },
        ]);
      })

      .then( () => {
        return this.models['WRWUsersWVAGroupModel'].bulkCreate([
          {
            IdUser                : this.user_guid,
            IdVAGroup             : this.vagroup_guid,
          },
        ]);
      })

      .then( () => {
        return this.models['WRWBranchGroupWVAGroupModel'].bulkCreate([
          {
            IdVAGroup                : this.vagroup_guid,
            IdBranchGroup            : this.branchgroup_guid,
            IdService                : this.service_id,
            idWRTV                   : this.rtv_id,
          },
        ]);
      })
      .then( () => {
        resolve()
      })

    })

  }

}
