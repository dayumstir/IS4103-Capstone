import { Breadcrumb, Card, Image, Tag } from "antd";
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

  return (
    <div>
      <div className="mb-5">
        <Breadcrumb
          items={[{ title: "Issues", href: basePath }, { title: issue?.title }]}
        />
      </div>

      <Card title={issue?.title}>
        <div className="grid grid-cols-2 gap-10">
          <div>
            <p>
              Created At:{" "}
              {issue?.create_time &&
                new Date(issue?.create_time).toDateString()}
              ,{" "}
              {issue?.create_time &&
                new Date(issue?.create_time).toLocaleTimeString()}
            </p>
            <p>
              Updated At:{" "}
              {issue?.updated_at && new Date(issue?.updated_at).toDateString()},{" "}
              {issue?.updated_at &&
                new Date(issue?.updated_at).toLocaleTimeString()}
            </p>
          </div>

          <div>
            {admin && <p>Admin Name: {admin.name}</p>}
            {customer && <p>Customer Name: {customer.name}</p>}
          </div>
        </div>
      </Card>
      <Card className="mt-10">
        <p className="text-lg font-semibold">Description</p>
        <p>{issue?.description}</p>
        <p className="mt-10 text-lg font-semibold">Status</p>
        {issue && (
          <Tag color={statusColorMap[issue?.status] || "default"} key={status}>
            {issue?.status.toUpperCase()}
          </Tag>
        )}
        <p className="mt-10 text-lg font-semibold">Outcome</p>
        <p>{issue?.outcome ? issue.outcome : "No outcome yet"}</p>
        <p className="mt-10 text-lg font-semibold">Images</p>
        <div className="flex flex-wrap gap-5">
          {issue?.images &&
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
            })}
        </div>
      </Card>
    </div>
  );
};

export default IssueDetailsScreen;
