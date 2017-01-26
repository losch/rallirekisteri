import * as api from '../api/api';
import { withSocket, emit } from '../api/socket';

/*
 * Action types
 */

export const VERSION_RECEIVED = 'VERSION_RECEIVED';
export const CARS_RECEIVED = 'CARS_RECEIVED';
export const TRACKS_RECEIVED = 'TRACKS_RECEIVED';
export const USERNAMES_RECEIVED = 'USERNAMES_RECEIVED';
export const TIMES_RECEIVED = 'TIMES_RECEIVED';
export const SCORES_RECEIVED = 'SCORES_RECEIVED';
export const TRACK_NAME_CHANGED = 'TRACK_NAME_CHANGED';
export const CAR_NAME_CHANGED = 'CAR_NAME_CHANGED';
export const TIMES_CHANGED = 'TIMES_CHANGED';
export const TIME_ADDED = 'TIME_ADDED';

export const SERVER_CONNECTED = 'SERVER_CONNECTED';
export const SERVER_DISCONNECTED = 'SERVER_DISCONNECTED';

/*
 * Action creators
 */

export function fetchUserNames() {
  return dispatch => {
    let ok = json => {
      dispatch({
        type: USERNAMES_RECEIVED,
        usernames: json
      });
    };
    api.fetchUsernameSuggestions(ok);
  };
}

export function fetchCarSuggestions() {
  return dispatch => {
    let ok = json => {
      dispatch({
        type: CARS_RECEIVED,
        cars: json
      });
    };
    api.fetchCarSuggestions(ok);
  };
}

export function fetchTrackSuggestions() {
  return dispatch => {
    let ok = json => {
      dispatch({
        type: TRACKS_RECEIVED,
        tracks: json
      });
    };
    api.fetchTrackSuggestions(ok);
  };
}

export function fetchTimes() {
  return dispatch => {
    let ok = json => {
      dispatch({
          type: TIMES_RECEIVED,
          times: json
      });
    };
    api.fetchTimes(ok);
  };
}

export function fetchScores(resolution, offset) {
  return dispatch => {
    let ok = json => {
      dispatch({
        type: SCORES_RECEIVED,
        resolution: resolution,
        offset: offset,
        scores: json
      });
    };
    api.fetchScores(ok, null, resolution, offset);
  }
}

function versionReceivedAction(version) {
  return { type: VERSION_RECEIVED, version };
}

function changeCarNameAction(date, name) {
  return { type: CAR_NAME_CHANGED, date, name };
}

function changeTrackNameAction(date, name) {
  return { type: TRACK_NAME_CHANGED, date, name };
}

function changeTimesAction(date, times) {
  return { type: TIMES_CHANGED, date, times };
}

function addTimeAction(date, name, time) {
  return { type: TIME_ADDED, date, name, time};
}

export function changeTrackName(date, name) {
  emit('track name changed', date, name);
  return changeTrackNameAction(date, name);
}

export function changeCarName(date, name) {
  emit('car name changed', date, name);
  return changeCarNameAction(date, name);
}

export function addTime(date, name, time) {
  emit('time added', date, name, time);
}

export function reloadPage() {
  location.reload();
}

export function serverConnected() {
  return { type: SERVER_CONNECTED };
}

export function serverDisconnected() {
  return { type: SERVER_DISCONNECTED };
}

/*
 * Actions from socket
 */
export function listen(dispatch) {
  withSocket(socket => {
    socket.on('version', (version) => {
      dispatch(versionReceivedAction(version));
    });

    socket.on('car name changed', (date, name) => {
      dispatch(changeCarNameAction(date, name));
    });

    socket.on('track name changed', (date, name) => {
      dispatch(changeTrackNameAction(date, name))
    });

    socket.on('times changed', (date, times) => {
      dispatch(changeTimesAction(date, times));
    });

    socket.on('connect', () => {
      dispatch(serverConnected());
    });

    socket.on('disconnect', () => {
      dispatch(serverDisconnected());
    });

    socket.on('time added', (time) => {
      dispatch(addTimeAction(time.date, time.name, time.time));
    });
  });
}
