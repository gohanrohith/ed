import React, { useState, useEffect } from 'react';
import { Select, Spin, Table, Tag } from 'antd';
import axios from 'axios';
import ChapterQuestions from './ChapterQuestions';
import './DownloadQuestion.css';

const { Option } = Select;

const DownloadQuestion = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState({ id: null, name: null });
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/classSubjects/getAll');
        const data = response.data.data;
        
        setSubjects(data);
        
        // Extract unique classes
        const uniqueClasses = [...new Set(data.map(item => item.class))];
        setClasses(uniqueClasses);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const filtered = subjects.filter(item => item.class === selectedClass);
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects([]);
    }
  }, [selectedClass, subjects]);

  const fetchChapters = async (subjectId) => {
    try {
      setChaptersLoading(true);
      const response = await axios.get(`http://localhost:5000/api/chapters/get/${subjectId}`);
      setChapters(response.data.data);
      setChaptersLoading(false);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      setChaptersLoading(false);
    }
  };

  const handleClassChange = (value) => {
    setSelectedClass(value);
    setSelectedSubject(null);
    setSelectedSubjectId(null);
    setSelectedChapter({ id: null, name: null });
    setChapters([]);
  };

  const handleSubjectChange = (value, option) => {
    setSelectedSubject(value);
    setSelectedSubjectId(option.key);
    setSelectedChapter({ id: null, name: null });
    fetchChapters(option.key);
  };

  const handleChapterChange = (value, option) => {
    setSelectedChapter({
      id: option.key,
      name: option.props.children
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="download-question-container">
      <h2>Select Class, Subject and Chapter</h2>
      
      <div className="selectors-container">
        <div className="selector-group">
          <label>Class:</label>
          <Select
            style={{ width: 200 }}
            placeholder="Select a class"
            onChange={handleClassChange}
            value={selectedClass}
          >
            {classes.map(cls => (
              <Option key={cls} value={cls}>{cls}</Option>
            ))}
          </Select>
        </div>

        <div className="selector-group">
          <label>Subject:</label>
          <Select
            style={{ width: 200 }}
            placeholder="Select a subject"
            disabled={!selectedClass}
            onChange={handleSubjectChange}
            value={selectedSubject}
            loading={chaptersLoading}
          >
            {filteredSubjects.map(subject => (
              <Option key={subject._id} value={subject.subject}>
                {subject.subject}
              </Option>
            ))}
          </Select>
        </div>

        <div className="selector-group">
          <label>Chapter:</label>
          <Select
            style={{ width: 200 }}
            placeholder="Select a chapter"
            disabled={!selectedSubjectId}
            onChange={handleChapterChange}
            loading={chaptersLoading}
          >
            {chapters.map(chapter => (
              <Option key={chapter._id} value={chapter.chapterName}>
                {chapter.chapterName}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {selectedChapter.id && (
        <div className="chapter-questions-section">
          <ChapterQuestions 
            chapterId={selectedChapter.id} 
            chapterName={selectedChapter.name} 
          />
        </div>
      )}
    </div>
  );
};

export default DownloadQuestion;