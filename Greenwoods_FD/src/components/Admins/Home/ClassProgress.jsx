import React, { useState, useEffect } from 'react';
import { Modal, Spin, Row, Col, Select, Card, Typography } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Option } = Select;
const { Title, Text } = Typography;

const ProgressGraphCard = ({ level, data }) => (
  <Card
    title={`Level ${level} Progress`}
    style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
  >
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="timestamp" />
        <YAxis domain={[0, 45]} />
        <Tooltip
          labelFormatter={(value) => `Month: ${value}`}
          formatter={(value) => `${value}`}
        />
        <Line
          type="monotone"
          dataKey={`level${level}`}
          stroke="#1890ff"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

const CombinedGraph = ({ chartData, availableLevels }) => {
  const getChartColor = (level) => {
    const colors = ['#1890ff', '#52c41a', '#ff4d4f', '#faad14', '#13c2c2'];
    return colors[level - 1] || '#000';
  };

  return (
    <Card
      title="Progress Across All Levels"
      style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => `Month ${value}`}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#7f8c8d' }}
          />
          <YAxis
            domain={[0, 45]}
            axisLine={false}
            tickLine={false}
            tickCount={45}
            tick={{ fontSize: 12, fill: '#7f8c8d' }}
          />
          <Tooltip
            labelFormatter={(value) => `Month: ${value}`}
            formatter={(value) => `${value}`}
          />
          <Legend />
          {[1, 2, 3, 4, 5].map((level) =>
            availableLevels.includes(level.toString()) && (
              <Line
                key={level}
                type="linear"
                dataKey={`level${level}`}
                name={`Level ${level}`}
                stroke={getChartColor(level)}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls={true}
                animationDuration={300}
              />
            )
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

const ClassProgress = ({ visible, onClose }) => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [averageScores, setAverageScores] = useState({});
  const [availableLevels, setAvailableLevels] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchClasses();
    } else {
      resetState();
    }
  }, [visible]);

  const resetState = () => {
    setClasses([]);
    setSubjects([]);
    setChapters([]);
    setSelectedClass(null);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setChartData([]);
    setAvailableLevels([]);
    setAverageScores({});
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/classSubjects/getAll');
      const data = await response.json();
      const uniqueClasses = [...new Set(data.data.map((item) => item.class))];
      setClasses(uniqueClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (selectedClass) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/classSubjects/getAll');
      const data = await response.json();
      const filteredSubjects = data.data
        .filter((item) => item.class === selectedClass)
        .map((item) => ({ id: item._id, name: item.subject }));
      setSubjects(filteredSubjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (subjectId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/chapters/get/${subjectId}`);
      const data = await response.json();
      setChapters(data.data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopMarks = async (chapterId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/student-progress/get-monthly-top-marks/${chapterId}`);
      const data = await response.json();

      if (data?.topMarksByMonth) {
        processTopMarksData(data.topMarksByMonth);
      } else {
        console.warn('No top marks data available');
      }
    } catch (error) {
      console.error('Error fetching top marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTopMarksData = (topMarks) => {
    const levelScores = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    const chartData = [];
    const monthNames = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
    ];

    topMarks.forEach((entry) => {
      const { level, topScore, month, year } = entry;
      const monthName = monthNames[month - 1];
      const timestamp = `${monthName}-${year}`;

      if (levelScores[level]) {
        levelScores[level].push(topScore);
      }

      let existingEntry = chartData.find((data) => data.timestamp === timestamp);
      if (!existingEntry) {
        existingEntry = { timestamp };
        chartData.push(existingEntry);
      }

      existingEntry[`level${level}`] = topScore;
    });

    const averages = {};
    Object.entries(levelScores).forEach(([level, scores]) => {
      if (scores.length > 0) {
        averages[level] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      }
    });

    setChartData(chartData);
    setAverageScores(averages);

    const availableLevels = Object.keys(levelScores).filter((level) => levelScores[level].length > 0);
    setAvailableLevels(availableLevels);
  };

  const handleClassChange = (value) => {
    setSelectedClass(value);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setSubjects([]);
    setChapters([]);
    setChartData([]);
    setAvailableLevels([]);
    setAverageScores({});
    fetchSubjects(value);
  };

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    setSelectedChapter(null);
    setChartData([]);
    setAvailableLevels([]);
    setAverageScores({});
    fetchChapters(value);
  };

  const handleChapterChange = (value) => {
    setSelectedChapter(value);
    setChartData([]);
    setAvailableLevels([]);
    setAverageScores({});
    fetchTopMarks(value);
  };

  return (
    <Modal
      title="Class Progress"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={1200}
      style={{ borderRadius: 8 }}
    >
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Select
              placeholder="Select a class"
              style={{ width: '100%', marginBottom: 16 }}
              onChange={handleClassChange}
              value={selectedClass}
            >
              {classes.map((cls, index) => (
                <Option key={index} value={cls}>
                  {cls}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={24}>
            <Select
              placeholder="Select a subject"
              style={{ width: '100%', marginBottom: 16 }}
              onChange={handleSubjectChange}
              value={selectedSubject}
              disabled={!selectedClass}
            >
              {subjects.map((subject) => (
                <Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={24}>
            <Select
              placeholder="Select a chapter"
              style={{ width: '100%', marginBottom: 16 }}
              onChange={handleChapterChange}
              value={selectedChapter}
              disabled={!selectedSubject}
            >
              {chapters.map((chapter) => (
                <Option key={chapter._id} value={chapter._id}>
                  {chapter.chapterName}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* Average Scores */}
        <Card
          title="Average Scores by Level"
          style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
        >
          <Row gutter={[16, 16]}>
            {Object.entries(averageScores).map(([level, score]) => (
              <Col key={level} span={4}>
                <Card>
                  <Title level={4}>Level {level}</Title>
                  <Text strong>{score.toFixed(2)}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Individual Graphs */}
        {availableLevels.map((level) => (
          <ProgressGraphCard key={level} level={level} data={chartData} />
        ))}

        {/* Combined Graph */}
        {availableLevels.length > 0 && (
          <CombinedGraph chartData={chartData} availableLevels={availableLevels} />
        )}
      </Spin>
    </Modal>
  );
};

export default ClassProgress;