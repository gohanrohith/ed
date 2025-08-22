import React, { useEffect, useState } from 'react';
import { Col, Row, Spin, Alert, Button, Avatar } from 'antd';
import { UserOutlined, LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import StudentDetailsByAdmin from './StudentDetailsByAdmin';
import ClassProgress from './ClassProgress'; // Import the new component

const HomePage = () => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility

  // Pastel colors array
  const pastelColors = [
    '#FAD02E', '#F28D35', '#D83367', '#A2D5F2', '#B6D7A8',
    '#E9D4B3', '#C4A0A1', '#B3CDE0', '#F1E6E1', '#A8DADC',
    '#FF6B6B', '#4CAF50', '#8D93A1', '#F7B7A3', '#C8D8E4'
  ];

  useEffect(() => {
    const adminId = localStorage.getItem('userId');
    if (adminId) {
      const token = localStorage.getItem('authToken');
      if (token) {
        const url = `http://localhost:5000/api/students/admin/${adminId}`;
        fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        .then((response) => {
          if (!response.ok) throw new Error('Failed to fetch students');
          return response.json();
        })
        .then((data) => {
          if (data?.students) setStudents(data.students);
          else setError('Unexpected response format');
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
      } else {
        setError('No auth token found');
        setLoading(false);
      }
    } else {
      setError('No admin ID found');
      setLoading(false);
    }
  }, []);

  const groupedStudents = students.reduce((acc, student) => {
    const className = student.class;
    acc[className] = acc[className] || [];
    acc[className].push(student);
    return acc;
  }, {});

  const handleClassClick = (className) => {
    setSelectedClass(className);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const getRandomColor = () => pastelColors[Math.floor(Math.random() * pastelColors.length)];

  return (
    <div style={containerStyle}>
      <div style={headerContainer}>
        <h1 style={headerStyle}>
          {selectedStudent
            ? `Details of ${selectedStudent.name}`
            : selectedClass
            ? `Students in Grade ${selectedClass}`
            : 'Student Directory'}
        </h1>
        <div>
          {selectedStudent ? (
            <Button onClick={handleBackToStudents} style={backButtonStyle}>
              <ArrowLeftOutlined /> Back to Students
            </Button>
          ) : selectedClass ? (
            <Button onClick={handleBackToClasses} style={backButtonStyle}>
              <ArrowLeftOutlined /> Back to Classes
            </Button>
          ) : (
            <Button onClick={showModal} style={backButtonStyle}>
              View Class Progress
            </Button>
          )}
        </div>
      </div>

      {loading && <Spin indicator={<LoadingOutlined style={spinStyle} spin />} />}
      {error && <Alert message="Error" description={error} type="error" showIcon />}

      {!loading && !error && (
        selectedStudent ? (
          <StudentDetailsByAdmin student={selectedStudent} />
        ) : selectedClass ? (
          <Row gutter={[16, 16]} style={rowStyle}>
            {groupedStudents[selectedClass].map((student) => (
              <Col key={student.id} xs={24} sm={12} md={8} lg={6}>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95, rotate: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    style={{ ...cardStyle, backgroundColor: getRandomColor() }}
                    onClick={() => handleStudentClick(student)}
                  >
                    <Avatar
                      size={64}
                      icon={<UserOutlined />}
                      src={student.profilePicture}
                      style={avatarStyle}
                    />
                    <h3 style={titleStyle}>{student.name}</h3>
                    <p style={studentCountStyle}>View Details</p>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={[16, 16]} style={rowStyle}>
            {Object.keys(groupedStudents).map((className) => (
              <Col key={className} xs={24} sm={12} md={8} lg={6}>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95, rotate: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    style={{ ...cardStyle, backgroundColor: getRandomColor() }}
                    onClick={() => handleClassClick(className)}
                  >
                    <h3 style={titleStyle}>Grade {className}</h3>
                    <p style={studentCountStyle}>
                      {groupedStudents[className].length} Students
                    </p>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        )
      )}

      {/* Modal for Class Progress */}
      <ClassProgress visible={isModalVisible} onClose={handleModalClose} />
    </div>
  );
};

// Styles
const containerStyle = {
  padding: '2rem',
  minHeight: '100vh',
  backgroundColor: '#f4f7fa',
  fontFamily: "'Roboto', sans-serif",
  maxWidth: '1200px',
  margin: '0 auto'
};

const headerContainer = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem'
};

const headerStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#2C3E50',
  margin: 0
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

const avatarStyle = {
  marginBottom: '1rem'
};

const titleStyle = {
  margin: '1rem 0',
  fontSize: '1.25rem',
  fontWeight: '600'
};

const studentCountStyle = {
  fontSize: '1rem',
  color: '#7f8c8d',
  marginTop: '0.5rem'
};

const rowStyle = {
  marginTop: '1rem'
};

const backButtonStyle = {
  backgroundColor: '#2C3E50',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  ':hover': {
    backgroundColor: '#1A252F'
  }
};

const spinStyle = {
  fontSize: '24px',
  display: 'block',
  margin: '2rem auto'
};

export default HomePage;