import React, { useState } from "react";
import {
  Spin,
  Popconfirm,
  Button,
  Card,
  Table,
  Empty,
  Tag,
  Input,
  Form,
  Modal,
  Descriptions,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useGetAllIssuesQuery, useUpdateIssueOutcomeMutation } from '../redux/services/issueService';
import { IIssue } from "../interfaces/issueInterface";

const { Search } = Input;


const AllIssuesScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: issues, isLoading } = useGetAllIssuesQuery(searchTerm);
  const [updateIssue] = useUpdateIssueOutcomeMutation();
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentIssue, setCurrentIssue] = useState<IIssue | null>(null);
  const [form] = Form.useForm();
  const [isModified, setIsModified] = useState(false);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const showIssueModal = (issue: IIssue) => {
    setCurrentIssue(issue);
    form.setFieldsValue(issue);
    setIsModalVisible(true);
  };

  const onValuesChange = (_, allValues) => {
    setIsModified(form.isFieldsTouched(true));
  };
  
  const handleUpdateIssue = async (values: Omit<IIssue, "issue_id">,) => {
    if (!currentIssue) {
      message.error("No issue selected");
      return;
    }
    const updatedIssue: IIssue = {
      ...values,
      issue_id: currentIssue.issue_id,
    };
    try {
      await updateIssue(updatedIssue).unwrap();
      setIsModalVisible(false);
      setCurrentIssue(null);
    } catch (error) {
      console.error("Error updating issue:", error);
      message.error("Failed to update issue");
    }
    
  };
  

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a: IIssue, b: IIssue) => a.title.localeCompare(b.title),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 500,
    },
    {
      title: "Outcome",
      dataIndex: "outcome",
      key: "outcome",
      width: 400,
      render: (outcome: string | null) => outcome || <Tag color="volcano">PENDING</Tag>,
      filters: [
        { text: 'Pending', value: 'Pending' },
      ],
      onFilter: (value, record) => !record.outcome
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 250,
      filters: [
        { text: 'Pending Outcome', value: 'PENDING_OUTCOME' },
        { text: 'Resolved', value: 'RESOLVED' },
      ],
      onFilter: (value: string, record: IIssue) => record.status === value,
      render: (text: string) => {
        let color = "geekblue";
        if (text === "RESOLVED") {
          color = "green";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
        key: "actions",
        width: 1,
        render: (text: string, record: IIssue) => (
          <div className="whitespace-nowrap">
            <Button onClick={() => showIssueModal(record)}>View Issue</Button>
            </div>
      ),
    },
  ];

  return (
    <div className="w-full px-8 py-4">
      <Card title="View All Issues">
      <Search
          placeholder="Search by title"
          onChange={handleSearchChange}
          value={searchTerm}
          style={{ marginBottom: 16 }}
        />
        <Table
          dataSource={issues}
          columns={columns}
          locale={{
            emptyText: <Empty description="No issues found"></Empty>,
          }}
        />
      </Card>
      <Modal
        title="Issue Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={[
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            disabled={!isModified}
          >
            Save Changes
          </Button>
        ]}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Title" span={2}>{currentIssue?.title}</Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>{currentIssue?.description}</Descriptions.Item>
          <Descriptions.Item label="Status">{currentIssue?.status}</Descriptions.Item>
          <Descriptions.Item label="Time Created">{currentIssue?.createTime ? new Date(currentIssue.createTime).toLocaleString() : 'Not available'}</Descriptions.Item>
          {currentIssue?.merchant_id && <Descriptions.Item label="Merchant ID" span={2}>{currentIssue.merchant_id}</Descriptions.Item>}
    {currentIssue?.customer_id && <Descriptions.Item label="Customer ID" span={2}>{currentIssue.customer_id}</Descriptions.Item>}
    {currentIssue?.admin_id && <Descriptions.Item label="Admin ID" span={2}>{currentIssue.admin_id}</Descriptions.Item>}
    {currentIssue?.images && (
  <Descriptions.Item label="Images" span={2}>
    {currentIssue.images.map((img, index) => (
      <img key={index} src={`data:image/jpeg;base64,${img.toString('base64')}`} alt="Issue Image" style={{ width: "100px", height: "100px", marginRight: "10px" }} />
    ))}
  </Descriptions.Item>
)}
        </Descriptions>
        <Form
          form={form}
          initialValues={{ outcome: currentIssue?.outcome || '' }}
          onValuesChange={onValuesChange}
          onFinish={handleUpdateIssue}
          onFieldsChange={() => form.setFieldsValue(form.getFieldsValue())}
        >
          <Form.Item name="outcome" label="Outcome">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AllIssuesScreen;
