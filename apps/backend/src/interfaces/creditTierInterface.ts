import { IInstalmentPlan } from "./instalmentPlanInterface";

export interface ICreditTier {
    credit_tier_id: string;
    name: string;
    min_credit_score: number;
    max_credit_score: number;

    instalment_plans: IInstalmentPlan[];
}
