import React, { useEffect, useState } from 'react';
import { Table, Button, Spin, Select, Card, Row, Col, Typography } from 'antd';
import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons';
import ProgressChapterDetails from './ProgressChapterDetails';
import LatestLevelDetails from './LatestLevelDetails';

const { Option } = Select;
const { Text } = Typography;

const StudentDetailsByAdmin = ({ student, onBack }) => {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/classSubjects/subjects/${student.class}`);
        if (!response.ok) throw new Error('Failed to fetch subjects');

        const result = await response.json();
        setSubjects(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [student]);

  const fetchChapters = async (subjectId) => {
    setSelectedSubject(subjectId);
    setChapters([]);
    setSelectedChapter(null);
    setLoadingChapters(true);

    try {
      const response = await fetch(`http://localhost:5000/api/chapters/get/${subjectId}`);
      if (!response.ok) throw new Error('Failed to fetch chapters');

      const result = await response.json();
      setChapters(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingChapters(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Student Details Card */}
      <Card title="Student Details" bordered style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <Table
          columns={[{ dataIndex: 'attribute' }, { dataIndex: 'value' }]}
          dataSource={[
            { key: '1', attribute: 'Name', value: student.name },
            { key: '2', attribute: 'Email', value: student.email },
            { key: '3', attribute: 'Class', value: student.class },
          ]}
          pagination={false}
          bordered
          showHeader={false}
        />
      </Card>

      {/* Subject and Chapter Selection */}
      <Row gutter={16} style={{ marginBottom: '1.5rem' }}>
        <Col span={12}>
          <Card title="Select Subject" bordered style={cardStyle}>
            {loadingSubjects ? (
              <Spin indicator={<LoadingOutlined style={spinStyle} spin />} />
            ) : (
              <Select
                placeholder="Select a subject"
                onChange={fetchChapters}
                style={dropdownStyle}
                value={selectedSubject}
              >
                {subjects.map((subject) => (
                  <Option key={subject._id} value={subject._id}>
                    {subject.subject}
                  </Option>
                ))}
              </Select>
            )}
          </Card>
        </Col>
        <Col span={12}>
          {selectedSubject && (
            <Card title="Select Chapter" bordered style={cardStyle}>
              {loadingChapters ? (
                <Spin indicator={<LoadingOutlined style={spinStyle} spin />} />
              ) : (
                <Select
                  placeholder="Select a chapter"
                  onChange={setSelectedChapter}
                  style={dropdownStyle}
                  value={selectedChapter}
                >
                  {chapters.map((chapter) => (
                    <Option key={chapter._id} value={chapter._id}>
                      {chapter.chapterName}
                    </Option>
                  ))}
                </Select>
              )}
            </Card>
          )}
        </Col>
      </Row>

      {/* Progress and Latest Level Details */}
      <Row gutter={16}>
        <Col span={12}>
          {selectedChapter && (
            <Card title="Chapter Progress" bordered style={cardStyle}>
              <ProgressChapterDetails studentId={student.id} chapterId={selectedChapter} />
            </Card>
          )}
        </Col>
        <Col span={12}>
        {selectedChapter && (
          <Card title="Latest Level Details" bordered style={cardStyle}>
            <LatestLevelDetails 
              studentId={student.id} 
              chapterId={selectedChapter} 
            />
          </Card>
        )}
        </Col>
      </Row>
    </div>
  );
};

// Styles
const containerStyle = { 
  padding: '2rem', 
  minHeight: '100vh', 
  backgroundColor: '#f4f7fa', 
  maxWidth: '1200px', 
  margin: '0 auto' 
};
const cardStyle = { 
  marginBottom: '1rem', 
  borderRadius: '10px', 
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  height: '100%'
};
const dropdownStyle = { width: '100%' };
const spinStyle = { fontSize: '24px', display: 'block', margin: '2rem auto' };

export default StudentDetailsByAdmin;