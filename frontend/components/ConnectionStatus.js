import React, { Component, PropTypes } from 'react';
import Snackbar from 'material-ui/Snackbar';

export default class ConnectionStatus extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.connected) {
      return null;
    }
    else {
      return (
        <Snackbar message="Real-time view disconnected. Reconnecting..."
                  open={true} />
      );
    }
  }
}
