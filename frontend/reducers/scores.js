import {
  SCORES_RECEIVED,
  } from '../actions/actions.js';

export default function scores(state = {}, action = null) {
  switch (action.type) {
    case SCORES_RECEIVED:
      const { scores, resolution } = action;

      switch (resolution) {
        case 'day':
        case 'week':
        case 'month':
          return Object.assign({}, state, scores);

        default:
          return scores;
      }

    default:
      return state;
  }
}
