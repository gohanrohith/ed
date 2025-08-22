import React, { useEffect, useState } from 'react';
import { Modal, Select, Spin, Typography, Card, Row, Col } from 'antd';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
          labelFormatter={(value) => new Date(value).toLocaleString()}
          formatter={(value) => `${value}`}
        />
        <Line
          type="monotone"
          dataKey="score"
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
            tickFormatter={() => ''} // Hide timestamp labels
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#7f8c8d' }}
          />
          <YAxis
            domain={[0, 45]} // Y-axis scale from 0 to 45
            axisLine={false}
            tickLine={false}
            tickCount={45}
            tick={{ fontSize: 12, fill: '#7f8c8d' }}
          />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleString()}
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
                connectNulls={true} // Connect missing data points
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
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [progressDetails, setProgressDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [averageScores, setAverageScores] = useState({});
  const [chartData, setChartData] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchClasses();
      fetchStudents();
    } else {
      // Clear all states when the modal is closed
      setClasses([]);
      setSubjects([]);
      setChapters([]);
      setStudents([]);
      setFilteredStudents([]);
      setSelectedClass(null);
      setSelectedSubject(null);
      setSelectedChapter(null);
      setProgressDetails([]);
      setStudentCount(0);
      setAverageScores({});
      setChartData([]);
      setAvailableLevels([]);
    }
  }, [visible]);

  // Fetch all classes
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

  // Fetch subjects for the selected class
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

  // Fetch chapters for the selected subject
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

  // Fetch all students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/students/admin/6773a1ddb1f59adab33016f9');
      const data = await response.json();
      setStudents(data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch progress details for all students and a specific chapter
  const fetchProgressDetails = async (studentIds, chapterId) => {
    setLoading(true);
    try {
      const progressPromises = studentIds.map((studentId) =>
        fetch(`http://localhost:5000/api/student-progress/get-chapter-details/${studentId}/${chapterId}`)
          .then((response) => response.json())
          .then((data) => ({
            studentId,
            progress: data.chapterProgress || {},
          }))
          .catch(() => ({
            studentId,
            progress: {},
          }))
      );
      const progressResults = await Promise.all(progressPromises);

      // Calculate average scores for each level
      const levelScores = { 1: [], 2: [], 3: [], 4: [], 5: [] };
      progressResults.forEach((result) => {
        Object.entries(result.progress).forEach(([level, scores]) => {
          if (levelScores[level]) {
            const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
            const averageScore = totalScore / scores.length;
            levelScores[level].push(averageScore);
          }
        });
      });

      const averages = {};
      Object.entries(levelScores).forEach(([level, scores]) => {
        if (scores.length > 0) {
          averages[level] = (scores.reduce((sum, score) => sum + score, 0)) / scores.length;
        }
      });
      setAverageScores(averages);

      // Prepare chart data
      const chartData = [];
      progressResults.forEach((result) => {
        Object.entries(result.progress).forEach(([level, scores]) => {
          scores.forEach((score) => {
            chartData.push({
              timestamp: new Date(score.timestamp).toLocaleString(),
              [`level${level}`]: score.score,
            });
          });
        });
      });
      setChartData(chartData);

      // Set available levels
      const levels = Object.keys(levelScores).filter((level) => levelScores[level].length > 0);
      setAvailableLevels(levels);
    } catch (error) {
      console.error('Error fetching progress details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle class selection
  const handleClassChange = (value) => {
    setSelectedClass(value);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setChapters([]);
    setProgressDetails([]);
    fetchSubjects(value);

    const classValue = Number(value);
    const filtered = students.filter((student) => student.class === classValue);
    setFilteredStudents(filtered);
    setStudentCount(filtered.length);
  };

  // Handle subject selection
  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    setSelectedChapter(null);
    setProgressDetails([]);
    fetchChapters(value);
  };

  // Handle chapter selection
  const handleChapterChange = (value) => {
    setSelectedChapter(value);
    setProgressDetails([]);

    const studentIds = filteredStudents.map((student) => student.id);
    fetchProgressDetails(studentIds, value);
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
            <Text strong>Number of Students: {studentCount}</Text>
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

        {/* Display Average Scores */}
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

        {/* Display Individual Level Progress */}
        {availableLevels.map((level) => (
          <ProgressGraphCard key={level} level={level} data={chartData} />
        ))}

        {/* Combined Graph */}
        <CombinedGraph chartData={chartData} availableLevels={availableLevels} />
      </Spin>
    </Modal>
  );
};

export default ClassProgress;