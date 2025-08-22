import React, { useEffect, useState } from 'react';
import { Table, Button, Spin, Alert, Select, Card } from 'antd';
import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons';
import ProgressChapterDetails from './ProgressChapterDetails';

const { Option } = Select;

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
      <Card title="Student Details" bordered style={cardStyle}>
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

      {selectedSubject && (
        <Card title="Select Chapter" bordered style={cardStyle}>
          {loadingChapters ? (
            <Spin indicator={<LoadingOutlined style={spinStyle} spin />} />
          ) : (
            <Select
              placeholder="Select a chapter"
              onChange={setSelectedChapter} // ✅ API call will trigger in `ProgressChapterDetails`
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

      {/* ✅ API call triggers dynamically when chapter is selected */}
      {selectedChapter && <ProgressChapterDetails studentId={student.id} chapterId={selectedChapter} />}
    </div>
  );
};

// Styles
const containerStyle = { padding: '2rem', minHeight: '100vh', backgroundColor: '#f4f7fa', maxWidth: '800px', margin: '0 auto' };
const backButtonStyle = { marginBottom: '1rem', backgroundColor: '#2C3E50', color: '#fff' };
const cardStyle = { marginBottom: '1rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' };
const dropdownStyle = { width: '100%' };
const spinStyle = { fontSize: '24px', display: 'block', margin: '2rem auto' };

export default StudentDetailsByAdmin;
