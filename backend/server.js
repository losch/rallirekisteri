'use strict';

var _ = require('lodash-fp');
var config = require('config');
var getToday = require('../common/utils/time').getToday;
var handlebars = require('handlebars');
var Hapi = require('hapi');
var Inert = require('inert');
var Joi = require('joi');
var md5File = require('md5-file');
var moment = require('moment');
var path = require('path');
var Promise = require('bluebird');
var repository = require('./repository');
var ScoreService = require('./services/ScoreService');
var vision = require('vision');
var winston = require('winston');

// Context

var io;
var server;
var logger;

// Configuration

var LOG_FILE = config.get('logfile');
var APPLICATION_PORT = config.get('port');
var RETHINK_CONFIG = config.get('rethinkdb');

const publicDir = path.join(__dirname, '../public');
const bundleFile = path.join(publicDir, 'bundle.js');
const VERSION = md5File(bundleFile);  // Frontend version

// Initialization failure exception
function InitFailException(message) {
  this.name = 'InitFailException';
  this.message = message;
}

/**
 * Initializes logging
 */
function initLogger() {
  return new Promise((resolve, reject) => {
    logger = new (winston.Logger)({
      transports: [
        new winston.transports.Console({
          level: 'debug',
          handleExceptions: true,
          json: false,
          colorize: true
        }),
        new winston.transports.File({
          level: 'debug',
          handleExceptions: true,
          filename: LOG_FILE,
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    });

    resolve();
  });
}

/**
 * Initializes database connection
 * @returns {*} Promises database initialization
 */
function initDb() {
  return repository.init(RETHINK_CONFIG, logger);
}

/**
 * Initializes services
 */
function initServices() {
  return new Promise((resolve, reject) => {
    ScoreService.init(logger, repository);
    resolve();
  });
}

/**
 * Initializes Hapi and all routes
 * @returns {*} Promises server initialization
 */
function initServer() {
  return new Promise((resolve, reject) => {
    server = new Hapi.Server({
      connections: {
        routes: {
          cors: true
        }
      }
    });

    server.connection({host: '0.0.0.0', port: APPLICATION_PORT});

    // Configure views. Use Handlebars for rendering.

    server.register(vision, (err) => {
      if (err) {
        throw new InitFailException('Failed to load vision');
      }

      server.views({
        engines: {
          html: handlebars
        },
        relativeTo: __dirname,
        path: './views',
        layoutPath: './views/layout',
        helpersPath: './views/helpers'
      });
    });

    // API

    server.register(Inert, (err) => {
      if (err) {
        throw new InitFailException('Failed to load Inert');
      }

      // Returns index page
      server.route({
        method: 'GET',
        path: '/',
        handler: (request, reply) =>
          reply.view('index', { version: VERSION })
      });

      // Returns static files
      server.route({
        method: 'GET',
        path: '/static/{param*}',
        handler: {
          directory: {
            path: 'public'
          }
        }
      });
    });

    server.route({
      method: 'GET',
      path: '/api/version',
      handler: (request, reply) => {
        reply(VERSION);
      }
    });

    // Returns all times
    server.route({
      method: 'GET',
      path: '/api/times',
      handler: (request, reply) => {
        // Adds default today entry if today is not present in the data
        let addDefaultToday = (rounds) => {
          let today = getToday();
          let isTodayIncluded = false;

          for (var i = 0; i < rounds.length; i++) {
            if (rounds[i].date == today) {
              isTodayIncluded = true;
              break;
            }
          }

          if (!isTodayIncluded) {
            let emptyEntry = {date: today, car: '', track: '', times: []};
            let newRounds = rounds.slice(0);
            newRounds.unshift(emptyEntry);
            return newRounds;
          }
          else {
            return rounds;
          }
        };

        repository.getRounds()
                  .then(addDefaultToday)
                  .then(reply);
      }
    });

    // Returns scores
    // Parameters:
    //   offset {number?} - How many time units to past?
    //   resolution {string?} - Time unit: [day, week, month]
    server.route({
      method: 'GET',
      path: '/api/scores',
      config: {
        validate: {
          query: {
            resolution: Joi.any().valid(['day', 'week', 'month', 'all']),
            offset: Joi.number().integer().min(0).default(0)
          }
        }
      },
      handler: (request, reply) =>
          ScoreService.getScores(request.query.resolution, request.query.offset)
                      .then(reply)
    });

    // Returns cars
    server.route({
      method: 'GET',
      path: '/api/cars',
      handler: (request, reply) => repository.getCars().then(reply)
    });

    // Returns tracks
    server.route({
      method: 'GET',
      path: '/api/tracks',
      handler: (request, reply) => repository.getTracks().then(reply)
    });

    // Returns usernames
    server.route({
      method: 'GET',
      path: '/api/usernames',
      handler: (request, reply) => repository.getUsernames().then(reply)
    });

    /* Adds times to database for given date
     * Parameters:
     *   date - Date of the entry in format yyyy-mm-dd
     *   name - Driver's name
     *   time - Time in format mm:ss.ms
     */
    server.route({
      method: 'POST',
      path: '/api/addtime',
      config: {
        validate: {
          payload: {
            date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            name: Joi.string().min(1),
            time: Joi.string().regex(/^\d{1,2}:\d{1,2}([\.,:]\S{1,3})?$/)
          }
        }
      },
      handler: (request, reply) => {
        let date = request.payload.date;
        let name = request.payload.name;
        let time = request.payload.time;

        let replyOk = () => reply('OK');
        let fetchRounds = (date) => repository.getRounds(date);
        let broadcastRounds = (date, rounds) => {
          io.emit('times changed', date, rounds[0].times)
        };
        let replyFail = (err) => reply(err.msg);

        logger.info('Add time called with parameters: ', request.payload);

        repository.upsertTime(date, name, time)
          .then(replyOk)
          .then(() => fetchRounds(date))
          .then((rounds) => broadcastRounds(date, rounds))
          .catch(repository.ValidationError, replyFail);
      }
    });

    // Health check
    server.route({
      method: 'GET',
      path: '/api/health',
      handler: (request, reply) => reply('OK')
    });

    server.start(() => {
      logger.info('Server running at: ' + server.info.uri)
    });

    resolve();
  });
}

/**
 * Initializes socket.io
 * @returns {*} Promises socket initialization
 */
function initSocket() {
  return new Promise((resolve, reject) => {
    io = require('socket.io')(server.listener);

    // Socket to db persistence

    let carUpdates = {};
    let trackUpdates = {};

    let doUpdate = (func, updates) => {
      Object.keys(updates).forEach((key) => {
        let value = updates[key];
        func(key, value.name, value.userId);
      });
      return {};
    };

    let writeCarsToDb = _.debounce(500, () => {
      carUpdates = doUpdate(repository.updateCar, carUpdates);
    });

    let writeTracksToDb = _.debounce(500, () => {
      trackUpdates = doUpdate(repository.updateTrack, trackUpdates);
    });

    let updateCar = (date, name, userId) => {
      carUpdates[date] = {name: name, userId: userId};
      writeCarsToDb();
    };

    let updateTrack = (date, name, userId) => {
      trackUpdates[date] = {name: name, userId: userId};
      writeTracksToDb();
    };

    // Socket.io

    repository.listenForUpdates(
      (update) => io.emit('car name changed', update.date, update.car),
      (update) => io.emit('track name changed', update.date, update.track),
      (update) => io.emit('times changed', update.date, update.times)
    );

    io.on('connection', (socket) => {
      let address = socket.handshake.address;
      let userId = 'User ' + address;

      let clientCountMsg = () => {
        return '(' + io.engine.clientsCount + ' client(s) connected)';
      };

      logger.info(userId + ' connected. ' + clientCountMsg());

      let carNameChanged = (date, name) => updateCar(date, name, userId);
      let trackNameChanged = (date, name) => updateTrack(date, name, userId);
      let timeAdded = (date, name, time) => {
        logger.info(userId + ' changes time. Date: ' + date +
                    ' name: ' + name + ' time: ' + time);
        repository.upsertTime(date, name, time)
          .catch((e) => { logger.error('Adding time failed:', e); });
      };

      socket.on('car name changed', carNameChanged);
      socket.on('track name changed', trackNameChanged);
      socket.on('time added', timeAdded);
      socket.on('disconnect', () => {
        logger.info(userId + ' disconnected. ' + clientCountMsg());
      });

      socket.emit('version', VERSION);
    });

    resolve();
  });
}

function start() {
  let showInitMsg = () => { logger.info('Initializations done') };

  initLogger()
    .then(initDb)
    .then(initServices)
    .then(initServer)
    .then(initSocket)
    .then(showInitMsg)
    .catch((err) => {
      console.error('Initialization failed:', err);
      console.error(err.stack);
    });
}

module.exports = start;
