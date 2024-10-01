import { Breadcrumb, Button, message, Table, Tag } from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import { Buffer } from "buffer";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CreateIssueModal from "../components/createIssueModal";
import { ApiError } from "../interfaces/errorInterface";
import {
  IssueFilter,
  IssueStatus,
  statusColorMap,
} from "../interfaces/models/issueInterface";
import { sortDirection } from "../interfaces/sortingInterface";
import { useGetIssuesMutation } from "../redux/services/issue";

interface IssueTableInterface {
  key: string;
  title: string;
  description: string;
  outcome: string;
  status: string;
  images?: Buffer[];
}

const IssueScreen: React.FC = () => {
  const merchantId = localStorage.getItem("merchantId");
  if (!merchantId) {
    message.error("Merchant ID not found!");
  }
  const [filter, setFilter] = useState<IssueFilter>({
    merchant_id: merchantId ? merchantId : "",
    sorting: { sortBy: "updated_at", sortDirection: sortDirection.DESC },
  });
  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  const [issues, setIssues] = useState<IssueTableInterface[]>([]);
  const [getIssues] = useGetIssuesMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchIssuesBasedOnFilter = async () => {
    try {
      const data = await getIssues(filter).unwrap();
      const mappedData: IssueTableInterface[] = data.map((issue) => ({
        key: issue.issue_id,
        title: issue.title,
        description: issue.description,
        outcome: issue.outcome,
        status: issue.status,
        images: issue.images,
      }));

      setIssues(mappedData);
    } catch (error) {
      const err = error as ApiError;
      message.error(
        err.data?.error || "Unable to fetch issues based on filter",
      );
    }
  };

  useEffect(() => {
    if (!isCreateIssueModalOpen) {
      fetchIssuesBasedOnFilter(); // Fetch issues when the component mounts or filter changes
    }
  }, [filter, getIssues, isCreateIssueModalOpen]);

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string) => (
        <div className="truncate" style={{ maxWidth: "200px" }}>
          {text}
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <div className="truncate" style={{ maxWidth: "200px" }}>
          {text}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: IssueStatus) => (
        <Tag color={statusColorMap[status] || "default"} key={status}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Outcome",
      dataIndex: "outcome",
      key: "outcome",
    },
    {
      title: "Action",
      key: "action",
      render: (issue: IssueTableInterface) => (
        <Button onClick={() => navigate(`${location.pathname}/${issue.key}`)}>
          View Details
        </Button>
      ),
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<IssueTableInterface> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div>
      {isCreateIssueModalOpen && (
        <CreateIssueModal
          isModalOpen={isCreateIssueModalOpen}
          setModalOpen={setIsCreateIssueModalOpen}
        />
      )}

      <div className="mb-5 flex items-center justify-between">
        <Breadcrumb items={[{ title: "Issues" }]} />
        <Button type="primary" onClick={() => setIsCreateIssueModalOpen(true)}>
          Create
        </Button>
      </div>

      <Table<IssueTableInterface>
        rowSelection={rowSelection}
        columns={columns}
        dataSource={issues}
      />
    </div>
  );
};

export default IssueScreen;
