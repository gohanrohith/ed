import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spin, Alert, Button, Modal, Form, Input } from 'antd';

const AdminAvailable = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch admin data
  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/admins/admins', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.admins) {
        setAdmins(response.data.admins);
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to fetch admins');
      setLoading(false);
    }
  };

  // Call fetchAdmins once on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Handle adding a new admin
  const handleAddAdmin = async (values) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:5000/api/admins/admins',
        {
          name: values.name,
          email: values.email,
          mobile_number: values.mobile_number,
          password: values.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        // Reload the admin list by calling fetchAdmins
        fetchAdmins();

        setIsModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      setError('Failed to add admin');
    }
  };

  // Handle deleting an admin
  const handleDeleteAdmin = async (adminId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:5000/api/admins/admins/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Reload the admin list after deletion
      fetchAdmins();
    } catch (error) {
      setError('Failed to delete admin');
    }
  };

  // Define table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Mobile Number',
      dataIndex: 'mobile_number',
      key: 'mobile_number',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button onClick={() => handleDeleteAdmin(record.id)} danger>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Align the "Add Admin" button to the right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Add Admin
        </Button>
      </div>

      {loading && <Spin size="large" />}
      {error && <Alert message={error} type="error" />}
      {!loading && !error && <Table dataSource={admins} columns={columns} rowKey="id" />}

      {/* Add Admin Modal */}
      <Modal
        title="Add Admin"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddAdmin}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input the admin name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input the admin email!' },
              { type: 'email', message: 'Please input a valid email!' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mobile Number"
            name="mobile_number"
            rules={[
              { required: true, message: 'Please input the mobile number!' },
              { len: 10, message: 'Mobile number must be 10 digits!' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input the password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Admin
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminAvailable;
