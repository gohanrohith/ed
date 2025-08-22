import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Typography } from 'antd';
import studentAvatar from '../../../assets/user.png';
import StudentProgressReport from './StudentProgressReport';
import LatestLevelDetails from './LatestLevelDetails';
import TotalAttempts from './TotalAttempts';

const { Text } = Typography;

const HomePageofStudents = () => {
  const [studentDetails, setStudentDetails] = useState({
    name: '',
    email: '',
    studentClass: '',
    mobile: '',
    section: '',
  });

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    const studentClass = localStorage.getItem('userClass');
    const mobile = localStorage.getItem('userMobile');
    const section = localStorage.getItem('userSection');

    setStudentDetails({
      name,
      email,
      studentClass,
      mobile,
      section,
    });
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '20px',
      }}
    >
      {studentDetails.name && (
        <>
          {/* Main Content Row */}
          <Row gutter={16} justify="center" style={{ width: '100%', marginBottom: 'auto' }}>
            {/* Left Column - 65% width for Student Details and Latest Level */}
            <Col xs={24} md={17} style={{ marginBottom: 'auto' }}>
              {/* Student Profile Card */}
              <Card
                bordered={false}
                style={{
                  width: '100%',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#ffffff',
                  marginBottom: '16px',
                  position: 'relative', // Added for proper avatar positioning
                }}
              >
                {/* Flex container for avatar and text */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  gap: '20px',
                  position: 'relative',
                  paddingBottom: '20px',
                  borderBottom: '1px solid #f0f0f0',
                  marginBottom: '20px'
                }}>
                  {/* Circular Avatar Image */}
                  <img
                    src={studentAvatar}
                    alt="Student Avatar"
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      border: '4px solid white',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                      flexShrink: 0,
                    }}
                  />
                  
                  {/* Welcome Text and Basic Info */}
                  <div style={{ flex: 1 }}>
                    <Text
                      strong
                      style={{
                        fontSize: '24px',
                        color: '#4caf50',
                        display: 'block',
                        marginBottom: '8px'
                      }}
                    >
                      Welcome, {studentDetails.name}!
                    </Text>
                    <Text
                      style={{
                        fontSize: '16px',
                        color: '#555',
                        display: 'block',
                        marginBottom: '16px'
                      }}
                    >
                      We're glad to have you on board.
                    </Text>
                    
                    {/* Information Grid */}
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '8px 16px'
                    }}>
                      <div>
                        <Text strong>Email:</Text> {studentDetails.email || 'N/A'}
                      </div>
                      <div>
                        <Text strong>Class:</Text> {studentDetails.studentClass || 'N/A'}
                      </div>
                      <div>
                        <Text strong>Mobile:</Text> {studentDetails.mobile || 'N/A'}
                      </div>
                      <div>
                        <Text strong>Section:</Text> {studentDetails.section || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Total Attempts Section */}
                <div style={{ marginTop: '20px' }}>
                  <TotalAttempts />
                </div>
              </Card>

              {/* Latest Level Details Card */}
              <Card
                bordered={false}
                style={{
                  width: '100%',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#ffffff',
                }}
              >
                <LatestLevelDetails />
              </Card>
            </Col>

            {/* Right Column - 35% width for Progress Report */}
            <Col xs={24} md={7}>
              <Card
                bordered={false}
                style={{
                  width: '100%',
                  padding: '0px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                  height: '100%',
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ fontSize: '18px' }}>Subject Progress</Text>
                </div>
                <StudentProgressReport />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default HomePageofStudents;