import {
  EditOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  GetFirstCreditRatingResult,
  ICreditTier,
  UpdateCreditScoreFromFrontend,
} from "@repo/interfaces/creditTierInterface";
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  FormInstance,
  FormProps,
  GetProp,
  Input,
  InputNumber,
  message,
  Result,
  Select,
  Spin,
  Table,
  Tooltip,
  Upload,
  UploadProps,
} from "antd";
import { useEffect, useState } from "react";
import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import { IInstalmentPlan } from "../interfaces/instalmentPlanInterface";
import {
  useGetFirstCreditRatingMutation,
  useUpdateCreditScoreMutation,
  useUploadCCIMutation,
} from "../redux/services/creditScoreService";
import { useGetCreditTierByScoreQuery } from "../redux/services/creditTierService";

export default function CreditScoreScreen() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<IInstalmentPlan | null>(null);

  const [creditScore, setCreditScore] = useState(-1);
  const [creditTier, setCreditTier] = useState<ICreditTier[]>();
  const [animationCreditScore, setAnimationCreditScore] = useState(-1);
  const [currFile, setCurrFile] = useState<File | undefined>(undefined);
  const [currCCIFile, setCurrCCIFile] = useState<File | undefined>(undefined);

  // Call the query hook conditionally based on the creditScore
  const {
    data: retrievedCreditTier,
    error: isCreditTierError,
    isLoading: isCreditTierLoading,
  } = useGetCreditTierByScoreQuery(creditScore, {
    skip: creditScore === null,
  });

  // Whenever the data changes, set the creditTier state
  useEffect(() => {
    if (retrievedCreditTier) {
      setCreditTier([retrievedCreditTier]);
    }
  }, [retrievedCreditTier, currFile, creditScore]);

  const { Dragger } = Upload;

  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

  const beforeUpload = (filetype: FileType) => {
    const isPdf = filetype.type === "application/pdf";
    if (!isPdf) {
      message.error("You can only upload PDF file!");
    }
    const isLt2M = filetype.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("File must be smaller than 2MB!");
    }

    return isPdf && isLt2M;
  };

  const handleChange: UploadProps["onChange"] = async ({ file: newFile }) => {
    if (newFile && newFile.originFileObj) {
      const file = newFile.originFileObj as File;
      setCurrFile(file);
    }
  };

  const [updateCreditScoreMutation, { isLoading: isUpdateCreditScoreLoading }] =
    useUpdateCreditScoreMutation();

  const [
    uploadCCIMutation,
    { isLoading: isUploadCCLoading, isSuccess: isUploadCCISuuccess },
  ] = useUploadCCIMutation();

  const [getFirstCreditRatingMutation, { isLoading }] =
    useGetFirstCreditRatingMutation();

  const props: UploadProps = {
    name: "file",
    multiple: false,
    customRequest({ onSuccess, onError }) {
      onSuccess?.("ok");
      // onError?.(new Error("File upload failed"));
    },
    beforeUpload(file, fileList) {
      console.log(currFile);
      console.log(fileList);
      if (currFile != undefined) {
        message.error("You can only upload one PDF!");
        message.error("why the fuck is it undefined");
        return false;
      }
      if (beforeUpload(file) == false) {
        return false;
      }

      setCurrFile(file);
      return true;
    },

    // onChange(info) {
    //   handleChange(info);
    // },
    onRemove(file) {
      if (currFile) {
        message.success("removing " + currFile.name + "...");
      } else {
        message.error("No file to remove");
      }
      setCurrFile(undefined as File | undefined);

      return true;
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const cciProps: UploadProps = {
    name: "file",
    multiple: false,
    customRequest({ onSuccess, onError }) {
      onSuccess?.("ok");
      // onError?.(new Error("File upload failed"));
    },
    beforeUpload(file, fileList) {
      console.log(currFile);
      console.log(fileList);
      if (currFile != undefined) {
        message.error("You can only upload one PDF!");
        return false;
      }
      if (beforeUpload(file) == false) {
        return false;
      }

      setCurrCCIFile(file);
      return true;
    },
    onRemove(file) {
      if (currCCIFile) {
        message.success("removing " + currCCIFile.name + "...");
      } else {
        message.error("No file to remove");
      }
      setCurrCCIFile(undefined as File | undefined);

      return true;
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const getColorBasedOnCreditScore = (score: number) => {
    if (0 < score && score <= 500) {
      // Worst credit score (red)
      return {
        backgroundColor: "lightcoral", // background color for worst
        pathColor: "red", // path color for worst
        trailColor: "#f1f1f1", // trail color for worst
      };
    } else if (0 < score && score <= 700) {
      // Neutral credit score (yellow or orange)
      return {
        backgroundColor: "lightyellow", // background color for neutral
        pathColor: "orange", // path color for neutral
        trailColor: "#f1f1f1", // trail color for neutral
      };
    } else {
      // Good credit score (green)
      return {
        backgroundColor: "lightgreen", // background color for good
        pathColor: "green", // path color for good
        trailColor: "#f1f1f1", // trail color for good
      };
    }
  };

  // Get colors based on the current score
  const { backgroundColor, pathColor, trailColor } =
    getColorBasedOnCreditScore(animationCreditScore);

  const tableColumns = [
    {
      title: <div className="whitespace-nowrap">Credit Limit</div>,
      dataIndex: "credit_limit",
      key: "credit_limit",
      width: 1,
      render: (text: string) => <div className="whitespace-nowrap">{text}</div>,
    },
    {
      title: <div className="whitespace-nowrap">Min Credit Score</div>,
      dataIndex: "min_credit_score",
      key: "min_credit_score",
      width: 1,
      render: (text: string) => <div className="whitespace-nowrap">{text}</div>,
    },
    {
      title: <div className="whitespace-nowrap">Max Credit Score</div>,
      dataIndex: "max_credit_score",
      key: "max_credit_score",
      width: 1,
      render: (text: string) => <div className="whitespace-nowrap">{text}</div>,
    },
  ];

  const onFinish: FormProps<UpdateCreditScoreFromFrontend>["onFinish"] = async (
    data,
  ) => {
    await updateCreditScoreMutation({
      creditUtilisationRatio: Number(data.creditUtilisationRatio),
      paymentHistory: data.paymentHistory
        .split(",")
        .map((payment) => Number(payment)),
    })
      .unwrap()
      .then((data) => {
        setCreditScore(data.credit_score);
        setAnimationCreditScore(0);
        setCreditTier(creditTier);
        setTimeout(() => {
          setAnimationCreditScore(data.credit_score);
        }, 500);
      })
      .catch((error) => {
        message.error(error);
      });
  };

  return (
    <div className="w-full px-8 py-4">
      {/* ===== Test credit score ===== */}
      <Card className="mb-8 border border-gray-300" title="Test Credit Score">
        {/* Main Container */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-8">
            {/* First Dragger with Button */}
            <div>
              <h3 className="text-l font-semibold">
                Get first credit score {"   "}
                <Tooltip title="Please ensure that a consumer credit index file has been uploaded before testing generation of credit score">
                  <ExclamationCircleOutlined />
                </Tooltip>
              </h3>
              <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for only a single upload. Strictly prohibited from
                  uploading company data or other banned files.
                </p>
              </Dragger>
              {isLoading ? (
                <Spin indicator={<LoadingOutlined spin />} />
              ) : (
                <Button
                  type="primary"
                  className="mt-4"
                  onClick={async () => {
                    const formData = new FormData();
                    currFile && formData.append("file", currFile);
                    await getFirstCreditRatingMutation(formData)
                      .unwrap()
                      .then((data: GetFirstCreditRatingResult) => {
                        setCreditScore(data.credit_score);
                        setAnimationCreditScore(0);
                        setCreditTier(creditTier);
                        setTimeout(() => {
                          setAnimationCreditScore(data.credit_score);
                        }, 500);

                        message.success("success");
                      })
                      .catch((error) => {
                        console.error("error: ", error);
                      });
                  }}
                >
                  Generate Credit Score
                </Button>
              )}
            </div>

            {/* Second Dragger with Button */}
            <div>
              <h3 className="text-l font-semibold">Update Credit Score</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-8">
                  <Form
                    name="basic"
                    labelCol={{ span: 10 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                    autoComplete="off"
                    form={form}
                  >
                    <Form.Item<UpdateCreditScoreFromFrontend>
                      name="creditUtilisationRatio"
                      label="Credit utilisation Ratio"
                      initialValue={2.3}
                      rules={[
                        {
                          required: true,
                          message: "Please input your E-mail!",
                        },
                      ]}
                    >
                      <InputNumber />
                    </Form.Item>

                    <Form.Item<UpdateCreditScoreFromFrontend>
                      name="paymentHistory"
                      label="Payment History"
                      initialValue={"-1,-1,-1,-1,-1,-1"}
                      rules={[
                        {
                          required: true,
                          message: "Please input your username!",
                          whitespace: true,
                        },
                        {
                          pattern: /^(-1|\d+)(,(-1|\d+)){5}$/, // Matches 6 comma-separated numbers
                          message:
                            "Please enter exactly 6 numbers separated by commas (e.g., 1,2,3,4,5,6).",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 0, span: 16 }}>
                      {isUpdateCreditScoreLoading ? (
                        <Spin indicator={<LoadingOutlined spin />} />
                      ) : (
                        <Button type="primary" htmlType="submit">
                          Update Credit Score
                        </Button>
                      )}
                    </Form.Item>
                  </Form>
                </div>
                <div>
                  {/* <h3>Mappings</h3> */}
                  <Descriptions title="Mappings" column={1}>
                    <Descriptions.Item label="-2">
                      No outstanding payments
                    </Descriptions.Item>
                    <Descriptions.Item label="-1">
                      0 to 1 month late
                    </Descriptions.Item>
                    <Descriptions.Item label="2">
                      2 months late
                    </Descriptions.Item>
                    <Descriptions.Item label="3">
                      3 months late
                    </Descriptions.Item>
                    <Descriptions.Item label="4">
                      4 months late
                    </Descriptions.Item>
                    <Descriptions.Item label="5">
                      5 months late
                    </Descriptions.Item>
                    <Descriptions.Item label="6">
                      6 months late
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column with Shared Card */}
          <Card className="p-4">
            {creditScore != -1 && (
              <div className="flex flex-col items-center justify-center">
                <div className="h-1/2 w-1/2">
                  <CircularProgressbarWithChildren
                    value={animationCreditScore / 10}
                    background
                    styles={buildStyles({
                      pathTransitionDuration: 1,
                      backgroundColor: backgroundColor,
                      pathColor: pathColor,
                      trailColor: trailColor,
                      textColor: "#000", // Optional, you can change the text color
                    })}
                  >
                    <div className="text-center text-4xl">
                      <strong>
                        {creditScore.toFixed(0).toString() + "/1000"}
                      </strong>
                    </div>
                  </CircularProgressbarWithChildren>
                </div>

                <div className="mt-4">
                  {" "}
                  {/* Add margin-top for spacing */}
                  {creditTier && (
                    <>
                      <p className="text-center text-xl">
                        <b>{creditTier[0].name.toUpperCase()}</b>
                      </p>
                      <Table
                        dataSource={creditTier}
                        columns={tableColumns}
                        rowKey="credit_tier_id"
                        pagination={false}
                        loading={isLoading}
                        locale={{
                          emptyText: (
                            <Empty description="No credit tiers found"></Empty>
                          ),
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </Card>
          {/* </Card> */}
        </div>
      </Card>
      {/* ===== Upload CCI ===== */}
      <Card
        className="mb-8 border border-gray-300"
        title="Upload Consumer Credit Index"
      >
        <h3 className="text-l font-semibold">Upload CCI</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Left Column with Dragger and Button */}
          <div className="flex flex-col space-y-4">
            <Dragger {...cciProps} className="flex-1">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibited from
                uploading company data or other banned files.
              </p>
            </Dragger>
            {/* Button stays within the card */}
            {isUploadCCLoading ? (
              <Spin indicator={<LoadingOutlined spin />} />
            ) : (
              <Button
                type="primary"
                className="mt-4 self-start"
                onClick={async () => {
                  if (!currCCIFile) {
                    message.error("No file uploaded yet");
                    return;
                  }

                  const formData = new FormData();
                  currCCIFile && formData.append("file", currCCIFile);
                  await uploadCCIMutation(formData)
                    .unwrap()
                    .then((data) => {
                      message.success(
                        "uploaded " + currCCIFile?.name + " successfully!",
                      );
                    })
                    .catch((error) => {
                      message.error(error);
                    });
                }}
              >
                Upload
              </Button>
            )}
          </div>

          {/* Right Column with Full-Length Card */}
          <Card className="flex-grow">
            {isUploadCCISuuccess && (
              <Result
                status="success"
                title={`Successfully uploaded ${currCCIFile?.name}!`}
              />
            )}
          </Card>
        </div>
      </Card>
    </div>
  );
}
