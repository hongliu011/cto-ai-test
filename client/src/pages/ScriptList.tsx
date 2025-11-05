import React from 'react';
import { Table, Tag, Button, Space, Typography } from 'antd';
import { DownloadOutlined, PlayCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ScriptList: React.FC = () => {
  const columns = [
    {
      title: '脚本名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '工作流',
      dataIndex: 'workflowName',
      key: 'workflowName'
    },
    {
      title: '框架',
      dataIndex: 'framework',
      key: 'framework',
      render: (framework: string) => <Tag color="blue">{framework}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending: 'default',
          validated: 'success',
          failed: 'error'
        };
        const labelMap: Record<string, string> = {
          pending: '待验证',
          validated: '已验证',
          failed: '验证失败'
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
          <Button type="link" icon={<PlayCircleOutlined />}>
            执行
          </Button>
          <Button type="link" icon={<DownloadOutlined />}>
            下载
          </Button>
          <Button type="link">查看</Button>
          <Button type="link" danger>删除</Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>脚本列表</Title>
      <Table columns={columns} dataSource={[]} pagination={{ pageSize: 10 }} style={{ marginTop: 16 }} />
    </div>
  );
};

export default ScriptList;
