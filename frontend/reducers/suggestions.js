import {
  CARS_RECEIVED, TRACKS_RECEIVED, USERNAMES_RECEIVED
} from '../actions/actions.js';

const initialState = {
  cars: [],
  tracks: [],
  usernames: []
};

export default function suggestions(state = initialState, action = null) {
  switch (action.type) {
    case CARS_RECEIVED:
      return Object.assign({}, state, {cars: action.cars});

    case TRACKS_RECEIVED:
      return Object.assign({}, state, {tracks: action.tracks});

    case USERNAMES_RECEIVED:
      return Object.assign({}, state, {usernames: action.usernames});

    default:
      return state;
  }
}
