import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Radio, Checkbox, Spin, Typography, Alert, Progress, Image, Row, Col, Collapse } from 'antd';
import { LeftOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons';
import './AssignmentsAvailable.css';
import ApexChart from './ApexChart';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const QUESTIONS_PER_PAGE = 5;

const distributeQuestions = (percentages, total) => {
  const exactCounts = Object.entries(percentages).map(([level, percent]) => ({
    level,
    count: (percent / 100) * total,
  }));

  let integerCounts = exactCounts.map(item => ({
    level: item.level,
    integer: Math.floor(item.count),
    fractional: item.count - Math.floor(item.count),
  }));

  const currentTotal = integerCounts.reduce((sum, item) => sum + item.integer, 0);
  let remaining = total - currentTotal;

  integerCounts.sort((a, b) => b.fractional - a.fractional);

  for (let i = 0; i < remaining; i++) {
    integerCounts[i].integer += 1;
  }

  const result = {};
  integerCounts.forEach(item => {
    result[item.level] = item.integer;
  });

  return result;
};

const cleanQuestionText = (text) => {
  if (!text) return '';
  return text
    .replace(/\\text\{/g, '')
    .replace(/\}/g, '')
    .replace(/\\/g, '')
    .replace(/\$/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '');
};

const AssignmentsAvailable = ({
  rememberQuestions = [],
  understandQuestions = [],
  applyQuestions = [],
  analyzeQuestions = [],
  evaluateQuestions = [],
  loading,
  onBack,
  chapterName,
  chapterId,
  subjectId
}) => {
  const [assignmentState, setAssignmentState] = useState({
    isActive: false,
    questions: [],
    currentPage: 0,
    answers: {},
    showScore: false,
    selectedLevel: null,
    score: 0,
    scoreByLevel: null,
    timeLeft: 300,
    timerActive: false,
    startTime: null,
    endTime: null,
    showSolutions: false,
    fullScreen: true,
  });

  const [dragState, setDragState] = useState({
    draggedOption: null,
    droppedOption: null,
  });

  const getLevelsConfig = useCallback(() => {
    return [
      {
        level: 1,
        weights: { Remembering: 40, Understanding: 20, Applying: 15, Analyzing: 15, Evaluating: 10 },
        title: "Level 1 (Basic)",
      },
      {
        level: 2,
        weights: { Remembering: 30, Understanding: 30, Applying: 15, Analyzing: 15, Evaluating: 10 },
        title: "Level 2 (Intermediate)",
      },
      {
        level: 3,
        weights: { Remembering: 20, Understanding: 20, Applying: 20, Analyzing: 20, Evaluating: 20 },
        title: "Level 3 (Advanced)",
      },
      {
        level: 4,
        weights: { Remembering: 15, Understanding: 15, Applying: 25, Analyzing: 25, Evaluating: 20 },
        title: "Level 4 (Expert)",
      },
      {
        level: 5,
        weights: { Remembering: 10, Understanding: 10, Applying: 30, Analyzing: 25, Evaluating: 25 },
        title: "Level 5 (Master)",
      }
    ];
  }, []);

  useEffect(() => {
    let interval;
    if (assignmentState.timerActive && assignmentState.timeLeft > 0) {
      interval = setInterval(() => {
        setAssignmentState(s => ({
          ...s,
          timeLeft: s.timeLeft - 1,
        }));
      }, 1000);
    } else if (assignmentState.timeLeft === 0) {
      handleSubmit();
    }
    return () => clearInterval(interval);
  }, [assignmentState.timerActive, assignmentState.timeLeft]);

  useEffect(() => {
    setDragState({
      draggedOption: null,
      droppedOption: null,
    });
  }, [assignmentState.currentPage]);

  const shuffleArray = useCallback((array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  const startAssignment = useCallback((levelConfig) => {
    const questionCounts = distributeQuestions(levelConfig.weights, 45);
    let allQuestions = [];

    Object.entries(questionCounts).forEach(([cognitiveLevel, count]) => {
      let sourceQuestions;
      switch (cognitiveLevel) {
        case 'Remembering': sourceQuestions = rememberQuestions; break;
        case 'Understanding': sourceQuestions = understandQuestions; break;
        case 'Applying': sourceQuestions = applyQuestions; break;
        case 'Analyzing': sourceQuestions = analyzeQuestions; break;
        case 'Evaluating': sourceQuestions = evaluateQuestions; break;
        default: sourceQuestions = [];
      }

      let cognitivePool = [];
      sourceQuestions?.forEach(q => {
        if (q.questionType === 'Comprehension') {
          cognitivePool.push(...q.subQuestions.map(subQ => ({
            ...subQ,
            comprehensionData: { 
              paragraph: q.paragraph, 
              mainQuestion: q.question,
              solution: q.solution
            },
            cognitiveLevel,
            type: 'comprehension'
          })));
        } else {
          cognitivePool.push({ 
            ...q, 
            cognitiveLevel, 
            type: 'mcq', 
            isDragDrop: false
          });
        }
      });

      cognitivePool = shuffleArray(cognitivePool).slice(0, count);
      allQuestions.push(...cognitivePool);
    });

    const dragDropQuestions = shuffleArray(allQuestions.filter(q => q.type === 'mcq')).slice(0, 5);
    dragDropQuestions.forEach(q => q.isDragDrop = true);

    setAssignmentState(s => ({
      ...s,
      isActive: true,
      questions: shuffleArray(allQuestions),
      selectedLevel: levelConfig.level,
      timerActive: true,
      timeLeft: 300,
      currentPage: 0,
      answers: {},
      showScore: false,
      showSolutions: false,
      score: 0,
      scoreByLevel: null,
      startTime: new Date(),
      endTime: null,
      fullScreen: true,
    }));
  }, [rememberQuestions, understandQuestions, applyQuestions, analyzeQuestions, evaluateQuestions, shuffleArray]);

  const handleAnswer = useCallback((value, questionIndex) => {
    setAssignmentState(s => ({
      ...s,
      answers: { ...s.answers, [questionIndex]: value }
    }));
  }, []);

  const calculateScore = useCallback(() => {
    const scoreByLevel = {
      Remembering: { correct: 0, total: 0 },
      Understanding: { correct: 0, total: 0 },
      Applying: { correct: 0, total: 0 },
      Analyzing: { correct: 0, total: 0 },
      Evaluating: { correct: 0, total: 0 },
    };

    assignmentState.questions.forEach((q, idx) => {
      const userAnswers = assignmentState.answers[idx] || [];
      const correctAnswers = q.correctAnswer || [];
      const cognitiveLevel = q.cognitiveLevel;

      scoreByLevel[cognitiveLevel].total += 1;

      if (q.isDragDrop) {
        if (userAnswers[0] === correctAnswers[0]) {
          scoreByLevel[cognitiveLevel].correct += 1;
        }
      } else if (correctAnswers.length === 1) {
        if (userAnswers[0] === correctAnswers[0]) {
          scoreByLevel[cognitiveLevel].correct += 1;
        }
      } else {
        const isCorrect =
          userAnswers.length === correctAnswers.length &&
          userAnswers.every(answer => correctAnswers.includes(answer));
        if (isCorrect) {
          scoreByLevel[cognitiveLevel].correct += 1;
        }
      }
    });

    return scoreByLevel;
  }, [assignmentState.questions, assignmentState.answers]);

  const handlePageNavigation = useCallback((direction) => {
    const totalPages = Math.ceil(assignmentState.questions.length / QUESTIONS_PER_PAGE);
    const newPage = direction === 'next' 
      ? Math.min(totalPages - 1, assignmentState.currentPage + 1)
      : Math.max(0, assignmentState.currentPage - 1);
    
    setAssignmentState(s => ({
      ...s,
      currentPage: newPage,
    }));
  }, [assignmentState.currentPage, assignmentState.questions.length]);

  const handleSubmit = useCallback(() => {
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - assignmentState.startTime) / 1000);
    const scoreByLevel = calculateScore();
    const totalScore = Object.values(scoreByLevel).reduce((sum, level) => sum + level.correct, 0);
    const studentId = localStorage.getItem('userId');
  
    const testResult = {
      studentId,
      chapterId,
      level: assignmentState.selectedLevel,
      score: totalScore,
      scoreByLevel,
      timeTaken,
    };
  
    fetch('http://localhost:5000/api/student-progress/add-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testResult),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to submit test results');
      }
      return response.json();
    })
    .then(data => {
      console.log('Test results submitted successfully:', data);
    })
    .catch(error => {
      console.error('Error submitting test results:', error);
    });
  
    const cognitiveBreakdown = {
      studentId,
      subjectId,
      chapterId,
      level: assignmentState.selectedLevel,
      progress: {
        analyse: {
          questionCount: scoreByLevel.Analyzing.total,
          correctCount: scoreByLevel.Analyzing.correct,
        },
        apply: {
          questionCount: scoreByLevel.Applying.total,
          correctCount: scoreByLevel.Applying.correct,
        },
        evaluate: {
          questionCount: scoreByLevel.Evaluating.total,
          correctCount: scoreByLevel.Evaluating.correct,
        },
        remember: {
          questionCount: scoreByLevel.Remembering.total,
          correctCount: scoreByLevel.Remembering.correct,
        },
        understand: {
          questionCount: scoreByLevel.Understanding.total,
          correctCount: scoreByLevel.Understanding.correct,
        },
      },
      totalTimeInSeconds: timeTaken,
    };
  
    fetch('http://localhost:5000/api/student-progress-details/studentProgress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cognitiveBreakdown),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to submit cognitive breakdown');
      }
      return response.json();
    })
    .then(data => {
      console.log('Cognitive breakdown submitted successfully:', data);
    })
    .catch(error => {
      console.error('Error submitting cognitive breakdown:', error);
    });
  
    setAssignmentState(s => ({
      ...s,
      showScore: true,
      timerActive: false,
      score: totalScore,
      scoreByLevel,
      endTime,
      fullScreen: false,
    }));
  }, [assignmentState.selectedLevel, assignmentState.startTime, calculateScore, chapterId, subjectId]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatTimeTaken = useCallback((seconds) => {
    if (!seconds) return "0 seconds";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let result = [];
    if (hours > 0) result.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) result.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    if (secs > 0 || result.length === 0) result.push(`${secs} second${secs !== 1 ? 's' : ''}`);
    
    return result.join(' ');
  }, []);

  const handleBack = useCallback(() => {
    if (assignmentState.isActive && !assignmentState.showScore) {
      if (window.confirm('Are you sure you want to leave? Your progress will be lost.')) {
        handleSubmit();
      } else {
        return;
      }
    }
    setAssignmentState(s => ({
      ...s,
      isActive: false,
      timerActive: false,
      fullScreen: false,
    }));
    onBack();
  }, [assignmentState.isActive, assignmentState.showScore, handleSubmit, onBack]);

  const handleChooseDifferentLevel = useCallback(() => {
    setAssignmentState(s => ({
      ...s,
      isActive: false,
      showScore: false,
      timerActive: false,
      fullScreen: false,
    }));
  }, []);

  const handleDragStart = useCallback((e, optionKey) => {
    e.dataTransfer.setData('option', optionKey);
    setDragState({ ...dragState, draggedOption: optionKey });
  }, [dragState]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e, questionIndex) => {
    e.preventDefault();
    const optionKey = e.dataTransfer.getData('option');
    setDragState({ ...dragState, droppedOption: optionKey });
    handleAnswer([optionKey], questionIndex);
  }, [dragState, handleAnswer]);

  const renderOption = useCallback((key, value) => {
    return (
      <div className="option-item">
        <span className="option-key">{key}</span>
        {value.image ? (
          <Image 
            src={value.image} 
            alt={`Option ${key}`} 
            className="option-image"
            preview={false}
          />
        ) : (
          <span className="option-value">{cleanQuestionText(value.text)}</span>
        )}
      </div>
    );
  }, []);

  const renderAnswerInput = useCallback((question, questionIndex) => {
    if (!question) {
      return <Text type="secondary">No question available.</Text>;
    }

    const isMultipleCorrect = question.correctAnswer?.length > 1;
    const currentAnswer = assignmentState.answers[questionIndex] || [];

    if (question.isDragDrop) {
      return (
        <div className="drag-drop-container">
          <div className="options-container">
            {Object.entries(question.options || {}).map(([key, value]) => (
              <div
                key={key}
                draggable
                onDragStart={(e) => handleDragStart(e, key)}
                className={`drag-option ${dragState.draggedOption === key ? 'dragging' : ''}`}
              >
                {renderOption(key, value)}
              </div>
            ))}
          </div>
          <div
            className={`drop-zone ${dragState.droppedOption ? 'has-answer' : ''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, questionIndex)}
          >
            {currentAnswer[0] ? (
              renderOption(currentAnswer[0], question.options[currentAnswer[0]])
            ) : (
              <Text type="secondary">Drag your answer here</Text>
            )}
          </div>
        </div>
      );
    } else if (isMultipleCorrect) {
      return (
        <Checkbox.Group 
          onChange={(values) => handleAnswer(values, questionIndex)}
          value={currentAnswer}
          className="options-group"
        >
          {Object.entries(question.options || {}).map(([key, value]) => (
            <Checkbox 
              key={key} 
              value={key}
              className="option-item"
            >
              {renderOption(key, value)}
            </Checkbox>
          ))}
        </Checkbox.Group>
      );
    } else {
      return (
        <Radio.Group 
          onChange={(e) => handleAnswer([e.target.value], questionIndex)}
          value={currentAnswer[0]}
          className="options-group"
        >
          {Object.entries(question.options || {}).map(([key, value]) => (
            <Radio 
              key={key} 
              value={key}
              className="option-item"
            >
              {renderOption(key, value)}
            </Radio>
          ))}
        </Radio.Group>
      );
    }
  }, [assignmentState.answers, dragState.draggedOption, dragState.droppedOption, handleAnswer, handleDragOver, handleDragStart, handleDrop, renderOption]);

  const renderCognitiveBreakdownChart = useCallback((scoreByLevel) => {
    if (!scoreByLevel) return null;
    return <ApexChart scoreByLevel={scoreByLevel} />;
  }, []);

  const getQuestionStatus = useCallback((questionIndex) => {
    const userAnswers = assignmentState.answers[questionIndex] || [];
    return userAnswers.length > 0 ? 'attempted' : 'unattempted';
  }, [assignmentState.answers]);

  const renderQuestionNavigation = useCallback(() => {
    return (
      <div className="question-navigation-sidebar">
        <div className="question-grid">
          {assignmentState.questions.map((_, index) => {
            const status = getQuestionStatus(index);
            const isCurrentPage = Math.floor(index / QUESTIONS_PER_PAGE) === assignmentState.currentPage;
            
            return (
              <Button
                key={index}
                type={isCurrentPage ? "primary" : "default"}
                className={`question-number ${status}`}
                onClick={() => {
                  const targetPage = Math.floor(index / QUESTIONS_PER_PAGE);
                  setAssignmentState(s => ({ ...s, currentPage: targetPage }));
                }}
              >
                {index + 1}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }, [assignmentState.currentPage, assignmentState.questions, getQuestionStatus]);

  const renderCurrentQuestions = useCallback(() => {
    const startIndex = assignmentState.currentPage * QUESTIONS_PER_PAGE;
    const endIndex = Math.min(startIndex + QUESTIONS_PER_PAGE, assignmentState.questions.length);
    
    return assignmentState.questions.slice(startIndex, endIndex).map((question, index) => {
      const questionIndex = startIndex + index;
      return (
        <Card key={questionIndex} className="question-card">
          <div className="question-header">
            <Text strong>Question {questionIndex + 1} of {assignmentState.questions.length}</Text>
            <Text type="secondary">Level {assignmentState.selectedLevel} • {question.cognitiveLevel}</Text>
          </div>

          {question.comprehensionData && (
            <div className="comprehension-passage">
              <Text strong>Reading Passage:</Text>
              <p>{cleanQuestionText(question.comprehensionData.paragraph)}</p>
            </div>
          )}

          <div className="question-content">
            <Text className="question-text">
              {cleanQuestionText(question.question || question.subQuestion)}
            </Text>
          </div>

          {renderAnswerInput(question, questionIndex)}

          {assignmentState.showSolutions && (
            <div className="solution-section">
              <Text strong>Solution:</Text>
              <Text>{cleanQuestionText(question.solution || question.comprehensionData?.solution || "No solution available")}</Text>
              <Text strong className="correct-answer">
                Correct Answer: {question.correctAnswer?.join(', ')}
              </Text>
            </div>
          )}
        </Card>
      );
    });
  }, [assignmentState.currentPage, assignmentState.questions, assignmentState.selectedLevel, assignmentState.showSolutions, renderAnswerInput]);

  const renderSolutionsSection = useCallback(() => {
    return (
      <div className="solutions-container">
        <Title level={4} className="solutions-title">Question Solutions</Title>
        <Collapse accordion>
          {assignmentState.questions.map((question, index) => (
            <Panel 
              header={`Question ${index + 1}`} 
              key={index}
              className="solution-panel"
              extra={
                <Text type={question.correctAnswer?.join(', ') === assignmentState.answers[index]?.join(', ') ? "success" : "danger"}>
                  {question.correctAnswer?.join(', ') === assignmentState.answers[index]?.join(', ') ? "✓ Correct" : "✗ Incorrect"}
                </Text>
              }
            >
              <div className="question-content">
                {question.comprehensionData && (
                  <div className="comprehension-passage">
                    <Text strong>Reading Passage:</Text>
                    <p>{cleanQuestionText(question.comprehensionData.paragraph)}</p>
                  </div>
                )}
                <Text strong>Question:</Text>
                <Text>{cleanQuestionText(question.question || question.subQuestion)}</Text>
              </div>

              <div className="solution-content">
                <Text strong>Solution:</Text>
                <Text>{cleanQuestionText(question.solution || question.comprehensionData?.solution || "No solution available")}</Text>
              </div>

              <div className="correct-answer">
                <Text strong>Correct Answer:</Text>
                <Text>{question.correctAnswer?.join(', ')}</Text>
              </div>

              <div className="user-answer">
                <Text strong>Your Answer:</Text>
                <Text type={question.correctAnswer?.join(', ') === assignmentState.answers[index]?.join(', ') ? "success" : "danger"}>
                  {assignmentState.answers[index]?.join(', ') || "Not attempted"}
                </Text>
              </div>
            </Panel>
          ))}
        </Collapse>
      </div>
    );
  }, [assignmentState.answers, assignmentState.questions]);

  const renderFullScreenAssessment = useCallback(() => {
    return (
      <div className="full-screen-assessment">
        <div className="fixed-header">
          <div className="header-content">
            <Title level={3} className="assessment-title">
              {chapterName} - Level {assignmentState.selectedLevel}
            </Title>
            <div className="timer-controls">
              <Alert 
                message={`Time Remaining: ${formatTime(assignmentState.timeLeft)}`} 
                type={assignmentState.timeLeft <= 60 ? "error" : "info"}
                showIcon
                className="timer-alert"
              />
              <Button 
                type="primary" 
                danger 
                onClick={handleSubmit}
                className="submit-button"
              >
                Submit Now
              </Button>
              <Button 
                icon={<CloseOutlined />}
                onClick={handleBack}
                className="close-button"
              />
            </div>
          </div>
        </div>

        <div className="assessment-content">
          <Row gutter={16} className="content-row">
            <Col span={4} className="navigation-column">
              {renderQuestionNavigation()}
            </Col>
            <Col span={20} className="questions-column">
              <div className="questions-container">
                {renderCurrentQuestions()}

                <div className="page-navigation-controls">
                  <Button
                    icon={<LeftOutlined />}
                    onClick={() => handlePageNavigation('prev')}
                    disabled={assignmentState.currentPage === 0}
                    className="nav-button prev-button"
                  >
                    Previous Page
                  </Button>
                  <Text>
                    Page {assignmentState.currentPage + 1} of {Math.ceil(assignmentState.questions.length / QUESTIONS_PER_PAGE)}
                  </Text>
                  <Button
                    type={assignmentState.currentPage === Math.ceil(assignmentState.questions.length / QUESTIONS_PER_PAGE) - 1 ? "primary" : "default"}
                    icon={<RightOutlined />}
                    onClick={() => {
                      if (assignmentState.currentPage === Math.ceil(assignmentState.questions.length / QUESTIONS_PER_PAGE) - 1) {
                        handleSubmit();
                      } else {
                        handlePageNavigation('next');
                      }
                    }}
                    className="nav-button next-button"
                  >
                    {assignmentState.currentPage === Math.ceil(assignmentState.questions.length / QUESTIONS_PER_PAGE) - 1 
                      ? "Submit Now" 
                      : "Next Page"}
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }, [assignmentState.currentPage, assignmentState.questions.length, assignmentState.selectedLevel, assignmentState.timeLeft, chapterName, formatTime, handleBack, handlePageNavigation, handleSubmit, renderCurrentQuestions, renderQuestionNavigation]);

  const renderResultScreen = useCallback(() => {
    return (
      <div className="result-container">
        <div className="result-header">
          <Title level={3} className="result-title">Assessment Results</Title>
          <div className="timer-controls">
            <Alert 
              message={`Time Taken: ${formatTimeTaken(
                Math.floor((assignmentState.endTime - assignmentState.startTime) / 1000)
              )}`} 
              type="info"
              showIcon
              className="timer-alert"
            />
            <Button 
              type="primary" 
              onClick={handleChooseDifferentLevel}
              className="different-level-button"
            >
              Choose Different Level
            </Button>
          </div>
        </div>

        <Card className="result-card">
          <div className="score-display">
            <Progress
              type="circle"
              percent={Math.round((assignmentState.score / assignmentState.questions.length) * 100)}
              format={() => (
                <div className="progress-content">
                  <Text strong className="score-text">
                    {assignmentState.score}
                  </Text>
                  <Text>/{assignmentState.questions.length}</Text>
                </div>
              )}
              width={150}
              strokeColor={assignmentState.score >= (assignmentState.questions.length * 0.7) ? "#52c41a" : "#ff4d4f"}
            />
            <div className="result-details">
              <Text className="result-message" type={assignmentState.score >= (assignmentState.questions.length * 0.7) ? "success" : "danger"}>
                {assignmentState.score >= (assignmentState.questions.length * 0.7) ? "Excellent Performance! 🎉" : "Keep Practicing! 💪"}
              </Text>
              <Text>Level: {assignmentState.selectedLevel}</Text>
            </div>
          </div>
          <div className="score-breakdown">
            <Title level={4} className="breakdown-title">Score Breakdown by Cognitive Level</Title>
            {renderCognitiveBreakdownChart(assignmentState.scoreByLevel)}
          </div>
          <div className="result-actions">
            <Button 
              type="primary" 
              onClick={() => startAssignment(getLevelsConfig().find(l => l.level === assignmentState.selectedLevel))}
              className="retake-button"
            >
              Retake Level {assignmentState.selectedLevel}
            </Button>
            <Button 
              onClick={() => setAssignmentState(s => ({ ...s, showSolutions: !s.showSolutions }))}
              className="view-solutions-button"
            >
              {assignmentState.showSolutions ? "Hide Solutions" : "View Solutions"}
            </Button>
          </div>
        </Card>

        {assignmentState.showSolutions && renderSolutionsSection()}
      </div>
    );
  }, [assignmentState.endTime, assignmentState.questions.length, assignmentState.score, assignmentState.scoreByLevel, assignmentState.selectedLevel, assignmentState.showSolutions, assignmentState.startTime, formatTimeTaken, getLevelsConfig, handleChooseDifferentLevel, renderCognitiveBreakdownChart, renderSolutionsSection, startAssignment]);

  const renderLevelSelection = useCallback(() => {
    return (
      <div className="level-selection">
        <Title level={3} className="level-select-title">Select Difficulty Level</Title>
        <Text className="level-select-subtitle">Choose the appropriate challenge level for your assessment</Text>
        
        <div className="level-cards-container">
          {getLevelsConfig().map(level => (
            <Card key={level.level} className="level-card" hoverable>
              <div className="level-card-content">
                <Title level={4} className="level-title">{level.title}</Title>
                <Text type="secondary" className="level-description">{level.description}</Text>
                
                              
                <Button 
                  type="primary"
                  onClick={() => startAssignment(level)}
                  className="start-level-button"
                >
                  Start Level {level.level}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }, [getLevelsConfig, startAssignment]);

  return (
    <div className="assignments-available">
      {loading ? (
        <Spin size="large" className="loading-spinner" />
      ) : assignmentState.isActive ? (
        assignmentState.fullScreen ? (
          renderFullScreenAssessment()
        ) : assignmentState.showScore ? (
          renderResultScreen()
        ) : (
          <div className="assessment-container">
            <Row gutter={16}>
              <Col span={4}>
                {renderQuestionNavigation()}
              </Col>
              <Col span={20}>
                <div className="questions-container">
                  <div className="timer-header">
                    <Alert 
                      message={`Time Remaining: ${formatTime(assignmentState.timeLeft)}`} 
                      type={assignmentState.timeLeft <= 60 ? "error" : "info"}
                      showIcon
                      className="timer-alert"
                    />
                    <Button 
                      type="primary" 
                      danger 
                      onClick={handleSubmit}
                      className="submit-button"
                    >
                      Submit Now
                    </Button>
                  </div>

                  {renderCurrentQuestions()}

                  <div className="page-navigation-controls">
                    <Button
                      icon={<LeftOutlined />}
                      onClick={() => handlePageNavigation('prev')}
                      disabled={assignmentState.currentPage === 0}
                      className="nav-button prev-button"
                    >
                      Previous Page
                    </Button>
                    <Text>
                      Page {assignmentState.currentPage + 1} of {Math.ceil(assignmentState.questions.length / QUESTIONS_PER_PAGE)}
                    </Text>
                    <Button
                      type={assignmentState.currentPage === Math.ceil(assignmentState.questions.length / QUESTIONS_PER_PAGE) - 1 ? "primary" : "default"}
                      icon={<RightOutlined />}
                      onClick={() => {
                        if (assignmentState.currentPage === Math.ceil(assignmentState.questions.length / QUESTIONS_PER_PAGE) - 1) {
                          handleSubmit();
                        } else {
                          handlePageNavigation('next');
                        }
                      }}
                      className="nav-button next-button"
                    >
                      {assignmentState.currentPage === Math.ceil(assignmentState.questions.length / QUESTIONS_PER_PAGE) - 1 
                        ? "Submit Now" 
                        : "Next Page"}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )
      ) : (
        renderLevelSelection()
      )}
    </div>
  );
};

export default AssignmentsAvailable;