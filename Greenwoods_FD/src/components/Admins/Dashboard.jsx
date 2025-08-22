import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Divider } from 'antd';
import { 
  UserOutlined, 
  FileTextOutlined, 
  UserAddOutlined, 
  QuestionCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined 
} from '@ant-design/icons';
import logo from '../../assets/logo.jpg';

const { Sider, Content, Header } = Layout;

const Dashboard = () => {
  const [user, setUser] = useState({
    userId: '',
    userName: '',
    userEmail: '',
    userMobile: ''
  });

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve user details from localStorage
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userMobile = localStorage.getItem('userMobile');

    if (userId && userName && userEmail && userMobile) {
      setUser({
        userId,
        userName,
        userEmail,
        userMobile
      });
    }

    // Check screen width on initial load
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const checkMobile = () => {
    const mobileBreakpoint = 768;
    const isMobileView = window.innerWidth <= mobileBreakpoint;
    setIsMobile(isMobileView);
    
    // Auto-hide sidebar on mobile by default
    if (isMobileView) {
      setSidebarVisible(false);
    } else {
      setSidebarVisible(true);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userMobile');
    navigate('/');
  };

  const menu = (
    <Menu>
      <Menu.Item disabled>
        <strong>Name:</strong> {user.userName}
      </Menu.Item>
      <Menu.Item disabled>
        <strong>Email:</strong> {user.userEmail}
      </Menu.Item>
      <Menu.Item disabled>
        <strong>Mobile Number:</strong> {user.userMobile}
      </Menu.Item>
      <Divider />
      <Menu.Item
        key="logout"
        danger
        onClick={handleLogout}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '16px',
          padding: '10px 20px',
          cursor: 'pointer',
          transition: 'font-size 0.3s ease',
        }}
        className="logout-button"
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#ffffff',
          padding: '0 24px',
          height: '60px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={sidebarVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={toggleSidebar}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              marginRight: '10px',
            }}
          />
          <img
            src={logo}
            alt="Logo"
            style={{
              height: '58px',
              marginRight: '16px',
            }}
          />
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>GREEN WOOD SCHOOLS</span>
        </div>

        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
          <Button
            icon={<UserOutlined />}
            style={{ border: 'none', background: 'transparent' }}
            size="large"
          />
        </Dropdown>
      </Header>

      <Layout style={{ display: 'flex', marginTop: '60px' }}>
        {/* Sidebar - completely hidden when not visible */}
        {sidebarVisible && (
          <Sider
            width={200}
            style={{
              position: 'fixed',
              top: '60px',
              left: 0,
              bottom: 0,
              zIndex: 1,
              height: 'calc(100vh - 60px)',
              overflow: 'auto',
            }}
            className="site-layout-background"
          >
            <Menu
              mode="inline"
              defaultSelectedKeys={['home']}
              style={{ height: '100%', borderRight: 0 }}
            >
              <Menu.Item key="Home" icon={<UserOutlined />}>
                <Link to="Home">HOME</Link>
              </Menu.Item>
              <Menu.Item key="assignments" icon={<FileTextOutlined />}>
                <Link to="assignments">Assignments</Link>
              </Menu.Item>
              <Menu.Item key="addstudent" icon={<UserAddOutlined />}>
                <Link to="addstudent">Add Student</Link>
              </Menu.Item>
              <Menu.Item key="addsubjectandclass" icon={<QuestionCircleOutlined />}>
                <Link to="addsubjectandclass">Add Class and Subject</Link>
              </Menu.Item>
              <Menu.Item key="addquestion" icon={<QuestionCircleOutlined />}>
                <Link to="addquestion">Add Questions</Link>
              </Menu.Item>
            </Menu>
          </Sider>
        )}

        {/* Main content area */}
        <Layout 
          style={{ 
            marginLeft: sidebarVisible ? 200 : 0,
            padding: '0 24px 24px',
            transition: 'margin-left 0.2s',
            width: '100%',
          }}
        >
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
              overflowY: 'auto',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Dashboard;