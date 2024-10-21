import {
  Breadcrumb,
  Button,
  Card,
  Form,
  FormProps,
  Empty,
  Input,
  message,
  Modal,
  Table,
  TableProps,
  Tag,
} from "antd";
import { SortOrder } from "antd/es/table/interface";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  TransactionFilter,
  TransactionStatus,
  transactionStatusColorMap,
} from "../../../../packages/interfaces/transactionInterface";
import { ApiError } from "../interfaces/errorInterface";
import { sortDirection } from "../interfaces/sortingInterface";
import { useGetTransactionsByFilterMutation } from "../redux/services/transaction";
import { RootState } from "../redux/store";
import { EyeOutlined } from "@ant-design/icons";
import {
  useGetProfileQuery,
  useEditProfileMutation,
} from "../redux/services/profile";
import { EditProfileProps } from "../interfaces/screens/editProfileInterface";

interface TransactionTableInterface {
  key: string;
  instalmentPlanName: string;
  dateOfTransaction: Date;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: TransactionStatus;
  fullyPaidDate: Date;
  referenceNumber: string;
  cashbackPercentage: number;
}

const TransactionScreen: React.FC = () => {
  const merchant = useSelector((state: RootState) => state.profile.merchant);

  const location = useLocation();
  const navigate = useNavigate();

  const { search, filteredTransactions } = location.state || {};

  const [transactions, setTransactions] = useState<TransactionTableInterface[]>(
    filteredTransactions || [],
  );
  const [getTransactionsByFilter, { isLoading }] =
    useGetTransactionsByFilterMutation();
  const { Search } = Input;

  const [searchTerm, setSearchTerm] = useState(search || "");
  const [filter, setFilter] = useState<TransactionFilter>({
    merchant_id: merchant?.merchant_id,
    search_term: searchTerm,
    sorting: {
      sortBy: "date_of_transaction",
      sortDirection: sortDirection.DESC,
    },
  });

  const [isEditCashbackModalOpen, setIsEditCashbackModalOpen] = useState(false);
  const [cashback, setCashback] = useState(0.0);
  const merchantId = localStorage.getItem("merchantId");
  if (!merchantId) {
    navigate("/login");
    return null;
  }
  const { data: profile, refetch } = useGetProfileQuery(merchantId);

  useEffect(() => {
    if (profile) {
      setCashback(profile.cashback);
    }
  });

  useEffect(() => {
    fetchFilteredTransactions();
    if (filteredTransactions) {
      setTransactions(filteredTransactions);
    }
    if (search) {
      setSearchTerm(search);
    }
  }, [filter, search, filteredTransactions]);

  useEffect(() => {
    if (merchant) {
      setFilter((currFilter) => ({
        ...currFilter,
        merchant_id: merchant.merchant_id,
      }));
    }
  }, [merchant]);

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

  const fetchFilteredTransactions = async () => {
    try {
      if (merchant && merchant.merchant_id) {
        console.log(merchant.merchant_id);
        const data = await getTransactionsByFilter(filter).unwrap();
        const mappedData: TransactionTableInterface[] = data.map(
          (transaction) => ({
            key: transaction.transaction_id,
            instalmentPlanName: transaction.instalment_plan.name,
            dateOfTransaction: transaction.date_of_transaction,
            customerName: transaction.customer.name,
            customerEmail: transaction.customer.email,
            amount: transaction.amount,
            status: transaction.status,
            fullyPaidDate: transaction.fully_paid_date,
            referenceNumber: transaction.reference_no,
            cashbackPercentage: transaction.cashback_percentage,
          }),
        );
        setTransactions(mappedData);
      }
    } catch (error) {
      const err = error as ApiError;
      message.error(
        err.data?.error || "Unable to fetch transactions based on filter",
      );
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const columns: TableProps<TransactionTableInterface>["columns"] = [
    {
      title: "Instalment Plan",
      dataIndex: "instalmentPlanName",
      showSorterTooltip: true,
      sorter: (a: TransactionTableInterface, b: TransactionTableInterface) =>
        a.instalmentPlanName.localeCompare(b.instalmentPlanName),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      key: "instalmentPlanName",
      render: (instalmentPlanName: string) => (
        <div className="truncate">{instalmentPlanName}</div>
      ),
      className: "w-1/10",
    },
    {
      title: "Date of Transaction",
      dataIndex: "dateOfTransaction",
      showSorterTooltip: true,
      sorter: (a: TransactionTableInterface, b: TransactionTableInterface) =>
        a.dateOfTransaction.getTime() - b.dateOfTransaction.getTime(),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      key: "dateOfTransaction",
      render: (dateOfTransaction: Date) => (
        <div>
          {`${new Date(dateOfTransaction).toDateString()}, ${new Date(dateOfTransaction).toLocaleTimeString()}`}
        </div>
      ),
      className: "w-1/10",
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      showSorterTooltip: true,
      sorter: (a: TransactionTableInterface, b: TransactionTableInterface) =>
        a.customerName.localeCompare(b.customerName),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      key: "customerName",
      render: (customerName: string) => (
        <div className="truncate">{customerName}</div>
      ),
      className: "w-1/10",
    },
    {
      title: "Customer Email",
      dataIndex: "customerEmail",
      showSorterTooltip: true,
      sorter: (a: TransactionTableInterface, b: TransactionTableInterface) =>
        a.customerEmail.localeCompare(b.customerEmail),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      key: "customerEmail",
      render: (customerEmail: string) => (
        <div className="truncate">{customerEmail}</div>
      ),
      className: "w-1/10",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      showSorterTooltip: true,
      sorter: (a: TransactionTableInterface, b: TransactionTableInterface) =>
        a.amount - b.amount,
      sortDirections: ["ascend", "descend"] as SortOrder[],
      key: "cashbackPercentage",
      render: (amount: string) => <div className="truncate">SGD {amount}</div>,
      className: "w-1/10",
    },
    {
      title: "Status",
      dataIndex: "status",
      showSorterTooltip: true,
      key: "status",
      render: (status: TransactionStatus) => (
        <Tag
          color={transactionStatusColorMap[status] || "default"}
          key={status}
        >
          {status == TransactionStatus.IN_PROGRESS && "IN PROGRESS"}
          {status == TransactionStatus.FULLY_PAID && "FULLY PAID"}
        </Tag>
      ),
      filters: [
        {
          text: TransactionStatus.IN_PROGRESS,
          value: TransactionStatus.IN_PROGRESS,
        },
        {
          text: TransactionStatus.FULLY_PAID,
          value: TransactionStatus.FULLY_PAID,
        },
      ],
      onFilter: (value, record) => record.status === value,
      className: "w-1/10",
    },
    {
      title: "Fully Paid Date",
      dataIndex: "fullyPaidDate",
      showSorterTooltip: true,
      sorter: (a: TransactionTableInterface, b: TransactionTableInterface) =>
        a.fullyPaidDate.getTime() - b.fullyPaidDate.getTime(),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      key: "fullyPaidDate",
      render: (fullyPaidDate: Date) => (
        <div>
          {`${new Date(fullyPaidDate).toDateString()}, ${new Date(fullyPaidDate).toLocaleTimeString()}`}
        </div>
      ),
      className: "w-1/10",
    },
    {
      title: "Reference Number",
      dataIndex: "referenceNumber",
      showSorterTooltip: true,
      sorter: (a: TransactionTableInterface, b: TransactionTableInterface) =>
        a.referenceNumber.localeCompare(b.referenceNumber),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      key: "referenceNumber",
      render: (referenceNumber: string) => (
        <div className="truncate">{referenceNumber}</div>
      ),
      className: "w-1/10",
    },
    {
      title: "Cashback Percentage",
      dataIndex: "cashbackPercentage",
      showSorterTooltip: true,
      sorter: (a: TransactionTableInterface, b: TransactionTableInterface) =>
        a.cashbackPercentage - b.cashbackPercentage,
      sortDirections: ["ascend", "descend"] as SortOrder[],
      key: "cashbackPercentage",
      render: (cashbackPercentage: string) => (
        <div className="truncate">{cashbackPercentage}%</div>
      ),
      className: "w-1/10",
    },
    {
      title: "Action",
      key: "action",
      render: (transaction: TransactionTableInterface) => (
        <div>
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`${location.pathname}/${transaction.key}`)}
          >
            View Details
          </Button>
        </div>
      ),
      className: "w-1/10",
    },
  ];

  return (
    <Card>
      <div className="flex justify-between">
        {/* <Breadcrumb items={[{ title: "Transactions" }]} /> */}
        <h2 className="text-xl font-bold"> Transactions</h2>
        <Button type="primary" onClick={() => setIsEditCashbackModalOpen(true)}>
          Edit CashBack
        </Button>
        {isEditCashbackModalOpen && (
          <EditCashbackModal
            refetch={refetch}
            merchantId={merchantId}
            initCashback={cashback}
            isModalOpen={isEditCashbackModalOpen}
            setModalOpen={setIsEditCashbackModalOpen}
          />
        )}
      </div>

      <Search
        placeholder="Search by amount, reference number, cashback, customer, or installment plan"
        onChange={handleSearchChange}
        value={searchTerm}
        className="my-3"
      />
      <Table<TransactionTableInterface>
        columns={columns}
        dataSource={transactions}
        style={{ tableLayout: "fixed" }}
        locale={{
          emptyText: <Empty description="No transactions found"></Empty>,
        }}
      />
    </Card>
  );
};

