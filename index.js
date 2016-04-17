'use strict';

/**
 * Serverless Model Plugin
 */

module.exports = function(S) {

  const path       = require('path'),
        SUtils     = S.utils,
        SError     = require(S.getServerlessPath('Error')),
        SCli       = require(S.getServerlessPath('utils/cli')),
        _          = require('lodash'),
        BbPromise  = require('bluebird');

  /**
   * Action instantiation. Used to resemble the SLS core layout to
   * make it easy to integrate into core later.
   */
  let ModelsCreate = require('./lib/actions/ModelsCreate')(S);
  ModelsCreate = new ModelsCreate();
  let ModelsList = require('./lib/actions/ModelsList')(S);
  ModelsList = new ModelsList();
  let ModelsRemove = require('./lib/actions/ModelsRemove')(S);
  ModelsRemove = new ModelsRemove();
  let ModelsImport = require('./lib/actions/ModelsImport')(S);
  ModelsImport = new ModelsImport();
  let ModelsDeploy = require('./lib/actions/ModelsDeploy')(S);
  ModelsDeploy = new ModelsDeploy();

  // Create pseudo core objects
  S.classes.Models = require('./lib/Models')(S);

  /**
   * ServerlessModel
   */

  class ServerlessModel extends S.classes.Plugin {

    /**
     * Constructor
     */

    constructor() {
      super();
    }

    /**
     * Define your plugins name
     */

    static getName() {
      return 'com.serverless.' + ServerlessModel.name;
    }

    /**
     * Register Actions
     */

    registerActions() {

      return BbPromise.join(
          ModelsCreate.registerActions(),
          ModelsList.registerActions(),
          ModelsImport.registerActions(),
          ModelsRemove.registerActions()
          );

    }

    /**
     * Register Hooks
     */

    registerHooks() {

      S.addHook(ModelsDeploy.modelsDeploy.bind(ModelsDeploy), {
        action: 'endpointBuildApiGateway',
        event:  'pre'
      });

      return BbPromise.resolve();
    }

  }

  return ServerlessModel;
};
