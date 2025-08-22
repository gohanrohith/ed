import React, { useEffect, useState } from 'react';
import { Spin, Alert, Button } from 'antd';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FaArrowLeft } from 'react-icons/fa';

const ProgressChapterDetails = ({ studentId, chapterId }) => {
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    attempts: []
  });
  const [chartData, setChartData] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const maxScore = 45; // Max score per attempt

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      setError(null);
      setChartData([]);
      setAvailableLevels([]);

      try {
        const response = await fetch(
          `http://localhost:5000/api/student-progress/get-chapter-details/${studentId}/${chapterId}`
        );

        if (!response.ok) throw new Error('Failed to fetch progress');

        const result = await response.json();
        processProgressData(result.chapterProgress || {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId && chapterId) fetchProgress();
  }, [chapterId, studentId]);

  const processProgressData = (rawData) => {
    let totalAttempts = 0;
    let totalScore = 0;
    const allAttempts = [];
    const levels = [1, 2, 3, 4, 5];
    const chartPoints = [];

    const allTimestamps = Array.from(
      new Set(levels.flatMap(level => (rawData[level] || []).map(attempt => attempt.timestamp)))
    ).sort();

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
        if (attempt) {
          point[`level${level}`] = attempt.score;
        }
      });
      chartPoints.push(point);
    });

    const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0;
    const averagePercentage = ((averageScore / maxScore) * 100).toFixed(1);

    setStats({
      totalAttempts,
      averageScore,
      averagePercentage,
      attempts: allAttempts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });
    setChartData(chartPoints);
    setAvailableLevels(Object.keys(rawData));
  };

  const getChartColor = (level) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
    return colors[level - 1] || '#000';
  };

  const renderLevelGraph = (level) => {
    if (!availableLevels.includes(level.toString())) return null;

    const filteredData = chartData.filter(entry => entry[`level${level}`] !== undefined);

    return (
      <div key={level} style={graphCard}>
        <h3 style={graphTitle}>Level {level} Progress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            {/*<XAxis dataKey="timestamp" tickFormatter={() => ''} />
            <YAxis domain={[0, 45]} />*/}
            <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />

            <Line 
              type="monotone"
              dataKey={`level${level}`}
              stroke={getChartColor(level)}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const CombinedGraph = () => (
      <div style={{ ...chartSection, marginTop: '2rem' }}>
        <h2 style={sectionTitle}>Progress Across All Levels</h2>
        <div style={chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={() => ''} // Hide timestamp labels
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#7f8c8d' }}
              />
              {/*<YAxis 
                domain={[0, 45]}  // Y-axis scale from 0 to 45
                axisLine={false}   
                tickLine={false} 
                tickCount={45}
                tick={{ fontSize: 12, fill: '#7f8c8d' }}
              />*/}
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
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <div style={containerStyle}>
      

      {/* Stats Section */}
      <div style={statsContainer}>
        <div style={statCard}><h3>Total Attempts</h3><p>{stats.totalAttempts}</p></div>
        <div style={statCard}><h3>Average Score</h3><p>{stats.averageScore.toFixed(1)} / {maxScore}</p></div>
        <div style={statCard}><h3>Average Percentage</h3><p>{stats.averagePercentage}%</p></div>
      </div>

      {/* Combined Graph */}
      <CombinedGraph />

      {/* Individual Level Graphs */}
      {[1, 2, 3, 4, 5].map(level => renderLevelGraph(level))}
    </div>
  );
};

// Styles
const containerStyle = { padding: '2rem', backgroundColor: '#f4f7fa', maxWidth: '1200px', margin: '0 auto' };
const backButtonStyle = { marginBottom: '1rem', backgroundColor: '#2C3E50', color: '#fff' };
const statsContainer = { display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' };
const statCard = { background: '#fff', padding: '1rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', width: '30%' };
const graphCard = { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '1.5rem' };
const graphTitle = { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#34495e' };
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
  const sectionTitle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#34495e',
    marginBottom: '1rem'
  };
    
export default ProgressChapterDetails;
