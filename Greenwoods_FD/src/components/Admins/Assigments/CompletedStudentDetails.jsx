// CompletedStudentDetails.jsx
import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Typography, Button, Spin, message } from "antd";
import axios from "axios";

const { Title, Text } = Typography;

const CompletedStudentDetails = ({ assignment, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (assignment) {
      fetchSubmissionDetails();
    }
  }, [assignment]);

  const fetchSubmissionDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:5000/api/scores/assignment/${assignment._id}`
      );
      setSubmissions(data || []);
    } catch (error) {
      message.error("Failed to fetch submission details");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Student Name',
      dataIndex: ['studentId', 'name'],
      key: 'studentName',
    },
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
      align: 'center',
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      align: 'center',
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center',
      render: (_, record) => (
        record.submittedAt ? (
          <Tag color="green">Submitted</Tag>
        ) : (
          <Tag color="red">Not Submitted</Tag>
        )
      ),
    },
    {
      title: 'Score',
      dataIndex: 'scoredMarks',
      key: 'score',
      align: 'center',
      render: (score) => (
        score !== undefined ? (
          <Text strong>{score}</Text>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: 'Submitted At',
      key: 'submittedAt',
      align: 'center',
      render: (_, record) => (
        record.submittedAt ? (
          new Date(record.submittedAt).toLocaleString()
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: 'Time Taken (mins)',
      dataIndex: 'timeTaken',
      key: 'timeTaken',
      align: 'center',
      render: (time) => (
        <Text>{time || 0}</Text>
      ),
    },
  ];

  return (
    <div className="completed-student-details">
      <div className="modal-header" style={{ marginBottom: '16px' }}>
        <Title level={4} className="modal-title">
          {assignment.title} - Student Submissions
        </Title>
        <Text type="secondary">
          Class: {assignment.class} | Section: {assignment.section}
        </Text>
      </div>

      {loading ? (
        <div className="loading-container" style={{ textAlign: 'center', padding: '24px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={submissions}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          className="student-details-table"
          locale={{ emptyText: 'No submissions found for this assignment' }}
        />
      )}

      <div className="modal-footer" style={{ marginTop: '16px', textAlign: 'right' }}>
          
      </div>
    </div>
  );
};

export default CompletedStudentDetails;