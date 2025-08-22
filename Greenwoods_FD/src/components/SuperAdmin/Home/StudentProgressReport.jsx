import React, { useEffect, useState } from 'react';
import { Spin, Alert } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentProgressReport = ({ studentId, chapterId }) => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/student-progress/get-chapter-details/${studentId}/${chapterId}`);
        if (!response.ok) throw new Error('Failed to fetch progress');

        const data = await response.json();

        // Transform data into Recharts format
        const formattedData = Object.entries(data.chapterProgress || {}).map(([level, attempts]) => ({
          level,
          averageScore: attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length || 0
        }));

        setProgressData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [studentId, chapterId]);

  if (loading) return <Spin indicator={<LoadingOutlined style={spinStyle} spin />} />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <div style={containerStyle}>
      <h2>Chapter Progress</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={progressData}>
          <XAxis dataKey="level" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="averageScore" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Styles
const containerStyle = { padding: '2rem', backgroundColor: '#fff', borderRadius: '8px' };
const spinStyle = { fontSize: '24px', display: 'block', margin: '2rem auto' };

export default StudentProgressReport;
