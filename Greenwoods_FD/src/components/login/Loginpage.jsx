import React, { useState } from 'react';
import { Button, Input, Form, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirecting

const { Title } = Typography;

const LoginPage = () => {
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate(); // Hook to navigate to another page

  const authenticateUser = async (endpoint, values) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Error during authentication:", error); // Add error logging
      return null;
    }
  };

  const onFinish = async (values) => {
    try {
      // Try Admin login
      const adminResponse = await authenticateUser('http://localhost:5000/api/admins/login', values);
      if (adminResponse && adminResponse.token) {
        setRole('admin');
        setUserData(adminResponse.admin);
        setToken(adminResponse.token);
        localStorage.setItem('authToken', adminResponse.token);
        localStorage.setItem('userId', adminResponse.admin.id);
        localStorage.setItem('userName', adminResponse.admin.name);
        localStorage.setItem('userEmail', adminResponse.admin.email);
        localStorage.setItem('userMobile', adminResponse.admin.mobile_number);
        message.success(adminResponse.message || 'Admin Login successful!');
        navigate('/dashboard_admin/Home');
        return;
      }
  
      // Try Student login
      const studentResponse = await authenticateUser('http://localhost:5000/api/students/login', values);
      if (studentResponse && studentResponse.token) {
        setRole('student');
        setUserData(studentResponse.student);
        setToken(studentResponse.token);
        localStorage.setItem('authToken', studentResponse.token);
        localStorage.setItem('userId', studentResponse.student.id);
        localStorage.setItem('userName', studentResponse.student.name);
        localStorage.setItem('userEmail', studentResponse.student.email);
        localStorage.setItem('userMobile', studentResponse.student.mobile_number || 'N/A');
        localStorage.setItem('userClass', studentResponse.student.class);
        localStorage.setItem('userSection',studentResponse.student.section||'N/A');
        message.success(studentResponse.message || 'Student Login successful!');
        navigate('/dashboard_student');
        return;
      }
  
      // Try Super Admin login
      const superAdminResponse = await authenticateUser('http://localhost:5000/api/superadmin/login', values);
      if (superAdminResponse && superAdminResponse.token) {
        setRole('superadmin');
        setUserData(superAdminResponse.superAdmin);
        setToken(superAdminResponse.token);
        localStorage.setItem('authToken', superAdminResponse.token);
        localStorage.setItem('userId', superAdminResponse.superAdmin.id);
        localStorage.setItem('userEmail', superAdminResponse.superAdmin.email);
        localStorage.setItem('userMobile', superAdminResponse.superAdmin.mobileNumber);
        localStorage.setItem('userName', superAdminResponse.superAdmin.name);
        message.success(superAdminResponse.message || 'Super Admin Login successful!');
        navigate('/dashboard_superadmin');
        return;
      }
  
      message.error('Invalid credentials. Please try again.');
    } catch (error) {
      message.error('Something went wrong. Please try again later.');
      console.error("Login Error:", error);
    }
  };

  const onFinishFailed = (errorInfo) => {
    message.error('Please fill in all required fields!');
    console.log('Failed:', errorInfo);
  };

  // If user is already logged in, redirect to their appropriate dashboard
  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Redirect to the appropriate dashboard based on role
      const role = localStorage.getItem('role');
      if (role === 'admin') {
        navigate('/dashboard_admin/Home');
      } else if (role === 'student') {
        navigate('/dashboard_student');
      } else if (role === 'superadmin') {
        navigate('/dashboard_superadmin');
      }
    }
  }, [navigate]);

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>
        Login
      </Title>
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        layout="vertical"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
        >
          <Input placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
          >
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
