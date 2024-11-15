import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Descriptions,
  Input,
  Empty,
  Tag,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { useGetRatingsQuery, useGetRatingQuery } from "../redux/services/ratingService";
import { IRating, TransactionResult } from "@repo/interfaces";

const { Search } = Input;

export default function RatingsScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRatingId, setSelectedRatingId] = useState<string | null>(null);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);

  const { data: ratings, isLoading } = useGetRatingsQuery(searchTerm);
  const { data: ratingDetails } = useGetRatingQuery(selectedRatingId ?? "", {
    skip: !selectedRatingId,
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleViewRatingDetails = (ratingId: string) => {
    setSelectedRatingId(ratingId);
    setIsRatingModalVisible(true);
  };

  const handleRatingModalClose = () => {
    setIsRatingModalVisible(false);
    setSelectedRatingId(null);
  };

  const renderTransactionDetails = (transaction: TransactionResult) => (
    <Descriptions bordered column={1} title="Transaction Details">
      <Descriptions.Item label="Transaction ID">
        {transaction.transaction_id}
      </Descriptions.Item>
      <Descriptions.Item label="Amount">
        SGD {transaction.amount.toFixed(2)}
      </Descriptions.Item>
      <Descriptions.Item label="Date of Transaction">
        {format(new Date(transaction.date_of_transaction), "d MMM yyyy, h:mm:ss a")}
      </Descriptions.Item>
      <Descriptions.Item label="Status">
        <Tag
          color={
            transaction.status === "FULLY_PAID" ? "green" : "orange"
          }
        >
          {transaction.status.replace("_", " ")}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Reference No">
        {transaction.reference_no}
      </Descriptions.Item>
      <Descriptions.Item label="Cashback Percentage">
        {transaction.cashback_percentage}%
      </Descriptions.Item>
      <Descriptions.Item label="Merchant Name">
        {transaction.merchant.name}
      </Descriptions.Item>
      <Descriptions.Item label="Customer Name">
        {transaction.customer.name}
      </Descriptions.Item>
      {transaction.fully_paid_date && (
        <Descriptions.Item label="Fully Paid Date">
          {format(new Date(transaction.fully_paid_date), "d MMM yyyy, h:mm:ss a")}
        </Descriptions.Item>
      )}
    </Descriptions>
  );

  const columns = [
    {
      title: "Rating ID",
      dataIndex: "rating_id",
      key: "rating_id",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating: string) => {
        const numericRating = parseFloat(rating);
        return (
          <Tag
            color={
              numericRating >= 4
                ? "green"
                : numericRating >= 2
                ? "gold"
                : "red"
            }
          >
            {rating} / 5
          </Tag>
        );
      },
    },
    {
      title: "Transaction ID",
      dataIndex: "transaction_id",
      key: "transaction_id",
      render: (transaction_id: string | undefined) =>
        transaction_id || "N/A",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: Date) => format(new Date(date), "d MMM yyyy, h:mm:ss a"),
    },
    {
      title: "Action",
      key: "action",
      render: (_: IRating, record: IRating) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewRatingDetails(record.rating_id)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full px-8 py-4">
      <Card className="mb-8 border border-gray-300" title="Ratings Management">
        <Search
          placeholder="Search ratings"
          onSearch={handleSearch}
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={columns}
          dataSource={ratings}
          loading={isLoading}
          pagination={false}
          rowKey="rating_id"
          locale={{
            emptyText: <Empty description="No ratings found" />,
          }}
        />
      </Card>

      {/* Rating Details Modal */}
      <Modal
        title="Rating Details"
        open={isRatingModalVisible}
        onCancel={handleRatingModalClose}
        footer={null}
        width={800}
      >
        {ratingDetails ? (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Rating ID">
                {ratingDetails.rating_id}
              </Descriptions.Item>
              <Descriptions.Item label="Title">
                {ratingDetails.title}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {ratingDetails.description}
              </Descriptions.Item>
              <Descriptions.Item label="Rating">
                <Tag
                  color={
                    parseFloat(ratingDetails.rating) >= 4
                      ? "green"
                      : parseFloat(ratingDetails.rating) >= 2
                      ? "gold"
                      : "red"
                  }
                >
                  {ratingDetails.rating} / 5
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {format(new Date(ratingDetails.createdAt), "d MMM yyyy, h:mm:ss a")}
              </Descriptions.Item>
            </Descriptions>

            {ratingDetails.transaction && renderTransactionDetails(ratingDetails.transaction)}
          </>
        ) : (
          <Empty description="No rating details available" />
        )}
      </Modal>
    </div>
  );
}
