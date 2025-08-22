import React, { useState, useEffect } from 'react';
import './AssignmentQuestions.css';

const AssignmentQuestions = ({ assignmentId, onBack, assignmentData }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState(new Set());
  const [startTime, setStartTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  const QUESTIONS_PER_PAGE = 5;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/questions/${assignmentId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setQuestions(data);
        setStartTime(new Date());
        
        if (assignmentData?.assignmentId?.endTime) {
          const endTime = new Date(assignmentData.assignmentId.endTime);
          const now = new Date();
          const remaining = Math.max(0, endTime - now);
          setTimeRemaining(remaining);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [assignmentId]);

  useEffect(() => {
    if (!timeRemaining) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    setVisitedQuestions(prev => {
      const newSet = new Set(prev);
      newSet.add(questionId);
      return newSet;
    });
  };

  const formatTime = (ms) => {
    if (ms <= 0) return "00:00:00";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  const formatMinutes = (ms) => {
    if (ms <= 0) return "0 minutes";
    const minutes = Math.floor(ms / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionStatus(null);
    
    try {
      // Get student ID from localStorage
      const studentId = localStorage.getItem('userId');
      if (!studentId) {
        throw new Error('Student ID not found in localStorage');
      }

      // Calculate time taken in minutes
      const endTime = new Date();
      const timeTaken = Math.round((endTime - startTime) / (1000 * 60));
      
      // Calculate score
      let correctAnswers = 0;
      questions.forEach(question => {
        if (answers[question._id] === question.correctAnswer) {
          correctAnswers++;
        }
      });
      const scoredMarks = Math.round((correctAnswers / questions.length) * 100);
      
      // Prepare submission data
      const submissionData = {
        assignmentId,
        studentId,
        scoredMarks,
        timeTaken,
        answers
      };

      const response = await fetch('http://localhost:5000/api/scores/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error(`Submission failed with status ${response.status}`);
      }

      const result = await response.json();
      setSubmissionData({
        score: scoredMarks,
        timeTaken: timeTaken,
        correctAnswers: correctAnswers,
        totalQuestions: questions.length
      });
      setSubmissionStatus({
        success: true,
        message: 'Assignment submitted successfully!',
        data: result
      });
    } catch (err) {
      setSubmissionStatus({
        success: false,
        message: err.message || 'Failed to submit assignment'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalQuestions = questions.length;
  const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
  const currentQuestions = questions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  );
  const attemptedCount = Object.keys(answers).length;

  const getQuestionStatus = (questionId) => {
    if (answers[questionId]) return 'answered';
    if (visitedQuestions.has(questionId)) return 'visited';
    return 'unvisited';
  };

  if (loading) {
    return <div className="loading-container">Loading questions...</div>;
  }

  if (error) {
    return (
      <div className="assignment-container">
        <button className="back-button" onClick={onBack}>
          ← Back to Assignments
        </button>
        <div className="error-message">Error loading questions: {error}</div>
      </div>
    );
  }

  if (submissionStatus?.success && submissionData) {
    return (
      <div className="assignment-container">
        <div className="submission-success-container">
          <div className="success-icon">✓</div>
          <h2>Assignment Submitted Successfully!</h2>
          
          <div className="submission-results">
            <div className="result-card">
              <h3>Your Score</h3>
              <p className="score">{submissionData.score}%</p>
              <p className="correct-answers">
                {submissionData.correctAnswers} out of {submissionData.totalQuestions} correct
              </p>
            </div>
            
            <div className="result-card">
              <h3>Time Taken</h3>
              <p className="time-taken">{formatMinutes(submissionData.timeTaken * 60 * 1000)}</p>
            </div>
          </div>
          
          <button className="back-button" onClick={onBack}>
            ← Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assignment-container">
      <button className="back-button" onClick={onBack}>
        ← Back to Assignments
      </button>
      
      <div className="header">
        <h2>Assignment Questions</h2>
        <div className="assignment-meta">
          <span className="assignment-id">ID: {assignmentId}</span>
          {timeRemaining !== null && (
            <span className="time-remaining">
              Time Remaining: {formatTime(timeRemaining)}
            </span>
          )}
        </div>
      </div>

      {submissionStatus && (
        <div className={`submission-status ${submissionStatus.success ? 'success' : 'error'}`}>
          {submissionStatus.message}
        </div>
      )}

      <div className="progress-container">
        <div className="progress-box">
          <span>Questions: {attemptedCount}/{totalQuestions}</span>
        </div>
        <div className="question-indicators">
          {questions.map((_, index) => {
            const questionId = questions[index]._id;
            const status = getQuestionStatus(questionId);
            return (
              <div 
                key={index}
                className={`indicator ${status} ${currentPage === Math.floor(index / QUESTIONS_PER_PAGE) + 1 ? 'current' : ''}`}
                onClick={() => setCurrentPage(Math.floor(index / QUESTIONS_PER_PAGE) + 1)}
                title={`Question ${index + 1}`}
              >
                {index + 1}
              </div>
            );
          })}
        </div>
      </div>

      <div className="questions-container">
        {currentQuestions.length > 0 ? (
          currentQuestions.map((question, index) => {
            const absoluteIndex = (currentPage - 1) * QUESTIONS_PER_PAGE + index;
            return (
              <div key={question._id} className="question-card">
                <div className="question-header">
                  <span className="question-number">Question {absoluteIndex + 1}</span>
                  <span className="question-type">{question.questionType}</span>
                </div>
                
                <p className="question-text">{question.question}</p>
                
                <div className="options-container">
                  <h4>Options:</h4>
                  <ul className="options-list">
                    {Object.entries(question.options).map(([key, option]) => (
                      <li 
                        key={key} 
                        className={`option-item ${answers[question._id] === key ? 'selected' : ''}`}
                        onClick={() => handleAnswerSelect(question._id, key)}
                      >
                        <span className="option-letter">{key}:</span>
                        <span className="option-text">{option.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-questions">No questions found for this assignment.</p>
        )}
      </div>

      <div className="pagination-controls">
        <button 
          className="pagination-button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Previous
        </button>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          className="pagination-button"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next
        </button>
      </div>

      <div className="submit-container">
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={isSubmitting || (timeRemaining !== null && timeRemaining <= 0)}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
        </button>
        {timeRemaining !== null && timeRemaining <= 0 && (
          <p className="time-expired-message">Time has expired for this assignment</p>
        )}
      </div>
    </div>
  );
};

export default AssignmentQuestions;