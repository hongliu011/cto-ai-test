import React from 'react';
import { Table, Tag, Button, Space, Typography, Progress } from 'antd';
import { EyeOutlined, StopOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ExecutionList: React.FC = () => {
  const columns = [
    {
      title: '执行ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.substring(0, 8)
    },
    {
      title: '脚本名称',
      dataIndex: 'scriptName',
      key: 'scriptName'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          running: 'processing',
          completed: 'success',
          failed: 'error',
          stopped: 'default'
        };
        const labelMap: Record<string, string> = {
          running: '运行中',
          completed: '已完成',
          failed: '失败',
          stopped: '已停止'
        };
        return <Tag color={colorMap[status]}>{labelMap[status]}</Tag>;
      }
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => <Progress percent={progress} size="small" />
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime'
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => duration ? `${(duration / 1000).toFixed(2)}s` : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />}>
            查看日志
          </Button>
          {record.status === 'running' && (
            <Button type="link" danger icon={<StopOutlined />}>
              停止
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>执行记录</Title>
      <Table columns={columns} dataSource={[]} pagination={{ pageSize: 10 }} style={{ marginTop: 16 }} />
    </div>
  );
};

export default ExecutionList;
