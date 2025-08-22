import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Divider } from 'antd';
import { UserOutlined, FileTextOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import logo from '../../assets/logo.jpg';

const { Sider, Content, Header } = Layout;

const Dashboard = () => {
  const [user, setUser] = useState({
    userId: '',
    userName: '',
    userEmail: '',
    userMobile: '',
    userClass: '',
    userSection: '',
  });

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve user details from localStorage
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userMobile = localStorage.getItem('userMobile');
    const userClass = localStorage.getItem('userClass');
    const userSection = localStorage.getItem('userSection');

    if (userId && userName && userEmail && userMobile && userClass) {
      setUser({
        userId,
        userName,
        userEmail,
        userMobile,
        userClass,
        userSection: userSection || 'N/A',
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
      setCollapsed(false); // Reset collapsed state on mobile
    } else {
      setSidebarVisible(true);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarVisible(!sidebarVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userMobile');
    localStorage.removeItem('userClass');
    localStorage.removeItem('userSection');
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
      <Menu.Item disabled>
        <strong>Class:</strong> {user.userClass}
      </Menu.Item>
      <Menu.Item disabled>
        <strong>Section:</strong> {user.userSection}
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
          padding: '0 0px',
          height: '60px',
          boxShadow: '0 2px 8px rgba(40, 232, 82, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1001, // Higher than sidebar
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
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
        {/* Sidebar - overlay style */}
        {sidebarVisible && (
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            width={200}
            collapsedWidth={80}
            style={{
              position: 'fixed',
              top: '60px',
              left: 0,
              bottom: 0,
              zIndex: 1000, // Below header but above content
              height: 'calc(100vh - 60px)',
              overflow: 'auto',
              boxShadow: '2px 0 8px rgba(55, 242, 26, 0.15)',
            }}
            className="site-layout-background"
            trigger={null} // We're handling the trigger with our own button
          >
            <Menu
              mode="inline"
              defaultSelectedKeys={['home']}
              style={{ height: '100%', borderRight: 0 }}
              inlineCollapsed={collapsed}
            >
              <Menu.Item key="home" icon={<UserOutlined />}>
                <Link to="Home">{collapsed ? '' : 'HOME'}</Link>
              </Menu.Item>
              <Menu.Item key="assignments" icon={<FileTextOutlined />}>
                <Link to="assignments">{collapsed ? '' : 'Assignments'}</Link>
              </Menu.Item>
              <Menu.Item key="ImmedaiteQuest" icon={<FileTextOutlined />}>
                <Link to="ImmediateQuest">{collapsed ? '' : 'Immediate Quest'}</Link>
              </Menu.Item>
            </Menu>
          </Sider>
        )}

        {/* Main content area - full width with potential overlay */}
        <Layout 
          style={{ 
            padding: '0 0 px 0px',
            marginLeft: sidebarVisible ? (collapsed ? 80 : 200) : 0,
            width: '100%',
            transition: 'margin-left 0.2s',
          }}
        >
          <Content
            style={{
              padding: 0,
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