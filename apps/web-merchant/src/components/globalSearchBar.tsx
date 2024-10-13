import {
  Card,
  Collapse,
  CollapseProps,
  Input,
  message,
  Popover,
  Spin,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IssueFilter,
  IIssue,
} from "../../../../packages/interfaces/issueInterface";
import { sortDirection } from "../interfaces/sortingInterface";
import { useGetIssuesMutation } from "../redux/services/issue";

const GlobalSearchBar: React.FC = () => {
  const merchantId = localStorage.getItem("merchantId");
  const navigate = useNavigate();

  if (!merchantId) {
    navigate("/login");
    return null;
  }

  const { Search } = Input;
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [issues, setIssues] = useState<IIssue[]>();
  const [issueFilter, setIssueFilter] = useState<IssueFilter>({
    merchant_id: merchantId ? merchantId : "",
    search_term: searchTerm,
    sorting: { sortBy: "updated_at", sortDirection: sortDirection.DESC },
  });
  const [getIssues, { isLoading }] = useGetIssuesMutation();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const handleClickOutside = (event: Event) => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm != "") {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    const handler = setTimeout(() => {
      setIssueFilter((currentFilter) => ({
        ...currentFilter,
        search_term: searchTerm,
      }));
    }, 1000); // 1 second delay for debounce search term

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm != "") {
      getIssues(issueFilter)
        .unwrap()
        .then((issues) => {
          setIssues(issues);
        })
        .catch(() => message.error("Unable to get issues"));
    } else {
      setIssues([]);
    }
  }, [issueFilter]);

  const issueItems: CollapseProps["items"] = [
    {
      key: "1",
      label: (
        <div className="flex items-center justify-between">
          <span>Issues</span>
          <button
            className="rounded-md border border-gray-300 bg-white px-2 text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-100 focus:outline-none"
            onClick={() => {
              navigate("/business-management/issues", {
                state: { search: searchTerm, filteredIssues: issues },
              });
              setIsOpen(false);
              setSearchTerm("");
            }}
          >
            View All
          </button>
        </div>
      ),
      children: issues?.map((issue) => (
        <Card
          key={issue.issue_id}
          hoverable
          onClick={() => {
            navigate(`/business-management/issues/${issue.issue_id}`);
            setIsOpen(false);
            setSearchTerm("");
          }}
          className="my-1"
        >
          <p className="line-clamp-1">
            <b>{issue.title}</b>
          </p>
          <p className="line-clamp-2">{issue.description}</p>
          <p style={{ color: "#9d9d9d" }}>
            {issue?.create_time
              ? `${new Date(issue.create_time).toDateString()}, ${new Date(issue.create_time).toLocaleTimeString()}`
              : "No Date Available"}
          </p>
        </Card>
      )),
    },
  ];

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const popoverContent = (
    <div className="h-60 w-80 overflow-y-auto" ref={popoverRef}>
      {issues && issues.length > 0 ? (
        <Collapse items={issueItems} />
      ) : isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Spin />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p style={{ color: "#9d9d9d" }}>No data found</p>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      placement="bottomRight"
      content={popoverContent}
      arrow={false}
      open={isOpen}
      className="w-100 m-10"
    >
      <Search
        placeholder="Search..."
        onChange={handleSearchChange}
        onClick={() => {
          searchTerm != "" && setIsOpen(true);
        }}
        value={searchTerm}
        className="my-3 w-32 sm:w-40 md:w-52 lg:w-64"
      />
    </Popover>
  );
};

export default GlobalSearchBar;
