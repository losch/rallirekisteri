import React, { Component, PropTypes } from 'react';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import AppBarButton from './AppBarButton';

export default class DateSelect extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { dates, index } = this.props;

    let dropDownStyle = {
      top: '-7px'
    };

    return (
      <div style={{height: '100%'}}>
        <AppBarButton label='Previous date'
                      disabled={ !this.hasPrevious() }
                      onClick={ () => this.onPrevious() }/>
        <DropDownMenu style={dropDownStyle}
                      labelStyle={{color: 'white'}}
                      value={index}
                      onChange={(e, index, menuItem) =>
                                  this.onSelect(index)}>
          {
            dates.map((date, index) =>
              <MenuItem key={'item-' + index}
                        value={index}
                        primaryText={date} />
            )
          }
        </DropDownMenu>
        <AppBarButton label='Next date'
                      disabled={ !this.hasNext() }
                      onClick={() => this.onNext() }/>
      </div>
    );
  }

  hasNext() {
    return this.props.index > 0;
  }

  hasPrevious() {
    return this.props.index < this.props.dates.length - 1;
  }

  onNext() {
    if (this.hasNext()) {
      this.props.onSelect(this.props.index - 1)
    }
  }

  onPrevious() {
    if (this.hasPrevious()) {
      this.props.onSelect(this.props.index + 1)
    }
  }

  onSelect(index) {
    this.props.onSelect(index);
  }
}

DateSelect.propTypes = {
  // List of available dates
  dates: PropTypes.array.isRequired,
  // Currently selected date
  index: PropTypes.number.isRequired,
  // Callback that gets called with new index upon new date is selected
  onSelect: PropTypes.func.isRequired
};
