import { View, Text, TouchableOpacity } from "react-native";

export default function SelectPaymentPlanScreen({
  paymentPlans,
  selectedPlan,
  setSelectedPlan,
  onCancel,
  onConfirm,
}: {
  paymentPlans: { name: string; price: string }[];
  selectedPlan: string;
  setSelectedPlan: (plan: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-8 px-8">
      <Text className="text-xl font-semibold">
        Which payment plan would you like to use?
      </Text>

      {/* Payment Plans Radio Group */}
      <View className="w-full">
        {paymentPlans.map((plan) => {
          return (
            <TouchableOpacity
              className={`mb-4 flex-row items-center rounded-md border p-4 ${
                selectedPlan === plan.name
                  ? "border-blue-500"
                  : "border-gray-300"
              }`}
              onPress={() => setSelectedPlan(plan.name)}
              key={plan.name}
            >
              <View className="mr-4 h-6 w-6 items-center justify-center rounded-full border border-blue-500">
                <View
                  className={`h-4 w-4 rounded-full ${selectedPlan === plan.name ? "bg-blue-500" : "bg-white"}`}
                />
              </View>
              <View>
                <Text className="text-lg font-semibold">{plan.name}</Text>
                <Text className="text-sm text-gray-600">
                  {plan.price}
                  {plan.name === "Pay in Full" ? " now" : "/month"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Cancel & Confirm Buttons */}
      <View className="flex w-full gap-4">
        <TouchableOpacity
          className="w-full rounded-md bg-blue-600 p-3 shadow-sm"
          onPress={onConfirm}
        >
          <Text className="text-center text-lg font-semibold text-white">
            Confirm
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full rounded-md border border-gray-300 p-3"
          onPress={onCancel}
        >
          <Text className="rounded-md text-center text-lg font-semibold text-gray-700">
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
