import { fetchScores } from '../actions/actions';
import React, { Component, PropTypes } from 'react';
import AppBarButton from '../components/AppBarButton';
import ScoreList from '../components/ScoreList';
import ScorePlot from '../components/ScorePlot';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

const RANGES = [
  {
    name: 'Today',
    titles: ["Today's best drivers",
             "Yesterday's best drivers",
             "Best drivers {} days ago"],
    key:  'day',
    days: 1
  },
  {
    name: 'Week',
    titles: ["This week's best drivers",
             "Last week's best drivers",
             "Best drivers {} weeks ago"],
    key: 'week',
    days: 7
  },
  {
    name: 'Month',
    titles: ["This month's best drivers",
             "Last month's best drivers",
             "Best drivers {} months ago"],
    key: 'month',
    days: 30
  },
  {
    name: 'All-time',
    titles: ['The best drivers since time was invented'],
    key: 'all',
    days: 1
  }
];

const DEFAULT_RANGE = 1;
const ALL_RANGE = 3;

export default class ScoreboardView extends Component {
  constructor(props) {
    super(props);

    let { initialState } = this.props;
    if (initialState && Object.keys(initialState).length > 0) {
      this.state = initialState;
    }
    else {
      this.state = {
        index: DEFAULT_RANGE,
        offsets: {}
      };
    }
  }

  _fetchScores() {
    const { offsets, index } = this.state;
    const key = RANGES[index].key;
    const offset = offsets[index] || 0;

    fetchScores(key, offset)(this.props.dispatch);
  }

  componentDidMount() {
    this._fetchScores();
  }

  _combineScores(scores) {
    let combinedScores = {};

    scores.forEach((dayScores) => {
      dayScores.forEach((entry) => {
        let { name, score } = entry;
        let combinedScore = (combinedScores[name] || 0) + parseInt(score);
        combinedScores[name] = combinedScore;
      });
    });

    return combinedScores;
  }

  render() {
    const { scores, onChangeView } = this.props;
    const { index, offsets } = this.state;
    const offset = offsets[index] || 0;

    let goToDayView = (
      <IconButton onClick={() => onChangeView(this.state)}>
        <FontIcon className="material-icons">timer</FontIcon>
      </IconButton>
    );

    const { key, titles } = RANGES[index];
    const shownScores = scores[key];
    const combinedScores = this._combineScores(shownScores);

    const title = (titles.length > offset ?
                   titles[offset] :
                   titles[titles.length - 1]).replace('{}', offset);

    const titleStyle = {
      fontWeight: 'bold',
      padding: '15px'
    };

    const dropDownStyle = {
      top: '-7px'
    };

    const rangeSelection = (
      <div>
        <AppBarButton label='Previous'
                      disabled={ !this._hasPrevious() }
                      onClick={ () => this._onPrevious() }/>
        <DropDownMenu style={dropDownStyle}
                      labelStyle={{color: 'white'}}
                      value={this.state.index}
                      onChange={(e, index, menuItem) =>
                                this._onSelect(index)}>
          {
            RANGES.map((entry, index) =>
              <MenuItem key={'item-' + index}
                        value={index}
                        primaryText={entry.name} />
            )
          }
        </DropDownMenu>
        <AppBarButton label='Next'
                      disabled={ !this._hasNext() }
                      onClick={ () => this._onNext() }/>
      </div>
    );

    let scoreListStyle;
    let chartStyle;
    let chart;
    switch (key) {
      case 'week':
      case 'month':
        scoreListStyle = {
          display: 'block',
          position: 'static',
          float: 'left',
          width: '48%'
        };

        chartStyle = {
          display: 'block',
          position: 'static',
          padding: '0 2% 2% 0',
          float: 'right',
          width: '47%',
          height: '70%'
        };

        chart = <ScorePlot style={chartStyle} scores={shownScores} />;

        break;

      default:
        scoreListStyle = {
          display: 'block',
          position: 'static'
        };
    }

    return (
      <div>
        <AppBar
          style={{maxHeight: '64px'}}
          title='Score board'
          iconElementLeft={goToDayView}
          iconElementRight={rangeSelection} />
          <div style={titleStyle}>{title}</div>
          <div style={scoreListStyle}>
            <ScoreList scores={combinedScores} />
          </div>
          {chart}
      </div>
    );
  }

  _onSelect(index) {
    this.setState({
      index: index
    });
  }

  _hasPrevious() {
    return this.state.index !== ALL_RANGE;
  }

  _hasNext() {
    const { offsets, index } = this.state;
    const offset = offsets[index] || 0;
    return this.state.index !== ALL_RANGE && offset > 0;
  }

  _onNext() {
    const { offsets, index } = this.state;
    const offset = offsets[index] || 0;
    const key = RANGES[index].key;

    let nextOffset = {};
    nextOffset[index] = offset - 1;
    const nextOffsets = Object.assign({}, offsets, nextOffset);

    fetchScores(key, offset - 1)(this.props.dispatch);

    this.setState({
      offsets: nextOffsets
    });
  }

  _onPrevious() {
    const { offsets, index } = this.state;
    const offset = offsets[index] || 0;
    const key = RANGES[index].key;

    let nextOffset = {};
    nextOffset[index] = offset + 1;

    const nextOffsets = Object.assign({}, offsets, nextOffset);

    fetchScores(key, offset + 1)(this.props.dispatch);

    this.setState({
      offsets: nextOffsets
    });
  }
}
