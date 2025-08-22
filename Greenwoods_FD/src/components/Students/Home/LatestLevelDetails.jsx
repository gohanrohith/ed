import React, { useEffect, useState } from 'react';
import { Typography, Spin, Card, Row, Col } from 'antd';
import ReactApexChart from 'react-apexcharts';

const { Title, Text } = Typography;

const LatestLevelDetails = () => {
  const [loading, setLoading] = useState(true);
  const [progressDetails, setProgressDetails] = useState([]);
  const [error, setError] = useState(null);

  // Function to convert seconds to hh:mm:ss format
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  useEffect(() => {
    const fetchProgressDetails = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found in localStorage');
        }

        const response = await fetch(
          `http://localhost:5000/api/student-progress-details/progress/recent/${userId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch progress details');
        }

        const data = await response.json();
        setProgressDetails(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressDetails();
  }, []);

  const renderCognitiveBreakdownChart = (levelData) => {
    if (!levelData || !levelData.progress) return null;

    const cognitiveLevels = Object.keys(levelData.progress);
    const questionCounts = cognitiveLevels.map(level => levelData.progress[level].questionCount);
    const correctCounts = cognitiveLevels.map(level => levelData.progress[level].correctCount);

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
      },
      yaxis: {
        title: {
          text: 'Number of Questions'
        },
        min: 0,
        tickAmount: 5
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
        horizontalAlign: 'center'
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

  if (loading) {
    return <Spin size="small" />;
  }

  if (error) {
    return <Text type="danger">{error}</Text>;
  }

  return (
    <div style={{ padding: '0px' }}>
      <Row gutter={[16, 16]}>
        {progressDetails.length > 0 ? (
          progressDetails.map((levelData) => (
            <Col
              key={levelData._id}
              xs={32}
              sm={32}
              md={24}
              lg={24}
              xl={24}
              style={{ marginBottom: '10px' }}
            >
              <Card
                title={`Level ${levelData.level} - ${levelData.chapterId?.chapterName || 'Unknown Chapter'}`}
                bordered={false}
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  height: '80%',
                  width:'50%',
                  fontSize:'8px',
                }}
              >
                <div style={{ marginBottom: '10px' }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong>Score: </Text>
                      <Text>{levelData.score}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Time Taken: </Text>
                      <Text>{formatTime(levelData.totalTimeInSeconds)}</Text>
                    </Col>
                  </Row>
                </div>
                {renderCognitiveBreakdownChart(levelData)}
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Text>No progress details found.</Text>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default LatestLevelDetails;