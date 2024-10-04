import { ICreditTier } from "./creditTierInterface";

export interface IInstalmentPlan {
    instalment_plan_id: string;
    name: string;
    description: string;
    number_of_instalments: number;
    time_period: number; // in weeks
    interest_rate: number;
    minimum_amount: number;
    maximum_amount: number;
    status: string; // TODO: Change to enum

    credit_tiers: ICreditTier[];
}
