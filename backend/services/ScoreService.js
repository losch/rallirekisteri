'use strict';

var moment = require('moment');
var Promise = require('bluebird');

var repository;
var logger;

const MOMENT_FORMAT = 'YYYY-MM-DD';

function findAllScores() {
  return repository.getScores();
}

function findScoresForMonth(offset) {
  let m = moment().subtract(offset, 'months');
  let start = m.startOf('month').format(MOMENT_FORMAT);
  let end = m.endOf('month').format(MOMENT_FORMAT);
  return repository.getScores(start, end);
}

function findScoresForWeek(offset) {
  let m = moment().subtract(offset, 'weeks');
  let start = m.startOf('isoWeek').format(MOMENT_FORMAT);
  let end = m.endOf('isoWeek').format(MOMENT_FORMAT);
  return repository.getScores(start, end);
}

function findScoresForDate(offset) {
  let date = moment().subtract(offset, 'day').format(MOMENT_FORMAT);
  return repository.getScores(date, date);
}

/**
 * Initializes score service with given logger and repository
 * @param log - Logger
 * @param repo - Repository
 */
function init(log, repo) {
  repository = repo;
  logger = log;
}

/**
 * Returns drivers' scores for given period of time
 * @param offset - Offset from the current date
 * @param resolution - Resolution: '', 'day', 'week' or 'month'
 * @returns {Promise}
 */
function getScores(resolution, offset) {
  offset = offset || 0;
  let promises;

  switch (resolution) {
    case 'day':
      promises = {
        'day': findScoresForDate(offset)
      };
      break;

    case 'week':
      promises = {
        'week': findScoresForWeek(offset)
      };
      break;

    case 'month':
      promises = {
        'month': findScoresForMonth(offset)
      };
      break;

    case 'all':
      promises = {
        'all': findAllScores()
      };
      break;

    default:
      promises = {
        'all': findAllScores(),
        'month': findScoresForMonth(offset),
        'week': findScoresForWeek(offset),
        'day': findScoresForDate(offset)
      }
  }

  return Promise.props(promises);
}

module.exports = {
  init: init,
  getScores: getScores
};
