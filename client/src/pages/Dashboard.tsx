import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import {
  ApartmentOutlined,
  CodeOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  return (
    <div>
      <Title level={2}>仪表板</Title>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="工作流总数"
              value={0}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="生成的脚本"
              value={0}
              prefix={<CodeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="执行次数"
              value={0}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成功率"
              value={0}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Card style={{ marginTop: 24 }}>
        <Title level={4}>欢迎使用 RPA AI 自动化平台</Title>
        <p>通过AI驱动的智能化流程设计，快速生成可靠的自动化脚本。</p>
        <ul>
          <li>📹 上传操作录制视频或配置步骤流程</li>
          <li>📸 提供各步骤的截图进行验证</li>
          <li>🤖 AI自动生成Playwright自动化脚本</li>
          <li>🔍 沙箱环境验证，OCR对比确保准确性</li>
          <li>📦 打包交付，即刻执行</li>
        </ul>
      </Card>
    </div>
  );
};

export default Dashboard;
