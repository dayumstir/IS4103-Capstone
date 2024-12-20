// packages/interfaces/creditTierInterface.ts
import { IInstalmentPlan } from "./instalmentPlanInterface";

export interface ICreditTier {
    credit_tier_id: string;
    name: string;
    min_credit_score: number;
    max_credit_score: number;
    credit_limit: number;

    instalment_plans: IInstalmentPlan[];
}

export interface GetFirstCreditRatingResult {
    credit_score: number;
}

export interface UpdateCreditRatingResult {
    credit_score: number;
}
export interface UploadCCIResult {
    message: string;
    error: string;
}

export type UpdateCreditScoreFromFrontend = {
    paymentHistory: string;
    creditUtilisationRatio: string;
};

export type UpdateCreditScoreToBackend = {
    creditUtilisationRatio: number;
    paymentHistory: number[];
};
