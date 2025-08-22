import React from 'react';
import ReactApexChart from 'react-apexcharts';

const ApexChart = ({ scoreByLevel }) => {
  // Extract cognitive levels from scoreByLevel keys
  const cognitiveLevels = Object.keys(scoreByLevel);
  
  // Prepare data for the series
  const questionCounts = cognitiveLevels.map(level => scoreByLevel[level].total);
  const correctCounts = cognitiveLevels.map(level => scoreByLevel[level].correct);

  const options = {
    chart: {
      type: 'bar',
      height: 150,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: cognitiveLevels.map(level => level.charAt(0).toUpperCase() + level.slice(1)),
      labels: {
        style: {
          colors: '#000000' // Set x-axis labels text color to black
        }
      }
    },
    yaxis: {
      title: {
        text: 'Number of Questions',
        style: {
          color: '#000000' // Set y-axis title text color to black
        }
      },
      min: 0,
      tickAmount: 5,
      labels: {
        style: {
          colors: '#000000' // Set y-axis labels text color to black
        }
      }
    },
    fill: {
      opacity: 1
    },
    colors: ['#8884d8', '#82ca9d'],
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " question" + (val !== 1 ? "s" : "");
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      labels: {
        colors: '#000000' // Set legend text color to black
      }
    }
  };

  const series = [
    {
      name: 'Total Questions',
      data: questionCounts
    },
    {
      name: 'Correct Answers',
      data: correctCounts
    }
  ];

  return (
    <div style={{ width: '100%' }}>
      <ReactApexChart 
        options={options} 
        series={series} 
        type="bar" 
        height={250} 
      />
    </div>
  );
};

export default ApexChart;