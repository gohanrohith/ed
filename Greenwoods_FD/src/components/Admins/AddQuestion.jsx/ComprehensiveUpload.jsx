import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, message, Typography, Progress, Button, Tooltip } from 'antd';
import { InboxOutlined, CheckCircleFilled, BookFilled, DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';

const { Title, Text } = Typography;

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

// Styled components
const StyledCard = styled(Card)`
  margin: 20px auto;
  max-width: 900px;
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .ant-card-head {
    background: linear-gradient(135deg, #1890ff, #5978f3);
    border-radius: 15px 15px 0 0;
    padding: 30px 24px;
  }
`;

const ChapterHeader = styled.div`
  text-align: center;
  margin-bottom: 24px;
  position: relative;

  .chapter-name {
    font-size: 2.2rem;
    font-weight: 600;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    
    .book-icon {
      animation: ${float} 3s ease-in-out infinite;
    }
  }

  .chapter-id {
    color: rgba(255, 255, 255, 0.85);
    font-size: 1rem;
    font-weight: 500;
  }
`;

const DropzoneContainer = styled.div`
  border: 2px dashed ${props => props.isDragActive ? '#1890ff' : '#d9d9d9'};
  border-radius: 12px;
  padding: 40px 20px;
  margin: 20px 0;
  background: ${props => props.isDragActive ? '#f0fbff' : '#fafafa'};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #1890ff;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.isDragActive ? 
      'linear-gradient(45deg, rgba(24, 144, 255, 0.05), rgba(24, 144, 255, 0.02))' : 'none'};
    z-index: 0;
  }
`;

const SampleFormatCard = styled(Card)`
  margin-top: 24px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: linear-gradient(145deg, #f8f9fa, #ffffff);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .ant-card-head-title {
    font-weight: 600;
    color: #1890ff;
  }
`;

const CompactTable = styled.div`
  overflow-x: auto;
  font-size: 0.9em;
  margin-bottom: 16px;

  table {
    min-width: 1000px;
    border-collapse: collapse;
    width: 100%;
  }

  th, td {
    padding: 8px 12px;
    border: 1px solid #f0f0f0;
    white-space: nowrap;
  }

  th {
    background-color: #1890ff;
    color: white;
    font-weight: 600;
    text-align: center;
  }

  td {
    background-color: white;
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .correct-answer {
    color: #52c41a;
    font-weight: 600;
  }

  .optional {
    font-style: italic;
    color: #8c8c8c;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  align-items: center;
`;

const downloadTemplate = () => {
  const template = [
    {
      "Question": "Read the passage and answer",
      "Paragraph": "Climate change refers to long-term shifts in temperatures...",
      "SubQuestion": "What is the main cause?",
      "SubOptionA": "Natural cycles",
      "SubOptionAImage": "",
      "SubOptionB": "Human activity",
      "SubOptionBImage": "",
      "SubOptionC": "Animal migration",
      "SubOptionCImage": "",
      "SubOptionD": "Solar flares",
      "SubOptionDImage": "",
      "SubCorrectAnswer": "B",
      "SubSolution": "Human activity is the primary driver..."
    },
    {
      "Question": "Read the passage and answer",
      "Paragraph": "Climate change refers to long-term shifts in temperatures...",
      "SubQuestion": "What is a major effect?",
      "SubOptionA": "Better agriculture",
      "SubOptionAImage": "",
      "SubOptionB": "Rising sea levels",
      "SubOptionBImage": "",
      "SubOptionC": "Increased forests",
      "SubOptionCImage": "",
      "SubOptionD": "Colder winters",
      "SubOptionDImage": "",
      "SubCorrectAnswer": "B",
      "SubSolution": "Rising sea levels are caused by melting ice caps..."
    }
  ];

  const ws = XLSX.utils.json_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, "Comprehension_Template.xlsx");
};

