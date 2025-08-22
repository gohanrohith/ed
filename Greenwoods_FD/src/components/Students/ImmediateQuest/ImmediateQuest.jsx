import React, { useState, useEffect } from 'react';
import AssignmentQuestions from './AssignmentQuestions';
import './ImmediateQuest.css';

const ImmediateQuest = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showQuestions, setShowQuestions] = useState(false);
    const [activeTab, setActiveTab] = useState('ongoing');
    const [sectionedAssignments, setSectionedAssignments] = useState({
        upcoming: [],
        ongoing: [],
        completed: []
    });
    const [hasScore, setHasScore] = useState(false);
    const [scoreLoading, setScoreLoading] = useState(false);
    const [scoreData, setScoreData] = useState(null);

    useEffect(() => {
        const studentId = localStorage.getItem('userId');
        if (!studentId) {
            setError('Student ID not found');
            setLoading(false);
            return;
        }

        const fetchAssignments = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/studentsassign/student/${studentId}`);
                if (!response.ok) throw new Error('Failed to fetch assignments');
                const data = await response.json();
                setAssignments(data);
                categorizeAssignments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []);

    useEffect(() => {
        if (selectedAssignment) {
            checkForExistingScore();
        }
    }, [selectedAssignment, activeTab]);

    const checkForExistingScore = async () => {
        const studentId = localStorage.getItem('userId');
        if (!studentId || !selectedAssignment) return;

        setScoreLoading(true);
        try {
            const response = await fetch(
                `http://localhost:5000/api/scores/${selectedAssignment.assignmentId._id}/${studentId}`
            );
            
            if (response.status === 200) {
                const data = await response.json();
                setHasScore(true);
                setScoreData(data);
            } else if (response.status === 404) {
                setHasScore(false);
                setScoreData(null);
            } else {
                throw new Error('Failed to check score status');
            }
        } catch (err) {
            console.error('Error checking score:', err);
            setHasScore(false);
            setScoreData(null);
        } finally {
            setScoreLoading(false);
        }
    };

    const categorizeAssignments = (assignments) => {
        const now = new Date();
        const categorized = {
            upcoming: [],
            ongoing: [],
            completed: []
        };

        assignments.forEach(assignment => {
            const start = new Date(assignment.assignmentId.startTime);
            const end = new Date(assignment.assignmentId.endTime);

            if (now < start) {
                categorized.upcoming.push(assignment);
            } else if (now > end) {
                categorized.completed.push(assignment);
            } else {
                categorized.ongoing.push(assignment);
            }
        });

        setSectionedAssignments(categorized);
    };

    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleAssignmentClick = (assignment) => {
        setSelectedAssignment(assignment);
        setHasScore(false);
        setScoreData(null);
    };

    const handleStartAssignment = () => {
        if (!hasScore) {
            setShowQuestions(true);
        }
    };

    const handleBackFromQuestions = () => {
        setShowQuestions(false);
        checkForExistingScore();
    };

    const handleBackToAssignments = () => {
        setSelectedAssignment(null);
    };

    if (loading) return <div className="loading-screen">Loading your assignments...</div>;
    if (error) return <div className="error-screen">Error: {error}</div>;
    
    if (showQuestions && selectedAssignment) {
        return <AssignmentQuestions 
            assignmentId={selectedAssignment.assignmentId._id}
            assignmentData={selectedAssignment}
            onBack={handleBackFromQuestions}
        />;
    }

    if (selectedAssignment) {
        return (
            <div className="assignment-detail-container">
                <nav className="detail-nav">
                    <button onClick={handleBackToAssignments} className="nav-back">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        All Assignments
                    </button>
                </nav>
                
                <div className="assignment-content">
                    <header className="assignment-header">
                        <h1>{selectedAssignment.assignmentId.title}</h1>
                        <p className="assignment-description">{selectedAssignment.assignmentId.description}</p>
                    </header>
                    
                    <div className="timeline-grid">
                        <div className="timeline-card">
                            <div className="timeline-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                            </div>
                            <div>
                                <div className="timeline-label">Start Time</div>
                                <div className="timeline-value">{formatDate(selectedAssignment.assignmentId.startTime)}</div>
                            </div>
                        </div>
                        
                        <div className="timeline-card">
                            <div className="timeline-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div>
                                <div className="timeline-label">End Time</div>
                                <div className="timeline-value">{formatDate(selectedAssignment.assignmentId.endTime)}</div>
                            </div>
                        </div>
                    </div>
                    
                    {scoreLoading ? (
                        <div className="loading-indicator">
                            <div className="spinner"></div>
                            Loading assignment status
                        </div>
                    ) : (
                        <div className="action-panel">
                            {activeTab === 'ongoing' && (
                                hasScore ? (
                                    <div className="completion-badge">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                        </svg>
                                        Already Completed
                                    </div>
                                ) : (
                                    <button className="primary-action-btn" onClick={handleStartAssignment}>
                                        Begin Assignment
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                                        </svg>
                                    </button>
                                )
                            )}
                            
                            {activeTab === 'completed' && hasScore && scoreData && (
                                <div className="score-display">
                                    <div className="score-card">
                                        <div className="score-header">
                                            <h3>Your Results</h3>
                                            <div className="score-badge">
                                                Score: {scoreData.score}/{scoreData.totalPossibleScore}
                                            </div>
                                        </div>
                                        <div className="score-details">
                                            <div className="score-metric">
                                                <span className="metric-label">Correct Answers:</span>
                                                <span className="metric-value">{scoreData.correctAnswers}</span>
                                            </div>
                                            <div className="score-metric">
                                                <span className="metric-label">Wrong Answers:</span>
                                                <span className="metric-value">{scoreData.wrongAnswers}</span>
                                            </div>
                                            <div className="score-metric">
                                                <span className="metric-label">Percentage:</span>
                                                <span className="metric-value">
                                                    {Math.round((scoreData.score / scoreData.totalPossibleScore) * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'completed' && !hasScore && (
                                <div className="completion-badge missed">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                    Not Attempted
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="assignments-container">
            <header className="page-header">
                <h1>Your Assignments</h1>
                <div className="tabs-container">
                    <button 
                        className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming
                        <span className="tab-count">{sectionedAssignments.upcoming.length}</span>
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'ongoing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ongoing')}
                    >
                        Ongoing
                        <span className="tab-count">{sectionedAssignments.ongoing.length}</span>
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Completed
                        <span className="tab-count">{sectionedAssignments.completed.length}</span>
                    </button>
                </div>
            </header>

            <main className="assignments-grid">
                {sectionedAssignments[activeTab].length > 0 ? (
                    sectionedAssignments[activeTab].map(assignment => (
                        <div 
                            key={assignment._id} 
                            className={`assignment-card ${activeTab}`}
                            onClick={() => handleAssignmentClick(assignment)}
                        >
                            <div className="card-content">
                                <h3>{assignment.assignmentId.title}</h3>
                                <p>{assignment.assignmentId.description}</p>
                                <div className="card-meta">
                                    <div className="meta-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                        <span>
                                            {activeTab === 'upcoming' ? 'Starts: ' : 
                                             activeTab === 'ongoing' ? 'Ends: ' : 'Completed: '}
                                            {formatDate(
                                                activeTab === 'upcoming' ? assignment.assignmentId.startTime :
                                                activeTab === 'ongoing' ? assignment.assignmentId.endTime :
                                                assignment.assignmentId.endTime
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className={`status-indicator ${activeTab}`}>
                                {activeTab === 'upcoming' ? 'Upcoming' : 
                                 activeTab === 'ongoing' ? 'Active' : 'Completed'}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <h3>No {activeTab} assignments</h3>
                        <p>You don't have any {activeTab.toLowerCase()} assignments right now</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ImmediateQuest;