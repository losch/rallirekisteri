import React, { Component, PropTypes } from 'react';
import DateSelect from '../components/DateSelect';
import { timeToS, timeEntryComparator } from '../../common/utils/time';
import TopList from '../components/TopList';
import Typeahead from '../components/Typeahead';
import { changeTrackName, changeCarName } from '../actions/actions';
import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

// Shows the times for a given day
export default class DayView extends Component {
  constructor(props) {
    super(props);

    let { initialState } = this.props;
    if (initialState && Object.keys(initialState).length > 0) {
      this.state = initialState;
    }
    else {
      this.state = {index: 0};
    }
  }

  render() {
    let { rounds, suggestions, onChangeView } = this.props;

    if (rounds.length === 0) {
      return <div>No data</div>;
    }

    let currentTimes = rounds[this.state.index];
    let topTimes = currentTimes.times.sort(timeEntryComparator);

    let dates = rounds.map((entry) => entry.date);
    let dateSelect = <DateSelect onSelect={(index) => this.setIndex(index)}
                                 dates={dates}
                                 index={this.state.index} />;

    let goToScoreBoard = (
      <IconButton onClick={() => onChangeView(this.state)}>
        <FontIcon className="material-icons">trending_up</FontIcon>
      </IconButton>
    );

    return (
      <div>
        <AppBar
          style={{maxHeight: '64px'}}
          title='Rallirekisteri'
          iconElementLeft={goToScoreBoard}
          iconElementRight={dateSelect} />
        <Paper zDepth={2}>
          <div style={{float: 'left'}}>
            <div style={{marginTop: '15px'}}>
              <div style={{width: '150px'}}><b>Track</b></div>
              <Typeahead id='track'
                         value={currentTimes.track}
                         onChange={(name) => this._onChangeTrackName(name)}
                         suggestions={suggestions.tracks} />
            </div>
            <div style={{marginTop: '15px'}}>
              <div style={{width: '150px'}}><b>Car</b></div>
              <Typeahead id='car'
                         value={currentTimes.car}
                         onChange={(name) => this._onChangeCarName(name)}
                         suggestions={suggestions.cars} />
            </div>
          </div>
          <div style={{marginTop: '10px', float: 'right', width: '800px'}}>
            <TopList date={currentTimes.date}
                     times={topTimes}
                     suggestions={suggestions.usernames} />
          </div>
        </Paper>
      </div>
    );
  }

  setIndex(index) {
    this.setState({
      index: index
    })
  }

  _getSelectedDate() {
    return this.props.rounds[this.state.index].date;
  }

  _onChangeTrackName(name) {
    let date = this._getSelectedDate();
    this.props.dispatch(changeTrackName(date, name));
  }

  _onChangeCarName(name) {
    let date = this._getSelectedDate();
    this.props.dispatch(changeCarName(date, name));
  }
}
