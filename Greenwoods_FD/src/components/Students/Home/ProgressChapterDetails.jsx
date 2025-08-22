import React, { useEffect, useState } from 'react';
import { Spin, Button, Alert } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { FaArrowLeft } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ProgressGraphCard from './ProgressGraphCard';
import noDataJpg from '../../../assets/nodata.jpg';
const ProgressChapterDetails = ({ chapterId, onBack }) => {
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    attempts: []
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableLevels, setAvailableLevels] = useState([]); // Declare state for available levels
  const userId = localStorage.getItem('userId');
  const maxScore = 45; // Define the max score as 45 for each attempt

  useEffect(() => {
    const processData = (rawData) => {
        let totalAttempts = 0;
        let totalScore = 0;
        const allAttempts = [];
        const levels = [1, 2, 3, 4, 5];
        const chartPoints = [];
        const allTimestamps = Array.from(new Set(
          levels.flatMap(level => 
            (rawData[level] || []).map(attempt => attempt.timestamp)
          )
        )).sort();
      
        levels.forEach(level => {
          const levelAttempts = rawData[level] || [];
          levelAttempts.forEach(attempt => {
            totalAttempts++;
            totalScore += attempt.score;
            allAttempts.push({
              ...attempt,
              level,
              date: new Date(attempt.timestamp).toLocaleDateString(),
              time: new Date(attempt.timestamp).toLocaleTimeString(),
              percentage: ((attempt.score / maxScore) * 100).toFixed(1)
            });
          });
        });
      
        allTimestamps.forEach(timestamp => {
          const point = { timestamp };
          levels.forEach(level => {
            const attempt = (rawData[level] || []).find(a => a.timestamp === timestamp);
            if (attempt) { // Only add the level's score if an attempt exists
              point[`level${level}`] = attempt.score;
            }
          });
          chartPoints.push(point);
        });
      
        const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0;
        const averagePercentage = ((averageScore / maxScore) * 100).toFixed(1);
      
        return {
          stats: {
            totalAttempts,
            averageScore,
            averagePercentage,
            attempts: allAttempts.sort((a, b) => 
              new Date(b.timestamp) - new Date(a.timestamp)
            )
          },
          chartData: chartPoints,
          availableLevels: Object.keys(rawData)
        };
      };

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/student-progress/get-chapter-details/${userId}/${chapterId}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const result = await response.json();
        const processed = processData(result.chapterProgress || {});
        
        setStats(processed.stats);
        setChartData(processed.chartData);
        setAvailableLevels(processed.availableLevels); // Update availableLevels state with available levels

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId && chapterId) fetchData();
  }, [chapterId, userId]);

  const getChartColor = (level) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
    return colors[level - 1] || '#000';
  };

  const renderLevelGraph = (level) => {
    // Check if the level exists in availableLevels
    if (!availableLevels.includes(level.toString())) return null;
  
    // Filter data to include only entries with this level's data
    const filteredData = chartData.filter(entry => 
      entry[`level${level}`] !== undefined
    );
  
    return (
      <ProgressGraphCard 
        key={level} 
        level={level} 
        data={filteredData} // Pass filtered data
      />
    );
  };

  // Combined Graph (showing all levels in a single chart)
  // Combined Graph (showing all levels in a single chart)
  const CombinedGraph = () => (
    <div style={{ ...chartSection, marginTop: '2rem' }}>
      <h2 style={sectionTitle}>Progress Across All Levels</h2>
      <div style={chartContainer}>
        <ResponsiveContainer width="80%" height={300}>
          <LineChart data={chartData}>
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={() => ''} // Hide timestamp labels
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#7f8c8d' }}
            />
            <YAxis 
              domain={[0, 45]}  // Y-axis scale from 0 to 45
              axisLine={false}   
              tickLine={false} 
              tickCount={45}
              tick={{ fontSize: 12, fill: '#7f8c8d' }}
            />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleString()}
              formatter={(value) => `${(value / maxScore * 100).toFixed(0)}%`}
            />
            <Legend />
            {[1, 2, 3, 4, 5].map(level => (
              availableLevels.includes(level.toString()) && (
                <Line 
                  key={level}
                  type="linear"
                  dataKey={`level${level}`}
                  name={`Level ${level}`}
                  stroke={getChartColor(level)}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls={true} // This connects missing data points
                  animationDuration={300}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
  

  const NoDataSection = () => (
    <div style={noDataContainer}>
      <div style={noDataIcon}>
        <img 
          src={noDataJpg}  // Use the imported image
          alt="No Data" 
          style={noDataImage}
        />
      </div>
      <div style={noDataMessage}>
        <h2 style={noDataTitle}>No Data Available</h2>
        <p style={noDataDescription}>
          It seems like there's no data for this chapter yet. Please check back later or try reloading.
        </p>
        <Button onClick={() => window.location.reload()} style={retryButtonStyle}>Retry</Button>
      </div>
    </div>
  );

  // No Data Check
  if (chartData.length === 0 || availableLevels.length === 0) {
    return (
      <div style={containerStyle}>
        <Button onClick={onBack} style={backButtonStyle}>
          <FaArrowLeft /> Back to Chapters
        </Button>
        <div style={contentStyle}>
          <NoDataSection />
        </div>
      </div>
    );
  }

  if (loading) return <Spin indicator={<LoadingOutlined style={spinStyle} spin />} />;

  return (
    <div style={containerStyle}>
      <Button onClick={onBack} style={backButtonStyle}>
        <FaArrowLeft /> Back to Chapters
      </Button>

      {error && <Alert message="Error" description={error} type="error" showIcon />}

      <div style={contentStyle}>
        {/* Stats Section: Total Attempts, Average Score, Average Percentage */}
        <div style={statsContainer}>
          <div style={statCard}>
            <h3 style={statTitle}>Total Attempts</h3>
            <div style={statValue}>{stats.totalAttempts}</div>
          </div>
          <div style={statCard}>
            <h3 style={statTitle}>Average Score</h3>
            <div style={statValue}>
              {stats.averageScore.toFixed(1)} / {maxScore}
            </div>
          </div>
          <div style={statCard}>
            <h3 style={statTitle}>Average Percentage</h3>
            <div style={statValue}>{stats.averagePercentage}%</div>
          </div>
        </div>

        {/* Previous Attempts History Section */}
        <div style={attemptsSection}>
  <h2 style={sectionTitle}>Previous Attempts History</h2>
  <div style={attemptsList}>
    {stats.attempts.length > 0 ? (
      stats.attempts.map((attempt, index) => (
        <div key={index} style={attemptItem}>
          <div style={attemptHeader}>
            <span style={attemptLevel}>Level {attempt.level}</span>
            <span style={scoreBadge(attempt.score)}>
              {(attempt.score / maxScore * 100).toFixed(0)}%
            </span>
          </div>
          <div style={attemptMeta}>
            <span style={timeStamp}>{attempt.date}</span>
            <span style={timeStamp}>{attempt.time}</span>
          </div>
        </div>
      ))
    ) : (
      <p style={noAttempts}>No attempts recorded</p>
    )}
  </div>
</div>

        {/* Display Combined Graph */}
        <CombinedGraph />

        {/* Display Individual Level Graphs */}
        {[1, 2, 3, 4, 5].map(level => renderLevelGraph(level))}
      </div>
    </div>
  );
};

// Style constants (same as before)
const containerStyle = {
  padding: '2rem',
  minHeight: '100vh',
  backgroundColor: '#f4f7fa',
  fontFamily: "'Roboto', sans-serif",
  maxWidth: '1200px',
  margin: '0 auto'
};

const contentStyle = {
  backgroundColor: 'white',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  padding: '2rem',
  marginTop: '1rem'
};

const statsContainer = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '2rem'
};

const statCard = {
  background: '#fff',
  borderRadius: '8px',
  padding: '1.5rem',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  width: '30%',
  textAlign: 'center'
};

const statTitle = {
  fontSize: '1.2rem',
  fontWeight: 'bold',
  color: '#34495e',
  marginBottom: '1rem'
};

const statValue = {
  fontSize: '2rem',
  fontWeight: '700',
  color: '#2C3E50'
};

const sectionTitle = {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#34495e',
  marginBottom: '1rem'
};

const attemptsSection = {
  marginTop: '3rem'
};

const attemptsList = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxHeight: '300px',  // You can adjust this height as per your requirement
    overflowY: 'auto',   // This enables vertical scrolling
  };
  

const attemptItem = {
  backgroundColor: '#f7f7f7',
  padding: '1rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const attemptHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '1rem'
};

const attemptLevel = {
  fontWeight: '600',
  color: '#2C3E50'
};
const chartSection = {
  marginBottom: '2rem',
  padding: '1rem',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
};
const chartContainer = {
    width: '100%',  // Reduce width to 80% of the available space
    height: '300px',  // Adjust the height of the chart container
    margin: '0 auto',  // Center it horizontally
  };
  

const scoreBadge = (score) => ({
  backgroundColor: '#e74c3c',
  color: '#fff',
  borderRadius: '5px',
  padding: '0.3rem 0.7rem',
  fontWeight: 'bold'
});

const attemptMeta = {
  fontSize: '0.9rem',
  color: '#7f8c8d'
};

const timeStamp = {
  marginRight: '1rem'
};

const noAttempts = {
  fontStyle: 'italic',
  color: '#bdc3c7'
};

const noDataContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  padding: '2rem',
  backgroundColor: '#f7f7f7',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  marginTop: '2rem',
  textAlign: 'center'
};

const noDataIcon = {
  marginBottom: '1rem',
  display: 'flex',
  justifyContent: 'center', // Centers the image horizontally
  alignItems: 'center',     // Centers the image vertically if necessary
  marginBottom: '20px',     // Optional: adds space between the image and message
};

const noDataImage = {
  width: '50%',
  height: '50%',
};

const noDataMessage = {
  color: '#2C3E50',
};

const noDataTitle = {
  fontSize: '1.8rem',
  fontWeight: '700',
  color: '#E74C3C',
  marginBottom: '1rem'
};

const noDataDescription = {
  fontSize: '1rem',
  color: '#7f8c8d',
  marginBottom: '1.5rem'
};

const retryButtonStyle = {
  backgroundColor: '#2C3E50',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'background-color 0.3s ease',
};

retryButtonStyle[':hover'] = {
  backgroundColor: '#34495E',
};

const backButtonStyle = {
  marginBottom: '1rem',
  backgroundColor: '#2C3E50',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  ':hover': {
    backgroundColor: '#1A252F'
  }
};

const spinStyle = {
  fontSize: '24px',
  display: 'block',
  margin: '2rem auto'
};

export default ProgressChapterDetails;
