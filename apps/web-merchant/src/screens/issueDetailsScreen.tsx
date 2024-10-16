import {
  Breadcrumb,
  Card,
  Descriptions,
  DescriptionsProps,
  Image,
  Tag,
} from "antd";
import { Buffer } from "buffer";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { statusColorMap } from "../../../../packages/interfaces/issueInterface";
import { useGetIssueQuery } from "../redux/services/issue";

const IssueDetailsScreen: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const { data: issue } = useGetIssueQuery(issueId || "", { skip: !issueId });
  const basePath = location.pathname.replace(`/${issueId}`, "");

  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Issue ID",
      children: issue?.issue_id,
    },
    {
      key: "2",
      label: "Created At",
      children:
        issue?.create_time &&
        new Date(issue?.create_time).toDateString() +
          ", " +
          issue?.create_time &&
        new Date(issue?.create_time).toLocaleTimeString(),
    },
    {
      key: "3",
      label: "Updated At",
      children:
        issue?.updated_at &&
        new Date(issue?.updated_at).toDateString() + ", " + issue?.updated_at &&
        new Date(issue?.updated_at).toLocaleTimeString(),
    },
  ];

  const transactionItems: DescriptionsProps["items"] = issue &&
    issue.transaction && [
      {
        key: "1",
        label: "Transaction ID",
        children: issue.transaction.transaction_id,
      },
      {
        key: "2",
        label: "Amount",
        children: "SGD " + issue.transaction.amount,
      },
      {
        key: "3",
        label: "Date of Transaction",
        children: `${new Date(issue.transaction.date_of_transaction).toDateString()}, ${new Date(issue.transaction.date_of_transaction).toLocaleTimeString()}`,
      },
      {
        key: "4",
        label: "Fully paid date",
        children: `${new Date(issue.transaction.fully_paid_date).toDateString()}, ${new Date(issue.transaction.fully_paid_date).toLocaleTimeString()}`,
      },
      {
        key: "5",
        label: "Reference Number",
        children: issue.transaction.reference_no,
      },
      {
        key: "6",
        label: "Status",
        children: issue.transaction.status,
      },
    ];

  return (
    <div>
      <Card>
        <Breadcrumb
          items={[
            { title: "Issues", href: basePath },
            { title: "Issue Details" },
          ]}
        />
        <div className="mt-5">
          <Descriptions title={issue?.title} items={items} />
        </div>
      </Card>
      <Card className="mt-10">
        <p className="text-base font-semibold">Description</p>
        <p>{issue?.description}</p>
        <p className="mt-10 text-base font-semibold">Status</p>
        {issue && (
          <Tag color={statusColorMap[issue?.status] || "default"} key={status}>
            {issue?.status.toUpperCase()}
          </Tag>
        )}
        <p className="mt-10 text-base font-semibold">Outcome</p>
        <p>
          {issue?.outcome ? (
            issue.outcome
          ) : (
            <span style={{ color: "#9d9d9d" }}>No outcome yet</span>
          )}
        </p>
        <p className="mt-10 text-base font-semibold">Images</p>
        <div className="flex flex-wrap gap-5">
          {issue?.images && issue.images.length > 0 ? (
            issue?.images.map((image, index) => {
              const base64String = `data:image/png;base64,${Buffer.from(image).toString("base64")}`;
              return (
                <Image
                  key={index} // Use index as key or a unique identifier if available
                  src={base64String}
                  alt={`Image ${index + 1}`} // Use a unique alt text
                  height={100}
                />
              );
            })
          ) : (
            <span style={{ color: "#9d9d9d" }}>No images</span>
          )}
        </div>
        {transactionItems && (
          <>
            <div className="mt-10 flex items-center gap-x-10">
              <p className="text-base font-semibold">Transaction Details</p>
              <Link
                to={`/financial-management/transactions/${issue?.transaction.transaction_id}`}
                className="text-blue-500 hover:underline"
              >
                View Details
              </Link>
            </div>
            <Descriptions items={transactionItems} />
          </>
        )}
      </Card>
    </div>
  );
};

export default IssueDetailsScreen;
