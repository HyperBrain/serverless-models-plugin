'use strict';

/**
 * Serverless Model Plugin
 */

module.exports = function(S) {

  const path       = require('path'),
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

      S.addHook(this._buildModels.bind(this), {
        action: 'endpointBuildApiGateway',
        event:  'pre'
      });

      return BbPromise.resolve();
    }

    /**
     * Optimize
     */

    _buildModels(evt) {

      // Validate: Check Serverless version
      // TODO: Use a full x.x.x version string. Consider using semver: https://github.com/npm/node-semver
      if (parseInt(S._version.split('.')[1]) < 5) {
        console.log("WARNING: This version of the Serverless Model Plugin will not work with a version of Serverless that is less than v0.5");
      }

      // Get function
      let endpoint = S.getProject().getEndpoint(evt.options.name);

      return BbPromise.resolve(evt);
    }
  }

  return ServerlessModel;
};
