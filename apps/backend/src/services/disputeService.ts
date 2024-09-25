// Contains the business logic related to instalment plans
import { DisputeStatus, IDispute } from "../interfaces/disputeInterface";
import * as disputeRepository from "../repositories/disputeRepository";
import logger from "../utils/logger";
("");
export const createDispute = async (disputeData: IDispute) => {
    logger.info("Executing createInstalmentPlan...");
    const instalmentPlan = await disputeRepository.createDispute({
        ...disputeData,
        status: DisputeStatus.PENDING_OUTCOME,
    });
    return instalmentPlan;
};
