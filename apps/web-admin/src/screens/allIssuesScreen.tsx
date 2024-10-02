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
  Image,
  Form,
  Modal,
  Descriptions,
  message,
} from "antd";
import { useGetAllIssuesQuery, useUpdateIssueOutcomeMutation } from '../redux/services/issueService';
import { IIssue, IssueStatus } from "../interfaces/issueInterface";
import TextArea from "antd/es/input/TextArea";
import { useViewCustomerProfileQuery } from "../redux/services/customerService";
import { useViewMerchantProfileQuery } from "../redux/services/merchantService";
import { Link } from "react-router-dom";


const { Search } = Input;


const AllIssuesScreen = () => {
  const adminId = localStorage.getItem("adminId");
  const [searchTerm, setSearchTerm] = useState('');
  const [updateIssue] = useUpdateIssueOutcomeMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isModified, setIsModified] = useState(false);
  const [currentIssue, setCurrentIssue] = useState<IIssue | null>(null);
  const { data: issues } = useGetAllIssuesQuery(searchTerm);
  const [currentCustomerId, setCurrentCustomerId] = useState('');
  const { data: currentCustomer } = useViewCustomerProfileQuery(currentCustomerId, { skip: !currentCustomerId });
  const [currentMerchantId, setCurrentMerchantId] = useState('');
  const { data: currentMerchant } = useViewMerchantProfileQuery(currentMerchantId, { skip: !currentMerchantId });


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const showIssueModal = (issue: IIssue) => {
    setCurrentIssue(issue);
    form.setFieldsValue(issue);
    setIsModalVisible(true);
    console.log("Image data:", currentIssue?.images);
  };

  const onValuesChange = (_, allValues) => {
    setIsModified(form.isFieldsTouched(true));
  };
  
  const handleUpdateIssue = async (values: Omit<IIssue, "issue_id">,) => {
    if (!currentIssue) {
      message.error("No issue selected");
      return;
    }
    const status = values.outcome && values.outcome.trim() !== '' ? IssueStatus.RESOLVED : currentIssue.status;
    const updatedIssue: IIssue = {
      ...values,
      issue_id: currentIssue.issue_id,
      status,
    };

    try {
      await updateIssue(updatedIssue).unwrap();
      setIsModalVisible(false);
      message.success("Issue updated successfully");
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
      width: 350,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 500,
      render: (text: string) => (
        <div 
          style={{ 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            maxWidth: '400px'
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "User Email",
      dataIndex: "user",
      key: "user",
      width: 350,
      filters: [
        { text: 'Customer', value: 'customer' },
        { text: 'Merchant', value: 'merchant' }
    ],
      onFilter: (value, record: IIssue) => {
        if (value === 'customer') {
            return !!record.customer_id;
        }
        return value === 'merchant' && !record.customer_id && !!record.merchant_id;
      },
      render: (text, record: IIssue) => {
        if (record && record.customer_id) {
          setCurrentCustomerId(record.customer_id);
        }
        if (record && record.merchant_id) {
          setCurrentMerchantId(record.merchant_id);
        }
        if (record.customer_id && record.merchant_id) {
          return (
            <>
                <Tag>Customer</Tag>
                {currentCustomer?.email}
            </>
          );
           // Return only customer if both exist
        } else if (record.customer_id) {
          return (
            <>
                <Tag>Customer</Tag>
                {currentCustomer?.email}
            </>
          );
        } else if (record.merchant_id) {
          return (
            <>
                <Tag>Merchant</Tag>
                {currentMerchant?.email}
            </>
          );
        }
        return null;
        
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 200,
      filters: [
        { text: 'Pending Outcome', value: 'PENDING_OUTCOME' },
        { text: 'Resolved', value: 'RESOLVED' },
        { text: 'Cancelled', value: 'CANCELLED' }
      ],
      onFilter: (value: string, record: IIssue) => record.status === value,
      render: (text: string) => {
        let color = "geekblue";
        const formattedStatus = text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        switch (text) {
          case "RESOLVED":
            color = "green";
            break;
          case "CANCELLED":
            color = "volcano";  // Choose an appropriate color
            break;
          // Add more cases as necessary
        }
        return <Tag color={color}>{formattedStatus}</Tag>;
      },
    },
    {
        key: "actions",
        width: 1,
        render: (text: string, record: IIssue) => (
          <div className="whitespace-nowrap" >
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
          <Popconfirm
            title="Updating the outcome will resolve the issue and cannot be changed."
            onConfirm={() => form.submit()}
            okText="Confirm"
            cancelText="Cancel"
            disabled={!isModified || (currentIssue && currentIssue.status === IssueStatus.CANCELLED)}
          >
            <Button
              key="submit"
              type="primary"
              disabled={!isModified || (currentIssue && currentIssue.status === IssueStatus.CANCELLED || currentIssue?.status === IssueStatus.RESOLVED)}
            >
              Resolve Issue
            </Button>
          </Popconfirm>
        ]}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Title" span={2}>{currentIssue?.title}</Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>{currentIssue?.description}</Descriptions.Item>
          <Descriptions.Item label="Status" span={2}>{currentIssue?.status}</Descriptions.Item>
          <Descriptions.Item label="Time Created">{currentIssue?.create_time &&
                new Date(currentIssue?.create_time).toDateString()},{" "}{currentIssue?.create_time &&
                new Date(currentIssue?.create_time).toLocaleTimeString()}</Descriptions.Item>
          <Descriptions.Item label="Updated At">{currentIssue?.updated_at &&
                new Date(currentIssue?.updated_at).toDateString()},{" "} {currentIssue?.updated_at &&
                new Date(currentIssue?.updated_at).toLocaleTimeString()}</Descriptions.Item>
          {currentMerchant?.merchant_id && <Descriptions.Item label="Merchant" span={2}><Link to={`/admin/merchant/${currentMerchant.merchant_id}`}>{currentMerchant.name}</Link></Descriptions.Item>}
          {currentCustomer?.customer_id && <Descriptions.Item label="Customer" span={2}><Link to={`/admin/customer/${currentCustomer.customer_id}`}>{currentCustomer.name}</Link></Descriptions.Item>}
          {currentIssue?.admin_id && <Descriptions.Item label="Admin ID" span={2}>{currentIssue.admin_id}</Descriptions.Item>}
          {currentIssue?.images && (
        <Descriptions.Item label="Images">
          {currentIssue?.images &&
            currentIssue.images.map((image, index) => {
              const base64String = `data:image/png;base64,${Buffer.from(image).toString("base64")}`;
              return (
                <img
                  key={index}
                  src={base64String}
                  alt={`Image ${index + 1}`}
                  style={{ height: '100px' }}
                />
              );
          })}
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
          <Form.Item 
          name="outcome" 
          label="Outcome" 
          style={{ padding: '25px' }} 
          rules={[
            {
              required: true,
              message: 'Outcome should be at least 5 characters!',
              min: 5
            }
          ]}>
            <TextArea rows={2} disabled={currentIssue?.status === IssueStatus.CANCELLED  || currentIssue?.status === IssueStatus.RESOLVED}/>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AllIssuesScreen;
