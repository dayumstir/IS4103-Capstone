import { View, Text, ScrollView, TextInput } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ant-design/react-native";
import { router } from "expo-router";
import ImagePickerField from "../../../../components/imagePickerField";

// Define your Zod schema
const issueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  merchantId: z.string().optional(),
  transactionId: z.string().optional(),
  image: z.string().optional(),
});

type IssueFormValues = z.infer<typeof issueSchema>;

export default function IssuesPage() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
  });

  const onSubmit = (data: IssueFormValues) => {
    console.log(data);
    // Here you would typically send the issue data to your backend
  };

  return (
    <ScrollView>
      <View className="m-4 rounded-lg bg-white p-4">
        <Text className="mb-4 text-2xl font-bold">Raise an Issue</Text>

        <Text className="mb-2 font-semibold">Title</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <TextInput
                className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Title to summarise your issue"
              />
              {errors.title && (
                <Text className="mt-1 text-red-500">
                  {errors.title.message}
                </Text>
              )}
            </View>
          )}
        />

        <Text className="mb-2 font-semibold">Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <TextInput
                className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Detailed description of your issue"
                multiline
                numberOfLines={4}
              />
              {errors.description && (
                <Text className="mt-1 text-red-500">
                  {errors.description.message}
                </Text>
              )}
            </View>
          )}
        />

        <Text className="mb-2 font-semibold">Merchant (optional)</Text>
        <Controller
          control={control}
          name="merchantId"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <TextInput
                className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Select a merchant"
              />
            </View>
          )}
        />

        <Text className="mb-2 font-semibold">Transaction (optional)</Text>
        <Controller
          control={control}
          name="transactionId"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <TextInput
                className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Select a transaction"
              />
            </View>
          )}
        />

        <Text className="mb-2 font-semibold">Upload Image (optional)</Text>
        <Controller
          control={control}
          name="image"
          render={({ field: { onChange, value } }) => (
            <ImagePickerField value={value} onChange={onChange} />
          )}
        />

        <View className="mt-4 flex flex-col gap-4">
          <Button type="primary" onPress={handleSubmit(onSubmit)}>
            <Text className="font-semibold text-white">Submit Issue</Text>
          </Button>
          <Button type="ghost" onPress={() => router.back()}>
            <Text className="font-semibold text-blue-500">Cancel</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
