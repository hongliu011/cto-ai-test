import React from 'react';
import { Button, Table, Tag, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const WorkflowList: React.FC = () => {
  const navigate = useNavigate();

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '步骤数',
      dataIndex: 'stepsCount',
      key: 'stepsCount'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          draft: 'default',
          ready: 'processing',
          generating: 'warning',
          completed: 'success',
          failed: 'error'
        };
        const labelMap: Record<string, string> = {
          draft: '草稿',
          ready: '就绪',
          generating: '生成中',
          completed: '已完成',
          failed: '失败'
        };
        return <Tag color={colorMap[status]}>{labelMap[status]}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" onClick={() => navigate(`/workflows/${record.id}/edit`)}>
            编辑
          </Button>
          <Button type="link" onClick={() => console.log('Generate script', record.id)}>
            生成脚本
          </Button>
          <Button type="link" danger>
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>工作流列表</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/workflows/new')}>
          新建工作流
        </Button>
      </div>
      <Table columns={columns} dataSource={[]} pagination={{ pageSize: 10 }} />
    </div>
  );
};

export default WorkflowList;
