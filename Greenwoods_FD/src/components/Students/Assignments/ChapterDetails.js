import React, { useState, useEffect } from 'react';
import { Row, Col, Button } from 'antd';
import styled from 'styled-components';
import axios from 'axios';
import AssignmentsAvailable from './AssignmentsAvailable';

const ChapterDetails = ({ chapterDetails, onChapterSelect, onBackToChapters }) => {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [rememberQuestions, setRememberQuestions] = useState([]);
  const [analyzeQuestions, setAnalyzeQuestions] = useState([]);
  const [evaluateQuestions, setEvaluateQuestions] = useState([]);
  const [applyQuestions, setApplyQuestions] = useState([]);
  const [understandQuestions, setUnderstandQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);

  const handleChapterClick = async (chapter) => {
    onChapterSelect();
    setSelectedChapter(chapter);
    setLoading(true);
  
    try {
      const chapterId = chapter._id;
      const studentId = localStorage.getItem("userId");
  
      const urls = [
        `http://localhost:5000/api/remember/questions/${chapterId}`,
        `http://localhost:5000/api/understand/questions/${chapterId}`,
        `http://localhost:5000/api/eval/questions/${chapterId}`,
        `http://localhost:5000/api/apply/questions/${chapterId}`,
        `http://localhost:5000/api/analyse/questions/${chapterId}`
      ];
  
      const responses = await Promise.all(urls.map(url => axios.get(url)));
  
      setRememberQuestions(responses[0].data.questions);
      setUnderstandQuestions(responses[1].data.questions);
      setEvaluateQuestions(responses[2].data.questions);
      setApplyQuestions(responses[3].data.questions);
      setAnalyzeQuestions(responses[4].data.questions);
  
      console.log('Remember Questions:', responses[0].data.questions);
      console.log('Understand Questions:', responses[1].data.questions);
      console.log('Evaluate Questions:', responses[2].data.questions);
      console.log('Apply Questions:', responses[3].data.questions);
      console.log('Analyze Questions:', responses[4].data.questions);
  
      try {
        const progressResponse = await axios.get(`http://localhost:5000/api/student-progress/get-progress/${studentId}/${chapterId}`);
        setProgress(progressResponse.data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          const progressData = {
            studentId,
            chapterId
          };
  
          const postResponse = await axios.post(`http://localhost:5000/api/student-progress/add-progress`, progressData);
          setProgress(postResponse.data);
        } else {
          console.error('Error fetching progress:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching chapter assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    onBackToChapters();
    setSelectedChapter(null);
  };

  if (chapterDetails.length === 0) {
    return <Message>No chapters available for this subject.</Message>;
  }

  return (
    <Container>
      {!selectedChapter ? (
        <Row gutter={[16, 16]}>
          {chapterDetails.map((chapter) => (
            <Col span={8} key={chapter._id}>
              <StyledCard
                hoverable
                onClick={() => handleChapterClick(chapter)}
                backgroundColor={getRandomPastelColor()}
              >
                <ChapterName>{chapter.chapterName}</ChapterName>
              </StyledCard>
            </Col>
          ))}
        </Row>
      ) : (
        <div>
          <Button onClick={handleBack} style={{ marginBottom: '20px' }} type="primary">
            Back to Chapters
          </Button>
          <AssignmentsAvailable
            chapterId={selectedChapter._id}
            chapterName={selectedChapter.chapterName}
            rememberQuestions={rememberQuestions}
            understandQuestions={understandQuestions}
            evaluateQuestions={evaluateQuestions}
            applyQuestions={applyQuestions}
            analyzeQuestions={analyzeQuestions}
            loading={loading}
            progress={progress}
            onBack={handleBack}
          />
        </div>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  background: #f4f7fa;
  font-family: 'Roboto', sans-serif;
`;

const Message = styled.p`
  font-size: 16px;
  color: #999;
`;

const StyledCard = styled.div`
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 20px;
  background-color: ${(props) => props.backgroundColor || '#fff'};
  min-height: 80px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

const ChapterName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  text-align: center;
  width: 100%;
`;

const pastelColors = [
  '#FAD02E', '#F28D35', '#D83367', '#A2D5F2', '#B6D7A8',
  '#E9D4B3', '#C4A0A1', '#B3CDE0', '#F1E6E1', '#A8DADC',
  '#FF6B6B', '#4CAF50', '#8D93A1', '#F7B7A3', '#C8D8E4',
  '#FFB3BA', '#E3D1D1', '#C6E2D1', '#D9E7FF', '#F0F0F0'
];

const getRandomPastelColor = () => {
  return pastelColors[Math.floor(Math.random() * pastelColors.length)];
};

export default ChapterDetails;