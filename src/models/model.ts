import * as Sequelize from 'sequelize';
import { injectable } from 'inversify';

export interface IModels {
  getModel(name: string): Sequelize.Model<{}, {}>;
}

@injectable()
export class Models {

  protected sequelize: Sequelize.Sequelize;
  protected models: {[index: string]: Sequelize.Model<{}, {}>} = {};

  constructor(database : string, user : string, password : string, options: Sequelize.Options ) {

    this.sequelize = new Sequelize(
      database, user, password, options
    );

    // --------------------------------------------------
    // ZoneCountry - RTV
    // --------------------------------------------------

    // WZoneCountry
    this.models['WZoneCountryModel'] = this.sequelize.define('WZoneCountryModel',{
      idWZone               : {type: Sequelize.INTEGER, primaryKey:true},
      Country_A2            : {type: Sequelize.STRING(2)},
      TimeZoneCode          : {type: Sequelize.STRING(5)},
      idWCore               : {type: Sequelize.INTEGER},
      idWRTV_Default        : {type: Sequelize.INTEGER}
    },
    {
      timestamps: false,
      tableName: 'WRWZoneCountry'
    });

    // WRTV
    this.models['WRTVModel'] = this.sequelize.define('WRTVModel',{
      idWRTV                : {type: Sequelize.INTEGER, primaryKey:true},
      Description           : {type: Sequelize.STRING(150)},
      ip                    : {type: Sequelize.STRING(50)},
      WebPort               : {type: Sequelize.INTEGER},
      SecureWebPort         : {type: Sequelize.INTEGER},
      CorePort              : {type: Sequelize.INTEGER},
      WebControlPort        : {type: Sequelize.INTEGER},
      Type                  : {type: Sequelize.INTEGER}
    },
    {
      timestamps: false,
      tableName: 'WRTV'
    });

    // WCoreModules
    this.models['WCoreModulesModel'] = this.sequelize.define('WCoreModulesModel',{
      idWCore               : {type: Sequelize.INTEGER, primaryKey:true},
      idWCoreServerType     : {type: Sequelize.STRING(150), primaryKey:true},
      ip                    : {type: Sequelize.STRING(50)},
      WebPort               : {type: Sequelize.INTEGER},
      SecureWebPort         : {type: Sequelize.INTEGER},
      CorePort              : {type: Sequelize.INTEGER},
      WebControlPort        : {type: Sequelize.INTEGER}
    },
    {
      timestamps: false,
      tableName: 'WCoreModules'
    });

    // WCoreModules
    this.models['WCoresModel'] = this.sequelize.define('WCoresModel',{
      idWCore               : {type: Sequelize.INTEGER, primaryKey:true},
      Description           : {type: Sequelize.STRING(150)},
    },
    {
      timestamps: false,
      tableName: 'WCores'
    });

    // WCoreModules
    this.models['WCoreServerTypesModel'] = this.sequelize.define('WCoreServerTypesModel',{
      idWCoreServerType     : {type: Sequelize.STRING(64), primaryKey:true},
      Description           : {type: Sequelize.STRING(150)}
    },
    {
      timestamps: false,
      tableName: 'WCoreServerTypes'
    });

    // Associations
    this.models['WCoreModulesModel'].belongsTo(this.models['WCoresModel'], {
      foreignKey: 'idWCore',
      targetKey: 'idWCore'
    })
    this.models['WCoreModulesModel'].belongsTo(this.models['WCoreServerTypesModel'], {
      foreignKey: 'idWCoreServerType',
      targetKey: 'idWCoreServerType'
    })

    // --------------------------------------------------
    // Customer - Campaign - Branchgroup - Branch
    // --------------------------------------------------

    // WCustomerModel
    this.models['WCustomerModel'] = this.sequelize.define('WCustomerModel',{
      guid                  : {type: Sequelize.STRING(64), primaryKey:true},
      name                  : {type: Sequelize.STRING(120)},
      enabled               : {type: Sequelize.INTEGER},
      IdBusinessSector      : {type: Sequelize.INTEGER}
    },
    {
      timestamps: false,
      freezeTableName: true,
    });

    // WCustomerApiKeyModel
    this.models['WCustomerApiKeyModel'] = this.sequelize.define('WCustomerApiKeyModel',{
      IDCustomer            : {type: Sequelize.STRING(64), primaryKey:true},
      ApiKey                : {type: Sequelize.STRING(64), primaryKey:true},
    },
    {
      timestamps: false,
      tableName: 'WCustomerApiKey'
    });

    // WCampaignModel
    this.models['WCampaignModel'] = this.sequelize.define('WCampaignModel',{
      guid                  : {type: Sequelize.STRING(64), primaryKey:true},
      WCustomer             : {type: Sequelize.STRING(64)},
      name                  : {type: Sequelize.STRING(120)},
      enabled               : {type: Sequelize.INTEGER},
      WGmtTable             : {type: Sequelize.STRING(64)},
      Description           : {type: Sequelize.STRING(140)},
      StartDate             : {type: Sequelize.DATE},
      ExpirationDate        : {type: Sequelize.DATE},
      Outbound              : {type: Sequelize.STRING(64)},
      LeadProcessingEnabled : {type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false},
      InvalidMonkey         : {type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false},
      NegativeMonkey        : {type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false},
      PositiveMonkey        : {type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false},
      GariEnabled           : {type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false},
      Country               : {type: Sequelize.STRING(2)},
      idWZone               : {type: Sequelize.INTEGER},
      WTimeZone             : {type: Sequelize.STRING(5)},
      Product               : {type: Sequelize.STRING(50)},
      IpFilter              : {type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false},
      AgentReserveEnabled   : {type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false},
    },
    {
      timestamps: false,
      tableName: 'WCampaign'
    });


    // WBranchGroupModel
    this.models['WBranchGroupModel'] = this.sequelize.define('WBranchGroupModel',{
      guid                  : {type: Sequelize.STRING(64), primaryKey:true},
      WCampaign             : {type: Sequelize.STRING(64)},
      name                  : {type: Sequelize.STRING(120)},
      scripturl             : {type: Sequelize.STRING(120)},
      maxcalls              : {type: Sequelize.INTEGER},
      maxtime               : {type: Sequelize.INTEGER},
      maxscheduletime       : {type: Sequelize.INTEGER},
      balancemethod         : {type: Sequelize.INTEGER},
      CreationDate          : {type: Sequelize.DATE},
      enabled               : {type: Sequelize.BOOLEAN},
      Type                  : {type: Sequelize.INTEGER},
      MaxAttendees          : {type: Sequelize.INTEGER},
      WowzaRTV              : {type: Sequelize.STRING(120)},
      SecondsToFirstHop     : {type: Sequelize.INTEGER},
      SecondsToNextHops     : {type: Sequelize.INTEGER}
    },
    {
      timestamps: false,
      tableName: 'WBranchGroup'
    });

    // WBranchModel
    this.models['WBranchModel'] = this.sequelize.define('WBranchModel',{
      guid                  : {type: Sequelize.STRING(64), primaryKey:true},
      WCampaign             : {type: Sequelize.STRING(64)},
      WBranchGroup          : {type: Sequelize.STRING(64)},
      name                  : {type: Sequelize.STRING(120)},
      enabled               : {type: Sequelize.INTEGER},
      Channel               : {type: Sequelize.INTEGER},
      WAgency               : {type: Sequelize.STRING(120)},
      Outbound              : {type: Sequelize.STRING(64)},
      Product               : {type: Sequelize.STRING(50)}
    },
    {
      timestamps: false,
      tableName: 'WBranch'
    });

    // Associations
    // this.models['WZoneCountryModel'].belongsTo(this.models['WCampaignModel'], {
    //   foreignKey: 'idWZone',
    //   targetKey: 'idWZone'
    // })

    this.models['WCampaignModel'].belongsTo(this.models['WZoneCountryModel'], {
      foreignKey: 'idWZone',
      targetKey: 'idWZone'
    })


    this.models['WBranchModel'].belongsTo(this.models['WCampaignModel'], {
      foreignKey: 'WCampaign',
      targetKey: 'guid'
    })
    this.models['WBranchModel'].belongsTo(this.models['WBranchGroupModel'], {
      foreignKey: 'WBranchGroup',
      targetKey: 'guid'
    })
    this.models['WBranchGroupModel'].belongsTo(this.models['WCampaignModel'], {
      foreignKey: 'WCampaign',
      targetKey: 'guid'
    })
    this.models['WCampaignModel'].belongsTo(this.models['WCustomerApiKeyModel'], {
      foreignKey: 'WCustomer',
      targetKey: 'IDCustomer'
    })
    this.models['WCampaignModel'].belongsTo(this.models['WCustomerModel'], {
      foreignKey: 'WCustomer',
      targetKey: 'guid'
    })
    this.models['WCustomerApiKeyModel'].belongsTo(this.models['WCustomerModel'], {
      foreignKey: 'IDCustomer',
      targetKey: 'guid'
    })
    this.models['WCampaignModel'].hasMany(this.models['WBranchGroupModel'], {
      foreignKey: 'WCampaign'
    })

    // --------------------------------------------------
    // VACenter - VAGroup - User
    // --------------------------------------------------

    // WVACenter
    this.models['WVACenterModel'] = this.sequelize.define('WVACenterModel',{
      guid                  : {type: Sequelize.STRING(64), primaryKey:true},
      name                  : {type: Sequelize.STRING(250)},
      enabled               : {type: Sequelize.INTEGER}
    },
    {
      timestamps: false,
      tableName: 'WVACenter'
    });


    // WVAGroups
    this.models['WVAGroupModel'] = this.sequelize.define('WVAGroupModel',{
      IdVAGroup             : {type: Sequelize.STRING(64), primaryKey:true},
      Name                  : {type: Sequelize.STRING(250)},
      IdVACenter            : {type: Sequelize.STRING(64)},
      queuesize             : {type: Sequelize.INTEGER},
      free_va               : {type: Sequelize.INTEGER},
      WGmtTable             : {type: Sequelize.STRING(64)},
      VATeamTypeId          : {type: Sequelize.INTEGER}
    },
    {
      timestamps: false,
      tableName: 'WVAGroups'
    });

    // WUsers
    this.models['WUserModel'] = this.sequelize.define('WUserModel',{
      IdUser                : {type: Sequelize.STRING(64), primaryKey:true},
      IdUserType            : {type: Sequelize.STRING(64)},
      Name                  : {type: Sequelize.STRING(50)},
      Surname               : {type: Sequelize.STRING(100)},
      Email                 : {type: Sequelize.STRING(200)},
      Password              : {type: Sequelize.STRING(50)},
      ForgotPasswordURL     : {type: Sequelize.STRING(200)},
      ForgotPasswordDate    : {type: Sequelize.DATE},
      ForgotPasswordSalt    : {type: Sequelize.STRING(200)},
      Mobile                : {type: Sequelize.STRING(20)},
      Birthday              : {type: Sequelize.DATE},
      Introduction          : {type: Sequelize.STRING(4000)},
      Active                : {type: Sequelize.BOOLEAN},
      LastPasswordUpdate    : {type: Sequelize.DATE},
      UserAccount           : {type: Sequelize.STRING(200)},
      Phone                 : {type: Sequelize.STRING(30)}
    },
    {
      timestamps: false,
      tableName: 'WUsers'
    });


    // Associations
    this.models['WVAGroupModel'].belongsTo(this.models['WVACenterModel'], {
      foreignKey: 'IdVACenter',
      targetKey: 'guid'
    });
    this.models['WVACenterModel'].hasMany(this.models['WVAGroupModel'], {
      foreignKey: 'IdVACenter',
    });

    this.models['WRWUsersWVAGroupModel'] = this.sequelize.define('WRWUsersWVAGroupModel', {
      IdUser                : {type: Sequelize.STRING(64), primaryKey: true},
      IdVAGroup             : {type: Sequelize.STRING(64), primaryKey: true},
    },
    {
      timestamps: false,
      tableName: 'WRWUsersWVAGroup'
    });

    this.models['WUserModel'].belongsToMany(this.models['WVAGroupModel'], {
      as: 'vagroups',
      through: this.models['WRWUsersWVAGroupModel'],
      foreignKey: 'IdUser',
    })
    this.models['WVAGroupModel'].belongsToMany(this.models['WUserModel'], {
      as: 'users',
      through: this.models['WRWUsersWVAGroupModel'],
      foreignKey: 'IdVAGroup'
    })

    // --------------------------------------------------
    // VAGroup - Branchgroup association
    // --------------------------------------------------

    this.models['WRWBranchGroupWVAGroupModel'] = this.sequelize.define('WRWBranchGroupWVAGroupModel', {
      IdVAGroup                : {type: Sequelize.STRING(64), primaryKey: true},
      IdBranchGroup            : {type: Sequelize.STRING(64), primaryKey: true},
      IdService                : {type: Sequelize.INTEGER},
      Priority                 : {type: Sequelize.INTEGER, defaultValue: 1 },
      idWRTV                   : {type: Sequelize.INTEGER},
    },
    {
      timestamps: false,
      tableName: 'WRWBranchGroupWVAGroup'
    });

    this.models['WRWBranchGroupWVAGroupModel'].belongsTo(this.models['WRTVModel'], {
      foreignKey: 'idWRTV',
      targetKey: 'idWRTV'
    })


    this.models['WBranchGroupModel'].belongsTo(this.models['WRWBranchGroupWVAGroupModel'], {
      foreignKey: 'guid',
      targetKey: 'IdBranchGroup'
    })
    this.models['WRWBranchGroupWVAGroupModel'].belongsTo(this.models['WBranchGroupModel'], {
      foreignKey: 'IdBranchGroup',
      targetKey: 'guid'
    })

    this.models['WVAGroupModel'].belongsTo(this.models['WRWBranchGroupWVAGroupModel'], {
      foreignKey: 'IdVAGroup',
      targetKey: 'IdVAGroup'
    })

  }

  public getModel(name: string): Sequelize.Model<{}, {}> {
    return this.models[name];
  }
}
