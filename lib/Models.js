'use strict';
/**
 * AWS APIG Model definition.
 */
module.exports = function (S) {

  const _         = require('lodash'),
        BbPromise = require('bluebird'),
        yaml      = require('js-yaml'),
        path      = require('path'),
        walkSync  = require('walk-sync'),
        SError    = require(S.getServerlessPath('Error'));

  class Models extends S.classes.Serializer {

    constructor (data, filePath) {
      super();

      this._class = 'Models';
      this._walkSyncGlobs = {
        globs  : ['**/s-models.yaml', '**/s-models.json'],
        ignore : ['**/node_modules']

      };
      this._filePath = filePath;

      if (data) this.fromObject(data);
    }

    load () {
      return this.deserialize(this);
    }

    save () {
      return this.serialize(this);
    }

    fromObject (data) {
      return _.assign(this, data);
    }
    
    toObject () {
      return S.utils.exportObject(_.cloneDeep(this));
    }

    getFilePath () {
      return this._filePath;
    }

    getWalkSyncGlobs () {
      return this._walkSyncGlobs;
    }

    getRootPath () {
      let args = _.toArray(arguments);
      args.unshift(path.dirname(this.getFilePath()));
      return path.join.apply(path, args);
    }

    walkSyncDirs () {
      return walkSync(this.getRootPath(), this.getWalkSyncGlobs());
    }

    deserializeModels (models) {
      let _this = this;

      if (!models.getFilePath()) return BbPromise.resolve();

      return BbPromise.try(function () {

        // Validate: Check project path is set
        if (!S.hasProject()) throw new SError('Models could not be loaded because no project path has been set on Serverless instance');

        // Set Data
        let filePath = models.getFilePath();
        if (_.endsWith(filePath, '.yaml')) {
          models.fromObject(yaml.safeLoad(S.utils.readFileSync(filePath)));
        } else {
          models.fromObject(S.utils.readFileSync(filePath));
        }
      })
        .then(function () {
          return models;
        });
    }

    serializeModels () {

    }

    static loadFromProject (project) {
      let models = new S.classes.Models({}, '');

      return BbPromise.mapSeries(models.walkSyncDirs(), (filename) => {
        // Load Templates
        let modelsFilePath = project.getRootPath(filename);

        if (S.utils.fileExistsSync(modelsFilePath)) {
          let models = new S.classes.Models({}, modelsFilePath);
          
          return models.load();
        }
        return null;
      })
        .filter((models) => {
          return models !== null;
        })
        .reduce((result, model) => {
          _.forOwn(model, (value, modelName) => {
            if (!_.startsWith(modelName, '_')) {
              if (_.has(result, modelName)) throw new SError('Detected duplicate models names for model: ' + modelName + ' .Please use different model names');
              result[modelName] = value;
            }
          });

          return result;
        }, {});
    }

  }

  return Models;
};
