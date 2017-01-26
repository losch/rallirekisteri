import React, { Component, PropTypes } from 'react';
import d3 from 'd3';
import { LineChart } from 'react-d3';

export default class ScorePlot extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { scores } = this.props;

    let datum = [];
    let drivers = {};

    // Collect scores per driver
    scores.forEach((day) => {
      day.forEach((entry) => {
        let { date, name, score } = entry;
        let driver = drivers[name] || {};
        driver[date] = score;
        drivers[name] = driver;
      });
    });

    // Convert scores per driver to chart data

    // The below code may fail when time machine is invented!
    let minDay = new Date('2100');
    let maxDay = new Date('1970');

    let minPoint = 9999;
    let maxPoint = 0;

    Object.keys(drivers).forEach((name) => {
      let driver = drivers[name];
      let values = [];

      Object.keys(driver)
            .sort((dateA, dateB) => dateA > dateB)
            .forEach((date) => {
        let score = driver[date];
        let previousScore = values.length > 0 ?
                            values[values.length - 1].y :
                            0;
        let scoreSum = previousScore + score;

        let day = new Date(date);

        if (minPoint > scoreSum) minPoint = scoreSum;
        if (maxPoint < scoreSum) maxPoint = scoreSum;

        if (minDay > day) minDay = day;
        if (maxDay < day) maxDay = day;

        values.push({
          x: new Date(date),
          y: scoreSum
        });
      });

      let dataPoint = {
        name: name,
        values: values
      };

      datum.push(dataPoint);
    });

    // Generate x axis tick values from 1 to 31
    let xAxisTickValues = [];
    for (let day = new Date(minDay);
         day <= maxDay;
         day = new Date(
           new Date(day).setDate(day.getDate() + 1))) {
      xAxisTickValues.push(day);
    }

    let yAxisTickValues = [];
    let step = parseInt(((maxPoint - minPoint) / 5).toFixed());
    if (step < 1) step = 1;

    for (let point = minPoint; point <= maxPoint; point += step) {
      yAxisTickValues.push(point);
    }
    // Add maxPoint, if it's missing
    if (yAxisTickValues[yAxisTickValues.length - 1] != maxPoint) {
      yAxisTickValues.push(maxPoint);
    }

    let chart;

    // Warning: the width and height parameters seem to be extremely volatile
    if (datum && datum.length > 0) {
      chart = (
        <LineChart
          legend={true}
          data={datum}
          gridHorizontal={true}
          gridVertical={true}
          width="100%"
          height={400}
          yAxisLabel='Points'
          xAxisLabel='Date'
          xAxisTickValues={xAxisTickValues}
          yAxisTickValues={yAxisTickValues}
          xAxisFormatter={(x) => x.getDate()}
          yAxisFormatter={(y) => parseInt(y)}
          viewBoxObject={{
            x: 0,
            y: 0,
            width: 500,
            height: 400
          }}
          />
      );
    }

    return (
      <div style={this.props.style}>{chart}</div>
    );
  }
}

ScorePlot.propTypes = {
  scores: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string,
        name: PropTypes.string,
        score: PropTypes.number
      })
    )
  ).isRequired
};
