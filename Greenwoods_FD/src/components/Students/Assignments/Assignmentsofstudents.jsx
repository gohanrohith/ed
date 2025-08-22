import React, { useState, useEffect } from 'react';
import { Col, Row, Spin, Alert, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { FaBook } from 'react-icons/fa';
import styled from 'styled-components';
import ChapterDetails from './ChapterDetails';

const Assignmentsofstudents = () => {
  const [classSubjects, setClassSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [chapterDetails, setChapterDetails] = useState([]);
  const [showBackToSubjects, setShowBackToSubjects] = useState(true);

  useEffect(() => {
    const userClass = localStorage.getItem('userClass');
    if (!userClass) {
      setError('No class found in local storage');
      setLoading(false);
      return;
    }

    const fetchClassSubjects = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/classSubjects/subjects/${userClass}`);
        if (!response.ok) {
          throw new Error('Failed to fetch class subjects');
        }

        const result = await response.json();
        setClassSubjects(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClassSubjects();
  }, []);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const pastelColors = [
    '#FAD02E', '#F28D35', '#D83367', '#A2D5F2', '#B6D7A8',
    '#E9D4B3', '#C4A0A1', '#B3CDE0', '#F1E6E1', '#A8DADC',
    '#FF6B6B', '#4CAF50', '#8D93A1', '#F7B7A3', '#C8D8E4',
    '#FFB3BA', '#E3D1D1', '#C6E2D1', '#D9E7FF', '#F0F0F0'
  ];

  const getRandomPastelColor = () => {
    return pastelColors[Math.floor(Math.random() * pastelColors.length)];
  };

  const handleSubjectClick = async (subjectId) => {
    setSelectedSubjectId(subjectId);
    setShowBackToSubjects(true);
    try {
      const response = await fetch(`http://localhost:5000/api/chapters/get/${subjectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chapter details');
      }
      const result = await response.json();
      setChapterDetails(result.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBackToSubjects = () => {
    setSelectedSubjectId(null);
    setChapterDetails([]);
  };

  return (
    <Container>
      <h1>Assignments</h1>

      {loading && <Spin indicator={antIcon} />}
      {error && <Alert message="Error" description={error} type="error" showIcon />}
      {selectedSubjectId === null && !loading && !error && classSubjects.length > 0 && (
        <Row gutter={[16, 16]}>
          {classSubjects.map((subject) => (
            <Col span={8} key={subject._id}>
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <StyledCard
                  onClick={() => handleSubjectClick(subject._id)}
                  style={{
                    backgroundColor: getRandomPastelColor(),
                    color: '#333',
                    padding: '20px',
                  }}
                >
                  <FaBook style={{ fontSize: '24px', marginRight: '8px' }} />
                  <span>{subject.subject}</span>
                </StyledCard>
              </motion.div>
            </Col>
          ))}
        </Row>
      )}

      {selectedSubjectId && !loading && !error && (
        <div>
          {showBackToSubjects && (
            <Button onClick={handleBackToSubjects} style={{ marginBottom: '20px' }} type="primary">
              Back to Subjects
            </Button>
          )}

          <ChapterDetails 
            chapterDetails={chapterDetails} 
            onChapterSelect={() => setShowBackToSubjects(false)}
            onBackToChapters={() => setShowBackToSubjects(true)}
          />
        </div>
      )}

      {classSubjects.length === 0 && !loading && !error && <p>No subjects available for this class.</p>}
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  background: #f4f7fa;
  font-family: 'Roboto', sans-serif;

  h1 {
    font-size: 2rem;
    font-weight: bold;
    color: #2C3E50;
    margin-bottom: 20px;
  }

  p {
    font-size: 14px;
    color: #555;
  }
`;

const StyledCard = styled.div`
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  display: flex;
  align-items: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  span {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
`;

export default Assignmentsofstudents;