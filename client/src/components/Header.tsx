import React from 'react';
import { Layout, Typography, Space } from 'antd';
import { RobotOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  return (
    <AntHeader className="header">
      <Space>
        <RobotOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
        <Title level={4} style={{ margin: 0 }}>RPA AI 自动化平台</Title>
      </Space>
    </AntHeader>
  );
};

export default Header;
