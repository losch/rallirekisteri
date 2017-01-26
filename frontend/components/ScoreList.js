import React, { Component, PropTypes } from 'react';

import {
    Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn
  } from 'material-ui/Table';

export default class ScoreList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { scores } = this.props;
    if (Object.entries(scores).length > 0) {
      return this.renderTable();
    }
    else {
      return (
        <div style={{padding: '15px'}}>No score data available</div>
      );
    }
  }

  renderTable() {
    const { scores } = this.props;
    const header = (
      <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
        <TableRow>
          <TableHeaderColumn>Position</TableHeaderColumn>
          <TableHeaderColumn>Name</TableHeaderColumn>
          <TableHeaderColumn>Score</TableHeaderColumn>
        </TableRow>
      </TableHeader>
    );

    // Sort and add position for each score

    let comparator = (entryA, entryB) => {
      let scoreA = entryA[1];
      let scoreB = entryB[1];
      if (scoreA < scoreB) return 1;
      else if (scoreA > scoreB) return -1;
      else return 0;
    };

    let i = 1;
    let indexedScores = Object.entries(scores)
                              .sort(comparator)
                              .map(([name, score]) => ({
                                  name: name,
                                  score: score,
                                  position: i++
                                })
                              );

    return (
      <Table displayRowCheckbox={false}
             displaySelectAll={false}>
        {header}
        <TableBody displayRowCheckbox={false}>
          {
            indexedScores.map((entry) =>
              <TableRow key={'score-entry-' + entry.position}>
                <TableRowColumn>{entry.position}</TableRowColumn>
                <TableRowColumn>{entry.name}</TableRowColumn>
                <TableRowColumn>{entry.score}</TableRowColumn>
              </TableRow>
            )
          }
        </TableBody>
      </Table>
    );
  }
}

ScoreList.propTypes = {
  // TODO: add the correct proptype instead of object
  scores: PropTypes.object.isRequired
};

