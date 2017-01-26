'use strict';

let _ = require('lodash-fp');

var r = require('rethinkdb');

var assert = require('assert');

let conn;

var logger;

function ValidationError(msg) { this.msg = msg; }

/**
 * Returns a new Round document with default fields
 * @param date
 * @param options
 */
function newRound(date, options) {
  return _.defaults(
    { id: date, date: date, car: '', track: '', times: [] },
    options
  );
}

/**
 * Initializes connection to database
 * @returns {Promise.<T>}
 */
function init(rethinkConfig, log) {
  logger = log;

  return r.connect(rethinkConfig)
    .then((_conn) => {
      logger.info('Connected to RethinkDB at ' + rethinkConfig);
      conn = _conn;
    })
    .error((err) => {
      console.log("Could not open a connection to initialize the database");
      console.log(err.message);
      process.exit(1);
    });
}

function listenForUpdates(carUpdateCb, trackUpdateCb, timesUpdateCb) {
  // Time changes
  r.table('rounds')
    .changes()
    .filter(r.row('new_val')('times').ne(r.row('old_val')('times')))
    .run(conn, (err, cursor) => {
      cursor.each((err, row) => {
        let timesUpdate = {
          date: row['new_val']['date'],
          times: row['new_val']['times']
        };

        timesUpdateCb(timesUpdate);
      })
    });

  // Car changes
  r.table('rounds')
    .changes()
    .filter(r.row('new_val')('car').ne(r.row('old_val')('car')))
    .run(conn, (err, cursor) => {
      cursor.each((err, row) => {
        let carUpdate = {
          date: row['new_val']['date'],
          car: row['new_val']['car']
        };

        carUpdateCb(carUpdate);
      })
    });

  // Track changes
  r.table('rounds')
    .changes()
    .filter(r.row('new_val')('track').ne(r.row('old_val')('track')))
    .run(conn, (err, cursor) => {
      cursor.each((err, row) => {
        let trackUpdate = {
          date: row['new_val']['date'],
          track: row['new_val']['track']
        };

        trackUpdateCb(trackUpdate);
      })
    });
}

/**
 * Returns a list of all cars in database
 */
function getCars() {
  return r.table('rounds')
          .filter(r.row('car').ne(''))
          .map((round) => round('car'))
          .distinct()
          .run(conn);
}

/**
 * Returns a list of all cars in database
 */
function getTracks() {
  return r.table('rounds')
          .filter(r.row('track').ne(''))
          .map((round) => round('track'))
          .distinct()
          .run(conn);
}

/**
 * Returns list of all distinct usernames in database
 * @returns {Promise}
 */
function getUsernames() {
  return r.table('rounds')
          .concatMap((round) => round('times').default([]))
          .pluck('name')
          .distinct()
          .map((name) => name('name'))
          .run(conn);
}

/**
 * Returns rounds for a given date. If date is not given, returns all
 * rounds
 * @param {string?} date - Date
 * @returns {Promise} Promises to return a list of rounds
 */
function getRounds(date) {
  let rounds = r.table('rounds')
                .orderBy(r.desc('date'));

  if (date) {
    rounds = rounds.filter(r.row('date').eq(date));
  }

  return rounds.run(conn);
}

/**
 * Returns scores for drivers according to positioning
 * @param {string?} startDate - Start date
 * @param {string?} endDate - End date
 * @returns {Promise}
 */
function getScores(startDate, endDate) {
  let scoreRound = (round) => {
    let times = round('times').default([]).orderBy(r.desc('time'));

    return times.fold([], (entries, entry) => {
      let score = entries.count();

      return entries.append(
        { name: entry('name'), score: score.add(1), date: round('date') }
      );
    });
  };

  let rounds = r.table('rounds');

  if (startDate && endDate) {
    rounds =
      rounds.between(startDate, endDate,
                     {index: 'date', rightBound: 'closed'});
  }

  return rounds.map(scoreRound)
               .run(conn)
               .then((cursor) => cursor.toArray());
}

/**
 * Normalizes time
 * @param {string} time
 * @returns {string} Normalized time
 */
function normalizeTime(time) {
  var r = /(\d{1,2}):(\d{1,2})(?:[\.,:](\d{1,3}))?/;
  var match = time.match(r);

  var m = match[1];
  var s = match[2];
  var ms = match[3] || "999";

  // Pad s with zeroes
  while (s.length < 2) {
    s = "0" + s;
  }
  
  // Pad ms with nines
  while (ms.length < 3) {
    ms += "9";
  }

  if (parseInt(s) > 59) throw new ValidationError("Seconds out of bounds");
  if (parseInt(m) > 59) throw new ValidationError("Minutes out of bounds");

  return m + ":" + s + "." + ms;
}

/**
 * Updates of inserts a time entry
 * @param {string} date - Date of the round to update
 * @param {string} name - Driver's name
 * @param {string} time - Driver's time
 * @returns {Promise}
 */
function upsertTime(date, name, time) {
  let normalizedTime = normalizeTime(time);

  let newEntry = { name: name, time: normalizedTime, timestamp: new Date() };

  let notName = (time) => time('name').ne(name);

  let modifyTimes = (row) => row('times').filter(notName).append(newEntry);

  return r.table('rounds')
    .get(date)
    .replace((row) =>
      r.branch(
        row.eq(null),
        newRound(date, { times: [newEntry] }),
        row.merge({ times: modifyTimes(row) })
      )
    )
    .run(conn)
    .then(() => {
      logger.info("Added new time entry", date, name, time);
    });
}

/**
 * Updates round's car
 * @param {string} date - Date
 * @param {string} car - Car
 * @param {string} userId - User ID
 */
function updateCar(date, car, userId) {
  return r.table('rounds')
    .get(date)
    .replace((row) =>
      r.branch(
        row.eq(null),
        newRound(date, { car: car }),
        row.merge({ car: car })
      )
    )
    .run(conn)
    .then(() => {
      logger.info(userId + ' updated car ' + date + ' to ' + car);
    });
}

/**
 * Updates round's track
 * @param {string} date - Date
 * @param {string} track - Track
 * @param {string} userId - User ID
 */
function updateTrack(date, track, userId) {
  return r.table('rounds')
    .get(date)
    .replace((row) =>
      r.branch(
        row.eq(null),
        newRound(date, { track: track }),
        row.merge({ track: track })
      )
    )
    .run(conn)
    .then(() => {
      logger.info(userId + ' updated track ' + date + ' to ' + track);
    });
}

module.exports = {
  init: init,
  listenForUpdates: listenForUpdates,
  getCars: getCars,
  getTracks: getTracks,
  getRounds: getRounds,
  getUsernames: getUsernames,
  getScores: getScores,
  upsertTime: upsertTime,
  updateCar: updateCar,
  updateTrack: updateTrack,
  ValidationError: ValidationError
};
