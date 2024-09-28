import { View, Text, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  InputItem,
  TextareaItem,
  Picker,
} from "@ant-design/react-native";
import { router } from "expo-router";

// Define your Zod schema
const disputeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  merchantId: z.string().optional(),
  transactionId: z.string().optional(),
});

type DisputeFormValues = z.infer<typeof disputeSchema>;

export default function RaiseDisputePage() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeSchema),
  });

  const onSubmit = (data: DisputeFormValues) => {
    console.log(data);
    // Here you would typically send the dispute data to your backend
  };

  return (
    <ScrollView>
      <View className="flex-1 bg-gray-100 p-4">
        <View className="mb-4 rounded-lg bg-white p-4">
          <Text className="mb-4 text-2xl font-bold">Raise a Dispute</Text>

          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <InputItem
                  placeholder="Brief title of your dispute"
                  value={value}
                  onChange={onChange}
                  error={!!errors.title}
                >
                  Title
                </InputItem>
                {errors.title && (
                  <Text className="text-sm text-red-500">
                    {errors.title.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <TextareaItem
                  rows={4}
                  placeholder="Detailed description of your dispute"
                  value={value}
                  onChange={onChange}
                  error={!!errors.description}
                >
                  Description
                </TextareaItem>
                {errors.description && (
                  <Text className="text-sm text-red-500">
                    {errors.description.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="merchantId"
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Picker
                  data={[
                    { value: "merchant1", label: "Merchant 1" },
                    { value: "merchant2", label: "Merchant 2" },
                    { value: "merchant3", label: "Merchant 3" },
                  ]}
                  cols={1}
                  value={value}
                  onChange={onChange}
                >
                  <InputItem arrow="horizontal">Merchant (optional)</InputItem>
                </Picker>
              </View>
            )}
          />

          <Controller
            control={control}
            name="transactionId"
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Picker
                  data={[
                    { value: "transaction1", label: "Transaction 1" },
                    { value: "transaction2", label: "Transaction 2" },
                    { value: "transaction3", label: "Transaction 3" },
                  ]}
                  cols={1}
                  value={value}
                  onChange={onChange}
                >
                  <InputItem arrow="horizontal">
                    Transaction (optional)
                  </InputItem>
                </Picker>
              </View>
            )}
          />

          <View className="mt-4 flex flex-col gap-4">
            <Button type="primary" onPress={handleSubmit(onSubmit)}>
              <Text className="font-semibold text-white">Submit Dispute</Text>
            </Button>
            <Button type="ghost" onPress={() => router.back()}>
              <Text className="font-semibold text-blue-500">Cancel</Text>
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
