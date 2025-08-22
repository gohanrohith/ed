// src/components/ProfileInfo.js
import React from 'react';
import { Modal, Button } from 'antd';

// ProfileInfo component will display the user's information
const ProfileInfo = ({ isModalVisible, handleOk, handleCancel, user, handleLogout }) => {
  return (
    <Modal
      title="Profile Information"
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null} // Hide default footer buttons
    >
      <div>
        <p><strong>Name:</strong> {user.userName}</p>
        <p><strong>Email:</strong> {user.userEmail}</p>
        <p><strong>Mobile:</strong> {user.userMobile}</p>
        <Button type="primary" onClick={handleLogout} danger>
          Logout
        </Button>
      </div>
    </Modal>
  );
};

export default ProfileInfo;
