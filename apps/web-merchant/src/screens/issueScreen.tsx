import { Breadcrumb, Button, message, Table, Tag } from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import { Buffer } from "buffer";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CreateIssueModal from "../components/createIssueModal";
import { ApiError } from "../interfaces/errorInterface";
import {
  IIssue,
  IssueFilter,
  IssueStatus,
  statusColorMap,
} from "../interfaces/models/issueInterface";
import { sortDirection } from "../interfaces/sortingInterface";
import {
  useCancelIssueMutation,
  useGetIssuesMutation,
  useSearchIssuesMutation,
} from "../redux/services/issue";
import { LoadingOutlined } from "@ant-design/icons";
import { Input } from "antd";
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
  const [cancelIssue, { isLoading }] = useCancelIssueMutation();
  const [searchIssues] = useSearchIssuesMutation();
  const { Search } = Input;
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [issueKeyCancelled, setIssueKeyCancelled] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000); // 1 second delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchIssues = async () => {
    // if (debouncedSearchTerm) {
    try {
      const data = await searchIssues(debouncedSearchTerm).unwrap();
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
    // }
  };

  useEffect(() => {
    fetchIssues();
  }, [debouncedSearchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

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
      showSorterTooltip: { target: "full-header" },
      sorter: (a: IIssue, b: IIssue) => a.title.localeCompare(b.title),
      sortDirections: ["ascend", "descend"],
      key: "title",
      render: (text: string) => (
        <div className="truncate" style={{ maxWidth: "200px" }}>
          {text}
        </div>
      ),
      className: "w-1/5 md:w-1/4 lg:w-1/5",
    },
    {
      title: "Description",
      dataIndex: "description",
      showSorterTooltip: { target: "full-header" },
      sorter: (a: IIssue, b: IIssue) =>
        a.description.localeCompare(b.description),
      sortDirections: ["ascend", "descend"],
      key: "description",
      render: (text: string) => (
        <div className="truncate" style={{ maxWidth: "200px" }}>
          {text}
        </div>
      ),
      className: "w-1/5 md:w-1/4 lg:w-1/5",
    },
    {
      title: "Status",
      dataIndex: "status",
      showSorterTooltip: { target: "full-header" },
      sorter: (a: IIssue, b: IIssue) => a.status.localeCompare(b.status),
      sortDirections: ["ascend", "descend"],
      key: "status",
      render: (status: IssueStatus) => (
        <Tag color={statusColorMap[status] || "default"} key={status}>
          {status == IssueStatus.PENDING_OUTCOME && "PENDING"}
          {status == IssueStatus.RESOLVED && "RESOLVED"}
          {status == IssueStatus.CANCELLED && "CANCELLED"}
        </Tag>
      ),
      filters: [
        {
          text: IssueStatus.PENDING_OUTCOME,
          value: IssueStatus.PENDING_OUTCOME,
        },
        {
          text: IssueStatus.RESOLVED,
          value: IssueStatus.RESOLVED,
        },
        {
          text: IssueStatus.CANCELLED,
          value: IssueStatus.CANCELLED,
        },
      ],
      onFilter: (value: IssueStatus, issue: IIssue) =>
        issue.status.indexOf(value as string) === 0,
      className: "w-1/5 md:w-1/4 lg:w-1/5",
    },
    {
      title: "Outcome",
      dataIndex: "outcome",
      key: "outcome",
      className: "w-1/5 md:w-1/4 lg:w-1/5",
    },
    {
      title: "Action",
      key: "action",
      render: (issue: IssueTableInterface) => (
        <div>
          <Button onClick={() => navigate(`${location.pathname}/${issue.key}`)}>
            View Details
          </Button>
          {isLoading && issue.key == issueKeyCancelled ? (
            <LoadingOutlined />
          ) : issue.status == IssueStatus.PENDING_OUTCOME ? (
            <Button
              type="primary"
              danger
              onClick={() => {
                setIssueKeyCancelled(issue.key);
                cancelIssue(issue.key)
                  .unwrap()
                  .then(() => {
                    fetchIssues();
                    message.success("Successfully cancelled issue!");
                  })
                  .catch((error: ApiError) => message.error(error.data?.error))
                  .finally(() => setIssueKeyCancelled(""));
              }}
              className="ml-5"
            >
              Cancel
            </Button>
          ) : (
            <Button type="primary" danger disabled className="ml-5">
              Cancel
            </Button>
          )}
        </div>
      ),
      className: "w-1/5 md:w-1/4 lg:w-1/5",
    },
  ];

  return (
    <>
      {isCreateIssueModalOpen && (
        <CreateIssueModal
          isModalOpen={isCreateIssueModalOpen}
          setModalOpen={setIsCreateIssueModalOpen}
        />
      )}

      <div className="mb-1 flex items-center justify-between">
        <Breadcrumb items={[{ title: "Issues" }]} />
        <Button type="primary" onClick={() => setIsCreateIssueModalOpen(true)}>
          Create
        </Button>
      </div>

      <Search
        placeholder="Search by title or description"
        onChange={handleSearchChange}
        value={searchTerm}
        className="mb-1"
      />
      <Table<IssueTableInterface>
        columns={columns}
        dataSource={issues}
        style={{ tableLayout: "fixed" }}
      />
    </>
  );
};

export default IssueScreen;
