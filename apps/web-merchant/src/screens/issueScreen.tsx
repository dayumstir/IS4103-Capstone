import { EyeOutlined, LoadingOutlined, StopOutlined } from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Card,
  Empty,
  Input,
  message,
  Popconfirm,
  Table,
  Tag,
} from "antd";
import { SortOrder } from "antd/es/table/interface";
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
import {
  useCancelIssueMutation,
  useGetIssuesMutation,
} from "../redux/services/issue";
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
  const location = useLocation();
  const navigate = useNavigate();

  const { search, filteredIssues } = location.state || {};

  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  const [issues, setIssues] = useState<IssueTableInterface[]>(
    filteredIssues || [],
  );
  const [getIssues] = useGetIssuesMutation();
  const [cancelIssue, { isLoading }] = useCancelIssueMutation();
  const { Search } = Input;

  const [searchTerm, setSearchTerm] = useState(search || "");
  const [filter, setFilter] = useState<IssueFilter>({
    merchant_id: merchantId ? merchantId : "",
    search_term: searchTerm,
    sorting: { sortBy: "updated_at", sortDirection: sortDirection.DESC },
  });
  const [issueKeyCancelled, setIssueKeyCancelled] = useState("");

  useEffect(() => {
    if (search) {
      setSearchTerm(search);
    }
    if (filteredIssues) {
      setIssues(filteredIssues);
    }
  }, [search, filteredIssues]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilter((currentFilter) => ({
        ...currentFilter,
        search_term: searchTerm,
      }));
    }, 1000); // 1 second delay for debounce search term

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchIssues = async () => {
    try {
      if (merchantId) {
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
      }
    } catch (error) {
      const err = error as ApiError;
      message.error(
        err.data?.error || "Unable to fetch issues based on filter",
      );
    }
  };

  useEffect(() => {
    if (!isCreateIssueModalOpen) {
      fetchIssues();
    }
  }, [filter, isCreateIssueModalOpen]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      showSorterTooltip: true,
      sorter: (a: IssueTableInterface, b: IssueTableInterface) =>
        a.title.localeCompare(b.title),
      sortDirections: ["ascend", "descend"] as SortOrder[],
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
      showSorterTooltip: true,
      sorter: (a: IssueTableInterface, b: IssueTableInterface) =>
        a.description.localeCompare(b.description),
      sortDirections: ["ascend", "descend"] as SortOrder[],
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
      showSorterTooltip: true,
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
      onFilter: (value: string, record: IssueTableInterface) =>
        record.status === value,
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
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`${location.pathname}/${issue.key}`)}
          >
            View Details
          </Button>
          {isLoading && issue.key == issueKeyCancelled ? (
            <LoadingOutlined />
          ) : issue.status == IssueStatus.PENDING_OUTCOME ? (
            <Popconfirm
              title={"Are you sure you would like to cancel the issue?"}
              onConfirm={() => {
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
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                danger
                className="ml-5"
                icon={<StopOutlined />}
              >
                Cancel
              </Button>
            </Popconfirm>
          ) : (
            <Button
              type="primary"
              danger
              disabled
              className="ml-5"
              icon={<StopOutlined />}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
      className: "w-1/5 md:w-1/4 lg:w-1/5",
    },
  ];

  return (
    <Card>
      {isCreateIssueModalOpen && (
        <CreateIssueModal
          isModalOpen={isCreateIssueModalOpen}
          setModalOpen={setIsCreateIssueModalOpen}
        />
      )}

      <div className="flex justify-between">
        <Breadcrumb items={[{ title: "Issues" }]} />
        <Button type="primary" onClick={() => setIsCreateIssueModalOpen(true)}>
          Create
        </Button>
      </div>

      <Search
        placeholder="Search by title or description"
        onChange={handleSearchChange}
        value={searchTerm}
        className="my-3"
      />
      <Table<IssueTableInterface>
        columns={columns}
        dataSource={issues}
        style={{ tableLayout: "fixed" }}
        locale={{
          emptyText: <Empty description="No issues found"></Empty>,
        }}
      />
    </Card>
  );
};

export default IssueScreen;
