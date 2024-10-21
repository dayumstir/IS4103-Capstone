import { ArrowRightOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Drawer,
  Input,
  message,
  Spin,
} from "antd";
import { RangePickerProps } from "antd/es/date-picker";
import { useEffect, useState } from "react";
import Highlighter from "react-highlight-words";
import { useNavigate } from "react-router-dom";
import {
  IssueFilter,
  IssueResult,
} from "../../../../packages/interfaces/issueInterface";
import { sortDirection } from "../../../../packages/interfaces/sortingInterface";
import {
  TransactionFilter,
  TransactionResult,
} from "../../../../packages/interfaces/transactionInterface";
import { useGetIssuesMutation } from "../redux/services/issue";
import { useGetTransactionsByFilterMutation } from "../redux/services/transaction";

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

  const highlightedColour = "yellow-300";

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
            <h3 className="mb-3 font-semibold">Filters</h3>
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
                          <Highlighter
                            highlightClassName={highlightedColour}
                            searchWords={[searchTerm]}
                            autoEscape={true}
                            textToHighlight={issue.title}
                            className="line-clamp-1 flex-1"
                          />
                        </div>
                        <div className="flex">
                          <p className="w-1/3 font-bold">Description:</p>
                          <Highlighter
                            highlightClassName={highlightedColour}
                            searchWords={[searchTerm]}
                            autoEscape={true}
                            textToHighlight={issue.description}
                            className="line-clamp-1 flex-1"
                          />
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
                          <Highlighter
                            highlightClassName={highlightedColour}
                            searchWords={[searchTerm]}
                            autoEscape={true}
                            textToHighlight={transaction.reference_no}
                            className="line-clamp-1 flex-1"
                          />
                        </div>
                      </div>
                      <div className="flex">
                        <p className="w-1/3 font-bold">Amount:</p>
                        <Highlighter
                          highlightClassName={highlightedColour}
                          searchWords={[searchTerm]}
                          autoEscape={true}
                          textToHighlight={`SGD ${transaction.amount}`}
                          className="line-clamp-1 flex-1"
                        />
                      </div>
                      <div className="flex">
                        <p className="w-1/3 font-bold">Cashback:</p>
                        {String(transaction?.cashback_percentage) ==
                        searchTerm ? (
                          <Highlighter
                            highlightClassName={highlightedColour}
                            searchWords={[searchTerm]}
                            autoEscape={true}
                            textToHighlight={`${transaction?.cashback_percentage}%`}
                            className="line-clamp-1 flex-1"
                          />
                        ) : (
                          <p>{transaction?.cashback_percentage}%</p>
                        )}
                      </div>
                      <div className="flex">
                        <p className="w-1/3 font-bold">Instalment Plan:</p>
                        <Highlighter
                          highlightClassName={highlightedColour}
                          searchWords={[searchTerm]}
                          autoEscape={true}
                          textToHighlight={transaction.instalment_plan.name}
                          className="line-clamp-1 flex-1"
                        />
                      </div>
                      <div className="flex">
                        <p className="w-1/3 font-bold">Customer:</p>
                        <p>
                          <Highlighter
                            highlightClassName={highlightedColour}
                            searchWords={[searchTerm]}
                            autoEscape={true}
                            textToHighlight={transaction?.customer.name}
                            className="line-clamp-1 flex-1"
                          />
                          <Highlighter
                            highlightClassName={highlightedColour}
                            searchWords={[searchTerm]}
                            autoEscape={true}
                            textToHighlight={transaction?.customer.email}
                            className="line-clamp-1 flex-1"
                          />
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
