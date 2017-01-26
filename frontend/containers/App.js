import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import DayView from './DayView';
import ScoreboardView from './ScoreboardView';
import ConnectionStatus from '../components/ConnectionStatus';
import {
    fetchUserNames, fetchCarSuggestions, fetchTrackSuggestions,
    fetchTimes, fetchScores, listen, reloadPage
  } from '../actions/actions';

const SCORE_VIEW = Symbol('SCORE_VIEW');
const DAY_VIEW = Symbol('DAY_VIEW');

// Application component. On initialization starts listening to sockets and
// fetches initial data. Keeps track of which view should be rendered and
// passes states to views.
class App extends Component {
  constructor(props) {
    super(props);
    listen(this.props.dispatch);
    this.state = {
      view: DAY_VIEW,
      viewStates: {}
    };
  }

  componentWillMount() {
    const { dispatch } = this.props;

    // Fetch initial data
    [fetchUserNames, fetchCarSuggestions, fetchTrackSuggestions,
     fetchTimes, fetchScores]
      .map((initAction) => initAction()(dispatch));
  }

  componentWillReceiveProps(nextProps) {
    // Application version differs from server's version. Reload application.
    if (nextProps.connection.isOutdated) {
      reloadPage();
    }
  }

  _changeView(to, from, state) {
    let nextStates = Object.assign({}, this.state.viewStates);
    nextStates[from] = state;
    this.setState({
      view: to,
      viewStates: nextStates
    });
  }

  render() {
    const { rounds, scores, connection, suggestions, dispatch } = this.props;
    const { view } = this.state;

    let renderView = () => {
      switch (view) {
        case SCORE_VIEW:
          return (
            <ScoreboardView
              initialState={this.state.viewStates[SCORE_VIEW]}
              dispatch={dispatch}
              scores={scores}
              onChangeView={
                (state) => this._changeView(DAY_VIEW, SCORE_VIEW, state)
              } />
          );

        default:
          return (
            <DayView
              initialState={this.state.viewStates[DAY_VIEW]}
              rounds={rounds}
              dispatch={dispatch}
              suggestions={suggestions}
              onChangeView={
                (state) => this._changeView(SCORE_VIEW, DAY_VIEW, state)
              }
            />
          );
      }
    };

    return (
      <div style={{fontFamily: '"Roboto",sans-serif'}}>
        {renderView()}
        <ConnectionStatus connected={connection.connected} />
      </div>
    );
  }
}

App.propTypes = {
  rounds: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    track: PropTypes.string,
    car: PropTypes.string,
    times: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      timestamp: PropTypes.string
    }))
  })),
  scores: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          date: PropTypes.string,
          name: PropTypes.string,
          score: PropTypes.number
        })
      )
    )
  ),
  connection: PropTypes.shape({
    connected: PropTypes.bool.isRequired,
    isOutdated: PropTypes.bool.isRequired,
    version: PropTypes.string.isRequired
  }),
  suggestions: PropTypes.shape({
    cars: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    tracks: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    usernames: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
  })
};

function select(state) {
  return {
    rounds: state.times,
    scores: state.scores,
    connection: state.connection,
    suggestions: state.suggestions
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(App);
