import React, { useState } from 'react';
import { Card, Form, Input, Button, Steps, Upload, Space, message, Typography } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { TextArea } = Input;

interface WorkflowStep {
  order: number;
  action: string;
  target: string;
  value?: string;
  description?: string;
}

const WorkflowDesigner: React.FC = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const navigate = useNavigate();

  const handleAddStep = () => {
    setSteps([...steps, { order: steps.length + 1, action: '', target: '' }]);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      message.success('工作流保存成功！');
      navigate('/workflows');
    } catch (error) {
      message.error('请完成所有必填项');
    }
  };

  const designerSteps = [
    { title: '基本信息' },
    { title: '配置步骤' },
    { title: '上传素材' },
    { title: '完成' }
  ];

  return (
    <div>
      <Title level={2}>工作流设计器</Title>
      <Card style={{ marginTop: 24 }}>
        <Steps current={currentStep} items={designerSteps} style={{ marginBottom: 32 }} />
        
        <Form form={form} layout="vertical">
          {currentStep === 0 && (
            <>
              <Form.Item
                name="name"
                label="工作流名称"
                rules={[{ required: true, message: '请输入工作流名称' }]}
              >
                <Input placeholder="例如：网页数据采集流程" />
              </Form.Item>
              <Form.Item name="description" label="描述">
                <TextArea rows={4} placeholder="描述此工作流的用途和流程" />
              </Form.Item>
            </>
          )}

          {currentStep === 1 && (
            <>
              <Title level={4}>配置自动化步骤</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                {steps.map((step, index) => (
                  <Card key={index} size="small" title={`步骤 ${index + 1}`}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Input
                        placeholder="操作类型 (例如: click, fill, navigate)"
                        value={step.action}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[index].action = e.target.value;
                          setSteps(newSteps);
                        }}
                      />
                      <Input
                        placeholder="目标元素 (例如: button.submit, #username)"
                        value={step.target}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[index].target = e.target.value;
                          setSteps(newSteps);
                        }}
                      />
                      <Input
                        placeholder="值 (可选)"
                        value={step.value}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[index].value = e.target.value;
                          setSteps(newSteps);
                        }}
                      />
                    </Space>
                  </Card>
                ))}
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddStep} block>
                  添加步骤
                </Button>
              </Space>
            </>
          )}

          {currentStep === 2 && (
            <>
              <Title level={4}>上传素材</Title>
              <Form.Item label="操作录制视频 (可选)">
                <Upload>
                  <Button icon={<UploadOutlined />}>上传视频</Button>
                </Upload>
              </Form.Item>
              <Form.Item label="步骤截图">
                <Upload multiple>
                  <Button icon={<UploadOutlined />}>上传截图</Button>
                </Upload>
              </Form.Item>
            </>
          )}

          {currentStep === 3 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Title level={3}>工作流配置完成！</Title>
              <p>点击"保存"按钮保存工作流，然后可以生成自动化脚本。</p>
            </div>
          )}
        </Form>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
          <Button disabled={currentStep === 0} onClick={() => setCurrentStep(currentStep - 1)}>
            上一步
          </Button>
          <Space>
            <Button onClick={() => navigate('/workflows')}>取消</Button>
            {currentStep < designerSteps.length - 1 ? (
              <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                下一步
              </Button>
            ) : (
              <Button type="primary" onClick={handleSave}>
                保存
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default WorkflowDesigner;
