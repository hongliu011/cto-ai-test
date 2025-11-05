import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ApartmentOutlined,
  CodeOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表板'
    },
    {
      key: '/workflows',
      icon: <ApartmentOutlined />,
      label: '工作流'
    },
    {
      key: '/scripts',
      icon: <CodeOutlined />,
      label: '脚本'
    },
    {
      key: '/executions',
      icon: <PlayCircleOutlined />,
      label: '执行记录'
    }
  ];

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
      <div className="logo">RPA AI</div>
      <Menu
        theme="dark"
        selectedKeys={[location.pathname]}
        mode="inline"
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default Sidebar;
