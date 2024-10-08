import { IInstalmentPlan } from "@repo/interfaces";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { formatCurrency } from "../../utils/formatCurrency";
import { Button } from "@ant-design/react-native";

export default function SelectInstalmentPlanScreen({
  instalmentPlans,
  price,
  selectedPlanId,
  setSelectedPlanId,
  onCancel,
  onConfirm,
}: {
  instalmentPlans: IInstalmentPlan[];
  price: number;
  selectedPlanId: string | null;
  setSelectedPlanId: (planId: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-8 p-8">
      <View className="flex flex-col items-center justify-center gap-2">
        <Text className="text-lg font-semibold">Total Amount</Text>
        <Text className="text-4xl font-bold">{formatCurrency(price)}</Text>
      </View>

      <Text className="text-xl font-semibold">
        Which instalment plan would you like to use?
      </Text>

      {/* ===== Instalment Plans Radio Group ===== */}
      <ScrollView className="w-full">
        {instalmentPlans.map((plan) => {
          return (
            <TouchableOpacity
              className={`mb-4 flex-row items-center rounded-md border p-4 ${
                selectedPlanId === plan.instalment_plan_id
                  ? "border-blue-500"
                  : "border-gray-300"
              }`}
              onPress={() => setSelectedPlanId(plan.instalment_plan_id)}
              key={plan.instalment_plan_id}
            >
              <View className="mr-4 h-6 w-6 items-center justify-center rounded-full border border-blue-500">
                <View
                  className={`h-4 w-4 rounded-full ${selectedPlanId === plan.instalment_plan_id ? "bg-blue-500" : "bg-white"}`}
                />
              </View>

              <View>
                <Text className="text-lg font-semibold">{plan.name}</Text>
                {/* ===== eg. 4 payments of $25 ===== */}
                <Text className="text-sm text-gray-600">
                  {`${plan.number_of_instalments} payments of ${formatCurrency(
                    price / plan.number_of_instalments,
                  )} `}
                </Text>
                {/* ===== eg. Once every 4.5 days ===== */}
                <Text className="text-sm text-gray-600">
                  {`Once every ${((plan.time_period * 7) / plan.number_of_instalments).toFixed(1)} days`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ===== Confirm & Cancel Buttons ===== */}
      <View className="flex w-full gap-4">
        <Button type="primary" onPress={onConfirm} disabled={!selectedPlanId}>
          <Text className="font-semibold text-white">Confirm</Text>
        </Button>

        <Button type="ghost" onPress={onCancel}>
          <Text className="font-semibold text-blue-500">Cancel</Text>
        </Button>
      </View>
    </View>
  );
}
