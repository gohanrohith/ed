import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ProgressGraphCard = ({ level, data }) => (
  <div style={{ margin: '1rem 0' }}>
    <h3>Level {level} Progress</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="timestamp" />
        <YAxis domain={[0, 45]} />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default ProgressGraphCard;
