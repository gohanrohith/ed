import React, { useEffect, useState } from 'react';
import { Typography, Spin, Card, Row, Col, Empty, Button } from 'antd';
import ReactApexChart from 'react-apexcharts';

// Sample illustrations (replace with your actual image paths)
const errorIllustration = (
  <svg width="200" height="160" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M200 150C200 67.157 267.157 0 350 0C432.843 0 500 67.157 500 150C500 232.843 432.843 300 350 300C267.157 300 200 232.843 200 150Z" fill="#FFF2F0"/>
    <path d="M350 100V170M350 200V210" stroke="#FF4D4F" strokeWidth="4" strokeLinecap="round"/>
    <path d="M150 50H50V250H150V50Z" fill="#F5F5F5" stroke="#D9D9D9" strokeWidth="2"/>
    <path d="M80 100H120M80 150H120M80 200H120" stroke="#D9D9D9" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const emptyIllustration = (
  <svg width="200" height="160" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M200 150C200 67.157 267.157 0 350 0C432.843 0 500 67.157 500 150C500 232.843 432.843 300 350 300C267.157 300 200 232.843 200 150Z" fill="#F6FFED"/>
    <path d="M350 120L330 150L350 180L370 150L350 120Z" fill="#52C41A" stroke="#52C41A" strokeWidth="2"/>
    <path d="M150 50H50V250H150V50Z" fill="#F5F5F5" stroke="#D9D9D9" strokeWidth="2"/>
    <path d="M80 100H120M80 150H120M80 200H120" stroke="#D9D9D9" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const noDataIllustration = (
  <svg width="200" height="160" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M200 150C200 67.157 267.157 0 350 0C432.843 0 500 67.157 500 150C500 232.843 432.843 300 350 300C267.157 300 200 232.843 200 150Z" fill="#FFFBE6"/>
    <path d="M350 120C350 151.142 324.142 177 293 177C261.858 177 236 151.142 236 120C236 88.858 261.858 63 293 63C324.142 63 350 88.858 350 120Z" fill="#FAAD14"/>
    <path d="M293 100V140M293 160V170" stroke="#FFF" strokeWidth="4" strokeLinecap="round"/>
    <path d="M150 50H50V250H150V50Z" fill="#F5F5F5" stroke="#D9D9D9" strokeWidth="2"/>
    <path d="M80 100H120M80 150H120M80 200H120" stroke="#D9D9D9" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const { Title, Text } = Typography;

const LatestLevelDetails = ({ studentId, chapterId }) => {
  const [loading, setLoading] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [error, setError] = useState(null);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    const fetchProgressDetails = async () => {
      try {
        if (!studentId || !chapterId) {
          setProgressData(null);
          setNoData(false);
          return;
        }

        setLoading(true);
        setError(null);
        setNoData(false);
        
        const response = await fetch(
          `http://localhost:5000/api/student-progress-details/progress/student/${studentId}/chapter/${chapterId}`
        );

        if (!response.ok) {
          throw new Error('We couldn\'t retrieve the progress data at this time. Please try again later.');
        }

        const result = await response.json();
        
        if (result.message === "No progress found for this student in this chapter") {
          setNoData(true);
          setProgressData(null);
        } else {
          setProgressData(result.data?.[0] || null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressDetails();
  }, [studentId, chapterId]);

  const renderCognitiveBreakdownChart = (progress) => {
    if (!progress) return null;

    const levelColors = {
      remember: '#9254de',
      understand: '#36cfc9',
      apply: '#4096ff',
      analyse: '#ff7a45',
      evaluate: '#ff4d4f'
    };

    const chartData = Object.entries(progress)
      .filter(([level]) => levelColors[level])
      .map(([level, { questionCount, correctCount }]) => ({
        x: level.charAt(0).toUpperCase() + level.slice(1),
        y: correctCount,
        fillColor: levelColors[level],
        goals: [
          {
            name: 'Total Questions',
            value: questionCount,
            strokeWidth: 2,
            strokeDashArray: 2,
            strokeColor: '#d9d9d9',
          },
        ],
      }));

    const options = {
      chart: {
        height: 350,
        type: 'bar',
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          dataLabels: { position: 'top' },
        },
      },
      colors: chartData.map(item => item.fillColor),
      dataLabels: {
        enabled: true,
        formatter: function(val, opt) {
          const goals = opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex].goals;
          return goals && goals.length ? `${val}/${goals[0].value}` : val;
        },
        style: { fontSize: '12px', colors: ['#333'] }
      },
      legend: {
        show: true,
        customLegendItems: ['Correct Answers', 'Total Questions'],
        markers: { fillColors: ['#00E396', '#d9d9d9'] },
      },
      tooltip: {
        y: {
          formatter: function(val, opts) {
            const goals = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].goals;
            return `Correct: ${val} / Total: ${goals[0].value}`;
          }
        }
      },
      xaxis: { categories: chartData.map(item => item.x) },
      grid: { borderColor: '#f0f0f0' }
    };

    return (
      <ReactApexChart
        options={options}
        series={[{ name: 'Cognitive Levels', data: chartData }]}
        type="bar"
        height={350}
      />
    );
  };

  if (!chapterId) {
    return (
      <Card style={{ textAlign: 'center', padding: '24px', border: 'none' }}>
        <Empty
          image={emptyIllustration}
          description={
            <Text style={{ color: '#595959', fontSize: 16 }}>
              Select a chapter to view detailed progress analytics
            </Text>
          }
        />
      </Card>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" tip="Gathering progress insights..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card style={{ textAlign: 'center', padding: '24px', border: 'none' }}>
        <Empty
          image={errorIllustration}
          description={
            <div>
              <Text style={{ color: '#ff4d4f', fontSize: 16, display: 'block', marginBottom: 16 }}>
                Unable to Load Progress Data
              </Text>
              <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                {error}
              </Text>
            </div>
          }
        />
      </Card>
    );
  }

  if (noData) {
    return (
      <Card style={{ textAlign: 'center', padding: '24px', border: 'none' }}>
        <Empty
          image={noDataIllustration}
          description={
            <div>
              <Text style={{ color: '#faad14', fontSize: 16, display: 'block', marginBottom: 8 }}>
                No Progress Records Found
              </Text>
              <Text type="secondary">
                This student hasn't completed any activities in the selected chapter yet
              </Text>
            </div>
          }
        />
      </Card>
    );
  }

  return (
    <Card 
      title="Learning Progress Analytics"
      style={{ marginTop: '16px' }}
      headStyle={{ borderBottom: '1px solid #f0f0f0' }}
    >
      {progressData ? (
        <div style={{ padding: '12px' }}>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={8}>
              <Card size="small" style={{ background: '#f9f9f9' }}>
                <Text type="secondary">Current Level</Text>
                <Title level={3} style={{ marginTop: 8, color: '#1890ff' }}>
                  {progressData.level}
                </Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card size="small" style={{ background: '#f9f9f9' }}>
                <Text type="secondary">Performance Score</Text>
                <Title level={3} style={{ marginTop: 8, color: '#52c41a' }}>
                  {progressData.score?.toFixed(2) || '0.00'}
                </Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card size="small" style={{ background: '#f9f9f9' }}>
                <Text type="secondary">Time Spent</Text>
                <Title level={3} style={{ marginTop: 8, color: '#faad14' }}>
                  {progressData.totalTimeInSeconds || 0}s
                </Title>
              </Card>
            </Col>
          </Row>
          
          <Title level={5} style={{ marginBottom: '16px', color: '#595959' }}>
            Cognitive Skills Breakdown
          </Title>
          
          {renderCognitiveBreakdownChart(progressData.progress)}
        </div>
      ) : null}
    </Card>
  );
};

export default LatestLevelDetails;