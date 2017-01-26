import React, { Component, PropTypes } from 'react';
import EditEntryDialog from './EditEntryDialog';
import { timeToS } from '../../common/utils/time';

import {
    Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn
  } from 'material-ui/Table';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';

const RECENT_UPDATE_TRESHOLD = 120 * 1000; // 2 minutes
const RECENT_UPDATE_COLOR = '#FFFF00';

function calculateDelta(a, b) {
  return (a.minutes * 60 + a.seconds) - (b.minutes * 60 + b.seconds);
}

function isRecentlyUpdated(timestamp) {
  let now = new Date();
  let time = new Date(timestamp);
  let ms = now - time;
  return ms < RECENT_UPDATE_TRESHOLD;
}

export default class TopList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editDialog: {
        title: '',
        contents: { name: '', time: '' },
        isNameLocked: false
      }
    };
  }

  modifyEntry(rowData, rowNumber) {
    let entry = rowData[rowNumber] || {name: '', time: ''};
    this.setState({
      editDialog: {
        title: 'Edit entry',
        contents: entry,
        isNameLocked: true
      }
    });

    this.refs.editEntryDialog.show();
  }

  addEntry() {
    this.setState({
      editDialog: {
        title: 'Add entry',
        contents: { name: '', time: '' },
        isNameLocked: false
      }
    });

    this.refs.editEntryDialog.show();
  }

  render() {
    const { times, suggestions } = this.props;

    let bestTime = (() => {
      if (times.length > 0) {
        return timeToS(times[0].time);

      }
      else {
        return 0;
      }
    })();

    let rowData = times.map((entry, index) => {
      return {
        position: index + 1,
        name: entry.name,
        time: entry.time,
        delta: '+' + calculateDelta(timeToS(entry.time), bestTime).toFixed(3),
        isRecentlyUpdated: isRecentlyUpdated(entry.timestamp)
      };
    });

    let header = (
      <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
        <TableRow>
          <TableHeaderColumn>Position</TableHeaderColumn>
          <TableHeaderColumn>Name</TableHeaderColumn>
          <TableHeaderColumn>Time</TableHeaderColumn>
          <TableHeaderColumn>Delta [s]</TableHeaderColumn>
        </TableRow>
      </TableHeader>
    );

    let highlightedTableRowStyle = {
      backgroundColor: RECENT_UPDATE_COLOR
    };

    return (
      <div>
        <Table displayRowCheckbox={false}
               onCellClick={
                 (rowNumber) => this.modifyEntry(rowData, rowNumber)
               }
               style={{cursor: 'pointer'}}
               displaySelectAll={false}>
          {header}
          <TableBody displayRowCheckbox={false} showRowHover={true}>
            {
              rowData.map((entry) =>
                <TableRow key={'top-list-entry-' + entry.position}
                          style={ entry.isRecentlyUpdated ?
                                  highlightedTableRowStyle :
                                  {} }>
                  <TableRowColumn>{entry.position}</TableRowColumn>
                  <TableRowColumn>{
                    entry.name +
                      (entry.isRecentlyUpdated && entry.position === 1 ?
                       ' prkl' :
                       '')
                  }</TableRowColumn>
                  <TableRowColumn>{entry.time}</TableRowColumn>
                  <TableRowColumn>{entry.delta}</TableRowColumn>
                </TableRow>
              )
            }
          </TableBody>
        </Table>
        <FloatingActionButton style={{marginTop: '15px', marginLeft: '15px'}}
                              secondary={true}
                              mini={true}
                              onClick={() => this.addEntry()}>
          <FontIcon className="material-icons">add</FontIcon>
        </FloatingActionButton>
        <EditEntryDialog
          ref='editEntryDialog'
          title={this.state.editDialog.title}
          date={this.props.date}
          name={this.state.editDialog.contents.name}
          time={this.state.editDialog.contents.time}
          isNameLocked={this.state.editDialog.isNameLocked}
          suggestions={suggestions} />
      </div>
    );
  }
}

TopList.propTypes = {
  date: PropTypes.string.isRequired,
  times: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired
  })),
  suggestions: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
};
