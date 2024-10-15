import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  DatePickerProps,
  Drawer,
  Input,
  message,
  Spin,
} from "antd";
import {
  IssueFilter,
  IssueResult,
} from "../../../../packages/interfaces/issueInterface";
import {
  TransactionFilter,
  TransactionResult,
} from "../../../../packages/interfaces/transactionInterface";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetIssuesMutation } from "../redux/services/issue";
import { useGetTransactionsByFilterMutation } from "../redux/services/transaction";
import { sortDirection } from "../../../../packages/interfaces/sortingInterface";
import { RangePickerProps } from "antd/es/date-picker";
import { ArrowRightOutlined } from "@ant-design/icons";

interface GlobalSearchDrawerProps {
  merchantId: string;
  isGlobalSearchDrawerOpen: boolean;
  setIsGlobalSearchDrawerOpen: (status: boolean) => void;
  prevSearchTerm: string;
  setPrevSearchTerm: (searchTerm: string) => void;
  prevIssues?: IssueResult[];
  prevTransactions?: TransactionResult[];
}

const GlobalSearchDrawer: React.FC<GlobalSearchDrawerProps> = ({
  merchantId,
  isGlobalSearchDrawerOpen,
  setIsGlobalSearchDrawerOpen,
  prevSearchTerm,
  prevIssues,
  prevTransactions,
}) => {
  const navigate = useNavigate();
  const { Search } = Input;
  const { RangePicker } = DatePicker;

  const [showIssues, setShowIssues] = useState(true);
  const [showTransactions, setShowTransactions] = useState(true);
  const [issues, setIssues] = useState<IssueResult[] | undefined>(prevIssues);
  const [transactions, setTransactions] = useState<
    TransactionResult[] | undefined
  >(prevTransactions);

  const [searchTerm, setSearchTerm] = useState(prevSearchTerm);

  const [issueFilter, setIssueFilter] = useState<IssueFilter>({
    merchant_id: merchantId,
    search_term: searchTerm,
    sorting: { sortBy: "updated_at", sortDirection: sortDirection.DESC },
  });
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>(
    {
      merchant_id: merchantId,
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

  useEffect(() => {
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

  const handleRangeChange: RangePickerProps["onChange"] = (values) => {
    if (values) {
      const createFrom = values[0] ? values[0].toDate() : undefined;
      const createTo = values[1] ? values[1].toDate() : undefined;
      setIssueFilter((currentFilter) => ({
        ...currentFilter,
        create_from: createFrom,
        create_to: createTo,
      }));
      setTransactionFilter((currentFilter) => ({
        ...currentFilter,
        create_from: createFrom,
        create_to: createTo,
      }));
    }
  };

  return (
    <Drawer
      title="Search"
      onClose={() => setIsGlobalSearchDrawerOpen(false)}
      open={isGlobalSearchDrawerOpen}
      size="large"
      bodyStyle={{ paddingTop: "0" }}
    >
      <Search
        placeholder="Search..."
        onChange={handleSearchChange}
        value={searchTerm}
        className="my-3 w-full"
      />
      <div className="flex">
        {/* Filter Column */}
        <div className="relative mr-2 w-1/3">
          <div className="sticky top-0 z-10 bg-white pb-2">
            <h3 className="font-semibold">Filters</h3>
            <p>Date Range:</p>
            <RangePicker onChange={handleRangeChange} />
            <div className="mt-2 flex flex-col">
              {issues && issues.length > 0 && (
                <Checkbox
                  onChange={(e) => {
                    e.target.checked
                      ? setShowIssues(true)
                      : setShowIssues(false);
                  }}
                  defaultChecked={true}
                >
                  Issues
                </Checkbox>
              )}
              {transactions && transactions.length > 0 && (
                <Checkbox
                  onChange={(e) => {
                    e.target.checked
                      ? setShowTransactions(true)
                      : setShowTransactions(false);
                  }}
                  defaultChecked={true}
                >
                  Transactions
                </Checkbox>
              )}
            </div>
          </div>
        </div>

        {/* Search Results Column */}
        <div
          className="flex-1 overflow-y-auto px-2"
          style={{ maxHeight: "calc(85vh)" }}
        >
          {isLoadingIssues && isLoadingTransactions ? (
            <div className="flex h-full items-center justify-center">
              <Spin />
            </div>
          ) : (
            <>
              {showIssues && issues && issues.length > 0 && (
                <>
                  {/* <h3 className="sticky top-0 z-10 bg-white pb-2 font-semibold">
                    Issues
                  </h3> */}
                  <div className="sticky top-0 z-10 flex items-center justify-between bg-white pb-2">
                    <h3 className="font-semibold">Issues</h3>
                    <Button
                      icon={<ArrowRightOutlined />}
                      size="small"
                      onClick={() => {
                        navigate("/business-management/issues", {
                          state: { search: searchTerm, filteredIssues: issues },
                        });
                        setIsGlobalSearchDrawerOpen(false);
                        setSearchTerm("");
                      }}
                    />
                  </div>
                  {issues?.map((issue) => (
                    <Card
                      key={issue.issue_id}
                      hoverable
                      onClick={() => {
                        navigate(
                          `/business-management/issues/${issue.issue_id}`,
                        );
                        setIsGlobalSearchDrawerOpen(false);
                        setSearchTerm("");
                      }}
                      className="my-1"
                    >
                      <div className="grid gap-2">
                        <div className="flex">
                          <p className="w-1/3 font-bold">Title:</p>
                          <p className="line-clamp-1 flex-1">{issue.title}</p>
                        </div>
                        <div className="flex">
                          <p className="w-1/3 font-bold">Description:</p>
                          <p className="line-clamp-2 flex-1">
                            {issue.description}
                          </p>
                        </div>
                        <div className="flex">
                          <p className="w-1/3 font-bold">Created At:</p>
                          <p className="flex-1 text-gray-500">
                            {issue?.create_time
                              ? `${new Date(issue.create_time).toDateString()}, ${new Date(issue.create_time).toLocaleTimeString()}`
                              : "No Date Available"}
                          </p>
                        </div>
                      </div>

                      {/* <p className="line-clamp-1">
                        Title: <b>{issue.title}</b>
                      </p>
                      <p className="line-clamp-2">
                        Description: {issue.description}
                      </p>
                      <p style={{ color: "#9d9d9d" }}>
                        Created At:
                        {issue?.create_time
                          ? `${new Date(issue.create_time).toDateString()}, ${new Date(issue.create_time).toLocaleTimeString()}`
                          : "No Date Available"}
                      </p> */}
                    </Card>
                  ))}
                </>
              )}
              {showTransactions && transactions && transactions.length > 0 && (
                <>
                  <div className="sticky top-0 z-10 flex items-center justify-between bg-white pb-2">
                    <h3 className="font-semibold">Transactions</h3>
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
                        setIsGlobalSearchDrawerOpen(false);
                        setSearchTerm("");
                      }}
                    />
                  </div>
                  {transactions?.map((transaction) => (
                    <Card
                      key={transaction.transaction_id}
                      hoverable
                      onClick={() => {
                        navigate(
                          `/financial-management/transactions/${transaction.transaction_id}`,
                        );
                        setIsGlobalSearchDrawerOpen(false);
                        setSearchTerm("");
                      }}
                      className="my-1"
                    >
                      <div className="grid gap-2">
                        <div className="flex">
                          <p className="w-1/3 font-bold">Ref No:</p>
                          <p className="line-clamp-1 flex-1">
                            {transaction.reference_no}
                          </p>
                        </div>
                        <div className="flex">
                          <p className="w-1/3 font-bold">Amount:</p>
                          <p className="line-clamp-2 flex-1">
                            SGD {transaction.amount}
                          </p>
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
                      {/* <p className="line-clamp-1">
                        <b>{transaction.reference_no}</b>
                      </p>
                      <p className="line-clamp-2">{transaction.amount}</p>
                      <p style={{ color: "#9d9d9d" }}>
                        {transaction?.date_of_transaction &&
                          `${new Date(transaction.date_of_transaction).toDateString()}, ${new Date(transaction.date_of_transaction).toLocaleTimeString()}`}
                      </p> */}
                    </Card>
                  ))}
                </>
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
      </div>
    </Drawer>
  );
};

export default GlobalSearchDrawer;
