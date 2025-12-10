import { describe, expect, it, beforeEach } from "vitest";
import { Cl, cvToValue } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("BitRaise Crowdfunding Platform", () => {
  // ========================================
  // CAMPAIGN CREATION TESTS
  // ========================================

  describe("Campaign Creation", () => {
    it("should create a campaign successfully", () => {
      const { result } = simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("My First Campaign"),
          Cl.stringUtf8("This is a test campaign for funding my project"),
          Cl.uint(10_000_000), // 10 STX goal
          Cl.uint(1000), // duration in blocks
          Cl.stringAscii("ipfs://QmTest123"),
        ],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(0)); // First campaign ID should be 0
    });

    it("should increment campaign IDs correctly", () => {
      // Create first campaign
      simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Campaign 1"),
          Cl.stringUtf8("First campaign"),
          Cl.uint(5_000_000),
          Cl.uint(500),
          Cl.stringAscii("ipfs://QmTest1"),
        ],
        wallet1
      );

      // Create second campaign
      const { result } = simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Campaign 2"),
          Cl.stringUtf8("Second campaign"),
          Cl.uint(8_000_000),
          Cl.uint(600),
          Cl.stringAscii("ipfs://QmTest2"),
        ],
        wallet2
      );

      expect(result).toBeOk(Cl.uint(1)); // Second campaign ID should be 1
    });

    it("should fail when goal is below minimum", () => {
      const { result } = simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Low Goal Campaign"),
          Cl.stringUtf8("Goal too low"),
          Cl.uint(500_000), // 0.5 STX - below minimum
          Cl.uint(500),
          Cl.stringAscii("ipfs://QmTest"),
        ],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(110)); // ERR-INVALID-GOAL
    });

    it("should fail when duration is too short", () => {
      const { result } = simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Short Duration"),
          Cl.stringUtf8("Duration too short"),
          Cl.uint(5_000_000),
          Cl.uint(100), // Less than MIN_CAMPAIGN_DURATION (144)
          Cl.stringAscii("ipfs://QmTest"),
        ],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(109)); // ERR-INVALID-DEADLINE
    });

    it("should fail when duration is too long", () => {
      const { result } = simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Long Duration"),
          Cl.stringUtf8("Duration too long"),
          Cl.uint(5_000_000),
          Cl.uint(60000), // More than MAX_CAMPAIGN_DURATION (52560)
          Cl.stringAscii("ipfs://QmTest"),
        ],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(109)); // ERR-INVALID-DEADLINE
    });

    it("should store campaign details correctly", () => {
      // Create campaign
      const createResult = simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Test Campaign"),
          Cl.stringUtf8("Test Description"),
          Cl.uint(10_000_000),
          Cl.uint(1000),
          Cl.stringAscii("ipfs://QmTest"),
        ],
        wallet1
      );

      const campaignId = createResult.result as any;

      // Get campaign details
      const { result } = simnet.callReadOnlyFn(
        "bitraise",
        "get-campaign",
        [Cl.uint(0)],
        wallet1
      );

      expect(result).toBeSome(
        Cl.tuple({
          creator: Cl.principal(wallet1),
          title: Cl.stringUtf8("Test Campaign"),
          description: Cl.stringUtf8("Test Description"),
          goal: Cl.uint(10_000_000),
          deadline: Cl.uint(simnet.blockHeight + 1000),
          "total-pledged": Cl.uint(0),
          state: Cl.stringAscii("active"),
          "metadata-uri": Cl.stringAscii("ipfs://QmTest"),
          withdrawn: Cl.bool(false),
          "created-at": Cl.uint(simnet.blockHeight),
        })
      );
    });
  });

  // ========================================
  // PLEDGING TESTS
  // ========================================

  describe("Pledging", () => {
    let campaignId: number;

    beforeEach(() => {
      // Create a campaign before each test
      const { result } = simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Pledge Test Campaign"),
          Cl.stringUtf8("Campaign for testing pledges"),
          Cl.uint(10_000_000), // 10 STX goal
          Cl.uint(1000),
          Cl.stringAscii("ipfs://QmPledgeTest"),
        ],
        wallet1
      );
      campaignId = Number(cvToValue((result as any).value));
    });

    it("should allow pledging to an active campaign", () => {
      const { result } = simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(campaignId), Cl.uint(2_000_000)], // 2 STX
        wallet2
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should update campaign total-pledged correctly", () => {
      // Make a pledge
      simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(campaignId), Cl.uint(3_000_000)],
        wallet2
      );

      // Check campaign
      const { result } = simnet.callReadOnlyFn(
        "bitraise",
        "get-campaign",
        [Cl.uint(campaignId)],
        wallet1
      );

      expect(result).toBeSome(
        Cl.tuple({
          creator: Cl.principal(wallet1),
          title: Cl.stringUtf8("Pledge Test Campaign"),
          description: Cl.stringUtf8("Campaign for testing pledges"),
          goal: Cl.uint(10_000_000),
          deadline: Cl.uint(simnet.blockHeight + 1000 - 1), // -1 because block advanced
          "total-pledged": Cl.uint(3_000_000),
          state: Cl.stringAscii("active"),
          "metadata-uri": Cl.stringAscii("ipfs://QmPledgeTest"),
          withdrawn: Cl.bool(false),
          "created-at": Cl.uint(simnet.blockHeight - 1),
        })
      );
    });

    it("should allow multiple pledges from the same backer", () => {
      // First pledge
      simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(campaignId), Cl.uint(1_000_000)],
        wallet2
      );

      // Second pledge
      const { result } = simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(campaignId), Cl.uint(2_000_000)],
        wallet2
      );

      expect(result).toBeOk(Cl.bool(true));

      // Check total pledge for backer
      const pledgeResult = simnet.callReadOnlyFn(
        "bitraise",
        "get-pledge",
        [Cl.uint(campaignId), Cl.principal(wallet2)],
        wallet2
      );

      expect(pledgeResult.result).toBeSome(
        Cl.tuple({
          amount: Cl.uint(3_000_000), // Combined amount
          refunded: Cl.bool(false),
          "pledged-at": Cl.uint(simnet.blockHeight),
        })
      );
    });

    it("should track multiple backers correctly", () => {
      // Pledge from wallet2
      simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(campaignId), Cl.uint(2_000_000)],
        wallet2
      );

      // Pledge from wallet3
      simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(campaignId), Cl.uint(3_000_000)],
        wallet3
      );

      // Check backer count
      const { result } = simnet.callReadOnlyFn(
        "bitraise",
        "get-backer-count",
        [Cl.uint(campaignId)],
        wallet1
      );

      expect(result).toStrictEqual(Cl.tuple({ count: Cl.uint(2) }));
    });

    it("should fail when pledging zero amount", () => {
      const { result } = simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(campaignId), Cl.uint(0)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(104)); // ERR-INVALID-AMOUNT
    });

    it("should fail when pledging to non-existent campaign", () => {
      const { result } = simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(999), Cl.uint(1_000_000)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(101)); // ERR-CAMPAIGN-NOT-FOUND
    });

    it("should fail when pledging after deadline", () => {
      // Mine blocks to pass deadline
      simnet.mineEmptyBlocks(1001);

      const { result } = simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(campaignId), Cl.uint(1_000_000)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(102)); // ERR-CAMPAIGN-ENDED
    });
  });

  // ========================================
  // WITHDRAWAL TESTS
  // ========================================

  describe("Fund Withdrawal", () => {
    let campaignId: number;

    beforeEach(() => {
      // Create campaign
      const { result } = simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Withdrawal Test"),
          Cl.stringUtf8("Test withdrawals"),
          Cl.uint(10_000_000), // 10 STX goal
          Cl.uint(500),
          Cl.stringAscii("ipfs://QmWithdraw"),
        ],
        wallet1
      );
      campaignId = Number(cvToValue((result as any).value));

      // Pledge enough to meet goal
      simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(campaignId), Cl.uint(12_000_000)], // 12 STX (over goal)
        wallet2
      );
    });

    it("should allow creator to withdraw after successful campaign", () => {
      // Mine blocks to pass deadline
      simnet.mineEmptyBlocks(501);

      const { result } = simnet.callPublicFn(
        "bitraise",
        "withdraw-funds",
        [Cl.uint(campaignId)],
        wallet1
      );

      // Should receive 98% (2% platform fee)
      const expectedAmount = 12_000_000 - (12_000_000 * 2) / 100;
      expect(result).toBeOk(Cl.uint(expectedAmount));
    });

    it("should update campaign state to successful after withdrawal", () => {
      // Mine blocks and withdraw
      simnet.mineEmptyBlocks(501);
      simnet.callPublicFn(
        "bitraise",
        "withdraw-funds",
        [Cl.uint(campaignId)],
        wallet1
      );

      // Check campaign state
      const { result } = simnet.callReadOnlyFn(
        "bitraise",
        "get-campaign",
        [Cl.uint(campaignId)],
        wallet1
      );

      const campaignData: any = cvToValue((result as any).value);
      expect(campaignData.state.value).toStrictEqual("successful");
      expect(campaignData.withdrawn).toStrictEqual(true);
    });

    it("should fail when non-creator tries to withdraw", () => {
      simnet.mineEmptyBlocks(501);

      const { result } = simnet.callPublicFn(
        "bitraise",
        "withdraw-funds",
        [Cl.uint(campaignId)],
        wallet2 // Not the creator
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });

    it("should fail when withdrawing before deadline", () => {
      const { result } = simnet.callPublicFn(
        "bitraise",
        "withdraw-funds",
        [Cl.uint(campaignId)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(103)); // ERR-CAMPAIGN-ACTIVE
    });

    it("should fail when goal not reached", () => {
      // Create new campaign with higher goal
      simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("High Goal"),
          Cl.stringUtf8("High goal campaign"),
          Cl.uint(50_000_000), // 50 STX goal
          Cl.uint(500),
          Cl.stringAscii("ipfs://QmHigh"),
        ],
        wallet1
      );

      // Pledge less than goal
      simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(1), Cl.uint(10_000_000)],
        wallet2
      );

      // Try to withdraw
      simnet.mineEmptyBlocks(501);
      const { result } = simnet.callPublicFn(
        "bitraise",
        "withdraw-funds",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(105)); // ERR-GOAL-NOT-REACHED
    });

    it("should fail when trying to withdraw twice", () => {
      simnet.mineEmptyBlocks(501);

      // First withdrawal
      simnet.callPublicFn(
        "bitraise",
        "withdraw-funds",
        [Cl.uint(campaignId)],
        wallet1
      );

      // Second withdrawal attempt
      const { result } = simnet.callPublicFn(
        "bitraise",
        "withdraw-funds",
        [Cl.uint(campaignId)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(106)); // ERR-ALREADY-WITHDRAWN
    });

    it("should accumulate platform fees correctly", () => {
      simnet.mineEmptyBlocks(501);

      // Withdraw funds
      simnet.callPublicFn(
        "bitraise",
        "withdraw-funds",
        [Cl.uint(campaignId)],
        wallet1
      ); // Check platform fees
      const { result } = simnet.callReadOnlyFn(
        "bitraise",
        "get-total-platform-fees",
        [],
        deployer
      );

      const expectedFee = (12_000_000 * 2) / 100;
      expect(result).toStrictEqual(Cl.uint(expectedFee));
    });
  });

  // ========================================
  // REFUND TESTS
  // ========================================

  describe("Refunds", () => {
    let campaignId: number;

    beforeEach(() => {
      // Create campaign
      const { result } = simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Refund Test"),
          Cl.stringUtf8("Test refunds"),
          Cl.uint(20_000_000), // 20 STX goal
          Cl.uint(500),
          Cl.stringAscii("ipfs://QmRefund"),
        ],
        wallet1
      );
      campaignId = Number(cvToValue((result as any).value));

      // Pledge less than goal
      simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(campaignId), Cl.uint(5_000_000)],
        wallet2
      );
    });

    it("should allow refund after failed campaign", () => {
      // Mine blocks to pass deadline
      simnet.mineEmptyBlocks(501);

      const { result } = simnet.callPublicFn(
        "bitraise",
        "refund",
        [Cl.uint(campaignId)],
        wallet2
      );

      expect(result).toBeOk(Cl.uint(5_000_000));
    });

    it("should update campaign state to failed after refund", () => {
      simnet.mineEmptyBlocks(501);

      simnet.callPublicFn("bitraise", "refund", [Cl.uint(campaignId)], wallet2);

      const { result } = simnet.callReadOnlyFn(
        "bitraise",
        "get-campaign",
        [Cl.uint(campaignId)],
        wallet1
      );

      const campaignData: any = cvToValue((result as any).value);
      expect(campaignData.state.value).toStrictEqual("failed");
    });

    it("should mark pledge as refunded", () => {
      simnet.mineEmptyBlocks(501);

      simnet.callPublicFn("bitraise", "refund", [Cl.uint(campaignId)], wallet2);

      const { result } = simnet.callReadOnlyFn(
        "bitraise",
        "get-pledge",
        [Cl.uint(campaignId), Cl.principal(wallet2)],
        wallet2
      );

      const pledgeData: any = cvToValue((result as any).value);
      expect(pledgeData.refunded).toStrictEqual(true);
    });

    it("should fail when trying to refund twice", () => {
      simnet.mineEmptyBlocks(501);

      // First refund
      simnet.callPublicFn("bitraise", "refund", [Cl.uint(campaignId)], wallet2);

      // Second refund attempt
      const { result } = simnet.callPublicFn(
        "bitraise",
        "refund",
        [Cl.uint(campaignId)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(108)); // ERR-ALREADY-REFUNDED
    });

    it("should fail when refunding before deadline", () => {
      const { result } = simnet.callPublicFn(
        "bitraise",
        "refund",
        [Cl.uint(campaignId)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(103)); // ERR-CAMPAIGN-ACTIVE
    });

    it("should fail when campaign was successful", () => {
      // Create new campaign and fully fund it
      simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Success Test"),
          Cl.stringUtf8("Will succeed"),
          Cl.uint(10_000_000),
          Cl.uint(500),
          Cl.stringAscii("ipfs://QmSuccess"),
        ],
        wallet1
      );

      simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(1), Cl.uint(15_000_000)],
        wallet2
      );

      simnet.mineEmptyBlocks(501);

      const { result } = simnet.callPublicFn(
        "bitraise",
        "refund",
        [Cl.uint(1)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(105)); // ERR-GOAL-NOT-REACHED (goal was reached)
    });

    it("should fail when user has no pledge", () => {
      simnet.mineEmptyBlocks(501);

      const { result } = simnet.callPublicFn(
        "bitraise",
        "refund",
        [Cl.uint(campaignId)],
        wallet3 // Never pledged
      );

      expect(result).toBeErr(Cl.uint(107)); // ERR-NO-PLEDGE-FOUND
    });
  });

  // ========================================
  // CAMPAIGN CANCELLATION TESTS
  // ========================================

  describe("Campaign Cancellation", () => {
    it("should allow creator to cancel campaign with no pledges", () => {
      simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Cancel Test"),
          Cl.stringUtf8("Will be cancelled"),
          Cl.uint(10_000_000),
          Cl.uint(500),
          Cl.stringAscii("ipfs://QmCancel"),
        ],
        wallet1
      );

      const { result } = simnet.callPublicFn(
        "bitraise",
        "cancel-campaign",
        [Cl.uint(0)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should update campaign state to cancelled", () => {
      const { result: createResult } = simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Cancel Test"),
          Cl.stringUtf8("Will be cancelled"),
          Cl.uint(10_000_000),
          Cl.uint(500),
          Cl.stringAscii("ipfs://QmCancel"),
        ],
        wallet1
      );
      const testCampaignId = Number(cvToValue((createResult as any).value));

      simnet.callPublicFn(
        "bitraise",
        "cancel-campaign",
        [Cl.uint(testCampaignId)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "bitraise",
        "get-campaign",
        [Cl.uint(testCampaignId)],
        wallet1
      );

      const campaignData: any = cvToValue((result as any).value);
      expect(campaignData.state.value).toStrictEqual("cancelled");
    });

    it("should fail when non-creator tries to cancel", () => {
      simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Cancel Test"),
          Cl.stringUtf8("Will be cancelled"),
          Cl.uint(10_000_000),
          Cl.uint(500),
          Cl.stringAscii("ipfs://QmCancel"),
        ],
        wallet1
      );

      const { result } = simnet.callPublicFn(
        "bitraise",
        "cancel-campaign",
        [Cl.uint(0)],
        wallet2 // Not creator
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });

    it("should fail when campaign has pledges", () => {
      simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Cancel Test"),
          Cl.stringUtf8("Has pledges"),
          Cl.uint(10_000_000),
          Cl.uint(500),
          Cl.stringAscii("ipfs://QmCancel"),
        ],
        wallet1
      );

      simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(0), Cl.uint(1_000_000)],
        wallet2
      );

      const { result } = simnet.callPublicFn(
        "bitraise",
        "cancel-campaign",
        [Cl.uint(0)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(104)); // ERR-INVALID-AMOUNT
    });
  });

  // ========================================
  // ADMIN FUNCTIONS TESTS
  // ========================================

  describe("Admin Functions", () => {
    it("should allow owner to update platform fee", () => {
      const { result } = simnet.callPublicFn(
        "bitraise",
        "set-platform-fee",
        [Cl.uint(5)], // 5%
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      const feeResult = simnet.callReadOnlyFn(
        "bitraise",
        "get-platform-fee-percentage",
        [],
        deployer
      );

      expect(feeResult.result).toStrictEqual(Cl.uint(5));
    });

    it("should fail when non-owner tries to update fee", () => {
      const { result } = simnet.callPublicFn(
        "bitraise",
        "set-platform-fee",
        [Cl.uint(5)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });

    it("should fail when fee is above maximum", () => {
      const { result } = simnet.callPublicFn(
        "bitraise",
        "set-platform-fee",
        [Cl.uint(15)], // 15% - above 10% max
        deployer
      );

      expect(result).toBeErr(Cl.uint(113)); // ERR-INVALID-FEE
    });

    it("should allow owner to pause contract", () => {
      const { result } = simnet.callPublicFn(
        "bitraise",
        "pause-contract",
        [],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      const pausedResult = simnet.callReadOnlyFn(
        "bitraise",
        "is-contract-paused",
        [],
        deployer
      );

      expect(pausedResult.result).toStrictEqual(Cl.bool(true));
    });

    it("should prevent campaign creation when paused", () => {
      simnet.callPublicFn("bitraise", "pause-contract", [], deployer);

      const { result } = simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Paused Test"),
          Cl.stringUtf8("Should fail"),
          Cl.uint(10_000_000),
          Cl.uint(500),
          Cl.stringAscii("ipfs://QmPaused"),
        ],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(111)); // ERR-CONTRACT-PAUSED
    });

    it("should allow owner to unpause contract", () => {
      simnet.callPublicFn("bitraise", "pause-contract", [], deployer);

      const { result } = simnet.callPublicFn(
        "bitraise",
        "unpause-contract",
        [],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      const pausedResult = simnet.callReadOnlyFn(
        "bitraise",
        "is-contract-paused",
        [],
        deployer
      );

      expect(pausedResult.result).toStrictEqual(Cl.bool(false));
    });

    it("should allow owner to withdraw platform fees", () => {
      // Create and complete a successful campaign to generate fees
      simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Fee Test"),
          Cl.stringUtf8("Generate fees"),
          Cl.uint(10_000_000),
          Cl.uint(500),
          Cl.stringAscii("ipfs://QmFee"),
        ],
        wallet1
      );

      simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(0), Cl.uint(15_000_000)],
        wallet2
      );

      simnet.mineEmptyBlocks(501);

      simnet.callPublicFn("bitraise", "withdraw-funds", [Cl.uint(0)], wallet1);

      // Withdraw platform fees
      const { result } = simnet.callPublicFn(
        "bitraise",
        "withdraw-platform-fees",
        [],
        deployer
      );

      const expectedFee = (15_000_000 * 2) / 100;
      expect(result).toBeOk(Cl.uint(expectedFee));
    });

    it("should fail when non-owner tries to withdraw fees", () => {
      const { result } = simnet.callPublicFn(
        "bitraise",
        "withdraw-platform-fees",
        [],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });
  });

  // ========================================
  // READ-ONLY FUNCTIONS TESTS
  // ========================================

  describe("Read-Only Functions", () => {
    beforeEach(() => {
      // Create campaign and pledge
      simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Read Test"),
          Cl.stringUtf8("Testing read functions"),
          Cl.uint(10_000_000),
          Cl.uint(500),
          Cl.stringAscii("ipfs://QmRead"),
        ],
        wallet1
      );

      simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(0), Cl.uint(7_000_000)],
        wallet2
      );
    });

    it("should return correct campaign progress", () => {
      const { result } = simnet.callReadOnlyFn(
        "bitraise",
        "get-campaign-progress",
        [Cl.uint(0)],
        wallet1
      );

      expect(result).toStrictEqual(Cl.uint(70)); // 70% of goal
    });

    it("should correctly identify successful campaign", () => {
      // Pledge more to reach goal
      simnet.callPublicFn(
        "bitraise",
        "pledge",
        [Cl.uint(0), Cl.uint(5_000_000)],
        wallet3
      );

      simnet.mineEmptyBlocks(501);

      const { result } = simnet.callReadOnlyFn(
        "bitraise",
        "is-campaign-successful",
        [Cl.uint(0)],
        wallet1
      );

      expect(result).toStrictEqual(Cl.bool(true));
    });

    it("should correctly identify failed campaign", () => {
      simnet.mineEmptyBlocks(501);

      const { result } = simnet.callReadOnlyFn(
        "bitraise",
        "is-campaign-failed",
        [Cl.uint(0)],
        wallet1
      );

      expect(result).toStrictEqual(Cl.bool(true));
    });

    it("should return user campaign count", () => {
      // Create another campaign
      simnet.callPublicFn(
        "bitraise",
        "create-campaign",
        [
          Cl.stringUtf8("Second Campaign"),
          Cl.stringUtf8("Another one"),
          Cl.uint(5_000_000),
          Cl.uint(500),
          Cl.stringAscii("ipfs://QmSecond"),
        ],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "bitraise",
        "get-user-campaign-count",
        [Cl.principal(wallet1)],
        wallet1
      );

      expect(result).toStrictEqual(Cl.tuple({ count: Cl.uint(2) }));
    });
  });
});
