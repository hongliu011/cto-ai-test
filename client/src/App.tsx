import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import WorkflowDesigner from './pages/WorkflowDesigner';
import WorkflowList from './pages/WorkflowList';
import ScriptList from './pages/ScriptList';
import ExecutionList from './pages/ExecutionList';
import './App.css';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header />
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workflows" element={<WorkflowList />} />
            <Route path="/workflows/new" element={<WorkflowDesigner />} />
            <Route path="/workflows/:id/edit" element={<WorkflowDesigner />} />
            <Route path="/scripts" element={<ScriptList />} />
            <Route path="/executions" element={<ExecutionList />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
