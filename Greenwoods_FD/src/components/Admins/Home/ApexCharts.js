import React from 'react';
import ReactApexChart from 'react-apexcharts';

const ApexChart = ({ scoreByLevel }) => {
  const chartData = Object.entries(scoreByLevel).map(([level, { correct, total }]) => ({
    x: level,
    y: correct,
    goals: [
      {
        name: 'Total',
        value: total,
        strokeWidth: 2,
        strokeDashArray: 2,
        strokeColor: '#775DD0'
      }
    ]
  }));

  const options = {
    chart: {
      height: 350,
      type: 'bar'
    },
    plotOptions: {
      bar: {
        horizontal: true,
      }
    },
    colors: ['#00E396'],
    dataLabels: {
      style: {
        colors: ['#000000'] // Set data labels text color to black
      },
      formatter: function(val, opt) {
        const goals =
          opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex]
            .goals
    
        if (goals && goals.length) {
          return `${val} / ${goals[0].value}`
        }
        return val
      }
    },
    legend: {
      show: true,
      showForSingleSeries: true,
      customLegendItems: ['Correct', 'Total'],
      markers: {
        fillColors: ['#00E396', '#775DD0']
      },
      labels: {
        colors: '#000000' // Set legend text color to black
      }
    },
    xaxis: {
      categories: Object.keys(scoreByLevel),
      labels: {
        style: {
          colors: '#000000' // Set x-axis labels text color to black
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#000000' // Set y-axis labels text color to black
        }
      }
    }
  };

  const series = [{
    name: 'Correct',
    data: chartData
  }];

  return (
    <div>
      <div id="chart">
        <ReactApexChart options={options} series={series} type="bar" height={350} />
      </div>
    </div>
  );
};

export default ApexChart;