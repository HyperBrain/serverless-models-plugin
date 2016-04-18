'use strict';
/**
 * List APIG models
 */

module.exports = function(S) {

  const path   = require('path'),
  SUtils     = S.utils,
  SError     = require(S.getServerlessPath('Error')),
  SCli       = require(S.getServerlessPath('utils/cli')),
  BbPromise  = require('bluebird'),
  _          = require('lodash');

  class ModelsDeploy extends S.classes.Plugin {

    static getName() {
      return 'serverless.core.' + this.name;
    }

    registerActions() {
      S.addAction(this.modelsDeploy.bind(this), {
        handler:       'modelsDeploy',
        description:   `Deploy APIG models from your project.
usage: serverless models deploy`,
        context:       'models',
        contextAction: 'deploy',
        options:       [
        ]
      });

      return BbPromise.resolve();
    }

    modelsDeploy(evt) {
      let _this    = this;
      _this.evt    = evt;
      _this.project          = S.getProject();
      _this.provider         = S.getProvider();
      _this.regions          = _this.evt.options.region ? [_this.evt.options.region] : _this.project.getAllRegionNames(_this.evt.options.stage);
      _this.aws              = S.getProvider('aws'),
      _this.awsAccountNumber = _this.aws.getAccountId(_this.evt.options.stage, _this.evt.options.region);
      _this.restApiName      = _this.project.getRegion(_this.evt.options.stage, _this.evt.options.region).getVariables().apiGatewayApi;
      _this.spinner          = SCli.spinner();

      return _this._prompt()
          .bind(_this)
          .tap(_this._getRestApi)
          .then(_this._validateAndPrepare)
          .then(_this._deployModels)
          .then(function() {
            return _this.evt;
          });
    }

    _prompt() {
      
      return BbPromise.resolve();
    }

    _validateAndPrepare() {
      let _this    = this;

      _this.endpoint = _this.project.getEndpoint(_this.evt.options.name);
      if (!_this.endpoint) BbPromise.reject(new SError(`Endpoint could not be found: ${_this.evt.options.endpointPath}#${_this.evt.options.endpointMethod}`));

      // Populate endpoint
      _this.endpoint = _this.endpoint.toObjectPopulated({ stage: _this.evt.options.stage, region: _this.evt.options.region });

      // Check if models are defined and pass the affected models to deploy.
      return S.classes.Models.loadFromProject(_this.project)
      .then(function (modelsDefined) {
        let modelsUsed = {};

        for (let model in _this.endpoint.requestModels) {
          if (_.has(_this.endpoint.requestModels, model)) {
            let modelName = _this.endpoint.requestModels[model];

            if (!_.has(modelsUsed, modelName)) {
              if (_.has(modelsDefined, modelName)) {
                modelsUsed[modelName] = { name: modelName, content: model, model: modelsDefined[modelName] };
              } else {
                return BbPromise.reject(new SError(`Model not defined: ${modelName}`));
              }
            }
          }
        }
        for (let response in _this.endpoint.responses) {
          if (_.has(_this.endpoint.responses, response)) {
            let responseModels = _this.endpoint.responses[response].responseModels;

            for (let model in responseModels) {
              if (_.has(responseModels, model)) {
                let modelName = responseModels[model];

                if (!_.has(modelsUsed, modelName)) {
                  if (_.has(modelsDefined, modelName)) {
                    modelsUsed[modelName] = { name: modelName, content: model, model: modelsDefined[modelName] };
                  } else {
                    return BbPromise.reject(new SError(`Model not defined: ${modelName}`));
                  }
                }
              }
            }
          }
        }

        return _this._findReferences(modelsUsed, modelsDefined);
      });
    }

    /**
     * Add reference pointers to the given used models collection.
     * We cannot exchange them here, because the canonical reference
     * needed by AWS requires the region based API path to the referenced
     * model. So just get pointers that can be easily exchanged per region.
     */
    _findReferences(modelsUsed, modelsDefined) {
      let _this = this;

      return BbPromise.try(function () {
        const models = _.keys(modelsUsed);
        const additionalModels = [];
        const orderedResult = [];

        for (let n=0; n<models.length; n++) {
          const currentModel = modelsUsed[models[n]];
          const refStack = [ { name: null, obj: currentModel.model } ];

          if (_.findIndex(orderedResult, [ 'name', currentModel.name ]) >= 0) {
            continue;
          }

          currentModel.refs = [];
          orderedResult.push(currentModel);
          while (refStack.length > 0) {
            const currentObject = refStack.pop();
            for (const child in currentObject.obj) {
              if (_.has(currentObject.obj, child)) {
                if (typeof currentObject.obj[child] === 'object') {
                  refStack.push( { name: child, obj: currentObject.obj[child] } );
                } else if (child === '$ref') {
                  // Check for additional model
                  if (_.indexOf(models, currentObject.obj[child] === -1) && _.findIndex(additionalModels, [ 'name', currentObject.obj[child] ]) === -1) {
                    if (!_.has(modelsDefined, currentObject.obj[child])) {
                      return BbPromise.reject(new SError(`Reference to unknown model: ${currentObject.obj[child]}`));
                    }
                    additionalModels.push({ name: currentObject.obj[child], content: currentModel.content, model: modelsDefined[currentObject.obj[child]] });
                  }
                  currentModel.refs.push(currentObject.obj);
                }
              }
            }
          }
        }

        if (additionalModels.length > 0) {
          return _this._findReferences(additionalModels, modelsDefined)
          .then(function (derefd) {
            const result = derefd;
            const count = orderedResult.length;
            for (let n=0; n<count; n++) {
              if (_.findIndex(result, [ 'name', orderedResult[n].name ]) === -1) {
                result.push(orderedResult[n]);
              }
            }
            return BbPromise.resolve(result);
          });
        }

        return BbPromise.resolve(orderedResult);
      });
    }

    _getRestApi() {

      let _this = this;

      return _this.aws.getApiByName(_this.restApiName, _this.evt.options.stage, _this.evt.options.region)
        .then(function(restApi) {

          if (!restApi) {
            throw new SError('API Gateway REST API with the name: ' + _this.restApi);
          }

          // Store restApi
          _this.restApi = restApi;
        });
    }

    _deployModels(models) {
      let _this    = this;

      if (_.size(models) === 0) {
        SUtils.sDebug('No models to deploy');
        return BbPromise.resolve();
      }

      SUtils.sDebug('Deploying models in "' + _this.evt.options.stage + '" to the following regions: ' + _this.regions.join(', '));

      return BbPromise.try(function() {
          return _this.regions;
        })
        .bind(_this)
        .each(function(region) {
          // Process each Region
          return _this._deployModelsInRegion(models, region);
        });
    }

    _deployModelsInRegion(models, region) {
      let _this = this;

      SUtils.sDebug(JSON.stringify(models, null, 2));
      return BbPromise.reject(new SError("Excpected"));
      
      SUtils.sDebug('Deploying models in "' + region + '"');

      let modelArray = _.keys(models).map((key) => { return models[key]; });

      return BbPromise.mapSeries(modelArray, function (model) {
        // Check if model exists and select 'create' or update accordingly.
        const params = {
              modelName: model.name, /* required */
              restApiId: _this.restApi.id, /* required */
              flatten: false
            };

        SUtils.sDebug('Model "' + model.name + '"');
        return _this.aws.request('APIGateway', 'getModel', params, _this.evt.options.stage, region)
          .then(function(response) {
            SUtils.sDebug('Update model "' + model.name + '"');
            const params = {
                  modelName: model.name, /* required */
                  restApiId: _this.restApi.id, /* required */
                  patchOperations: [
                    {
                      op: 'replace',
                      path: '/schema',
                      value: JSON.stringify(model.model)
                    }
                    /* more items */
                  ]
                };
            return _this.aws.request('APIGateway', 'updateModel', params, _this.evt.options.stage, region);
          })
          .catch(function (err) {
            if (err.statusCode !== 404) {
              return BbPromise.reject(err);
            }

            SUtils.sDebug('Create model "' + model.name + '"');
            const params = {
                  contentType: model.content, /* required */
                  name: model.name, /* required */
                  restApiId: _this.restApi.id, /* required */
                  schema: JSON.stringify(model.model)
              };
            return _this.aws.request('APIGateway', 'createModel', params, _this.evt.options.stage, region);
          });
      });
    }

  }

  return ModelsDeploy;
};
