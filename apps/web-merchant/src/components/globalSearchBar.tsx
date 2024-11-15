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
  Tag,
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
import Highlighter from "react-highlight-words";
import { useGetMerchantPaymentsMutation } from "../redux/services/merchantPayment";
import {
  IMerchantPayment,
  IMerchantPaymentFilter,
  PaymentStatus,
} from "@repo/interfaces/merchantPaymentInterface";

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
  const [merchantPayments, setMerchantPayments] =
    useState<IMerchantPayment[]>();
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
  const [merchantPaymentFilter, setMerchantPaymentFilter] =
    useState<IMerchantPaymentFilter>({
      merchant_id: merchant?.merchant_id,
      search_term: searchTerm,
      sorting: {
        sortBy: "created_at",
        sortDirection: sortDirection.DESC,
      },
    });

  const [getIssues, { isLoading: isLoadingIssues }] = useGetIssuesMutation();
  const [getTransactions, { isLoading: isLoadingTransactions }] =
    useGetTransactionsByFilterMutation();

  const [getMerchantPayments, { isLoading: isLoadingMerchantPayments }] =
    useGetMerchantPaymentsMutation();

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
      setMerchantPaymentFilter((currentFilter) => ({
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
      getMerchantPayments(merchantPaymentFilter)
        .unwrap()
        .then((merchantPayments) => {
          setMerchantPayments(merchantPayments);
        })
        .catch(() => message.error("Unable to get merchant payments"));
    } else {
      setIssues([]);
      setTransactions([]);
    }
  }, [issueFilter, transactionFilter]);

  const highlightedColour = "yellow-300";

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
          <div className="">
            <div className="flex">
              <p className="w-2/5 font-bold">Title:</p>
              <Highlighter
                highlightClassName={highlightedColour}
                searchWords={[searchTerm]}
                autoEscape={true}
                textToHighlight={issue.title}
                className="line-clamp-1 flex-1"
              />
            </div>
            <div className="flex">
              <p className="w-2/5 font-bold">Description:</p>
              <Highlighter
                highlightClassName={highlightedColour}
                searchWords={[searchTerm]}
                autoEscape={true}
                textToHighlight={issue.description}
                className="line-clamp-1 flex-1"
              />
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
              navigate("/business-management/transactions", {
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
          <div className="">
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
            {String(transaction?.cashback_percentage) == searchTerm ? (
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
      )),
    },
  ];

  const merchantPaymentItems: CollapseProps["items"] = [
    {
      key: "2",
      label: (
        <div className="flex items-center justify-between">
          <span>Merchant Payments</span>
          <Button
            icon={<ArrowRightOutlined />}
            size="small"
            onClick={() => {
              navigate("/business-management/merchant-payments", {
                state: {
                  search: searchTerm,
                  filteredMerchantPayments: merchantPayments,
                },
              });
              setIsOpen(false);
              setSearchTerm("");
            }}
          />
        </div>
      ),
      children: merchantPayments?.map((merchantPayment) => (
        <Card
          key={merchantPayment.merchant_payment_id}
          hoverable
          onClick={() => {
            navigate(
              `/business-management/issues/${merchantPayment.merchant_payment_id}`,
            );
            setIsOpen(false);
            setSearchTerm("");
          }}
          className="my-1"
        >
          <div className="">
            <div className="flex">
              <p className="w-1/3 font-bold">Requested Withdrawal:</p>
              <Highlighter
                highlightClassName={highlightedColour}
                searchWords={[searchTerm]}
                autoEscape={true}
                textToHighlight={merchantPayment.total_amount_from_transactions.toString()}
                className="line-clamp-1 flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <p className="w-1/3 font-bold">Final Payment:</p>
            <Highlighter
              highlightClassName={highlightedColour}
              searchWords={[searchTerm]}
              autoEscape={true}
              textToHighlight={`SGD ${merchantPayment.final_payment_amount.toString()}`}
              className="line-clamp-1 flex-1"
            />
          </div>
          <div className="flex">
            <p className="w-1/3 font-bold">Status:</p>
            <Tag
              color={
                merchantPayment.status === PaymentStatus.PAID ? "green" : "gold"
              }
            >
              {merchantPayment.status == PaymentStatus.PENDING_PAYMENT &&
                "PENDING PAYMENT"}
              {merchantPayment.status == PaymentStatus.PAID && "PAID"}
            </Tag>
          </div>
          <div className="flex">
            <p className="w-1/3 font-bold">Created At:</p>
            <p className="flex-1 text-gray-500">
              {merchantPayment?.created_at
                ? `${new Date(merchantPayment.created_at).toDateString()}, ${new Date(merchantPayment.created_at).toLocaleTimeString()}`
                : "No Date Available"}
            </p>
          </div>
        </Card>
      )),
    },
  ];

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const popoverContent = (
    <div className="overflow-y-auto md:h-60 lg:h-80" ref={popoverRef}>
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
          {merchantPayments && merchantPayments.length > 0 && (
            <Collapse items={merchantPaymentItems} className="mb-2" />
          )}

          {issues &&
            issues.length == 0 &&
            transactions &&
            transactions.length == 0 &&
            merchantPayments &&
            merchantPayments.length == 0 && (
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
        overlayStyle={{ width: "25%" }}
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
