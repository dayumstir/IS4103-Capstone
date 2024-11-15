import {
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  DescriptionsProps,
  Table,
  TableProps,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CreateIssueModal from "../components/createIssueModal";
import { SortOrder } from "antd/es/table/interface";
import { IssueStatus, statusColorMap } from "@repo/interfaces/issueInterface";
import { useGetMerchantPaymentQuery } from "../redux/services/merchantPayment";
import { PaymentStatus } from "@repo/interfaces/merchantPaymentInterface";
import { merchantPaymentStatusColorMap } from "@repo/interfaces/merchantPaymentInterface";
import { Buffer } from "buffer";

const MerchantPaymentDetailsScreen: React.FC = () => {
  const { merchantPaymentId } = useParams<{ merchantPaymentId: string }>();
  const { data: merchantPayment, refetch } = useGetMerchantPaymentQuery(
    merchantPaymentId || "",
    {
      skip: !merchantPaymentId,
    },
  );
  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  useEffect(() => {
    refetch();
  }, [isCreateIssueModalOpen]);

  if (!merchantPayment) {
    return null;
  }

  const basePath = location.pathname.replace(`/${merchantPaymentId}`, "");

  const issueItems: { key: string; item: DescriptionsProps["items"] }[] =
    merchantPayment &&
    merchantPayment.issues &&
    merchantPayment.issues.length > 0
      ? merchantPayment.issues.map((issue, index) => ({
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

  return (
    <div>
      {isCreateIssueModalOpen && merchantPaymentId && (
        <CreateIssueModal
          isModalOpen={isCreateIssueModalOpen}
          setModalOpen={setIsCreateIssueModalOpen}
          merchantPaymentId={merchantPaymentId}
        />
      )}
      <Card>
        <div className="flex justify-between">
          <Breadcrumb
            items={[
              { title: "Payment", href: basePath },
              { title: "Payment Details" },
            ]}
          />
          <Button
            type="primary"
            onClick={() => setIsCreateIssueModalOpen(true)}
          >
            Raise an Issue
          </Button>
        </div>

        <div className="mt-5">
          <Descriptions title="Payment Details" column={2}>
            <Descriptions.Item label="Merchant Payment ID">
              {merchantPayment?.merchant_payment_id}
            </Descriptions.Item>
            <Descriptions.Item label="Date of payment">
              {new Date(merchantPayment?.created_at).toDateString()}
              {", "}
              {new Date(merchantPayment?.created_at).toLocaleTimeString()},
            </Descriptions.Item>
            <Descriptions.Item label="Requested Withdrawl Amount">
              {" "}
              {"SGD " +
                merchantPayment?.total_amount_from_transactions.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Final Payment">
              {"SGD " + merchantPayment?.final_payment_amount.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Transaction Fee">
              {"SGD " + merchantPayment?.transaction_fees.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Withdrawal Fee">
              {"SGD " +
                (
                  merchantPayment?.withdrawal_fee_percentage *
                  merchantPayment?.total_amount_from_transactions
                ).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Transaction Fee Percentage">
              {merchantPayment?.transaction_fee_percentage * 100 + "%"}
            </Descriptions.Item>
            <Descriptions.Item label="Withdrawal Fee Percentage">
              {merchantPayment?.withdrawal_fee_percentage * 100 + "%"}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Card>
      <Card className="mt-10">
        <p className="text-base font-semibold">Status</p>
        {merchantPayment && (
          <Tag
            color={
              merchantPaymentStatusColorMap[merchantPayment.status] || "default"
            }
            key={merchantPayment.status}
          >
            {merchantPayment.status == PaymentStatus.PENDING_PAYMENT &&
              "PENDING PAYMENT"}
            {merchantPayment.status == PaymentStatus.PAID && "PAID"}
          </Tag>
        )}
        <p className="mt-10 text-base font-semibold">Evidence</p>
        {merchantPayment && merchantPayment.evidence ? (
          <img
            src={`data:image/jpeg;base64,${Buffer.from(
              merchantPayment.evidence as Buffer,
            ).toString("base64")}`}
            alt="Payment Evidence"
            style={{ width: "300px" }}
          />
        ) : (
          <p style={{ color: "#9d9d9d" }}>No evidence yet</p>
        )}
        {/* <p className="mt-10 text-base font-semibold">Customer</p>
        <Descriptions items={customerItems} />
        <p className="mt-10 text-base font-semibold">Instalment Plan</p>
        <Descriptions items={instalmentPlanItems} /> */}
        {issueItems.length > 0 && (
          <>
            <p className="mt-10 text-base font-semibold">Issues</p>
            <Table<IssueTableInterface>
              columns={issueColumns}
              dataSource={merchantPayment.issues}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default MerchantPaymentDetailsScreen;
