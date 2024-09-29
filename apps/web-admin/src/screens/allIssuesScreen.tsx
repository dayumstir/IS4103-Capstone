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
} from "antd";
import { useNavigate } from "react-router-dom";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useGetAllIssuesQuery, useUpdateIssueStatusMutation } from '../redux/services/issueService';
import { IIssue } from "../interfaces/issueInterface";

const { Search } = Input;


const AllIssuesScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: issues, isLoading } = useGetAllIssuesQuery(searchTerm);
  const [updateIssue] = useUpdateIssueStatusMutation();
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
      colSpan: 2,
    },
    {
      title: "Outcome",
      dataIndex: "outcome",
      key: "outcome",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
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
            <Button
              className="mr-2"
              onClick={() => navigate(`/admin/issue/${record.issue_id}`)}
            >
              View Profile
            </Button>
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
    </div>
  );
};

export default AllIssuesScreen;
