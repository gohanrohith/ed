import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Button, Table, message, Form, Input, Row, Col, Typography, Card } from 'antd';
import { UploadOutlined, InboxOutlined, FileExcelOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Dragger } = Upload;

const AddStudent = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [jsonData, setJsonData] = useState([]);
  const [file, setFile] = useState(null); // Store the selected file
  const [form] = Form.useForm();

  // Mapping Excel column names to desired JSON keys
  const columnMapping = {
    'Name': 'name',
    'Class': 'class',
    'Section': 'section',
    'Email': 'email',
    'Username': 'username',
    'Mobile Number': 'mobile_number',
    'Password': 'password'
  };

  // Function to map Excel data to JSON format
  const mapToJsonFormat = (data) => {
    const userId = localStorage.getItem('userId'); // Get the userId from localStorage
    return data.map((row) => {
      const formattedRow = {};

      // Loop through the row and map each value to the corresponding JSON key
      Object.keys(row).forEach((excelColumn) => {
        if (columnMapping[excelColumn]) {
          formattedRow[columnMapping[excelColumn]] = row[excelColumn];
        }
      });

      // Add the adminId (userId from localStorage)
      formattedRow.adminId = userId;

      return formattedRow;
    });
  };

  // Handle file upload and parsing
  const handleFileUpload = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = e.target.result;

      // Parse the Excel file using xlsx
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert to JSON data
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      
      if (jsonData.length === 0) {
        message.error('No data found in the uploaded file!');
      } else {
        // Map the raw data to the desired JSON format and add the adminId
        const formattedJson = mapToJsonFormat(jsonData);
        setStudentsData(formattedJson);
        setJsonData(formattedJson); // Store the formatted JSON data
      }
    };

    reader.readAsBinaryString(file);
    return false; // Prevent the default upload behavior
  };

  // Handle file selection
  const handleFileChange = (info) => {
    const { file } = info;
    setFile(file);
    setFileName(file.name);
  };

  // Handle the submission of the uploaded data to the server
  const handleSubmit = async () => {
    if (!file) {
      message.error('Please select a file to upload!');
      return;
    }

    handleFileUpload(file); // Process the file

    try {
      const response = await fetch('http://localhost:5000/api/students/register/multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });

      if (response.ok) {
        message.success('Students registered successfully!');
        setFile(null); // Clear the file after upload
        setFileName(''); // Clear the file name
      } else {
        message.error('Failed to register students!');
      }
    } catch (error) {
      message.error('An error occurred while registering students!');
    }
  };

  // Ant Design Table columns configuration
  const columns = studentsData.length > 0
    ? Object.keys(studentsData[0]).map((key) => ({
        title: key,
        dataIndex: key,
        key: key,
      }))
    : [];

  // Handle the form submission for a single student
  const onFinish = (values) => {
    const userId = localStorage.getItem('userId'); // Get the userId from localStorage
    const newStudent = { ...values, adminId: userId };

    // Send the new student data to the server
    const registerStudent = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/students/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newStudent),
        });

        if (response.ok) {
          message.success('Student added successfully!');
        } else {
          message.error('Failed to add student!');
        }
      } catch (error) {
        message.error('An error occurred while adding the student!');
      }
    };

    // Call the registerStudent function
    registerStudent();

    // Optionally, reset the form
    form.resetFields();
  };

  return (
    <div style={{ padding: 20 }}>
        {/* Left Section: Excel File Upload */}
        <div >
          <Card
            title="Upload Multiple Students (Excel)"
            bordered={false}
            style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: 8 }}
          >
            <Dragger
              onChange={handleFileChange}
              showUploadList={false}
              accept=".xlsx,.xls"
              beforeUpload={(file) => {
                const isExcel = file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                if (!isExcel) {
                  message.error('You can only upload Excel files!');
                }
                return isExcel;
              }}
              style={{
                padding: 20,
                border: '2px dashed #1890ff',
                borderRadius: 8,
                backgroundColor: '#fafafa',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <p className="ant-upload-drag-icon">
                <FileExcelOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 'bold' }}>
                Click or drag an Excel file to upload
              </p>
              <p className="ant-upload-hint" style={{ color: '#666' }}>
                Only .xlsx and .xls files are supported
              </p>
            </Dragger>

            {/* Display the selected file name */}
            {fileName && (
              <div style={{ marginTop: 10 }}>
                <Text strong>Selected File: </Text>
                <Text>{fileName}</Text>
              </div>
            )}

            {/* Upload Button */}
            <div style={{ textAlign: 'right', marginTop: 20 }}>
              <Button
                type="primary"
                onClick={handleSubmit}
                style={{ borderRadius: 4 }}
                disabled={!file} // Disable if no file is selected
              >
                Upload
              </Button>
            </div>
          </Card>
          <Card
            title="Add Single Student"
            bordered={false}
            style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: 8 }}
          >
            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item
                label={<span style={{ fontWeight: 'bold' }}>Name</span>}
                name="name"
                rules={[{ required: true, message: 'Please input the name!' }]}
              >
                <Input style={{ borderRadius: 4 }} />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 'bold' }}>Class</span>}
                name="class"
                rules={[{ required: true, message: 'Please input the class!' }]}
              >
                <Input style={{ borderRadius: 4 }} />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 'bold' }}>Section</span>}
                name="section"
                rules={[{ required: true, message: 'Please input the section!' }]}
              >
                <Input style={{ borderRadius: 4 }} />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 'bold' }}>Email</span>}
                name="email"
                rules={[{ required: true, message: 'Please input the email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
              >
                <Input style={{ borderRadius: 4 }} />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 'bold' }}>Username</span>}
                name="username"
                rules={[{ required: true, message: 'Please input the username!' }]}
              >
                <Input style={{ borderRadius: 4 }} />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 'bold' }}>Mobile Number</span>}
                name="mobile_number"
                rules={[{ required: true, message: 'Please input the mobile number!' }]}
              >
                <Input style={{ borderRadius: 4 }} />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 'bold' }}>Password</span>}
                name="password"
                rules={[{ required: true, message: 'Please input the password!' }]}
              >
                <Input.Password style={{ borderRadius: 4 }} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ borderRadius: 4 }}>
                  Add Student
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      {/* Display the table of students data */}
      {studentsData.length > 0 && (
        <Card style={{ marginTop: 20, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: 8 }}>
          <Table
            columns={columns}
            dataSource={studentsData}
            rowKey={(record, index) => index}
            bordered
          />
        </Card>
      )}
    </div>
  );
};

export default AddStudent;