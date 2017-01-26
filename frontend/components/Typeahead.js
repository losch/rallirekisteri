import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import {List, ListItem} from 'material-ui/List';

const SUGGESTION_COUNT = 4;

export default class Typeahead extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTypeaheadOpen: false
    }
  }

  render() {
    const { id, value, suggestions, onChange, disabled, floatingLabelText,
            errorText } = this.props;
    const { isTypeaheadOpen } = this.state;
    const dropdownStyle = { position: 'absolute', zIndex: 10 };

    let suggestionFilter = Typeahead.createSuggestionFilter(value);
    let suggestionList = isTypeaheadOpen ? (
      <Paper zDepth={1} style={dropdownStyle}>
        <List>
          {suggestions
              .filter(suggestionFilter)
              .sort()
              .slice(0, SUGGESTION_COUNT)
              .map((suggestion, i) =>
            <ListItem key={'suggestion-' + i}
                      primaryText={suggestion}
                      onMouseDown={ () => onChange(suggestion) } /> )}
        </List>
      </Paper>
    ) : undefined;

    return (
      <div>
        <TextField id={'text-field-' + this.props.id}
                   value={value}
                   disabled={disabled}
                   floatingLabelText={floatingLabelText}
                   errorText={errorText}
                   onChange={(e) => this._onValueChange(e)}
                   onFocus={() => this._onFocus()}
                   onBlur={() => this._onBlur()} />
        {suggestionList}
      </div>
    );
  }

  _onValueChange(e) {
    this.props.onChange(e.target.value);
  }

  _onFocus() {
    this.setState({ isTypeaheadOpen: true });
  }

  _onBlur() {
    this.setState({ isTypeaheadOpen: false });
  }

  /**
   * Filters suggestion for typeahead dropdown list
   * @param value - Value to use as a filter
   * @returns Function which takes a suggestion and returns whether it passes
   *          the filter.
   */
  static createSuggestionFilter(value) {
    return (suggestion) =>
      suggestion.toLowerCase().startsWith(value.toLowerCase());
  }
}

Typeahead.propTypes = {
  id: PropTypes.string.isRequired,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  floatingLabelText: PropTypes.string,
  errorText: PropTypes.string,
  value: PropTypes.string.isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.string.isRequired),
  onChange: PropTypes.func.isRequired
};
