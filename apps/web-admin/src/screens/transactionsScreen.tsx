import { useState } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Tag,
  Modal,
  Descriptions,
  message,
  Empty,
} from "antd";
import {
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useUpdateTransactionStatusMutation,
} from "../redux/services/transactionService";
import { ICustomer, IMerchant, TransactionResult } from "@repo/interfaces";
import { formatCurrency } from "../utils/formatCurrency";
import { EyeOutlined } from "@ant-design/icons";

const { Search } = Input;

enum TransactionStatus {
  FULLY_PAID = "FULLY_PAID",
  IN_PROGRESS = "IN_PROGRESS",
}

export default function TransactionsScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: transactions, isLoading } = useGetTransactionsQuery(searchTerm);
  const { data: transactionDetails, refetch: refetchTransactionDetails } =
    useGetTransactionByIdQuery(selectedTransactionId ?? "", {
      skip: !selectedTransactionId,
    });
  const [updateTransactionStatus] = useUpdateTransactionStatusMutation();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [isMerchantModalVisible, setIsMerchantModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null,
  );
  const [selectedMerchant, setSelectedMerchant] = useState<IMerchant | null>(
    null,
  );

  const handleViewCustomerDetails = (customer: ICustomer) => {
    setSelectedCustomer(customer);
    setIsCustomerModalVisible(true);
  };

  const handleViewMerchantDetails = (merchant: IMerchant) => {
    setSelectedMerchant(merchant);
    setIsMerchantModalVisible(true);
  };

  const handleCustomerModalClose = () => {
    setIsCustomerModalVisible(false);
    setSelectedCustomer(null);
  };

  const handleMerchantModalClose = () => {
    setIsMerchantModalVisible(false);
    setSelectedMerchant(null);
  };

  const handleViewDetails = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsModalVisible(true);
    refetchTransactionDetails();
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedTransactionId(null);
  };

  const handleUpdateStatus = async (
    transactionId: string,
    newStatus: string,
  ) => {
    try {
      await updateTransactionStatus({
        transaction_id: transactionId,
        status: newStatus,
      }).unwrap();
      message.success("Transaction status updated successfully");
      refetchTransactionDetails();
    } catch (error) {
      message.error("Failed to update transaction status");
    }
  };

  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "transaction_id",
      key: "transaction_id",
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (customer: ICustomer) => (
        <Button onClick={() => handleViewCustomerDetails(customer)}>
          {customer.email}
        </Button>
      ),
    },
    {
      title: "Merchant",
      dataIndex: "merchant",
      key: "merchant",
      render: (merchant: IMerchant) => (
        <Button onClick={() => handleViewMerchantDetails(merchant)}>
          {merchant.email}
        </Button>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: TransactionResult, b: TransactionResult) =>
        a.amount - b.amount,
    },
    {
      title: "Date",
      dataIndex: "date_of_transaction",
      key: "date_of_transaction",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: TransactionResult, b: TransactionResult) =>
        new Date(a.date_of_transaction).getTime() -
        new Date(b.date_of_transaction).getTime(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: TransactionStatus) => (
        <Tag
          color={status === TransactionStatus.FULLY_PAID ? "green" : "orange"}
        >
          {status === TransactionStatus.FULLY_PAID
            ? "Fully Paid"
            : "In Progress"}
        </Tag>
      ),
      filters: [
        { text: "Fully Paid", value: TransactionStatus.FULLY_PAID },
        { text: "In Progress", value: TransactionStatus.IN_PROGRESS },
      ],
      onFilter: (value: React.Key | boolean, record: TransactionResult) =>
        record.status === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text: string, record: TransactionResult) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record.transaction_id)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full px-8 py-4">
      <Card
        className="mb-8 border border-gray-300"
        title="View and Manage Transactions"
      >
        <Search
          placeholder="Search transactions"
          onSearch={handleSearch}
          style={{ marginBottom: 16 }}
        />
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="transaction_id"
          loading={isLoading}
          pagination={false}
          locale={{
            emptyText: <Empty description="No transactions found" />,
          }}
        />
      </Card>

      <Modal
        title="Transaction Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {transactionDetails && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Transaction ID">
                {transactionDetails.transaction_id}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    transactionDetails.status === TransactionStatus.FULLY_PAID
                      ? "green"
                      : "orange"
                  }
                >
                  {transactionDetails.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {transactionDetails.customer.name}
              </Descriptions.Item>
              <Descriptions.Item label="Merchant">
                {transactionDetails.merchant.name}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                {formatCurrency(transactionDetails.amount)}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {new Date(
                  transactionDetails.date_of_transaction,
                ).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Instalment Plan">
                {transactionDetails.instalment_plan.name}
              </Descriptions.Item>
              <Descriptions.Item label="Number of Instalments">
                {transactionDetails.instalment_plan.number_of_instalments}
              </Descriptions.Item>
            </Descriptions>

            <Table
              dataSource={transactionDetails.instalment_payments}
              columns={[
                {
                  title: "Instalment Number",
                  dataIndex: "instalment_number",
                  key: "instalment_number",
                },
                {
                  title: "Amount Due",
                  dataIndex: "amount_due",
                  key: "amount_due",
                  render: (amount: number) => formatCurrency(amount),
                },
                {
                  title: "Due Date",
                  dataIndex: "due_date",
                  key: "due_date",
                  render: (date: string) => new Date(date).toLocaleDateString(),
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  key: "status",
                  render: (status: string) => (
                    <Tag color={status === "PAID" ? "green" : "orange"}>
                      {status}
                    </Tag>
                  ),
                },
              ]}
              locale={{
                emptyText: <Empty description="No instalment payments found" />,
              }}
              pagination={false}
              className="mt-4"
            />
          </>
        )}
      </Modal>

      <Modal
        title="Customer Details"
        open={isCustomerModalVisible}
        onCancel={handleCustomerModalClose}
        footer={null}
      >
        {selectedCustomer && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Customer ID">
              {selectedCustomer.customer_id}
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              {selectedCustomer.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedCustomer.email}
            </Descriptions.Item>
            <Descriptions.Item label="Contact Number">
              {selectedCustomer.contact_number}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {selectedCustomer.address}
            </Descriptions.Item>
            <Descriptions.Item label="Date of Birth">
              {new Date(selectedCustomer.date_of_birth).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedCustomer.status}
            </Descriptions.Item>
            <Descriptions.Item label="Credit Score">
              {selectedCustomer.credit_score}
            </Descriptions.Item>
            <Descriptions.Item label="Wallet Balance">
              {formatCurrency(selectedCustomer.wallet_balance)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="Merchant Details"
        open={isMerchantModalVisible}
        onCancel={handleMerchantModalClose}
        footer={null}
      >
        {selectedMerchant && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Merchant ID">
              {selectedMerchant.merchant_id}
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              {selectedMerchant.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedMerchant.email}
            </Descriptions.Item>
            <Descriptions.Item label="Contact Number">
              {selectedMerchant.contact_number}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {selectedMerchant.address}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedMerchant.status}
            </Descriptions.Item>
            <Descriptions.Item label="Cashback">
              {selectedMerchant.cashback}%
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
