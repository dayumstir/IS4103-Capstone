import { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Empty,
  Modal,
  Descriptions,
  Input,
  message,
  Form,
  Upload,
  UploadProps,
  Image,
  Popconfirm,
} from "antd";
import { EyeOutlined, UploadOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import {
  useGetMerchantPaymentsQuery,
  useGetMerchantPaymentByIdQuery,
  useUpdateMerchantPaymentMutation,
} from "../redux/services/merchantPaymentService";
import { IMerchantPayment, IMerchant } from "@repo/interfaces";
import { formatCurrency } from "../utils/formatCurrency";
import type { UploadFile } from "antd/es/upload/interface";
import { Buffer } from "buffer";

const { Search } = Input;

enum PaymentStatus {
  PAID = "PAID",
  PENDING_PAYMENT = "PENDING_PAYMENT",
}

export default function MerchantPaymentsScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null,
  );
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isMerchantModalVisible, setIsMerchantModalVisible] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<IMerchant | null>(
    null,
  );
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageDisplay, setImageDisplay] = useState<string>("");
  const [image, setImage] = useState<File | undefined>(undefined);

  const { data: payments, isLoading } = useGetMerchantPaymentsQuery(searchTerm);
  const { data: paymentDetails, refetch: refetchPaymentDetails } =
    useGetMerchantPaymentByIdQuery(selectedPaymentId ?? "", {
      skip: !selectedPaymentId,
    });
  const [updateMerchantPayment] = useUpdateMerchantPaymentMutation();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleViewMerchantPaymentDetails = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsPaymentModalVisible(true);
    refetchPaymentDetails();
  };

  const handleMerchantPaymentModalClose = () => {
    setIsPaymentModalVisible(false);
    setSelectedPaymentId(null);
    form.resetFields();
    setFileList([]);
  };

  const handleViewMerchantDetails = (merchant: IMerchant) => {
    setSelectedMerchant(merchant);
    setIsMerchantModalVisible(true);
  };

  const handleMerchantModalClose = () => {
    setIsMerchantModalVisible(false);
    setSelectedMerchant(null);
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    fileList: fileList,
    beforeUpload: (file) => {
      const isValidFormat = ["image/jpeg", "image/jpg", "image/png"].includes(
        file.type,
      );
      const isLessThan5MB = file.size / 1024 / 1024 < 5;

      if (!isValidFormat) {
        message.error("You can only upload JPG/PNG files!");
        return false;
      }
      if (!isLessThan5MB) {
        message.error("File must be smaller than 5MB!");
        return false;
      }
      return isValidFormat && isLessThan5MB;
    },
    onChange: async ({ file: newFile }) => {
      if (newFile && newFile.originFileObj) {
        const file = newFile.originFileObj as File;
        setImage(file);
        const base64String = await convertImageToBase64(file);
        setImageDisplay(base64String);
      }
    },
    onRemove: () => {
      setImage(undefined);
      setImageDisplay("");
      setFileList([]);
      return true;
    },
  };

  const handlePayMerchant = async () => {
    try {
      if (!paymentDetails) {
        message.error("Payment details not found");
        return;
      }

      setIsSubmitting(true);
      const values = await form.validateFields();

      if (!image) {
        message.error("Please upload payment evidence");
        setIsSubmitting(false);
        return;
      }

      const buffer = await new Promise<Buffer>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          resolve(Buffer.from(arrayBuffer));
        };
        reader.readAsArrayBuffer(image);
      });

      const updatedPayment: IMerchantPayment = {
        ...paymentDetails,
        status: PaymentStatus.PAID,
        from_bank: values.from_bank,
        evidence: buffer,
      };

      await updateMerchantPayment(updatedPayment).unwrap();
      message.success("Merchant payment updated successfully");
      refetchPaymentDetails();
      handleMerchantPaymentModalClose();
    } catch (error) {
      console.error(error);
      message.error("Failed to update merchant payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const bufferToBase64 = (buffer: Buffer) => {
    return Buffer.from(buffer).toString("base64");
  };

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
          {status === PaymentStatus.PAID ? "PAID" : "PENDING PAYMENT"}
        </Tag>
      ),
      filters: [
        { text: "PAID", value: PaymentStatus.PAID },
        {
          text: "PENDING PAYMENT",
          value: PaymentStatus.PENDING_PAYMENT,
        },
      ],
      onFilter: (value: React.Key | boolean, record: IMerchantPayment) =>
        record.status === value,
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
      title: "Action",
      key: "action",
      render: (_: IMerchantPayment, record: IMerchantPayment) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() =>
            handleViewMerchantPaymentDetails(record.merchant_payment_id)
          }
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
        title="View and Manage Merchant Payments"
      >
        <Search
          placeholder="Search payments"
          onSearch={handleSearch}
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={columns}
          dataSource={payments}
          loading={isLoading}
          pagination={false}
          rowKey="merchant_payment_id"
          locale={{
            emptyText: <Empty description="No payments found" />,
          }}
        />
      </Card>

      {/* ===== Merchant Payment Details Modal ===== */}
      <Modal
        title="Merchant Payment Details"
        open={isPaymentModalVisible}
        onCancel={handleMerchantPaymentModalClose}
        footer={null}
        width={800}
      >
        {paymentDetails && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Payment ID">
                {paymentDetails.merchant_payment_id}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    paymentDetails.status === PaymentStatus.PAID
                      ? "green"
                      : "gold"
                  }
                >
                  {paymentDetails.status === PaymentStatus.PAID
                    ? "PAID"
                    : "PENDING PAYMENT"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {format(
                  new Date(paymentDetails.created_at),
                  "d MMM yyyy, h:mm:ss a",
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                {formatCurrency(paymentDetails.total_amount_from_transactions)}
              </Descriptions.Item>
              <Descriptions.Item label="Transaction Fee Rate">
                {(paymentDetails.transaction_fee_percentage * 100).toFixed(2)}%
              </Descriptions.Item>
              <Descriptions.Item label="Transaction Fees">
                {formatCurrency(paymentDetails.transaction_fees)}
              </Descriptions.Item>
              <Descriptions.Item label="Withdrawal Fee Rate">
                {(paymentDetails.withdrawal_fee_percentage * 100).toFixed(2)}%
              </Descriptions.Item>
              <Descriptions.Item label="Withdrawal Fees">
                {formatCurrency(paymentDetails.withdrawal_fee)}
              </Descriptions.Item>
              <Descriptions.Item label="Final Payment Amount">
                {formatCurrency(paymentDetails.final_payment_amount)}
              </Descriptions.Item>
              <Descriptions.Item label="Merchant Bank Account Number">
                {paymentDetails.to_merchant_bank_account_no}
              </Descriptions.Item>
              {paymentDetails.status === PaymentStatus.PAID && (
                <>
                  {paymentDetails.from_bank && (
                    <Descriptions.Item label="Admin Bank Account Number">
                      {paymentDetails.from_bank}
                    </Descriptions.Item>
                  )}
                  {paymentDetails.evidence && (
                    <Descriptions.Item label="Payment Evidence" span={2}>
                      <Image
                        src={`data:image/jpeg;base64,${bufferToBase64(paymentDetails.evidence)}`}
                        alt="Payment evidence"
                        width={200}
                      />
                    </Descriptions.Item>
                  )}
                </>
              )}
            </Descriptions>

            {/* ===== Pay Merchant Form ===== */}
            {paymentDetails.status === PaymentStatus.PENDING_PAYMENT && (
              <div className="mt-4">
                <h3 className="mb-4 font-medium">Payment Details</h3>
                <Form form={form} layout="vertical">
                  <Form.Item
                    label="Bank Account Number"
                    name="from_bank"
                    rules={[
                      {
                        required: true,
                        message: "Please enter bank account number",
                      },
                      {
                        pattern: /^\d+$/,
                        message: "Please enter valid bank account number",
                      },
                    ]}
                  >
                    <Input placeholder="Enter bank account number" />
                  </Form.Item>

                  <Form.Item
                    label="Payment Evidence"
                    required
                    tooltip="Upload payment receipt or evidence"
                  >
                    <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />}>Click to Upload</Button>
                    </Upload>
                    {imageDisplay && (
                      <div className="mt-4">
                        <Image
                          src={imageDisplay}
                          alt="Payment evidence"
                          width={200}
                        />
                        <Button
                          className="mt-2 block"
                          danger
                          onClick={() => {
                            setImage(undefined);
                            setImageDisplay("");
                            setFileList([]);
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    )}
                  </Form.Item>
                  <Popconfirm
                    title="Are you sure you want to process this payment?"
                    onConfirm={() => handlePayMerchant()}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="primary"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      Pay Merchant
                    </Button>
                  </Popconfirm>
                </Form>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* ===== Merchant Details Modal ===== */}
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
