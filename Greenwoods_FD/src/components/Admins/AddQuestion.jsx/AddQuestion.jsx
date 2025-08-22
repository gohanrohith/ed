import React, { useEffect, useState } from 'react';
import { Select, Spin, Alert, Row, Col, Card, Button } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { SmileOutlined, LoadingOutlined } from '@ant-design/icons';
import AddQuestionAndOptions from './AddQuestionAndOptions';
import './AddQuestion.css';
import MathSymbolsKeyboard from './MathSymbolsKeyboard';
const { Option } = Select;

const AddQuestion = () => {
  const [subjectsData, setSubjectsData] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [chaptersError, setChaptersError] = useState(null);
  const [showAddQuestionAndOptions, setShowAddQuestionAndOptions] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/classSubjects/getAll');
        if (!response.ok) {
          throw new Error('Failed to fetch subjects');
        }
        const data = await response.json();
        setSubjectsData(data.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleClassChange = (value) => {
    setSelectedClass(value);
    const filtered = subjectsData.filter(subject => subject.class === value);
    setFilteredSubjects(filtered);

    setSelectedSubjectId(null);
    setChapters([]);
    setShowAddQuestionAndOptions(false);
  };

  const handleSubjectChange = (value) => {
    setSelectedSubjectId(value);

    setChapters([]);
    setShowAddQuestionAndOptions(false);
  };

  const handleGetChapters = async () => {
    if (!selectedSubjectId) {
      alert('Please select a subject.');
      return;
    }

    setChaptersLoading(true);
    setChaptersError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/chapters/get/${selectedSubjectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chapters');
      }
      const data = await response.json();

      const chaptersList = data.data.map((chapter) => ({
        chapterName: chapter.chapterName,
        chapterId: chapter._id,
      }));

      setChapters(chaptersList);
      setShowAddQuestionAndOptions(true);
    } catch (error) {
      setChaptersError(error.message);
    } finally {
      setChaptersLoading(false);
    }
  };

  return (
    <Row justify="center" style={{ paddingTop: 10 }}>
      <Col xs={24} md={20} lg={18}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card title="Select Class, Subject, and Get Chapters" bordered={true} className="modern-card">
            {loading ? (
              <div className="loading-container">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} />} />
              </div>
            ) : error ? (
              <Alert message="Error" description={error} type="error" showIcon />
            ) : (
              <>
                <div className="form-container">
                  <AnimatePresence>
                    <motion.div
                      key="class-select"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 120 }}
                      className="form-group"
                    >
                      <label className="form-label">Select Class</label>
                      <Select
                        value={selectedClass}
                        onChange={handleClassChange}
                        className="modern-select"
                        placeholder="Select a Class"
                      >
                        <Option value="">-- Select a Class --</Option>
                        {Array.from(new Set(subjectsData.map(subject => subject.class))).map(classItem => (
                          <Option key={classItem} value={classItem}>Class {classItem}</Option>
                        ))}
                      </Select>
                    </motion.div>
                  </AnimatePresence>

                  {selectedClass && (
                    <AnimatePresence>
                      <motion.div
                        key="subject-select"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
                        className="form-group"
                      >
                        <label className="form-label">Select Subject</label>
                        <Select
                          value={selectedSubjectId}
                          onChange={handleSubjectChange}
                          className="modern-select"
                          placeholder="Select a Subject"
                        >
                          <Option value="">-- Select a Subject --</Option>
                          {filteredSubjects.map(subject => (
                            <Option key={subject._id} value={subject._id}>{subject.subject}</Option>
                          ))}
                        </Select>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>

                {selectedSubjectId && (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Button
                      type="primary"
                      onClick={handleGetChapters}
                      loading={chaptersLoading}
                      className="action-button"
                      icon={<SmileOutlined />}
                    >
                      Get Chapters 📚
                    </Button>
                  </motion.div>
                )}

                <AnimatePresence>
                  {showAddQuestionAndOptions && chapters.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="chapters-container"
                    >
                      <AddQuestionAndOptions chapters={chapters} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {chaptersError && (
                  <div className="error-container">
                    <Alert message="Error" description={chaptersError} type="error" showIcon />
                  </div>
                )}
              </>
            )}
          </Card>
        </motion.div>
      </Col>
    </Row>
  );
};

export default AddQuestion;
