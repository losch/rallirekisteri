import React, { Component, PropTypes } from 'react';
import { addTime } from '../actions/actions';
import Typeahead from './Typeahead';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

const ENTER = 13;

function randomChoice(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

export default class EditEntryDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: props.name,
      time: props.time,
      nameErrorText: '',
      timeErrorText: '',
      isOpen: false
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      name: nextProps.name,
      time: nextProps.time,
      nameErrorText: '',
      timeErrorText: ''
    });
  }

  show() {
    this.setState({
      isOpen: true
    });
  }

  dismiss() {
    this.setState({
      isOpen: false
    });
  }

  _isValidName(name) {
    return name.trim().length > 2;
  }

  _isValidTime(time) {
    let validationRegex = /^\d{1,2}:\d{1,2}([\.,:]\S{1,3})?$/;
    return time.trim().match(validationRegex);
  }

  _onDialogSubmit() {
    let isValid = true;
    let { date } = this.props;
    let { name, time } = this.state;

    if (!this._isValidName(name)) {
      let errorMsg = randomChoice([
        'Are you a wizard?', 'Invalid handle', 'null', 'Must be non-void',
        "Ia! Ia! Cthulhu f'tang", 'Please enter a valid name', 'Critical error',
        '?SYNTAX ERROR', 'BAD DATA', 'FILE NOT FOUND', 'DIVISION BY ZERO',
        'OUT OF MEMORY'
      ]);
      this.setState({
        nameErrorText: errorMsg
      });
      isValid = false;
    }

    if (!this._isValidTime(time)) {
      let errorMsg = randomChoice([
        'TYPE MISMATCH', 'DIVISION BY ZERO', 'You shall enter a valid time',
        'Please enter time in format ss:mm.ms', 'Invalid characters detected',
        'BAD DATA', 'Behind the wall', 'Error error', 'Hint: ss:mm.ms',
        'Nice shot, sir!', 'You shall not pass', 'Please remain calm',
        'This incident will be reported', 'DO NOT PRESS ANY KEY',
        "I'm sorry Dave, I'm afraid I can't do that", 'Crom!',
        'java.lang.NullPointerException',
        'java.time.format.DateTimeParseException',
        'Program terminated with signal 11, Segmentation fault.'
      ]);
      this.setState({
        timeErrorText: errorMsg
      });
      isValid = false;
    }

    if (isValid) {
      addTime(date, name.trim(), time.trim());
      this.dismiss();
    }
  }

  _onKeyPress(e) {
    if (e.charCode === ENTER) {
      this._onDialogSubmit();
    }
  }

  render() {
    let textFieldStyle = {
      display: 'block'
    };

    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={() => this.dismiss()}
      />,
      <FlatButton
        label="Ok"
        primary={true}
        onTouchTap={() => this._onDialogSubmit()}
      />,
    ];

    return (
      <Dialog title={this.props.title}
              open={this.state.isOpen}
              actions={actions}>
        <Typeahead
          id='name'
          style={textFieldStyle}
          onChange={(name) => this.setState({name: name})}
          disabled={this.props.isNameLocked}
          floatingLabelText='Name'
          errorText={this.state.nameErrorText}
          value={this.state.name}
          suggestions={this.props.suggestions} />
        <TextField
          id='edit-entry-time'
          style={textFieldStyle}
          onChange={(e) => this.setState({time: e.target.value})}
          floatingLabelText='Time'
          errorText={this.state.timeErrorText}
          defaultValue={this.props.time}
          onKeyPress={(e) => this._onKeyPress(e)}/>
      </Dialog>
    );
  }
}
