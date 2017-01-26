import { VERSION_RECEIVED,
         SERVER_CONNECTED, SERVER_DISCONNECTED } from '../actions/actions.js';

// The HTML contains element #initial-payload that contains frontend's
// version hash
const initialPayload = JSON.parse(
  document.getElementById('initial-payload').innerHTML
);

var initialState = {
  // Frontend version hash
  version: initialPayload.version,
  // Is the currently loaded frontend outdated?
  isOutdated: false,
  // Connected to server?
  connected: true
};

export default function connection(state = initialState, action = null) {
  switch (action.type) {
    case VERSION_RECEIVED:
      let version = action.version;
      let previousVersion = state.version;
      return Object.assign(
        {},
        state,
        {
          version: version,
          isOutdated: version != previousVersion
        }
      );

    case SERVER_CONNECTED:
      return Object.assign({}, state, {connected: true});

    case SERVER_DISCONNECTED:
      return Object.assign({}, state, {connected: false});

    default:
      return state;
  }
}
