import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Row, Col } from 'antd';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';

const { Title, Text } = Typography;

const TotalAttempts = () => {
  const [attemptsData, setAttemptsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttemptsData = async () => {
      try {
        const studentId = localStorage.getItem('userId');
        if (!studentId) {
          throw new Error('Student ID not found');
        }

        const response = await axios.get(
          `http://localhost:5000/api/student-progress/attempts/${studentId}`
        );

        if (response.data && response.data.data) {
          setAttemptsData(response.data.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptsData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!attemptsData) {
    return <div>No data available</div>;
  }

  // Safely get data with fallbacks
  const totalAttempts = attemptsData.totalAttempts || 0;
  const overallAvgScore = attemptsData.overallAvgScore !== undefined ? attemptsData.overallAvgScore : 0;
  const levels = attemptsData.levels || [];

  // Prepare attempts chart data (smaller version)
  const attemptsChartOptions = {
    series: levels.map(level => level.attempts || 0),
    chart: {
      height: 250, // Reduced from 350
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 5,
          size: '30%',
          background: 'transparent',
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: false,
          }
        },
        barLabels: {
          enabled: true,
          useSeriesColors: true,
          offsetX: -8,
          fontSize: '12px', // Smaller font
          formatter: function(seriesName, opts) {
            return ` ${opts.seriesIndex + 1}: ${opts.w.globals.series[opts.seriesIndex]}`;
          },
        },
      }
    },
    colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800'],
    labels: levels.map(level => `Level ${level.level || 0}`),
  };

  // Prepare scores chart data (smaller version)
  const scoresChartOptions = {
    series: levels.map(level => level.avgScore || 0),
    chart: {
      height: 250, // Reduced from 350
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 5,
          size: '30%',
          background: 'transparent',
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: false,
          }
        },
        barLabels: {
          enabled: true,
          useSeriesColors: true,
          offsetX: -8,
          fontSize: '12px', // Smaller font
          formatter: function(seriesName, opts) {
            const value = opts.w.globals.series[opts.seriesIndex];
            return ` ${opts.seriesIndex + 1}: ${typeof value === 'number' ? value.toFixed(2) : '0.00'}`;
          },
        },
      }
    },
    colors: ['#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50'],
    labels: levels.map(level => `Level ${level.level || 0}`),
  };

  return (
    <div 
      style={{ 
        marginTop: '1px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '0px'
      }}
    >
      
      {/* Enhanced Stats Cards Row */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card 
            bordered={false} 
            style={{ 
              background: '#f6ffed',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Text strong style={{ fontSize: '10px', display: 'block', marginBottom: '0px' }}>
              Total Attempts
            </Text>
            <Title level={2} style={{ color: '#4CAF50', margin: 0 }}>
              {totalAttempts}
            </Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            bordered={false} 
            style={{ 
              background: '#e6f7ff',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Text strong style={{ fontSize: '10px', display: 'block', marginBottom: '8px' }}>
              Overall Average Score
            </Text>
            <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
              {typeof overallAvgScore === 'number' ? overallAvgScore.toFixed(2) : '0.00'}
            </Title>
          </Card>
        </Col>
      </Row>
      
      {/* Smaller Charts Row */}
      <Row gutter={16}>
        <Col xs={12} md={8}>
          
            <ReactApexChart 
              options={attemptsChartOptions} 
              series={attemptsChartOptions.series} 
              type="radialBar" 
              height={180} 
            />
        </Col>
        <Col xs={24} md={12}>
            <ReactApexChart 
              options={scoresChartOptions} 
              series={scoresChartOptions.series} 
              type="radialBar" 
              height={180} 
            />
        </Col>
      </Row>
    </div>
  );
};

export default TotalAttempts;