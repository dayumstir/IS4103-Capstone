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
import { useParams } from "react-router-dom";
import { useGetAdminQuery } from "../redux/services/admin";
import { useGetCustomerQuery } from "../redux/services/customer";
import { useGetIssueQuery } from "../redux/services/issue";
import { statusColorMap } from "../interfaces/models/issueInterface";

const IssueDetailsScreen: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const { data: issue } = useGetIssueQuery(issueId || "", { skip: !issueId });
  const { data: admin } = useGetAdminQuery(issue?.admin_id || "", {
    skip: !issue?.admin_id,
  });
  const { data: customer } = useGetCustomerQuery(issue?.customer_id || "", {
    skip: !issue?.customer_id,
  });
  const basePath = location.pathname.replace(`/${issueId}`, "");

  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Created At",
      children:
        issue?.create_time &&
        new Date(issue?.create_time).toDateString() +
          ", " +
          issue?.create_time &&
        new Date(issue?.create_time).toLocaleTimeString(),
    },
    {
      key: "2",
      label: "Updated At",
      children:
        issue?.updated_at &&
        new Date(issue?.updated_at).toDateString() + ", " + issue?.updated_at &&
        new Date(issue?.updated_at).toLocaleTimeString(),
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
        <div className="mt-5 grid grid-cols-2 gap-10">
          <Descriptions title={issue?.title} items={items} />;
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
      </Card>
    </div>
  );
};

export default IssueDetailsScreen;
