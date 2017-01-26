'use strict';

function getToday() {
  let today = new Date();
  let year = '' + today.getFullYear();
  let month = '' + (today.getMonth() + 1);
  let date = '' + today.getDate();

  // Pad month and date to two digits

  while (month.length < 2) {
    month = "0" + month;
  }

  while (date.length < 2) {
    date = "0" + date;
  }

  return year + '-' + month + '-' + date;
}

// Utility function for parsing time string
function timeToS(time) {
  var timeR = /(\d+):(\d+\.\d+)/;
  var match = time.match(timeR);
  var minutes = parseInt(match[1]);
  var seconds = parseFloat(match[2]);
  return {
    minutes: minutes,
    seconds: seconds
  }
}

function timeEntryComparator(entryA, entryB) {
  let a = timeToS(entryA.time);
  let b = timeToS(entryB.time);

  if (a.minutes > b.minutes) {
    return 1;
  }
  if (b.minutes > a.minutes) {
    return -1;
  }
  if (a.seconds > b.seconds) {
    return 1;
  }
  return -1;
}

module.exports = {
  getToday: getToday,
  timeToS: timeToS,
  timeEntryComparator: timeEntryComparator
};
