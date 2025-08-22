import React, { useEffect, useState, useCallback } from 'react';
import {
  Descriptions, Typography, Button, Divider, Empty,
  Select, Spin, message, Card, Modal, Radio,
  Image, Form, Input, Upload, Layout, Alert
} from 'antd';
import { PlusOutlined, FilterOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;
const { Content, Sider } = Layout;

const API_BASE_URL = 'http://localhost:5000/api';

const questionTypes = [
  { value: 'remember', label: 'Remember' },
  { value: 'understand', label: 'Understand' },
  { value: 'apply', label: 'Apply' },
  { value: 'analyse', label: 'Analyse' },
  { value: 'eval', label: 'Evaluate' }
];

const QuestionTile = ({ question, onSelect }) => {
  return (
    <Card hoverable style={{ marginBottom: 16 }} onClick={() => onSelect(question)}>
      <Text strong ellipsis={{ tooltip: question.question }}>
        {question.question.replace(/\\ /g, ' ')}
      </Text>
      <div style={{ marginTop: 8 }}>
        {question.options && Object.entries(question.options).map(([key, option]) => (
          <div key={key}>
            <Text>{key}. {option.text.replace(/\\ /g, ' ')}</Text>
            {option.image && (
              <Image
                width={50}
                src={option.image}
                alt={`Option ${key}`}
                preview={false}
                style={{ marginLeft: 8 }}
              />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

const NewQuestionForm = ({ form, onSubmit, onCancel }) => {
  const [optionImages, setOptionImages] = useState({});

  const normFile = (e) => Array.isArray(e) ? e : e?.fileList;

  const handleOptionImageChange = (optionKey, info) => {
    const file = info.file;
    const reader = new FileReader();
    reader.onload = () => {
      setOptionImages(prev => ({ ...prev, [optionKey]: reader.result }));
      form.setFieldsValue({
        options: {
          ...form.getFieldValue('options'),
          [optionKey]: {
            ...form.getFieldValue(['options', optionKey]),
            image: reader.result
          }
        }
      });
    };
    reader.readAsDataURL(file.originFileObj);
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="questionType"
        label="Question Type"
        initialValue="MCQ"
        rules={[{ required: true }]}
      >
        <Radio.Group>
          <Radio value="MCQ">Multiple Choice</Radio>
          <Radio value="TF" disabled>True/False</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="question"
        label="Question Text"
        rules={[
          { required: true, message: 'Please enter the question text' },
          { min: 10, message: 'Question must be at least 10 characters' }
        ]}
      >
        <Input.TextArea rows={3} showCount maxLength={500} />
      </Form.Item>

      {['A', 'B', 'C', 'D'].map(optionKey => (
        <div key={optionKey} style={{ marginBottom: 16 }}>
          <Form.Item
            name={['options', optionKey, 'text']}
            label={`Option ${optionKey}`}
            rules={[
              { required: true, message: `Please enter option ${optionKey}` },
              { min: 1, message: 'Option cannot be empty' }
            ]}
          >
            <Input showCount maxLength={200} />
          </Form.Item>
          <Form.Item
            name={['options', optionKey, 'image']}
            label={`Option ${optionKey} Image`}
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              beforeUpload={() => false}
              listType="picture"
              onChange={(info) => handleOptionImageChange(optionKey, info)}
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>
          {optionImages[optionKey] && (
            <Image
              width={100}
              src={optionImages[optionKey]}
              alt={`Option ${optionKey} preview`}
              preview={false}
            />
          )}
        </div>
      ))}

      <Form.Item
        name="correctAnswer"
        label="Correct Answer(s)"
        rules={[
          { required: true, message: 'Please select correct answer(s)' },
          { type: 'array', min: 1, message: 'Select at least one correct answer' }
        ]}
      >
        <Select
          mode="multiple"
          placeholder="Select correct answer(s)"
          allowClear
          style={{ width: '100%' }}
        >
          {['A', 'B', 'C', 'D'].map(option => (
            <Select.Option key={option} value={option}>
              Option {option}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  );
};

const OngoingAddQuestion = ({ assignment }) => {
  const [form] = Form.useForm();
  const [state, setState] = useState({
    subjects: [],
    chapters: [],
    questions: [],
    selectedSubject: null,
    selectedChapter: null,
    selectedType: 'remember',
    selectedQuestions: [],
    loading: {
      subjects: false,
      chapters: false,
      questions: false,
      submitting: false
    },
    error: null,
    modal: {
      visible: false,
      mode: null, // 'create' or 'preview'
      question: null
    }
  });

  // Memoized fetch functions
  const fetchSubjects = useCallback(async (classId) => {
    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, subjects: true }, error: null }));
      
      const response = await axios.get(`${API_BASE_URL}/classSubjects/subjects/${classId}`);
      setState(prev => ({
        ...prev,
        subjects: response.data.data || [],
        loading: { ...prev.loading, subjects: false }
      }));
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, subjects: false },
        error: "Failed to load subjects"
      }));
      message.error("Failed to load subjects");
    }
  }, []);

  const fetchChapters = useCallback(async (subjectId) => {
    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, chapters: true }, error: null }));
      
      const response = await axios.get(`${API_BASE_URL}/chapters/get/${subjectId}`);
      setState(prev => ({
        ...prev,
        chapters: response.data.data || [],
        selectedChapter: null,
        questions: [],
        loading: { ...prev.loading, chapters: false }
      }));
    } catch (err) {
      console.error("Error fetching chapters:", err);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, chapters: false },
        error: "Failed to load chapters"
      }));
      message.error("Failed to load chapters");
    }
  }, []);

  const fetchQuestions = useCallback(async (chapterId, type) => {
    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, questions: true }, error: null }));
      
      const response = await axios.get(`${API_BASE_URL}/${type}/questions/${chapterId}`);
      setState(prev => ({
        ...prev,
        questions: response.data.questions || [],
        loading: { ...prev.loading, questions: false }
      }));
    } catch (err) {
      console.error(`Error fetching ${type} questions:`, err);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, questions: false },
        error: `Failed to load ${type} questions`
      }));
      message.error(`Failed to load ${type} questions`);
    }
  }, []);

  // Effect hooks
  useEffect(() => {
    if (assignment?.class) {
      fetchSubjects(assignment.class);
    } else {
      setState(prev => ({
        ...prev,
        subjects: [],
        selectedSubject: null,
        chapters: [],
        selectedChapter: null,
        questions: [],
        selectedType: 'remember'
      }));
    }
  }, [assignment?.class, fetchSubjects]);

  useEffect(() => {
    if (state.selectedSubject) {
      fetchChapters(state.selectedSubject);
    }
  }, [state.selectedSubject, fetchChapters]);

  useEffect(() => {
    if (state.selectedChapter) {
      fetchQuestions(state.selectedChapter, state.selectedType);
    }
  }, [state.selectedChapter, state.selectedType, fetchQuestions]);

  // Handler functions
  const handleQuestionSelect = (question) => {
    setState(prev => ({
      ...prev,
      modal: {
        visible: true,
        mode: 'preview',
        question
      }
    }));
  };

  const handleAddQuestion = () => {
    if (state.modal.question) {
      setState(prev => ({
        ...prev,
        selectedQuestions: [...prev.selectedQuestions, state.modal.question],
        modal: { ...prev.modal, visible: false }
      }));
      message.success("Question added to assignment");
    }
  };

  const handleCreateQuestion = async () => {
    try {
      const values = await form.validateFields();
      const newQuestion = {
        questionType: values.questionType,
        question: values.question,
        options: values.options,
        correctAnswer: values.correctAnswer,
        assignmentId: assignment?._id,
        subjectId: state.selectedSubject,
        chapterId: state.selectedChapter,
        questionLevel: state.selectedType
      };

      setState(prev => ({
        ...prev,
        selectedQuestions: [...prev.selectedQuestions, newQuestion],
        modal: { ...prev.modal, visible: false }
      }));
      
      message.success("Question created and added to assignment");
      form.resetFields();
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  const handleRemoveQuestion = (index) => {
    setState(prev => ({
      ...prev,
      selectedQuestions: prev.selectedQuestions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitQuestions = async () => {
    if (state.selectedQuestions.length === 0) {
      message.warning("Please add at least one question");
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, submitting: true } }));
      
      const payload = {
        questions: state.selectedQuestions.map(q => ({
          assignmentId: assignment._id,
          questionType: q.questionType,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          subjectId: state.selectedSubject,
          chapterId: state.selectedChapter,
          questionLevel: state.selectedType
        }))
      };

      await axios.post(`${API_BASE_URL}/questions/multipleupload`, payload);
      
      setState(prev => ({
        ...prev,
        selectedQuestions: [],
        loading: { ...prev.loading, submitting: false }
      }));
      
      message.success(`${state.selectedQuestions.length} questions added successfully`);
    } catch (err) {
      console.error("Error submitting questions:", err);
      setState(prev => ({ ...prev, loading: { ...prev.loading, submitting: false } }));
      message.error("Failed to submit questions");
    }
  };

  if (!assignment) {
    return (
      <div className="no-assignment">
        <Empty description="No assignment selected" />
      </div>
    );
  }

  return (
    <div className="ongoing-add-question-container">
      {/* Assignment Details Section */}
      <Card title="Assignment Details" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Title">{assignment.title}</Descriptions.Item>
          <Descriptions.Item label="Class">{assignment.class}</Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {assignment.description || "No description provided"}
          </Descriptions.Item>
          <Descriptions.Item label="Start Time">
            {new Date(assignment.startTime).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="End Time">
            {new Date(assignment.endTime).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {state.error && (
        <Alert
          message="Error"
          description={state.error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Divider />

      {/* Main Content Area */}
      <Layout style={{ background: 'transparent', minHeight: '60vh' }}>
        {/* Left Side - Question Bank */}
        <Sider width={400} style={{ background: 'transparent', paddingRight: 24 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setState(prev => ({
              ...prev,
              modal: {
                visible: true,
                mode: 'create',
                question: null
              }
            }))}
            block
            style={{ marginBottom: 16 }}
          >
            Create New Question
          </Button>

          <Card title="Question Bank" style={{ marginBottom: 16 }}>
            <Form layout="vertical">
              <Form.Item label="Subject">
                <Select
                  placeholder={state.loading.subjects ? "Loading..." : "Select subject"}
                  value={state.selectedSubject}
                  onChange={(value) => setState(prev => ({
                    ...prev,
                    selectedSubject: value,
                    selectedChapter: null
                  }))}
                  loading={state.loading.subjects}
                  disabled={state.loading.subjects || state.subjects.length === 0}
                >
                  {state.subjects.map((subject) => (
                    <Option key={subject._id} value={subject._id}>
                      {subject.subject}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Chapter">
                <Select
                  placeholder={state.loading.chapters ? "Loading..." : "Select chapter"}
                  value={state.selectedChapter}
                  onChange={(value) => setState(prev => ({
                    ...prev,
                    selectedChapter: value
                  }))}
                  loading={state.loading.chapters}
                  disabled={!state.selectedSubject || state.loading.chapters || state.chapters.length === 0}
                >
                  {state.chapters.map((chapter) => (
                    <Option key={chapter._id} value={chapter._id}>
                      {chapter.chapterName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Question Type">
                <Select
                  value={state.selectedType}
                  onChange={(value) => setState(prev => ({
                    ...prev,
                    selectedType: value
                  }))}
                  disabled={!state.selectedChapter}
                >
                  {questionTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Available Questions">
            {state.loading.questions ? (
              <Spin tip="Loading questions..." style={{ width: '100%', padding: '40px 0' }} />
            ) : state.selectedChapter ? (
              state.questions.length > 0 ? (
                <div style={{ overflowY: 'auto', maxHeight: '40vh' }}>
                  {state.questions.map((question) => (
                    <QuestionTile
                      key={question._id}
                      question={question}
                      onSelect={handleQuestionSelect}
                    />
                  ))}
                </div>
              ) : (
                <Empty
                  description={
                    <Text type="secondary">
                      No {state.selectedType} questions found for this chapter
                    </Text>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )
            ) : (
              <Empty
                description={
                  state.selectedSubject ? 
                    "Please select a chapter" : 
                    "Please select a subject"
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Sider>

        {/* Right Side - Selected Questions */}
        <Content style={{ padding: '0 24px' }}>
          <Card
            title={`Selected Questions (${state.selectedQuestions.length})`}
            extra={
              <Button
                type="primary"
                onClick={handleSubmitQuestions}
                disabled={state.selectedQuestions.length === 0}
                loading={state.loading.submitting}
              >
                Submit Questions
              </Button>
            }
          >
            {state.selectedQuestions.length > 0 ? (
              <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
                {state.selectedQuestions.map((question, index) => (
                  <Card
                    key={`selected-${index}`}
                    style={{ marginBottom: 16 }}
                    actions={[
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveQuestion(index)}
                        block
                      >
                        Remove
                      </Button>
                    ]}
                  >
                    <Text strong>{question.question}</Text>
                    <div style={{ marginTop: 8 }}>
                      {question.options && Object.entries(question.options).map(([key, option]) => (
                        <div key={key}>
                          <Text>{key}. {option.text.replace(/\\ /g, ' ')}</Text>
                          {option.image && (
                            <Image
                              width={50}
                              src={option.image}
                              alt={`Option ${key}`}
                              preview={false}
                              style={{ marginLeft: 8 }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Text strong>Correct Answer(s): </Text>
                      <Text>
                        {Array.isArray(question.correctAnswer) ?
                          question.correctAnswer.join(', ') :
                          question.correctAnswer}
                      </Text>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty
                description="No questions selected yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Content>
      </Layout>

      {/* Question Preview Modal */}
      <Modal
        title="Question Preview"
        visible={state.modal.visible && state.modal.mode === 'preview'}
        onOk={handleAddQuestion}
        onCancel={() => setState(prev => ({
          ...prev,
          modal: { ...prev.modal, visible: false }
        }))}
        okText="Add to Assignment"
        width={700}
      >
        {state.modal.question && (
          <div>
            <Text strong style={{ fontSize: 16 }}>
              {state.modal.question.question.replace(/\\ /g, ' ')}
            </Text>
            
            <div style={{ marginTop: 16 }}>
              {state.modal.question.options && Object.entries(state.modal.question.options).map(([key, option]) => (
                <div key={key} style={{ marginBottom: 8 }}>
                  <Radio
                    checked={state.modal.question.correctAnswer.includes(key)}
                    disabled
                  >
                    <Text>{key}. {option.text.replace(/\\ /g, ' ')}</Text>
                  </Radio>
                  {option.image && (
                    <Image
                      width={100}
                      src={option.image}
                      alt={`Option ${key}`}
                      preview={false}
                      style={{ marginLeft: 24 }}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: 16 }}>
              <Text strong>Correct Answer(s): </Text>
              <Text>{state.modal.question.correctAnswer.join(', ')}</Text>
            </div>
            
            <div style={{ marginTop: 8 }}>
              <Text strong>Question Type: </Text>
              <Text>
                {questionTypes.find(t => t.value === state.modal.question.questionType)?.label ||
                  state.modal.question.questionType}
              </Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Question Modal */}
      <Modal
        title="Create New Question"
        visible={state.modal.visible && state.modal.mode === 'create'}
        onOk={handleCreateQuestion}
        onCancel={() => {
          setState(prev => ({
            ...prev,
            modal: { ...prev.modal, visible: false }
          }));
          form.resetFields();
        }}
        okText="Create"
        cancelText="Cancel"
        width={700}
      >
        <NewQuestionForm
          form={form}
          onSubmit={handleCreateQuestion}
          onCancel={() => {
            setState(prev => ({
              ...prev,
              modal: { ...prev.modal, visible: false }
            }));
            form.resetFields();
          }}
        />
      </Modal>
    </div>
  );
};

export default OngoingAddQuestion;