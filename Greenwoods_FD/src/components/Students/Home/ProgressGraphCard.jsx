import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ProgressGraphCard = ({ level, data }) => {
  const getChartColor = (level) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
    return colors[level - 1] || '#000';
  };

  return (
    <div style={cardStyle}>
      <h3 style={cardTitle}>Level {level} Progress</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={() => ''} // Hide timestamp labels
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            domain={[0, 45]}  // Y-axis scale from 0 to 45
            axisLine={false}   
            tickLine={false}   
          />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleString()}  // Format timestamp
            formatter={(value) => `${value}`}  // Show raw score without percentage
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={`level${level}`}
            name={`Level ${level}`}
            stroke={getChartColor(level)}
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
// Style for the individual graph card
const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '1.5rem',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  marginBottom: '1.5rem',
  overflow: 'hidden',  // Ensure contents are contained within the card
};

const cardTitle = {
  color: '#2C3E50',
  marginBottom: '1rem',
  fontWeight: '600',
  fontSize: '1.2rem', // Customize title font size
};

export default ProgressGraphCard;
