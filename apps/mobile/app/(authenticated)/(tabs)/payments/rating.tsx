import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Picker } from "@ant-design/react-native";
import Toast from "react-native-toast-message";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCreateRatingMutation } from "../../../../redux/services/ratingService";
import { IRating } from "@repo/interfaces";

// Define Zod schema
const ratingSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(50, "Title must be 50 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description must be 200 characters or less"),
  rating: z.number().min(1, "Rating is required").max(5, "Invalid rating"),
});

type RatingFormValues = z.infer<typeof ratingSchema>;

export default function RatingScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RatingFormValues>({
    resolver: zodResolver(ratingSchema),
  });

  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const router = useRouter();
  const [createRating, { isLoading }] = useCreateRatingMutation();

  const [ratingVisible, setRatingVisible] = useState(false);

  const onSubmit = async (data: RatingFormValues) => {
    try {
      if (!transactionId) {
        Toast.show({
          type: "error",
          text1: "Transaction ID is required.",
        });
        return;
      }

      const payload: Partial<IRating> = {
        transaction_id: transactionId,
        title: data.title,
        rating: data.rating.toString(), // Convert number to string for API compatibility
        description: data.description,
      };

      await createRating(payload).unwrap();

      Toast.show({
        type: "success",
        text1: "Rating submitted successfully",
      });

      reset();
      router.back();
    } catch (error) {
      console.error("Error creating rating:", error);
      Toast.show({
        type: "error",
        text1: "Failed to submit rating. Please try again.",
      });
    }
  };

  return (
    <ScrollView>
      <View className="m-4 rounded-lg bg-white p-8">
        <Text className="mb-4 text-2xl font-bold">Submit a Rating</Text>

        {/* Title Field */}
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
                placeholder="Enter a title for your rating"
              />
              {errors.title && (
                <Text className="mt-1 text-red-500">{errors.title.message}</Text>
              )}
            </View>
          )}
        />

        {/* Rating Picker */}
        <Text className="mb-2 font-semibold">Rating</Text>
        <Controller
          control={control}
          name="rating"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <TouchableOpacity
                className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                onPress={() => setRatingVisible(true)}
              >
                <Text>{value ? `${value} / 5` : "Select Rating"}</Text>
              </TouchableOpacity>
              <Picker
                data={[
                  { label: "1 / 5", value: 1 },
                  { label: "2 / 5", value: 2 },
                  { label: "3 / 5", value: 3 },
                  { label: "4 / 5", value: 4 },
                  { label: "5 / 5", value: 5 },
                ]}
                cols={1}
                visible={ratingVisible}
                value={[value]}
                onChange={(val) => {
                  onChange(val[0]);
                  setRatingVisible(false);
                }}
                onDismiss={() => setRatingVisible(false)}
                okText="Confirm"
                dismissText="Cancel"
              />
              {errors.rating && (
                <Text className="mt-1 text-red-500">{errors.rating.message}</Text>
              )}
            </View>
          )}
        />

        {/* Description Field */}
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
                placeholder="Write a detailed review"
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

        {/* Buttons */}
        <View className="mt-4 flex flex-col gap-4">
          <Button
            type="primary"
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
          >
            <Text className="font-semibold text-white">Submit Rating</Text>
          </Button>
          <Button
            type="ghost"
            onPress={() => {
              reset();
              router.back();
            }}
          >
            <Text className="font-semibold text-blue-500">Cancel</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
