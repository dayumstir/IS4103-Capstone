import {
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  DescriptionsProps,
  Table,
  TableProps,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  TransactionStatus,
  transactionStatusColorMap,
} from "../../../../packages/interfaces/transactionInterface";
import { useGetTransactionQuery } from "../redux/services/transaction";
import { useCreateRatingMutation } from "../redux/services/rating";
import CreateIssueModal from "../components/createIssueModal";
import { SortOrder } from "antd/es/table/interface";
import {
  IssueStatus,
  statusColorMap,
} from "../../../../packages/interfaces/issueInterface";

const { Option } = Select;

const TransactionDetailsScreen: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const { data: transaction, refetch } = useGetTransactionQuery(
    transactionId || "",
    { skip: !transactionId }
  );

  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  const [isCreateRatingModalOpen, setIsCreateRatingModalOpen] = useState(false);
  const [createRating, { isLoading: isCreatingRating }] = useCreateRatingMutation();

  const [form] = Form.useForm();

  useEffect(() => {
    refetch();
  }, [isCreateIssueModalOpen, isCreateRatingModalOpen, refetch]);

  if (!transaction) {
    return null;
  }

  const basePath = location.pathname.replace(`/${transactionId}`, "");

  interface CreateRatingFormValues {
    title: string;
    description: string;
    rating: number;
  }

  const handleCreateRating = async (values: CreateRatingFormValues) => {
    try {
      const response = await createRating({
        ...values,
        transaction_id: transaction.transaction_id,
        rating: String(values.rating),
      }).unwrap(); // Ensure this unwraps the result
  
      if (response) { // Check explicitly for a valid response
        message.success("Rating created successfully!");
        form.resetFields(); // Reset the form fields
        setIsCreateRatingModalOpen(false); // Close the modal
        refetch(); // Refresh the transaction details
      }
    } catch (error) {
      console.error("Create Rating Error:", error); // Log the error for debugging
      message.error("Failed to create rating. Please try again.");
    }
  };
  

  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Transaction ID",
      children: transaction?.transaction_id,
    },
    {
      key: "2",
      label: "Date of Transaction",
      children: `${new Date(transaction?.date_of_transaction).toDateString()}, ${new Date(transaction?.date_of_transaction).toLocaleTimeString()}`,
    },
    {
      key: "3",
      label: "Fully Paid Date",
      children:
        transaction?.fully_paid_date &&
        new Date(transaction?.fully_paid_date).toDateString() +
          ", " +
          transaction?.fully_paid_date &&
        new Date(transaction?.fully_paid_date).toLocaleTimeString(),
    },
    {
      key: "4",
      label: "Reference Number",
      children: transaction?.reference_no,
    },
    {
      key: "5",
      label: "Cashback Percentage",
      children: transaction?.cashback_percentage + "%",
    },
  ];

  const customerItems: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Name",
      children: transaction?.customer.name,
    },
    {
      key: "2",
      label: "Email",
      children: transaction?.customer.email,
    },
  ];

  const instalmentPlanItems: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Name",
      children: transaction?.instalment_plan.name,
    },
    {
      key: "2",
      label: "Description",
      children: transaction?.instalment_plan.description,
    },
    {
      key: "3",
      label: "Number of instalments",
      children: transaction?.instalment_plan.number_of_instalments,
    },
    {
      key: "4",
      label: "Time Period",
      children: `${transaction?.instalment_plan.time_period} months`,
    },
    {
      key: "5",
      label: "Interest Rate",
      children: `${transaction?.instalment_plan.interest_rate}%`,
    },
    {
      key: "6",
      label: "Minimum Amount",
      children: transaction?.instalment_plan.minimum_amount,
    },
    {
      key: "7",
      label: "Maximum Amount",
      children: transaction?.instalment_plan.maximum_amount,
    },
  ];

  const issueItems: { key: string; item: DescriptionsProps["items"] }[] =
    transaction && transaction.issues && transaction.issues.length > 0
      ? transaction.issues.map((issue, index) => ({
          key: issue.issue_id, // Use the issue_id as the key
          item: [
            {
              key: `${issue.issue_id}-${index}-title`,
              label: "Title",
              children: issue.title,
            },
            {
              key: `${issue.issue_id}-${index}-description`,
              label: "Description",
              children: issue.description,
            },
          ] as DescriptionsProps["items"],
        }))
      : [];

  interface IssueTableInterface {
    issue_id: string;
    create_time: Date;
    title: string;
    description: string;
    status: IssueStatus;
  }
  const issueColumns: TableProps<IssueTableInterface>["columns"] = [
    {
      title: "Date",
      dataIndex: "create_time",
      showSorterTooltip: true,
      sorter: (a: IssueTableInterface, b: IssueTableInterface) => {
        const dateA = new Date(a.create_time).getTime();
        const dateB = new Date(b.create_time).getTime();
        return dateA - dateB;
      },
      sortDirections: ["ascend", "descend"] as SortOrder[],
      key: "create_time",
      render: (create_time: Date) => (
        <div>
          {`${new Date(create_time).toDateString()}, ${new Date(create_time).toLocaleTimeString()}`}
        </div>
      ),
      className: "w-1/5",
    },
    {
      title: "Title",
      dataIndex: "title",
      showSorterTooltip: true,
      sorter: (a: IssueTableInterface, b: IssueTableInterface) =>
        a.title.localeCompare(b.title),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      key: "title",
      render: (title: string) => (
        <div className="truncate" style={{ width: "200px" }}>
          {title}
        </div>
      ),
      className: "w-1/5",
    },
    {
      title: "Description",
      dataIndex: "description",
      showSorterTooltip: true,
      sorter: (a: IssueTableInterface, b: IssueTableInterface) =>
        a.description.localeCompare(b.description),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      key: "description",
      render: (description: string) => (
        <div className="truncate" style={{ width: "200px" }}>
          {description}
        </div>
      ),
      className: "w-1/5",
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
      onFilter: (value, record) => record.status === value,
      className: "w-1/5",
    },

    {
      title: "",
      dataIndex: "issue_id",
      key: "issue_id",
      render: (issue_id: string) => (
        <Link
          to={`/business-management/issues/${issue_id}`}
          className="text-blue-500 hover:underline"
        >
          View Details
        </Link>
      ),
      className: "w-1/5",
    },
  ];

  const isRatingExists = Boolean(transaction.rating); 

  return (
    <div>
      {isCreateIssueModalOpen && transactionId && (
        <CreateIssueModal
          isModalOpen={isCreateIssueModalOpen}
          setModalOpen={setIsCreateIssueModalOpen}
          transactionId={transactionId}
        />
      )}
      <Card>
        <div className="flex justify-between">
          <Breadcrumb
            items={[
              { title: "Transactions", href: basePath },
              { title: "Transaction Details" },
            ]}
          />
          <div>
            <Button
              type="primary"
              onClick={() => setIsCreateIssueModalOpen(true)}
              className="mr-2"
            >
              Raise an Issue
            </Button>
            <Button
              type="primary"
              onClick={() => setIsCreateRatingModalOpen(true)}
              disabled={isRatingExists}
            >
              Create Rating
            </Button>
          </div>
        </div>

        <div className="mt-5">
          <Descriptions title="Transaction Details" items={items} />
        </div>
      </Card>

      <Card className="mt-10">
        <p className="text-base font-semibold">Status</p>
        {transaction && (
          <Tag
            color={transactionStatusColorMap[transaction.status] || "default"}
            key={transaction.status}
          >
            {transaction.status == TransactionStatus.IN_PROGRESS &&
              "IN PROGRESS"}
            {transaction.status == TransactionStatus.FULLY_PAID && "FULLY PAID"}
          </Tag>
        )}
        <p className="mt-10 text-base font-semibold">Customer</p>
        <Descriptions items={customerItems} />
        <p className="mt-10 text-base font-semibold">Instalment Plan</p>
        <Descriptions items={instalmentPlanItems} />
        {issueItems.length > 0 && (
          <>
            <p className="mt-10 text-base font-semibold">Issues</p>
            <Table<IssueTableInterface>
              columns={issueColumns}
              dataSource={transaction.issues}
            />
          </>
        )}
      </Card>

      {/* Create Rating Modal */}
      <Modal
        title="Create Rating"
        open={isCreateRatingModalOpen}
        onCancel={() => {
          setIsCreateRatingModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateRating}
          initialValues={{ title: "", description: "", rating: 3 }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Enter rating title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please enter a description" },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Enter rating description" />
          </Form.Item>

          <Form.Item
            label="Rating"
            name="rating"
            rules={[{ required: true, message: "Please select a rating" }]}
          >
            <Select>
              {[1, 2, 3, 4, 5].map((num) => (
                <Option key={num} value={num}>
                  {num}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreatingRating}
            >
              Submit Rating
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TransactionDetailsScreen;
