import React, { Component, PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';

export default class AppBarButton extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let buttonStyle = {
      verticalAlign: 'top',
      marginTop: '5px'
    };

    return (
      <RaisedButton {...this.props} style={buttonStyle} />
    );
  }
}