const ComprehensiveUpload = ({ chapterId, questionType, chapterName }) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: '.xlsx',
    multiple: false,
    onDrop: acceptedFiles => handleFileProcessing(acceptedFiles[0]),
  });

  const handleFileProcessing = (file) => {
    setProcessing(true);
    setProgress(30);

    const reader = new FileReader();

    reader.onload = (e) => {
      setTimeout(() => {
        try {
          processExcel(e.target.result);
          setProgress(100);
        } catch (error) {
          message.error('Error processing file: ' + error.message);
          setProgress(0);
        } finally {
          setTimeout(() => setProcessing(false), 500);
        }
      }, 1000);
    };

    reader.onerror = () => {
      message.error('Error reading file');
      setProcessing(false);
      setProgress(0);
    };

    reader.readAsArrayBuffer(file);
  };

  const processExcel = (data) => {
    const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
    const questionsMap = jsonData.reduce((acc, row) => {
      const questionText = row.Question?.trim();
      const paragraphText = row.Paragraph?.trim();
      const subQuestionText = row.SubQuestion?.trim();
  
      if (!questionText || !paragraphText || !subQuestionText) {
        message.warning('Skipping row with missing required fields');
        return acc;
      }
  
      const groupKey = `${questionText}_${paragraphText}`;
  
      if (!acc[groupKey]) {
        acc[groupKey] = {
          chapterId,
          question: questionText,
          paragraph: paragraphText,
          paragraphImage: row.ParagraphImage || '',
          subQuestions: [],
          questionType: "Comprehension",
        };
      }
  
      acc[groupKey].subQuestions.push({
        subQuestion: subQuestionText,
        options: {
          A: { 
            text: row.SubOptionA, 
            image: row.SubOptionAImage || '', 
            fileName: row.SubOptionAImage ? 'imageA.png' : '' 
          },
          B: { 
            text: row.SubOptionB, 
            image: row.SubOptionBImage || '', 
            fileName: row.SubOptionBImage ? 'imageB.png' : '' 
          },
          C: { 
            text: row.SubOptionC, 
            image: row.SubOptionCImage || '', 
            fileName: row.SubOptionCImage ? 'imageC.png' : '' 
          },
          D: { 
            text: row.SubOptionD, 
            image: row.SubOptionDImage || '', 
            fileName: row.SubOptionDImage ? 'imageD.png' : '' 
          },
        },
        correctAnswer: row.SubCorrectAnswer ? row.SubCorrectAnswer.split(',').map(ans => ans.trim()) : [],
        solution: row.SubSolution || '',
      });
  
      return acc;
    }, {});
  
    const formattedQuestions = Object.values(questionsMap).filter(q => 
      q.question && q.paragraph && q.subQuestions.length > 0
    );
  
    if (formattedQuestions.length === 0) {
      throw new Error('No valid comprehension questions found in the file');
    }
  
    sendToApi(formattedQuestions);
  };

  const sendToApi = async (questions) => {
    try {
      const response = await axios.post(getApiUrl(), { 
        questions,
        metadata: {
          chapterId,
          chapterName,
          questionType,
          timestamp: new Date().toISOString()
        }
      });
      
      if (response.data.success) {
        message.success({
          content: `Uploaded ${questions.length} comprehension sets with ${questions.reduce((acc, q) => acc + q.subQuestions.length, 0)} total questions!`,
          icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
          style: { marginTop: '50px' },
          duration: 5,
        });
      }
    } catch (error) {
      message.error('Upload failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const getApiUrl = () => {
    switch(questionType.toLowerCase()) {
      case 'understand':
        return 'http://localhost:5000/api/understand/upload';
      case 'remember':
        return 'http://localhost:5000/api/remember/upload';
      case 'eval':
        return 'http://localhost:5000/api/eval/upload';
      case 'apply':
        return 'http://localhost:5000/api/apply/upload';
      case 'analyse':
        return 'http://localhost:5000/api/analyse/upload';
      default:
        return 'http://localhost:5000/api/comprehension/upload';
    }
  };

  return (
    <StyledCard
      title={
        <ChapterHeader>
          <div className="chapter-name">
            <BookFilled className="book-icon" />
            {chapterName || `COMPREHENSION UPLOAD`}
          </div>
          <div className="chapter-id">
            {questionType && `Question Type: ${questionType.toUpperCase()}`}
          </div>
        </ChapterHeader>
      }
    >
      <ActionBar>
        <Tooltip title="Download Excel template with sample format">
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={downloadTemplate}
          >
            Download Template
          </Button>
        </Tooltip>
        <Text type="secondary">
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          Supports .xlsx files with comprehension questions
        </Text>
      </ActionBar>

      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <DropzoneContainer isDragActive={isDragActive}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center' }}>
              <InboxOutlined
                style={{
                  fontSize: 48,
                  color: '#1890ff',
                  marginBottom: 16,
                  filter: `drop-shadow(0 2px 4px rgba(24, 144, 255, 0.3))`,
                }}
              />
              <Title level={4} style={{ marginBottom: 8, color: '#1890ff' }}>
                {isDragActive ? 'Release to Upload' : 'Drag & Drop Excel File'}
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                or click to select file
              </Text>
              {processing && (
                <Progress
                  percent={progress}
                  status="active"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  strokeWidth={6}
                  style={{ maxWidth: 400, margin: '20px auto 0' }}
                />
              )}
            </div>
          </div>
        </DropzoneContainer>
      </div>

      <SampleFormatCard title="Excel Format Guidelines (Comprehension)">
        <CompactTable>
          <table>
            <thead>
              <tr>
                {['Question', 'Paragraph', 'ParagraphImage*', 'SubQuestion', 'SubOptionA', 'SubOptionAImage*', 'SubOptionB', 'SubOptionBImage*', 'SubOptionC', 'SubOptionCImage*', 'SubOptionD', 'SubOptionDImage*', 'SubCorrectAnswer', 'SubSolution*'].map((h) => (
                  <th key={h} className={h.endsWith('*') ? 'optional' : ''}>
                    {h}
                    {h.endsWith('*') && (
                      <Tooltip title="Optional field">
                        <span style={{ marginLeft: 4 }}>*</span>
                      </Tooltip>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan="2">Read the passage and answer</td>
                <td rowSpan="2">Climate change refers to long-term shifts in temperatures...</td>
                <td rowSpan="2">climate.jpg</td>
                <td>What is the main cause?</td>
                <td>Natural cycles</td>
                <td></td>
                <td>Human activity</td>
                <td></td>
                <td>Animal migration</td>
                <td></td>
                <td>Solar flares</td>
                <td></td>
                <td className="correct-answer">B</td>
                <td className="optional">Human activity is the primary driver...</td>
              </tr>
              <tr>
                <td>What is a major effect?</td>
                <td>Better agriculture</td>
                <td></td>
                <td>Rising sea levels</td>
                <td>sea.jpg</td>
                <td>Increased forests</td>
                <td></td>
                <td>Colder winters</td>
                <td></td>
                <td className="correct-answer">B</td>
                <td className="optional">Rising sea levels are caused by melting ice caps...</td>
              </tr>
            </tbody>
          </table>
        </CompactTable>
        <div style={{ padding: '0 16px' }}>
          <Text type="secondary">
            <strong>Note:</strong> Fields marked with * are optional. Each comprehension set should have:
          </Text>
          <ul style={{ marginTop: 8, paddingLeft: 24 }}>
            <li><Text type="secondary">1 main question and paragraph</Text></li>
            <li><Text type="secondary">1 or more sub-questions (each with 4 options and correct answer)</Text></li>
            <li><Text type="secondary">Same Question and Paragraph for all rows in a set</Text></li>
          </ul>
        </div>
      </SampleFormatCard>
    </StyledCard>
  );
};

export default ComprehensiveUpload;