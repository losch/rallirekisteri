import {
  TIMES_RECEIVED,
  TRACK_NAME_CHANGED,
  CAR_NAME_CHANGED,
  TIMES_CHANGED,
  TIME_ADDED } from '../actions/actions.js';

export default function times(state = [], action = null) {
  let index;

  switch (action.type) {
    case TIMES_RECEIVED:
      return action.times;

    case TRACK_NAME_CHANGED:
      index = state.findIndex((entry) => {
        return entry['date'] === action.date;
      });

      if (index > -1) {
        return [
          ...state.slice(0, index),
          Object.assign({}, state[index], {
            track: action.name
          }),
          ...state.slice(index + 1)
        ];
      }
      else {
        return state;
      }

    case CAR_NAME_CHANGED:
      index = state.findIndex((entry) => {
        return entry['date'] === action.date;
      });

      if (index > -1) {
        return [
          ...state.slice(0, index),
          Object.assign({}, state[index], {
            car: action.name
          }),
          ...state.slice(index + 1)
        ];
      }
      else {
        return state;
      }

    case TIMES_CHANGED:
      index = state.findIndex((entry) => {
        return entry['date'] === action.date;
      });

      if (index > -1) {
        return [
          ...state.slice(0, index),
          Object.assign({}, state[index], {
            times: action.times
          }),
          ...state.slice(index + 1)
        ];
      }
      else {
        return state;
      }

    case TIME_ADDED:
      index = state.findIndex((entry) => {
        return entry['date'] === action.date;
      });

      let entry = {
        name: action.name,
        time: action.time
      };

      if (index > -1) {
        let entries = [...state[index].entries.slice(), entry];

        return [
          ...state.slice(0, index),
          Object.assign({}, state[index], {
            entries: entries
          }),
          ...state.slice(index + 1)
        ];
      }
      else {
        let time = {
          date: action.date,
          track: '',
          car: '',
          entries: [entry]
        };
        return [...state.slice(), time];
      }

    default:
      return state;
  }
}