import React, { useState, useEffect } from "react";
import {
  Select,
  Input,
  Button,
  DatePicker,
  message,
  Card,
  Row,
  Col,
  Spin,
  Empty,
  Typography,
  Modal
} from "antd";
import axios from "axios";
import OngoingAddQuestion from "./OngoingAddQuestion";
import CompletedStudentDetails from "./CompletedStudentDetails";
import "./Assignments.css";

const { Option } = Select;
const { Title } = Typography;

const Assignments = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isOngoingModalVisible, setIsOngoingModalVisible] = useState(false);
  const [isCompletedModalVisible, setIsCompletedModalVisible] = useState(false);
  const [isUpcomingModalVisible, setIsUpcomingModalVisible] = useState(false);

  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    class: "",
    section: "",
    startTime: null,
    endTime: null,
    createdBy: localStorage.getItem("userId") || "",
  });

  useEffect(() => {
    fetchStudents();
    fetchAssignments();
  }, []);

  const fetchStudents = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        message.error("User not logged in");
        return;
      }
      const { data } = await axios.get(`http://localhost:5000/api/students/admin/${userId}`);
      if (data.students && data.students.length > 0) {
        setStudents(data.students);
        setClasses([...new Set(data.students.map(student => student.class))]);
      }
    } catch (error) {
      message.error("Error fetching students data");
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const adminId = localStorage.getItem("userId");
      if (!adminId) {
        message.error("User not logged in");
        setLoading(false);
        return;
      }
      const { data } = await axios.get(`http://localhost:5000/api/assignments/createdBy/${adminId}`);
      setAssignments(data || []);
    } catch (error) {
      message.error("Error fetching assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (value) => {
    setFormData((prev) => ({ ...prev, class: value, section: "" }));
    const filteredSections = [...new Set(students.filter(student => student.class === value).map(student => student.section))];
    setSections(filteredSections);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.class || !formData.section || !formData.startTime || !formData.endTime) {
      message.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post("http://localhost:5000/api/assignments/", formData);
      const assignmentId = data.assignment._id;
      message.success("Assignment created successfully");

      const studentsToUpdate = students
        .filter(student => student.class === formData.class && student.section === formData.section)
        .map(student => ({
          studentId: student.id,
          assignmentId: assignmentId,
        }));

      if (studentsToUpdate.length === 0) {
        message.warning("No students found for the selected class and section");
        return;
      }

      try {
        await axios.post(`http://localhost:5000/api/studentsassign/bulk`, studentsToUpdate);
        message.success(`Assignment added to ${studentsToUpdate.length} students`);
      } catch (updateError) {
        console.error("Error updating student assignments:", updateError);
        message.warning("Assignment created but failed to update some student assignments");
      }

      setFormData({
        title: "",
        description: "",
        class: "",
        section: "",
        startTime: null,
        endTime: null,
        createdBy: localStorage.getItem("userId"),
      });

      fetchAssignments();
    } catch (error) {
      console.error("Error:", error);
      message.error("Error creating assignment");
    } finally {
      setLoading(false);
    }
  };

  const showAssignmentModal = (assignment) => {
    setSelectedAssignment(assignment);
    const now = new Date();
    const start = new Date(assignment.startTime);
    const end = new Date(assignment.endTime);

    if (end <= now) {
      setIsCompletedModalVisible(true);
    } else if (start > now) {
      setIsUpcomingModalVisible(true);
    } else {
      setIsOngoingModalVisible(true);
    }
  };

  const handleModalClose = (type) => {
    if (type === "ongoing") {
      setIsOngoingModalVisible(false);
    } else if (type === "completed") {
      setIsCompletedModalVisible(false);
    } else if (type === "upcoming") {
      setIsUpcomingModalVisible(false);
    }
    fetchAssignments();
  };

  const now = new Date();
  const upcomingAssignments = assignments.filter(assignment => new Date(assignment.startTime) > now);
  const ongoingAssignments = assignments.filter(assignment => new Date(assignment.startTime) <= now && new Date(assignment.endTime) > now);
  const completedAssignments = assignments.filter(assignment => new Date(assignment.endTime) <= now);

  return (
    <div className="assignments-container">
      <Row gutter={24}>
        <Col xs={24}>
          <Card title="Create Assignment ✏️" bordered className="create-assignment-card">
            <Input placeholder="Title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} />
            <Input.TextArea placeholder="Description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />

            <Select placeholder="Select Class" value={formData.class} onChange={handleClassChange} style={{ width: "100%", marginBottom: "10px" }}>
              {classes.map((cls) => (
                <Option key={cls} value={cls}>{cls}</Option>
              ))}
            </Select>

            <Select placeholder="Select Section" value={formData.section} onChange={(value) => handleChange("section", value)} style={{ width: "100%", marginBottom: "10px" }} disabled={!formData.class}>
              {sections.map((sec) => (
                <Option key={sec} value={sec}>{sec}</Option>
              ))}
            </Select>

            <DatePicker showTime placeholder="Start Time" onChange={(date, dateString) => handleChange("startTime", dateString)} style={{ width: "100%", marginBottom: "10px" }} />
            <DatePicker showTime placeholder="End Time" onChange={(date, dateString) => handleChange("endTime", dateString)} style={{ width: "100%", marginBottom: "10px" }} />

            <Button type="primary" onClick={handleSubmit} style={{ width: "100%" }}>Create Assignment</Button>
          </Card>
        </Col>
      </Row>

      {/* Upcoming */}
      <Row gutter={24} style={{ marginTop: "20px" }}>
        <Col xs={24}>
          <Title level={3} className="section-title upcoming">Upcoming Assignments ⏳</Title>
          <Row gutter={[16, 16]}>
            {loading ? <Spin size="large" /> : upcomingAssignments.length === 0 ? <Empty description="No upcoming assignments" /> :
              upcomingAssignments.map((assignment) => (
                <Col xs={24} sm={12} md={8} lg={6} key={assignment._id}>
                  <Card
                    hoverable
                    className="assignment-card upcoming-card"
                    onClick={() => showAssignmentModal(assignment)}
                  >
                    <Title level={5}>{assignment.title}</Title>
                    <p><strong>Class:</strong> {assignment.class}</p>
                    <p><strong>Section:</strong> {assignment.section}</p>
                    <p><strong>Starts:</strong> {new Date(assignment.startTime).toLocaleString()}</p>
                    <p><strong>Ends:</strong> {new Date(assignment.endTime).toLocaleString()}</p>
                  </Card>
                </Col>
              ))}
          </Row>
        </Col>
      </Row>

      {/* Ongoing */}
      <Row gutter={24} style={{ marginTop: "20px" }}>
        <Col xs={24}>
          <Title level={3} className="section-title ongoing">Ongoing Assignments 📌</Title>
          <Row gutter={[16, 16]}>
            {loading ? <Spin size="large" /> : ongoingAssignments.length === 0 ? <Empty description="No ongoing assignments" /> :
              ongoingAssignments.map((assignment) => (
                <Col xs={24} sm={12} md={8} lg={6} key={assignment._id}>
                  <Card
                    hoverable
                    className="assignment-card ongoing-card"
                    onClick={() => showAssignmentModal(assignment)}
                  >
                    <Title level={5}>{assignment.title}</Title>
                    <p><strong>Class:</strong> {assignment.class}</p>
                    <p><strong>Section:</strong> {assignment.section}</p>
                    <p><strong>Ends:</strong> {new Date(assignment.endTime).toLocaleString()}</p>
                  </Card>
                </Col>
              ))}
          </Row>
        </Col>
      </Row>

      {/* Completed */}
      <Row gutter={24} style={{ marginTop: "20px" }}>
        <Col xs={24}>
          <Title level={3} className="section-title completed">Completed Assignments ✅</Title>
          <Row gutter={[16, 16]}>
            {loading ? <Spin size="large" /> : completedAssignments.length === 0 ? <Empty description="No completed assignments" /> :
              completedAssignments.map((assignment) => (
                <Col xs={24} sm={12} md={8} lg={6} key={assignment._id}>
                  <Card
                    hoverable
                    className="assignment-card completed-card"
                    onClick={() => showAssignmentModal(assignment)}
                  >
                    <Title level={5}>{assignment.title}</Title>
                    <p><strong>Class:</strong> {assignment.class}</p>
                    <p><strong>Section:</strong> {assignment.section}</p>
                    <p><strong>Ended:</strong> {new Date(assignment.endTime).toLocaleString()}</p>
                  </Card>
                </Col>
              ))}
          </Row>
        </Col>
      </Row>

      {/* Upcoming Modal */}
      <Modal
        title={
          <div className="modal-title-container">
            <span className="modal-main-title">Upcoming Assignment</span>
            {selectedAssignment && <span className="modal-sub-title">{selectedAssignment.title}</span>}
          </div>
        }
        visible={isUpcomingModalVisible}
        onCancel={() => handleModalClose("upcoming")}
        footer={[
          <Button key="close" onClick={() => handleModalClose("upcoming")} className="modal-close-btn">
            Close
          </Button>
        ]}
        width={800}
        className="assignment-modal"
        destroyOnClose
      >
        {selectedAssignment && (
          <OngoingAddQuestion assignment={selectedAssignment} isUpcoming />
        )}
      </Modal>

      {/* Ongoing Modal */}
      <Modal
        title={
          <div className="modal-title-container">
            <span className="modal-main-title">Assignment Details</span>
            {selectedAssignment && <span className="modal-sub-title">{selectedAssignment.title}</span>}
          </div>
        }
        visible={isOngoingModalVisible}
        onCancel={() => handleModalClose("ongoing")}
        footer={[
          <Button key="close" onClick={() => handleModalClose("ongoing")} className="modal-close-btn">
            Close
          </Button>
        ]}
        width={800}
        className="assignment-modal"
        destroyOnClose
      >
        {selectedAssignment && (
          <CompletedStudentDetails
            assignment={selectedAssignment}
            onClose={() => handleModalClose("completed")}
          />
        )}
      </Modal>

      {/* Completed Modal */}
      <Modal
        title={
          <div className="modal-title-container">
            <span className="modal-main-title">Assignment Results</span>
            {selectedAssignment && <span className="modal-sub-title">{selectedAssignment.title}</span>}
          </div>
        }
        visible={isCompletedModalVisible}
        onCancel={() => handleModalClose("completed")}
        footer={null}
        width={1000}
        className="completed-assignment-modal"
        destroyOnClose
      >
        {selectedAssignment && (
          <CompletedStudentDetails
            assignment={selectedAssignment}
            onClose={() => handleModalClose("completed")}
          />
        )}
      </Modal>
    </div>
  );
};

export default Assignments;
