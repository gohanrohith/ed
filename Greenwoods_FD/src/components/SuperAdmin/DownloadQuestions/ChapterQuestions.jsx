import React, { useState, useEffect, useRef } from 'react';
import { Table, Tag, Spin, Select, Tabs, message, Typography, Image, Button, Card, Row, Col } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { renderToString } from 'react-dom/server';
import katex from 'katex';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const questionTypes = [
  { value: 'remember', label: 'Remember', color: 'blue' },
  { value: 'understand', label: 'Understand', color: 'green' },
  { value: 'apply', label: 'Apply', color: 'orange' },
  { value: 'analyze', label: 'Analyze', color: 'purple' },
  { value: 'eval', label: 'Evaluate', color: 'red' },
];

const ChapterQuestions = ({ chapterId, chapterName }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('remember');
  const [activeTab, setActiveTab] = useState('list');
  const pdfRef = useRef();
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    if (chapterId) {
      fetchQuestions();
    }
  }, [chapterId, selectedType]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/${selectedType}/questions/chapter/${chapterId}/all`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      let questionsData = [];
      
      if (Array.isArray(result)) {
        questionsData = result;
      } else if (result.data && Array.isArray(result.data)) {
        questionsData = result.data;
      } else if (result.questions && Array.isArray(result.questions)) {
        questionsData = result.questions;
      }

      // Ensure each question has at least an empty options object if not provided
      const normalizedQuestions = questionsData.map(question => ({
        ...question,
        options: question.options || {},
        correctAnswer: question.correctAnswer || []
      }));

      setQuestions(normalizedQuestions);
    } catch (error) {
      console.error(`Error fetching ${selectedType} questions:`, error);
      message.error(`Failed to fetch ${selectedType} questions`);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const cleanLatexText = (text) => 
    text?.replace(/\\ /g, ' ')
         .replace(/\s{2,}/g, ' ')
         .trim() || '';

  const renderTextOrLatex = (text, block = false) => {
    if (!text) return null;
    const cleaned = cleanLatexText(text);
    const isMath = /\\/.test(cleaned);
    
    return isMath
      ? block 
        ? <BlockMath math={cleaned} /> 
        : <InlineMath math={cleaned} />
      : <Text>{cleaned}</Text>;
  };

  const renderOptions = (options) => {
    if (!options || typeof options !== 'object') {
      return <Text type="secondary">No options provided</Text>;
    }

    return Object.entries(options).map(([key, option]) => {
      if (!option) return null;
      
      const text = option.text || '';
      return (
        <div key={key} style={{ marginBottom: 8 }}>
          <Text strong>{key}.</Text>{' '}
          {renderTextOrLatex(text)}
          {option.image && option.image.startsWith('data:image') && (
            <div style={{ marginTop: 4 }}>
              <Image
                width={100}
                src={option.image}
                alt={`Option ${key}`}
                style={{ maxWidth: '100%' }}
              />
            </div>
          )}
        </div>
      );
    });
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
  };

  const renderLatexToString = (latex) => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false
      });
    } catch (e) {
      return latex;
    }
  };

  const downloadPDF = () => {
    setGeneratingPDF(true);
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let y = margin;
    let questionCount = 1;
    const lineHeight = 8;

    const cleanText = (str) => 
      str?.replace(/\\+/g, '')
         ?.replace(/\s{2,}/g, ' ')
         ?.replace(/^\s+|\s+$/g, '') || '';

    const addTextBlock = (text, fontSize = 10) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, contentWidth);
      const blockHeight = lines.length * lineHeight;

      if (y + blockHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      doc.text(lines, margin, y);
      y += blockHeight + 2;
    };

    const addBase64Image = (imgData, targetWidth = 100, callback) => {
      const img = new window.Image();
      img.onload = () => {
        const aspectRatio = img.height / img.width;
        const targetHeight = targetWidth * aspectRatio;

        if (y + targetHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        doc.addImage(imgData, 'PNG', margin, y, targetWidth, targetHeight);
        y += targetHeight + 5;

        if (callback) callback();
      };
      img.onerror = () => {
        console.warn('Image failed to load');
        if (callback) callback();
      };
      img.src = imgData;
    };

    let index = 0;

    const processQuestion = () => {
      if (index >= questions.length) {
        doc.save(`${chapterName}_${selectedType}_questions.pdf`);
        setGeneratingPDF(false);
        return;
      }

      const q = questions[index];
      addTextBlock(`Q${questionCount++}. ${cleanText(q.question)}`);

      if (q.options && Object.keys(q.options).length > 0) {
        addTextBlock('Options:');
        const optionKeys = Object.keys(q.options);
        
        const processOption = (optIndex = 0) => {
          if (optIndex >= optionKeys.length) {
            addTextBlock(`Correct Answer: ${(q.correctAnswer || []).join(', ')}`);
            y += 10;
            index++;
            processQuestion();
            return;
          }

          const key = optionKeys[optIndex];
          const option = q.options[key];
          addTextBlock(`${key}. ${cleanText(option?.text || '')}`);
          
          if (option?.image && option.image.startsWith('data:image')) {
            addBase64Image(option.image, 100, () => processOption(optIndex + 1));
          } else {
            processOption(optIndex + 1);
          }
        };

        processOption();
      } else {
        addTextBlock(`Correct Answer: ${(q.correctAnswer || []).join(', ')}`);
        y += 10;
        index++;
        processQuestion();
      }
    };

    // Add title page
    doc.setFontSize(20);
    addTextBlock(`${chapterName} - ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Questions`, 20);
    y += 20;
    
    // Start processing questions
    processQuestion();
  };

  const columns = [
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
      width: '30%',
      render: (text) => renderTextOrLatex(text, true),
    },
    {
      title: 'Options',
      dataIndex: 'options',
      key: 'options',
      width: '50%',
      render: (options) => <div>{renderOptions(options)}</div>,
    },
    {
      title: 'Correct Answer',
      dataIndex: 'correctAnswer',
      key: 'correctAnswer',
      width: '20%',
      render: (answers) => (
        <div>
          {(answers || []).map(answer => (
            <Tag color="green" key={answer}>{answer}</Tag>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div style={{ margin: '20px' }}>
      <style>
        {`
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .ant-card {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Title level={4}>Questions for: {chapterName}</Title>
        <div>
          <Select
            defaultValue="remember"
            style={{ width: 180, marginRight: 16 }}
            onChange={handleTypeChange}
            value={selectedType}
            loading={loading}
          >
            {questionTypes.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={downloadPDF}
            disabled={questions.length === 0 || generatingPDF}
            loading={generatingPDF}
          >
            Download PDF
          </Button>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="List View" key="list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" tip={`Loading ${selectedType} questions...`} />
            </div>
          ) : questions.length > 0 ? (
            <div ref={pdfRef} style={{ padding: '20px', backgroundColor: 'white' }}>
              <Title level={3} style={{ textAlign: 'center', marginBottom: '30px' }}>
                {chapterName} - {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Questions
              </Title>
              
              {questions.map((question, index) => (
                <Card 
                  key={question._id || index} 
                  style={{ 
                    marginBottom: '20px', 
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid-page'
                  }}
                  bordered={false}
                >
                  <Row gutter={16}>
                    <Col span={24}>
                      <Text strong>Question {index + 1}:</Text>
                      <div style={{ margin: '8px 0' }}>
                        {renderTextOrLatex(question.question, true)}
                      </div>
                    </Col>
                  </Row>
                  
                  {question.options && Object.keys(question.options).length > 0 && (
                    <Row gutter={16}>
                      <Col span={24}>
                        <Text strong>Options:</Text>
                        <div style={{ margin: '8px 0' }}>
                          {renderOptions(question.options)}
                        </div>
                      </Col>
                    </Row>
                  )}
                  
                  <Row gutter={16}>
                    <Col span={24}>
                      <Text strong>Correct Answer:</Text>
                      <div style={{ margin: '8px 0' }}>
                        {(question.correctAnswer || []).map(answer => (
                          <Tag color="green" key={answer}>{answer}</Tag>
                        ))}
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              No {selectedType} questions found for this chapter.
              <div style={{ marginTop: 20 }}>
                <Text type="secondary">API Endpoint: {`api/${selectedType}/questions/${chapterId}`}</Text>
              </div>
            </div>
          )}
        </TabPane>
        
        <TabPane tab="Table View" key="table">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" tip={`Loading ${selectedType} questions...`} />
            </div>
          ) : questions.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <Table
                dataSource={questions}
                columns={columns}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                bordered
                scroll={{ x: true }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              No {selectedType} questions found for this chapter.
            </div>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ChapterQuestions;