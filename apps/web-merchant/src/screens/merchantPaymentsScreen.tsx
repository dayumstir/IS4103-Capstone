import {
  Card,
  Table,
  Tag,
  Button,
  Empty,
  Modal,
  Form,
  InputNumber,
  message,
  Input,
  Tooltip,
  Statistic,
  Popconfirm,
} from "antd";
import {
  EyeOutlined,
  DollarOutlined,
  QuestionCircleOutlined,
  WalletOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { useCreateMerchantPaymentMutation } from "../redux/services/merchantPayment";
import { useState, useEffect } from "react";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import { useGetTransactionsByFilterMutation } from "../redux/services/transaction";
import { subMonths } from "date-fns";
import { IMerchantPayment, TransactionFilter } from "@repo/interfaces";

enum PaymentStatus {
  PAID = "PAID",
  PENDING_PAYMENT = "PENDING_PAYMENT",
}

export default function MerchantPaymentsScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [createPayment] = useCreateMerchantPaymentMutation();
  const { merchant } = useSelector((state: RootState) => state.profile);
  const [getTransactionsByFilter] = useGetTransactionsByFilterMutation();
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (merchant?.merchant_id) {
        const filter: TransactionFilter = {
          merchant_id: merchant.merchant_id,
          create_from: subMonths(new Date(), 1),
          create_to: new Date(),
        };

        const data = await getTransactionsByFilter(filter).unwrap();
        const totalAmount = data.reduce(
          (sum, transaction) => sum + transaction.amount,
          0,
        );
        setMonthlyRevenue(totalAmount);
      }
    };

    fetchTransactions();
  }, [merchant]);

  const columns = [
    {
      title: "Payment ID",
      dataIndex: "merchant_payment_id",
      key: "merchant_payment_id",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => format(new Date(date), "d MMM yyyy, h:mm a"),
      sorter: (a: IMerchantPayment, b: IMerchantPayment) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount_from_transactions",
      key: "total_amount_from_transactions",
      render: (amount: number) => `SGD ${amount.toFixed(2)}`,
      sorter: (a: IMerchantPayment, b: IMerchantPayment) =>
        a.total_amount_from_transactions - b.total_amount_from_transactions,
    },
    {
      title: "Final Payment",
      dataIndex: "final_payment_amount",
      key: "final_payment_amount",
      render: (amount: number) => `SGD ${amount.toFixed(2)}`,
      sorter: (a: IMerchantPayment, b: IMerchantPayment) =>
        a.final_payment_amount - b.final_payment_amount,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: PaymentStatus) => (
        <Tag color={status === PaymentStatus.PAID ? "green" : "gold"}>
          {status}
        </Tag>
      ),
      filters: [
        { text: PaymentStatus.PAID, value: PaymentStatus.PAID },
        {
          text: PaymentStatus.PENDING_PAYMENT,
          value: PaymentStatus.PENDING_PAYMENT,
        },
      ],
      onFilter: (value: React.Key | boolean, record: IMerchantPayment) =>
        record.status === value,
    },
    {
      title: "Action",
      key: "action",
      render: (_: IMerchantPayment, record: IMerchantPayment) => (
        <Button
          icon={<EyeOutlined />}
          // onClick={() => setSelectedPayment(record)}
        >
          View Details
        </Button>
      ),
    },
  ];

  const handleCreatePayment = async (values: {
    total_amount_from_transactions: number;
    to_merchant_bank_account_no: string;
  }) => {
    // Calculate fees
    const transaction_fee_percentage = 0.015;
    const transaction_fees =
      values.total_amount_from_transactions * transaction_fee_percentage;
    const withdrawal_fee_percentage = calculateWithdrawalFeeRate();
    const withdrawal_fee =
      values.total_amount_from_transactions * withdrawal_fee_percentage;
    const final_payment_amount =
      values.total_amount_from_transactions - transaction_fees - withdrawal_fee;

    form.setFieldsValue({
      ...values,
      merchant_id: merchant?.merchant_id,

      from_bank: null,
      created_at: new Date(),
      evidence: null,
      status: PaymentStatus.PENDING_PAYMENT,

      total_amount_from_transactions: values.total_amount_from_transactions,
      transaction_fee_percentage: transaction_fee_percentage,
      transaction_fees: transaction_fees,
      withdrawal_fee_percentage: withdrawal_fee_percentage,
      withdrawal_fee: withdrawal_fee,
      final_payment_amount: final_payment_amount,
    });

    try {
      await createPayment(form.getFieldsValue(true)).unwrap();
      message.success("Payment created successfully");
      setIsModalOpen(false);
      form.resetFields();
      window.location.reload();
    } catch (error) {
      message.error("Failed to create payment");
    }
  };

  const calculateWithdrawalFeeRate = () => {
    if (!merchant) {
      return 0.05; // default highest withdrawal fee rate
    }

    if (monthlyRevenue >= 25000) {
      if (merchant.wallet_balance >= 200000) return 0.028;
      if (merchant.wallet_balance >= 100000) return 0.03;
      if (merchant.wallet_balance >= 50000) return 0.035;
    } else {
      if (merchant.wallet_balance >= 50000) return 0.028;
      if (merchant.wallet_balance >= 25000) return 0.03;
      if (merchant.wallet_balance >= 5000) return 0.035;
    }

    return 0.05;
  };

  return (
    <div className="w-full px-8 py-4">
      <Card>
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-2xl font-bold">Merchant Payments</h1>
          <Button
            type="primary"
            icon={<DollarOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Request Withdrawal
          </Button>
        </div>

        {/* ===== Monthly Revenue and Wallet Balance ===== */}
        <div className="mb-4 flex flex-wrap gap-4">
          <Card className="flex-1">
            <Statistic
              title="Monthly Revenue"
              value={monthlyRevenue}
              precision={2}
              prefix={
                <>
                  <LineChartOutlined className="text-blue-500" /> $
                </>
              }
            />
          </Card>
          <Card className="flex-1">
            <Statistic
              title="Wallet Balance"
              value={merchant?.wallet_balance ?? 0}
              precision={2}
              prefix={
                <>
                  <WalletOutlined className="text-green-500" /> $
                </>
              }
            />
          </Card>
        </div>

        {/* ===== Merchant Payments Table ===== */}
        <Table
          columns={columns}
          dataSource={[]}
          loading={false}
          rowKey="merchant_payment_id"
          locale={{
            emptyText: <Empty description="No payments found" />,
          }}
        />

        {/* ===== Request Withdrawal Modal ===== */}
        <Modal
          title="Request Withdrawal"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          centered
        >
          <Form form={form} layout="vertical" onFinish={handleCreatePayment}>
            <Form.Item
              name="total_amount_from_transactions"
              label="Amount"
              rules={[{ required: true, message: "Please enter amount" }]}
            >
              <InputNumber
                className="w-full"
                prefix="$"
                min={0.01}
                max={merchant?.wallet_balance}
              />
            </Form.Item>

            <Form.Item
              name="to_merchant_bank_account_no"
              label="Bank Account Number"
              rules={[
                {
                  required: true,
                  message: "Please enter bank account number",
                },
              ]}
            >
              <Input placeholder="Enter your bank account number" />
            </Form.Item>

            <Form.Item
              label="Fees"
              dependencies={["total_amount_from_transactions"]}
            >
              {() => {
                const amount =
                  form.getFieldValue("total_amount_from_transactions") || 0;
                const transactionFee = amount * 0.015;
                const withdrawalFee = amount * calculateWithdrawalFeeRate();
                const finalAmount = amount - transactionFee - withdrawalFee;

                return (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Transaction Fee (1.5%):</span>
                      <span>${transactionFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1">
                        <Tooltip
                          title={
                            <div className="space-y-4">
                              <div>
                                <p className="mb-2 font-bold">
                                  Big Businesses (Monthly Revenue ≥ $25,000)
                                </p>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr>
                                      <th className="w-1/2 text-left">
                                        Wallet Balance
                                      </th>
                                      <th className="w-1/2 text-left">
                                        Withdrawal Fee
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td>≥ $200,000</td>
                                      <td>2.8%</td>
                                    </tr>
                                    <tr>
                                      <td>$100,000 - $199,999</td>
                                      <td>3.0%</td>
                                    </tr>
                                    <tr>
                                      <td>$50,000 - $99,999</td>
                                      <td>3.5%</td>
                                    </tr>
                                    <tr>
                                      <td>$0 - $49,999</td>
                                      <td>5.0%</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <div>
                                <p className="mb-2 font-bold">
                                  Small Businesses (Monthly Revenue ≤ $25,000)
                                </p>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr>
                                      <th className="w-1/2 text-left">
                                        Wallet Balance
                                      </th>
                                      <th className="w-1/2 text-left">
                                        Withdrawal Fee
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td>≥ $50,000</td>
                                      <td>2.8%</td>
                                    </tr>
                                    <tr>
                                      <td>$25,000 - $49,999</td>
                                      <td>3.0%</td>
                                    </tr>
                                    <tr>
                                      <td>$5,000 - $24,999</td>
                                      <td>3.5%</td>
                                    </tr>
                                    <tr>
                                      <td>$0 - $4,999</td>
                                      <td>5.0%</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          }
                          overlayStyle={{ maxWidth: "500px" }}
                        >
                          <QuestionCircleOutlined className="text-gray-500" />
                        </Tooltip>
                        <span>
                          Withdrawal Fee ({calculateWithdrawalFeeRate() * 100}
                          %):
                        </span>
                      </div>
                      <span>${withdrawalFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Final Amount:</span>
                      <span>SGD {finalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                );
              }}
            </Form.Item>

            <Form.Item className="flex justify-end">
              <Popconfirm
                title="Are you sure you want to proceed with this withdrawal?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => form.submit()}
              >
                <Button type="primary">Confirm Withdrawal</Button>
              </Popconfirm>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}
