import request from 'superagent';
import io from 'socket.io-client';
window.superagent = request;

function handleResponse(ok, fail) {
  return (err, res) => {
    if (!err && res.body) {
      ok(res.body);
    }
    else {
      console.warn('API fetch error:', err);
      if (fail) {
        fail(err);
      }
    }
  }
}

/**
 * Fetches username suggestions from server
 * @param {function} ok - OK callback
 * @param {function?} fail - Fail callback
 */
export function fetchUsernameSuggestions(ok, fail = null) {
  request
    .get('/api/usernames')
    .set('Accept', 'application/json')
    .end(handleResponse(ok, fail));
}

/**
 * Fetches car suggestions from server
 * @param {function} ok - OK callback
 * @param {function?} fail - Fail callback
 */
export function fetchCarSuggestions(ok, fail = null) {
  request
    .get('/api/cars')
    .set('Accept', 'application/json')
    .end(handleResponse(ok, fail));
}

/**
 * Fetches track suggestions from server
 * @param {function} ok - OK callback
 * @param {function?} fail - Fail callback
 */
export function fetchTrackSuggestions(ok, fail = null) {
  request
    .get('/api/tracks')
    .set('Accept', 'application/json')
    .end(handleResponse(ok, fail));
}

/**
 * Fetches times from server
 * @param {function} ok - OK callback
 * @param {function?} fail - Fail callback
 */
export function fetchTimes(ok, fail = null) {
  request
    .get('/api/times')
    .set('Accept', 'application/json')
    .end(handleResponse(ok, fail));
}

/**
 * Fetches scores from server
 * @param {function} ok - OK callback
 * @param {function} fail - Fail callback
 * @param {string?} resolution - Time unit [day, week, month]
 * @param {number?} offset - Offset
 */
export function fetchScores(ok, fail = null,
                            resolution = null, offset = null) {
  let req = request.get('/api/scores')
                   .set('Accept', 'application/json');

  if (resolution && offset) {
    req = req.query({
      resolution: resolution,
      offset: offset
    });
  }

  req.end(handleResponse(ok, fail));
}
