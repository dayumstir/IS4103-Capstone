import { ArrowRightOutlined, ExpandOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Collapse,
  CollapseProps,
  Input,
  message,
  Popover,
  Spin,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  IssueFilter,
  IssueResult,
} from "../../../../packages/interfaces/issueInterface";
import {
  TransactionFilter,
  TransactionResult,
} from "../../../../packages/interfaces/transactionInterface";
import { sortDirection } from "../interfaces/sortingInterface";
import { useGetIssuesMutation } from "../redux/services/issue";
import { useGetTransactionsByFilterMutation } from "../redux/services/transaction";
import { RootState } from "../redux/store";
import GlobalSearchDrawer from "./globalSearchDrawer";

const GlobalSearchBar: React.FC = () => {
  const navigate = useNavigate();

  const merchant = useSelector((state: RootState) => state.profile.merchant);

  const { Search } = Input;
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isGlobalSearchDrawerOpen, setIsGlobalSearchDrawerOpen] =
    useState<boolean>(false);

  const [issues, setIssues] = useState<IssueResult[]>();
  const [transactions, setTransactions] = useState<TransactionResult[]>();
  const [issueFilter, setIssueFilter] = useState<IssueFilter>({
    merchant_id: merchant?.merchant_id,
    search_term: searchTerm,
    sorting: { sortBy: "updated_at", sortDirection: sortDirection.DESC },
  });
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>(
    {
      merchant_id: merchant?.merchant_id,
      search_term: searchTerm,
      sorting: {
        sortBy: "date_of_transaction",
        sortDirection: sortDirection.DESC,
      },
    },
  );
  const [getIssues, { isLoading: isLoadingIssues }] = useGetIssuesMutation();
  const [getTransactions, { isLoading: isLoadingTransactions }] =
    useGetTransactionsByFilterMutation();

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
      setTransactionFilter((currentFilter) => ({
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
      getTransactions(transactionFilter)
        .unwrap()
        .then((transactions) => {
          setTransactions(transactions);
        })
        .catch(() => message.error("Unable to get transactions"));
    } else {
      setIssues([]);
      setTransactions([]);
    }
  }, [issueFilter, transactionFilter]);

  const issueItems: CollapseProps["items"] = [
    {
      key: "1",
      label: (
        <div className="flex items-center justify-between">
          <span>Issues</span>
          <Button
            icon={<ArrowRightOutlined />}
            size="small"
            onClick={() => {
              navigate("/business-management/issues", {
                state: { search: searchTerm, filteredIssues: issues },
              });
              setIsOpen(false);
              setSearchTerm("");
            }}
          />
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
          <div className="grid gap-2">
            <div className="flex">
              <p className="w-2/5 font-bold">Title:</p>
              <p className="line-clamp-1 flex-1">{issue.title}</p>
            </div>
            <div className="flex">
              <p className="w-2/5 font-bold">Description:</p>
              <p className="line-clamp-2 flex-1">{issue.description}</p>
            </div>
            <div className="flex">
              <p className="w-2/5 font-bold">Created At:</p>
              <p className="flex-1 text-gray-500">
                {issue?.create_time
                  ? `${new Date(issue.create_time).toDateString()}, ${new Date(issue.create_time).toLocaleTimeString()}`
                  : "No Date Available"}
              </p>
            </div>
          </div>
        </Card>
      )),
    },
  ];

  const transactionItems: CollapseProps["items"] = [
    {
      key: "2",
      label: (
        <div className="flex items-center justify-between">
          <span>Transactions</span>
          <Button
            icon={<ArrowRightOutlined />}
            size="small"
            onClick={() => {
              navigate("/financial-management/transactions", {
                state: {
                  search: searchTerm,
                  filteredTransactions: transactions,
                },
              });
              setIsOpen(false);
              setSearchTerm("");
            }}
          />
        </div>
      ),
      children: transactions?.map((transaction) => (
        <Card
          key={transaction.transaction_id}
          hoverable
          onClick={() => {
            navigate(
              `/business-management/issues/${transaction.transaction_id}`,
            );
            setIsOpen(false);
            setSearchTerm("");
          }}
          className="my-1"
        >
          <div className="grid gap-2">
            <div className="flex">
              <p className="w-1/3 font-bold">Ref No:</p>
              <p className="line-clamp-1 flex-1">{transaction.reference_no}</p>
            </div>
            <div className="flex">
              <p className="w-1/3 font-bold">Amount:</p>
              <p className="line-clamp-2 flex-1">SGD {transaction.amount}</p>
            </div>
            <div className="flex">
              <p className="w-1/3 font-bold">Cashback:</p>
              <p className="flex-1 text-gray-500">
                {transaction?.cashback_percentage}%
              </p>
            </div>
            <div className="flex">
              <p className="w-1/3 font-bold">Instalment Plan:</p>
              <p className="flex-1 text-gray-500">
                {transaction.instalment_plan.name}
              </p>
            </div>
            <div className="flex">
              <p className="w-1/3 font-bold">Customer:</p>
              <p>
                <p className="w-1/3 flex-1 text-gray-500">
                  {transaction?.customer.name}
                </p>
                <p className="flex-1 text-gray-500">
                  {transaction?.customer.email}
                </p>
              </p>
            </div>
            <div className="flex">
              <p className="w-1/3 font-bold">Date:</p>
              <p className="flex-1 text-gray-500">
                {transaction?.date_of_transaction
                  ? `${new Date(transaction.date_of_transaction).toDateString()}, ${new Date(transaction.date_of_transaction).toLocaleTimeString()}`
                  : "No Date Available"}
              </p>
            </div>
          </div>
        </Card>
      )),
    },
  ];

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const popoverContent = (
    <div className="h-60 w-80 overflow-y-auto" ref={popoverRef}>
      {isLoadingIssues && isLoadingTransactions ? (
        <div className="flex h-full items-center justify-center">
          <Spin />
        </div>
      ) : (
        <>
          {(issues && issues.length > 0) ||
          (transactions && transactions.length > 0) ? (
            <div className="flex items-center justify-between">
              <div>Search Results</div>
              <Button
                icon={<ExpandOutlined />}
                onClick={() => {
                  setIsGlobalSearchDrawerOpen(true);
                  setIsOpen(false);
                }}
                className="mb-2"
                size="small"
              />
            </div>
          ) : null}

          {issues && issues.length > 0 && (
            <Collapse items={issueItems} className="mb-2" />
          )}
          {transactions && transactions.length > 0 && (
            <Collapse items={transactionItems} className="mb-2" />
          )}

          {issues &&
            issues.length == 0 &&
            transactions &&
            transactions.length == 0 && (
              <div className="flex h-full items-center justify-center">
                <p style={{ color: "#9d9d9d" }}>No search results</p>
              </div>
            )}
        </>
      )}
    </div>
  );

  return (
    <>
      {merchant && isGlobalSearchDrawerOpen && (
        <GlobalSearchDrawer
          merchantId={merchant.merchant_id}
          isGlobalSearchDrawerOpen={isGlobalSearchDrawerOpen}
          setIsGlobalSearchDrawerOpen={setIsGlobalSearchDrawerOpen}
          prevSearchTerm={searchTerm}
          prevIssues={issues}
          prevTransactions={transactions}
          setPrevSearchTerm={setSearchTerm}
        />
      )}
      <Popover
        placement="bottomRight"
        content={popoverContent}
        arrow={false}
        open={isOpen}
        className="m-10"
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
    </>
  );
};

export default GlobalSearchBar;
