import React, { useState } from 'react';
import { Select, Input, Button, Form, Row, Col, Card, message, Modal, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import MCQUpload from './McqUpload';
import ComprehensiveUpload from './ComprehensiveUpload';
import './AddQuestionAndOptions.css';
import MathSymbolsKeyboard from './MathSymbolsKeyboard';
import { addStyles, EditableMathField } from 'react-mathquill';

const { Option } = Select;
addStyles();

const AddQuestionAndOptions = ({ chapters }) => {
  const [questions, setQuestions] = useState([{
    question: '',
    questionType: '',
    options: { 
      A: { text: '', image: '', fileName: '' }, 
      B: { text: '', image: '', fileName: '' }, 
      C: { text: '', image: '', fileName: '' }, 
      D: { text: '', image: '', fileName: '' } 
    },
    correctAnswer: [],
    solution: '',
    paragraph: '',
    subQuestions: [{
      subQuestion: '', 
      options: { 
        A: { text: '', image: '', fileName: '' }, 
        B: { text: '', image: '', fileName: '' }, 
        C: { text: '', image: '', fileName: '' }, 
        D: { text: '', image: '', fileName: '' } 
      }, 
      correctAnswer: [],
      solution: ''
    }],
    adminId: '' // Optional field
  }]);

  const [questionType, setQuestionType] = useState('');
  const [questionSubType, setQuestionSubType] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [activeInput, setActiveInput] = useState(null);

  const handleQuestionTypeChange = (value) => {
    setQuestionType(value);
    setQuestionSubType('');
    setQuestions([{
      question: '',
      questionType: '',
      options: { 
        A: { text: '', image: '', fileName: '' }, 
        B: { text: '', image: '', fileName: '' }, 
        C: { text: '', image: '', fileName: '' }, 
        D: { text: '', image: '', fileName: '' } 
      },
      correctAnswer: [],
      solution: '',
      paragraph: '',
      subQuestions: [{
        subQuestion: '', 
        options: { 
          A: { text: '', image: '', fileName: '' }, 
          B: { text: '', image: '', fileName: '' }, 
          C: { text: '', image: '', fileName: '' }, 
          D: { text: '', image: '', fileName: '' } 
        }, 
        correctAnswer: [],
        solution: ''
      }],
      adminId: ''
    }]);
  };

  const handleQuestionSubTypeChange = (value) => {
    setQuestionSubType(value);
    if (value === 'Comprehension') {
      setQuestions([{
        question: '',
        questionType: value,
        paragraph: '',
        solution: '',
        subQuestions: [{
          subQuestion: '', 
          options: { 
            A: { text: '', image: '', fileName: '' }, 
            B: { text: '', image: '', fileName: '' }, 
            C: { text: '', image: '', fileName: '' }, 
            D: { text: '', image: '', fileName: '' } 
          }, 
          correctAnswer: [],
          solution: ''
        }],
        adminId: ''
      }]);
    } else {
      setQuestions([{
        question: '',
        questionType: value,
        options: { 
          A: { text: '', image: '', fileName: '' }, 
          B: { text: '', image: '', fileName: '' }, 
          C: { text: '', image: '', fileName: '' }, 
          D: { text: '', image: '', fileName: '' } 
        },
        correctAnswer: [],
        solution: '',
        adminId: ''
      }]);
    }
  };

  const handleChapterChange = (value) => {
    const selected = chapters.find(chapter => chapter.chapterId === value);
    setSelectedChapter(selected);
  };

  const handleSolutionChange = (index, e) => {
    const { value } = e.target;
    const updatedQuestions = [...questions];
    updatedQuestions[index].solution = value;
    setQuestions(updatedQuestions);
  };

  const handleSubSolutionChange = (questionIndex, subQuestionIndex, e) => {
    const { value } = e.target;
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].subQuestions[subQuestionIndex].solution = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (index, option, e) => {
    const { value } = e.target;
    const updatedQuestions = [...questions];
    updatedQuestions[index].options[option].text = value;
    setQuestions(updatedQuestions);
  };

  const handleImageUpload = (index, option, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target.result;
      const updatedQuestions = [...questions];
      updatedQuestions[index].options[option].image = base64Image;
      updatedQuestions[index].options[option].fileName = file.name;
      setQuestions(updatedQuestions);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleCorrectAnswerChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].correctAnswer = Array.isArray(value) ? value : [value];
    setQuestions(updatedQuestions);
  };

  const handleSubCorrectAnswerChange = (questionIndex, subQuestionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].subQuestions[subQuestionIndex].correctAnswer = Array.isArray(value) ? value : [value];
    setQuestions(updatedQuestions);
  };

  const handleSubImageUpload = (questionIndex, subQuestionIndex, option, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target.result;
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex].subQuestions[subQuestionIndex].options[option].image = base64Image;
      updatedQuestions[questionIndex].subQuestions[subQuestionIndex].options[option].fileName = file.name;
      setQuestions(updatedQuestions);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleAddQuestion = () => {
    const newQuestion = questionSubType === 'Comprehension' 
      ? {
          question: '',
          questionType: questionSubType,
          paragraph: '',
          solution: '',
          subQuestions: [{
            subQuestion: '',
            options: { 
              A: { text: '', image: '', fileName: '' }, 
              B: { text: '', image: '', fileName: '' }, 
              C: { text: '', image: '', fileName: '' }, 
              D: { text: '', image: '', fileName: '' } 
            },
            correctAnswer: [],
            solution: ''
          }],
          adminId: ''
        }
      : {
          question: '',
          questionType: questionSubType,
          options: { 
            A: { text: '', image: '', fileName: '' }, 
            B: { text: '', image: '', fileName: '' }, 
            C: { text: '', image: '', fileName: '' }, 
            D: { text: '', image: '', fileName: '' } 
          },
          correctAnswer: [],
          solution: '',
          adminId: ''
        };

    setQuestions([...questions, newQuestion]);
  };

  const handleAddSubQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].subQuestions.push({
      subQuestion: '',
      options: { 
        A: { text: '', image: '', fileName: '' }, 
        B: { text: '', image: '', fileName: '' }, 
        C: { text: '', image: '', fileName: '' }, 
        D: { text: '', image: '', fileName: '' } 
      },
      correctAnswer: [],
      solution: ''
    });
    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (index, latex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = latex;
    setQuestions(updatedQuestions);
  };

  const handleParagraphChange = (index, latex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].paragraph = latex;
    setQuestions(updatedQuestions);
  };

  const handleSubQuestionChange = (index, subIndex, latex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].subQuestions[subIndex].subQuestion = latex;
    setQuestions(updatedQuestions);
  };

  const handleSubOptionChange = (index, subIndex, option, latex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].subQuestions[subIndex].options[option].text = latex;
    setQuestions(updatedQuestions);
  };

  const handleInsertSymbol = (symbol) => {
    if (!activeInput) return;
  
    const { index, field, option, subIndex } = activeInput;
    const updatedQuestions = [...questions];
  
    if (field === 'question') {
      updatedQuestions[index].question += ` ${symbol} `;
    } else if (field === 'paragraph') {
      updatedQuestions[index].paragraph += ` ${symbol} `;
    } else if (field === 'subQuestion') {
      updatedQuestions[index].subQuestions[subIndex].subQuestion += ` ${symbol} `;
    } else if (field === 'option') {
      updatedQuestions[index].options[option].text += ` ${symbol} `;
    } else if (field === 'subOption') {
      updatedQuestions[index].subQuestions[subIndex].options[option].text += ` ${symbol} `;
    } else if (field === 'solution') {
      updatedQuestions[index].solution += ` ${symbol} `;
    } else if (field === 'subSolution') {
      updatedQuestions[index].subQuestions[subIndex].solution += ` ${symbol} `;
    }
  
    setQuestions(updatedQuestions);
  };

  const handleInputFocus = (index, field, option = null, subIndex = null) => {
    setActiveInput({ index, field, option, subIndex });
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleRemoveSubQuestion = (questionIndex, subQuestionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].subQuestions.splice(subQuestionIndex, 1);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    if (!selectedChapter) {
      message.error('Please select a chapter');
      return;
    }
    if (!questionType) {
      message.error('Please select a question type');
      return;
    }
    if (!questionSubType) {
      message.error('Please select a question sub-type');
      return;
    }
  
    // Validate all questions
    for (const question of questions) {
      if (!question.question.trim()) {
        message.error('Please fill in all questions');
        return;
      }

      if (questionSubType === 'MCQ') {
        for (const option in question.options) {
          if (!question.options[option].text.trim()) {
            message.error(`Please fill in all options for question: ${question.question}`);
            return;
          }
        }
        if (question.correctAnswer.length === 0) {
          message.error(`Please select correct answer(s) for question: ${question.question}`);
          return;
        }
      } else if (questionSubType === 'Comprehension') {
        if (!question.paragraph.trim()) {
          message.error('Please provide a paragraph for Comprehension questions');
          return;
        }

        for (const subQuestion of question.subQuestions) {
          if (!subQuestion.subQuestion.trim()) {
            message.error('Please fill in all sub-questions');
            return;
          }
          if (subQuestion.correctAnswer.length === 0) {
            message.error(`Please select correct answer(s) for sub-question: ${subQuestion.subQuestion}`);
            return;
          }
          for (const option in subQuestion.options) {
            if (!subQuestion.options[option].text.trim()) {
              message.error(`Please fill in all options for sub-question: ${subQuestion.subQuestion}`);
              return;
            }
          }
        }
      }
    }
  
    const finalData = questions.map(question => ({
      chapterId: selectedChapter.chapterId,
      question: question.question,
      questionType: questionSubType,
      options: question.options,
      correctAnswer: question.correctAnswer,
      solution: question.solution,
      paragraph: questionSubType === 'Comprehension' ? question.paragraph : undefined,
      subQuestions: questionSubType === 'Comprehension' 
        ? question.subQuestions.map(subQuestion => ({
            subQuestion: subQuestion.subQuestion,
            options: subQuestion.options,
            correctAnswer: subQuestion.correctAnswer,
            solution: subQuestion.solution
          }))
        : undefined,
      adminId: question.adminId || undefined
    }));
  
    console.log('Final Data:', JSON.stringify(finalData, null, 2));

    try {
      const apiUrl = getApiUrl(questionType, questionSubType);
  
      for (const question of finalData) {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(question),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to submit question: ${question.question}`);
        }
      }
  
      message.success('Questions submitted successfully');
  
      // Reset form
      setQuestions([{
        question: '',
        questionType: '',
        options: { 
          A: { text: '', image: '', fileName: '' }, 
          B: { text: '', image: '', fileName: '' }, 
          C: { text: '', image: '', fileName: '' }, 
          D: { text: '', image: '', fileName: '' } 
        },
        correctAnswer: [],
        solution: '',
        paragraph: '',
        subQuestions: [{
          subQuestion: '', 
          options: { 
            A: { text: '', image: '', fileName: '' }, 
            B: { text: '', image: '', fileName: '' }, 
            C: { text: '', image: '', fileName: '' }, 
            D: { text: '', image: '', fileName: '' } 
          }, 
          correctAnswer: [],
          solution: ''
        }],
        adminId: ''
      }]);
      setQuestionType('');
      setQuestionSubType('');
      setSelectedChapter(null);
      setIsModalVisible(false);
      setModalContent(null);
      setActiveInput(null);
  
    } catch (error) {
      message.error(`Error: ${error.message}`);
    }
  };

  const getApiUrl = (type, subType) => {
    let apiUrl = '';
    switch (type) {
      case 'understand':
        apiUrl = 'http://localhost:5000/api/understand/questions';
        break;
      case 'remeber':
        apiUrl = 'http://localhost:5000/api/remember/questions';
        break;
      case 'eval':
        apiUrl = 'http://localhost:5000/api/eval/questions';
        break;
      case 'apply':
        apiUrl = 'http://localhost:5000/api/apply/questions';
        break;
      case 'analyse':
        apiUrl = 'http://localhost:5000/api/analyse/questions';
        break;
      default:
        apiUrl = '';
    }
    return apiUrl;
  };

  const handleButton1Click = () => {
    if (!selectedChapter) {
      message.error('Please select a chapter');
      return;
    }

    setModalContent(
      <MCQUpload 
        chapterId={selectedChapter.chapterId} 
        chapterName={selectedChapter.chapterName} 
        questionType={questionType} 
      />
    );
    setIsModalVisible(true);
  };

  const handleButton2Click = () => {
    if (!selectedChapter) {
      message.error('Please select a chapter');
      return;
    }

    setModalContent(
      <ComprehensiveUpload 
        chapterId={selectedChapter.chapterId} 
        chapterName={selectedChapter.chapterName} 
        questionType={questionType} 
      />
    );
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setModalContent(null);
  };

  return (
    <div>
      <Card className="modern-card glass-bg" title="Chapter Selection">
        <Form.Item label="Select Chapter" className="form-group">
          <Select
            className="modern-select"
            value={selectedChapter?.chapterId || ''}
            onChange={handleChapterChange}
            placeholder="Select a Chapter"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {chapters.map(chapter => (
              <Option key={chapter.chapterId} value={chapter.chapterId}>
                {chapter.chapterName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Card>

      <Card className="modern-card glass-bg margin-top-20" title="Question Configuration">
        <Form layout="vertical">
          <Form.Item label="Question Type" className="form-group">
            <Select
              className="modern-select"
              value={questionType}
              onChange={handleQuestionTypeChange}
              placeholder="Select Question Type"
            >
              <Option value="understand">Understand</Option>
              <Option value="remeber">Remember</Option>
              <Option value="eval">Evaluate</Option>
              <Option value="apply">Apply</Option>
              <Option value="analyse">Analyze</Option>
            </Select>
          </Form.Item>

          {questionType && (
            <Row gutter={16} className="button-group">
              <Col span={12}>
                <Button
                  className="button-dashed"
                  onClick={handleButton1Click}
                >
                  <span className="button-label">MCQ</span>
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  className="button-dashed"
                  onClick={handleButton2Click}
                >
                  <span className="button-label">Comprehensive</span>
                </Button>
              </Col>
            </Row>
          )}

          <Modal
            className="modern-modal"
            title="Upload Questions"
            visible={isModalVisible}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnClose
          >
            {modalContent}
          </Modal>

          {questionType && (
            <Form.Item label="Question Sub-Type" className="form-group">
              <Select
                className="modern-select"
                value={questionSubType}
                onChange={handleQuestionSubTypeChange}
                placeholder="Select Sub-Type"
              >
                <Option value="MCQ">MCQ</Option>
                <Option value="Comprehension">Comprehension</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Card>

      {questionSubType === 'MCQ' && questions.map((question, index) => (
        <Card key={index} className="question-container glass-bg margin-top-20">
          <Form.Item label={`Question ${index + 1}`} className="form-group">
            <EditableMathField
              className="form-input adaptive-textarea"
              latex={question.question}
              onChange={(mathField) => handleQuestionChange(index, mathField.latex())}
              onFocus={() => handleInputFocus(index, 'question')}
              placeholder="Enter your question"
            />
          </Form.Item>

          <MathSymbolsKeyboard onInsert={handleInsertSymbol} />

          <div className="option-grid">
            {['A', 'B', 'C', 'D'].map(option => (
              <div key={option} className="option-item">
                <Form.Item label={`Option ${option}`} className="form-group">
                  <EditableMathField
                    className="form-input"
                    latex={question.options[option].text}
                    onChange={(mathField) => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[index].options[option].text = mathField.latex();
                      setQuestions(updatedQuestions);
                    }}
                    onFocus={() => handleInputFocus(index, 'option', option)}
                    placeholder={`Option ${option}`}
                  />
                  <Upload
                    beforeUpload={(file) => handleImageUpload(index, option, file)}
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />}>Upload Image</Button>
                  </Upload>
                  {question.options[option].fileName && (
                    <div className="file-name">{question.options[option].fileName}</div>
                  )}
                </Form.Item>
              </div>
            ))}
          </div>

          <Form.Item label="Correct Answer" className="form-group">
            <Select
              mode="multiple"
              className="modern-select"
              value={question.correctAnswer}
              onChange={(value) => handleCorrectAnswerChange(index, value)}
              placeholder="Select correct answer(s)"
            >
              {['A', 'B', 'C', 'D'].map(option => (
                <Option key={option} value={option}>Option {option}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Solution (Optional)" className="form-group">
            <Input.TextArea
              className="form-input"
              value={question.solution}
              onChange={(e) => handleSolutionChange(index, e)}
              onFocus={() => handleInputFocus(index, 'solution')}
              placeholder="Enter solution/explanation"
              rows={3}
            />
            <MathSymbolsKeyboard onInsert={handleInsertSymbol} />
          </Form.Item>

          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button
              type="danger"
              onClick={() => handleRemoveQuestion(index)}
            >
              Remove Question
            </Button>
          </div>
        </Card>
      ))}

      {questionSubType === 'Comprehension' && questions.map((question, index) => (
        <Card key={index} className="question-container glass-bg margin-top-20">
          <Form.Item label={`Main Question ${index + 1}`} className="form-group">
            <EditableMathField
              className="form-input adaptive-textarea"
              latex={question.question}
              onChange={(mathField) => handleQuestionChange(index, mathField.latex())}
              onFocus={() => handleInputFocus(index, 'question')}
              placeholder="Enter main question"
            />
          </Form.Item>

          <MathSymbolsKeyboard onInsert={handleInsertSymbol} />

          <Form.Item label="Paragraph" className="form-group">
            <EditableMathField
              className="form-input adaptive-textarea"
              latex={question.paragraph}
              onChange={(mathField) => handleParagraphChange(index, mathField.latex())}
              onFocus={() => handleInputFocus(index, 'paragraph')}
              placeholder="Enter paragraph"
            />
          </Form.Item>

          <Form.Item label="Main Solution (Optional)" className="form-group">
            <Input.TextArea
              className="form-input"
              value={question.solution}
              onChange={(e) => handleSolutionChange(index, e)}
              onFocus={() => handleInputFocus(index, 'solution')}
              placeholder="Enter main solution/explanation"
              rows={3}
            />
            <MathSymbolsKeyboard onInsert={handleInsertSymbol} />
          </Form.Item>

          {question.subQuestions.map((subQuestion, subIndex) => (
            <Card key={subIndex} className="sub-question-container glass-bg">
              <Form.Item label={`Sub-question ${subIndex + 1}`} className="form-group">
                <EditableMathField
                  className="form-input adaptive-textarea"
                  latex={subQuestion.subQuestion}
                  onChange={(mathField) => handleSubQuestionChange(index, subIndex, mathField.latex())}
                  onFocus={() => handleInputFocus(index, 'subQuestion', null, subIndex)}
                  placeholder="Enter sub-question"
                />
              </Form.Item>

              <MathSymbolsKeyboard onInsert={handleInsertSymbol} />

              <Row gutter={16}>
                {['A', 'B', 'C', 'D'].map(option => (
                  <Col key={option} xs={24} md={12}>
                    <Form.Item label={`Option ${option}`} className="form-group">
                      <EditableMathField
                        className="form-input"
                        latex={subQuestion.options[option].text}
                        onChange={(mathField) => handleSubOptionChange(index, subIndex, option, mathField.latex())}
                        onFocus={() => handleInputFocus(index, 'subOption', option, subIndex)}
                        placeholder={`Option ${option}`}
                      />
                      <Upload
                        beforeUpload={(file) => handleSubImageUpload(index, subIndex, option, file)}
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />}>Upload Image</Button>
                      </Upload>
                      {subQuestion.options[option].fileName && (
                        <div className="file-name">{subQuestion.options[option].fileName}</div>
                      )}
                    </Form.Item>
                  </Col>
                ))}
              </Row>

              <Form.Item label="Correct Answer" className="form-group">
                <Select
                  mode="multiple"
                  className="modern-select"
                  value={subQuestion.correctAnswer}
                  onChange={(value) => handleSubCorrectAnswerChange(index, subIndex, value)}
                  placeholder="Select correct answer(s)"
                >
                  {['A', 'B', 'C', 'D'].map(option => (
                    <Option key={option} value={option}>Option {option}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Solution (Optional)" className="form-group">
                <Input.TextArea
                  className="form-input"
                  value={subQuestion.solution}
                  onChange={(e) => handleSubSolutionChange(index, subIndex, e)}
                  onFocus={() => handleInputFocus(index, 'subSolution', null, subIndex)}
                  placeholder="Enter solution/explanation"
                  rows={3}
                />
                <MathSymbolsKeyboard onInsert={handleInsertSymbol} />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <Button
                  type="danger"
                  onClick={() => handleRemoveSubQuestion(index, subIndex)}
                >
                  Remove Sub-question
                </Button>
              </div>
            </Card>
          ))}

          <Button 
            className="button-dashed margin-top-20"
            onClick={() => handleAddSubQuestion(index)}
          >
            Add Sub-question
          </Button>

          

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button
              type="danger"
              onClick={() => handleRemoveQuestion(index)}
            >
              Remove Question Set
            </Button>
          </div>
        </Card>
      ))}

      <div className="action-buttons margin-top-20">
        <Button 
          className="button-dashed"
          onClick={handleAddQuestion}
        >
          Add New Question Set
        </Button>
        
        <Button 
          className="button-primary margin-top-20"
          onClick={handleSubmit}
        >
          Submit All Questions
        </Button>
      </div>
    </div>
  );
};

export default AddQuestionAndOptions;