import React, { useState, useEffect } from 'react';
import { Row, Spin, Alert, Button, Modal, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import ProgressChapterDetails from './ProgressChapterDetails';
import {
  FaBook,
  FaFlask,
  FaCalculator,
  FaGlobe,
  FaLanguage,
  FaAtom,
  FaVial,
  FaHistory,
  FaArrowLeft,
  FaMicroscope,
  FaChartBar
} from 'react-icons/fa';

const StudentProgressReport = () => {
  const [classSubjects, setClassSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [chapterProgress, setChapterProgress] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Pastel colors array
  const pastelColors = [
    '#FAD02E', '#F28D35', '#D83367', '#A2D5F2', '#B6D7A8',
    '#E9D4B3', '#C4A0A1', '#B3CDE0', '#F1E6E1', '#A8DADC',
    '#FF6B6B', '#4CAF50', '#8D93A1', '#F7B7A3', '#C8D8E4'
  ];

  // Subject to icon mapping
  const subjectIcons = {
    telugu: <FaLanguage />,
    hindi: <FaLanguage />,
    mathematics: <FaCalculator />,
    socialstudies: <FaGlobe />,
    science: <FaFlask />,
    physics: <FaAtom />,
    chemistry: <FaVial />,
    history: <FaHistory />,
    biology: <FaMicroscope />,
    economics: <FaChartBar />,
    default: <FaBook />,
  };

  useEffect(() => {
    const userClass = localStorage.getItem('userClass');
    if (!userClass) {
      setError('No class found in local storage');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/classSubjects/subjects/${userClass}`);
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const result = await response.json();
        setClassSubjects(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubjectClick = async (subjectId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/chapters/get/${subjectId}`);
      if (!response.ok) throw new Error('Failed to fetch chapters');
      const result = await response.json();
      setChapterProgress(result.data);
      setSelectedSubjectId(subjectId);
      setIsModalVisible(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapterId) => {
    setSelectedChapterId(chapterId);
  };

  const handleBackToChapters = () => {
    setSelectedChapterId(null);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedSubjectId(null);
    setChapterProgress([]);
  };

  const getSubjectIcon = (subjectName) => {
    const lowerCaseSubject = subjectName.toLowerCase().replace(/\s+/g, '');
    return subjectIcons[lowerCaseSubject] || subjectIcons.default;
  };

  const getRandomColor = () => pastelColors[Math.floor(Math.random() * pastelColors.length)];

  return (
    <div style={containerStyle}>
      <div style={headerContainer}>
        <h1 style={headerStyle}>Subjects</h1>
      </div>

      {loading && <Spin indicator={<LoadingOutlined style={spinStyle} spin />} />}
      {error && <Alert message="Error" description={error} type="error" showIcon />}

      {!loading && !error && (
        <div style={subjectsContainer}>
          {classSubjects.map(subject => (
            <motion.div
              key={subject._id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={subjectItemStyle}
              onClick={() => handleSubjectClick(subject._id)}
            >
              <div style={subjectIconContainer}>
                <div style={iconStyle}>
                  {getSubjectIcon(subject.subject)}
                </div>
              </div>
              <div style={subjectNameStyle}>
                {subject.subject}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        title={selectedSubjectId && classSubjects.find(s => s._id === selectedSubjectId)?.subject}
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width="80%"
        style={{ top: 100 }}
        bodyStyle={{ padding: '12px' }}
      >
        {selectedChapterId ? (
          <ProgressChapterDetails 
            chapterId={selectedChapterId} 
            onBack={handleBackToChapters}
          />
        ) : (
          <>
            {loading && <Spin indicator={<LoadingOutlined style={spinStyle} spin />} />}
            {error && <Alert message="Error" description={error} type="error" showIcon />}
            
            {!loading && !error && (
              <Row gutter={[16, 16]} style={rowStyle}>
                {chapterProgress.map(chapter => (
                  <Col key={chapter._id} xs={24} sm={12} md={8} lg={6}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div 
                        style={{ ...cardStyle, backgroundColor: getRandomColor() }}
                        onClick={() => handleChapterClick(chapter._id)}
                      >
                        <FaBook style={iconStyle} />
                        <h3 style={titleStyle}>{chapter.chapterName}</h3>
                      </div>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

// Styles
const containerStyle = {
  padding: '1rem',
  backgroundColor: '#f4f7fa',
  fontFamily: "'Roboto', sans-serif",
};

const headerContainer = {
  marginBottom: '1.5rem'
};

const headerStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#2C3E50',
  margin: 0
};

const subjectsContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const subjectItemStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '12px 16px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
};

const subjectIconContainer = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#f0f2f5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '16px'
};

const iconStyle = {
  fontSize: '1.2rem',
  color: '#555'
};

const subjectNameStyle = {
  fontSize: '1rem',
  fontWeight: '500',
  color: '#2c3e50'
};

const cardStyle = {
  cursor: 'pointer',
  padding: '1.5rem',
  borderRadius: '15px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  color: '#2c3e50',
  minHeight: '150px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.3s ease'
};

const titleStyle = {
  margin: '0.5rem 0',
  fontSize: '1rem',
  fontWeight: '600'
};

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  margin: '0 -8px'
};

const spinStyle = {
  fontSize: '24px',
  display: 'block',
  margin: '2rem auto'
};

export default StudentProgressReport;