const EditCashbackModal = ({
  refetch,
  merchantId,
  initCashback,
  isModalOpen,
  setModalOpen,
}: EditProfileProps) => {
  const [form] = Form.useForm();
  const [EditProfileMutation] = useEditProfileMutation();

  const onFinish: FormProps["onFinish"] = async (data) => {
    data.cashback = parseFloat(data.cashback);
    await EditProfileMutation({
      id: merchantId,
      body: data,
    })
      .unwrap()
      .then(() => {
        message.success("Update Cashback Successful!");
        setModalOpen(false);
      })
      .catch((error) => message.error(error.data.error));
    refetch();
  };
  return (
    <Modal
      title="Cashback percentage currently offered"
      open={isModalOpen}
      onOk={() => form.submit()}
      cancelText="Cancel"
      okText="Confirm"
      onCancel={() => setModalOpen(false)}
    >
      <Form
        name="basic"
        onFinish={onFinish}
        form={form}
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item
          name="cashback"
          label="Cashback (%)"
          rules={[
            {
              required: true,
              message: "Please input your Cashback desired",
            },
            {
              validator: (_, value) => {
                if (value !== undefined && (value < 0 || value > 100)) {
                  return Promise.reject(
                    new Error("Cashback must be between 0 and 100."),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          initialValue={initCashback}
          hasFeedback
        >
          <Input type="number" min={0} max={100} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default TransactionScreen;
