import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, message, Typography, Progress } from 'antd';
import { InboxOutlined, FileExcelFilled, CheckCircleFilled, BookFilled } from '@ant-design/icons';
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

const gradientBackground = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled components
const StyledCard = styled(Card)`
  margin: 20px auto;
  max-width: 800px;
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

const McqUpload = ({ chapterId, questionType, chapterName }) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: '.xlsx',
    multiple: false,
    onDrop: acceptedFiles => {
      handleFileProcessing(acceptedFiles[0]);
    }
  });

  const handleFileProcessing = (file) => {
    setProcessing(true);
    setProgress(30);

    const reader = new FileReader();

    reader.onload = (e) => {
      setTimeout(() => {
        processExcel(e.target.result);
        setProgress(100);
        setTimeout(() => setProcessing(false), 500);
      }, 1000);
    };

    reader.onprogress = (event) => {
      if (event.loaded && event.total) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const processExcel = (data) => {
    const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
    const formattedQuestions = jsonData.map(row => ({
      chapterId,
      question: row.Question,
      options: {
        A: { text: row.OptionA, image: row.OptionAImage ? convertImageToBase64(row.OptionAImage) : '' },
        B: { text: row.OptionB, image: row.OptionBImage ? convertImageToBase64(row.OptionBImage) : '' },
        C: { text: row.OptionC, image: row.OptionCImage ? convertImageToBase64(row.OptionCImage) : '' },
        D: { text: row.OptionD, image: row.OptionDImage ? convertImageToBase64(row.OptionDImage) : '' }
      },
      correctAnswer: row.CorrectAnswer ? row.CorrectAnswer.split(',').map(ans => ans.trim()) : [],
      solution: row.Solution || '', // Add solution field (optional)
      questionType: 'MCQ'
    }));
  
    sendToApi(formattedQuestions);
  };

  const convertImageToBase64 = (imageFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const sendToApi = async (questions) => {
    try {
      const response = await axios.post(getApiUrl(), { questions });
      if (response.data.success) {
        message.success({
          content: `${questions.length} Questions Uploaded Successfully!`,
          icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
          style: { marginTop: '50px' }
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
        return '';
    }
  };

  return (
    <StyledCard
      title={
        <ChapterHeader>
          <div className="chapter-name">
            <BookFilled className="book-icon" />
            {chapterName || `UPLOAD QUESTIONS`}
          </div>
        </ChapterHeader>
      }
    >
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <DropzoneContainer isDragActive={isDragActive}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center' }}>
              <InboxOutlined style={{ 
                fontSize: 48, 
                color: '#1890ff', 
                marginBottom: 16,
                filter: `drop-shadow(0 2px 4px rgba(24, 144, 255, 0.3))`
              }} />
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

      <SampleFormatCard title="Excel Format Guidelines">
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            borderRadius: '8px',
            overflow: 'hidden',
            minWidth: '900px'
          }}>
            <thead>
              <tr style={{ 
                backgroundColor: '#1890ff',
                color: 'white'
              }}>
                {['Question', 'OptionA', 'OptionAImage', 'OptionB', 'OptionBImage', 'OptionC', 'OptionCImage', 'OptionD', 'OptionDImage', 'CorrectAnswer', 'Solution'].map((h) => (
                  <th key={h} style={{ 
                    padding: '12px', 
                    border: '1px solid #e8e8e8',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    minWidth: '120px'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ 
                  padding: '12px', 
                  border: '1px solid #f0f0f0',
                  backgroundColor: 'white',
                  whiteSpace: 'nowrap'
                }}>
                  What is the capital of France?
                </td>
                {['Berlin', '', 'Paris', '', 'Madrid', '', 'Rome', '', 'B', 'Paris is the capital of France because...'].map((c, i) => (
                  <td 
                    key={i} 
                    style={{ 
                      padding: '12px', 
                      border: '1px solid #f0f0f0',
                      backgroundColor: 'white',
                      color: i === 8 ? '#52c41a' : 'inherit',
                      fontWeight: i === 8 ? 600 : 'normal',
                      whiteSpace: 'nowrap',
                      fontStyle: i === 10 ? 'italic' : 'normal'
                    }}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '16px', padding: '0 12px' }}>
          <Text type="secondary">
            <strong>Note:</strong> The "Solution" column is optional. All image columns should contain image file references.
          </Text>
        </div>
      </SampleFormatCard>
    </StyledCard>
  );
};

export default McqUpload;