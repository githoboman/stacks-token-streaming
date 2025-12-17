import { Cl, cvToValue } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer");
const sender = accounts.get("wallet_1");
const recipient = accounts.get("wallet_2");
const sender2 = accounts.get("wallet_3");
const recipient2 = accounts.get("wallet_4");

describe("stream analytics contract", () => {
  describe("stream recording", () => {
    it("records stream creation correctly", () => {
      // Record a stream creation
      const result = simnet.callPublicFn(
        "stream-analytics",
        "record-stream-creation",
        [
          Cl.uint(0),
          Cl.principal(sender),
          Cl.principal(recipient),
          Cl.uint(1000),
          Cl.uint(0),
          Cl.uint(100),
        ],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Check stream record
      const streamRecord = simnet.getMapEntry(
        "stream-analytics",
        "stream-records",
        Cl.uint(0)
      );

      expect(streamRecord).toBeSome(
        Cl.tuple({
          sender: Cl.principal(sender),
          recipient: Cl.principal(recipient),
          "total-amount": Cl.uint(1000),
          "amount-withdrawn": Cl.uint(0),
          "start-block": Cl.uint(0),
          "end-block": Cl.uint(100),
          "created-at-block": Cl.uint(2),
          completed: Cl.bool(false),
          cancelled: Cl.bool(false),
        })
      );

      // Check global stats
      const globalStats = simnet.callReadOnlyFn(
        "stream-analytics",
        "get-global-stats",
        [],
        deployer
      );

      const stats = cvToValue(globalStats.result);
      expect(stats["total-streams"].value).toBe(1n);
      expect(stats["total-volume"].value).toBe(1000n);
    });

    it("prevents unauthorized stream recording", () => {
      const result = simnet.callPublicFn(
        "stream-analytics",
        "record-stream-creation",
        [
          Cl.uint(0),
          Cl.principal(sender),
          Cl.principal(recipient),
          Cl.uint(1000),
          Cl.uint(0),
          Cl.uint(100),
        ],
        sender // Not the deployer
      );

      expect(result.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
    });

    it("prevents duplicate stream recording", () => {
      // Record first time
      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-creation",
        [
          Cl.uint(0),
          Cl.principal(sender),
          Cl.principal(recipient),
          Cl.uint(1000),
          Cl.uint(0),
          Cl.uint(100),
        ],
        deployer
      );

      // Try to record again
      const result = simnet.callPublicFn(
        "stream-analytics",
        "record-stream-creation",
        [
          Cl.uint(0),
          Cl.principal(sender),
          Cl.principal(recipient),
          Cl.uint(1000),
          Cl.uint(0),
          Cl.uint(100),
        ],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(102)); // ERR_ALREADY_RECORDED
    });
  });

  describe("sender statistics", () => {
    beforeEach(() => {
      // Create two streams from the same sender
      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-creation",
        [
          Cl.uint(0),
          Cl.principal(sender),
          Cl.principal(recipient),
          Cl.uint(1000),
          Cl.uint(0),
          Cl.uint(100),
        ],
        deployer
      );

      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-creation",
        [
          Cl.uint(1),
          Cl.principal(sender),
          Cl.principal(recipient2),
          Cl.uint(2000),
          Cl.uint(0),
          Cl.uint(100),
        ],
        deployer
      );
    });

    it("tracks sender statistics correctly", () => {
      const senderStats = simnet.callReadOnlyFn(
        "stream-analytics",
        "get-sender-stats",
        [Cl.principal(sender)],
        deployer
      );

      const stats = cvToValue(senderStats.result);
      expect(stats["total-streams-created"].value).toBe(2n);
      expect(stats["total-amount-sent"].value).toBe(3000n);
      expect(stats["streams-completed"].value).toBe(0n);
      expect(stats["streams-cancelled"].value).toBe(0n);
    });

    it("updates completion stats", () => {
      // Complete a stream
      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-completion",
        [Cl.uint(0)],
        deployer
      );

      const senderStats = simnet.callReadOnlyFn(
        "stream-analytics",
        "get-sender-stats",
        [Cl.principal(sender)],
        deployer
      );

      const stats = cvToValue(senderStats.result);
      expect(stats["streams-completed"].value).toBe(1n);
    });

    it("updates cancellation stats", () => {
      // Cancel a stream
      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-cancellation",
        [Cl.uint(1)],
        deployer
      );

      const senderStats = simnet.callReadOnlyFn(
        "stream-analytics",
        "get-sender-stats",
        [Cl.principal(sender)],
        deployer
      );

      const stats = cvToValue(senderStats.result);
      expect(stats["streams-cancelled"].value).toBe(1n);
    });

    it("calculates sender reliability score", () => {
      // Complete one stream
      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-completion",
        [Cl.uint(0)],
        deployer
      );

      // Cancel another
      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-cancellation",
        [Cl.uint(1)],
        deployer
      );

      const reliability = simnet.callReadOnlyFn(
        "stream-analytics",
        "calculate-sender-reliability",
        [Cl.principal(sender)],
        deployer
      );

      const score = cvToValue(reliability.result);
      // 1 completed out of 2 = 50% completion
      // 1 cancelled out of 2 = 10% penalty
      // Score should be around 40
      expect(score.value).toBe(40n);
    });
  });

  describe("recipient statistics", () => {
    beforeEach(() => {
      // Create a stream
      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-creation",
        [
          Cl.uint(0),
          Cl.principal(sender),
          Cl.principal(recipient),
          Cl.uint(1000),
          Cl.uint(0),
          Cl.uint(100),
        ],
        deployer
      );
    });

    it("tracks recipient statistics correctly", () => {
      const recipientStats = simnet.callReadOnlyFn(
        "stream-analytics",
        "get-recipient-stats",
        [Cl.principal(recipient)],
        deployer
      );

      const stats = cvToValue(recipientStats.result);
      expect(stats["total-streams-received"].value).toBe(1n);
      expect(stats["total-amount-received"].value).toBe(0n); // Nothing withdrawn yet
    });

    it("updates withdrawal stats", () => {
      // Record a withdrawal
      simnet.callPublicFn(
        "stream-analytics",
        "record-withdrawal",
        [Cl.uint(0), Cl.uint(500)],
        deployer
      );

      const recipientStats = simnet.callReadOnlyFn(
        "stream-analytics",
        "get-recipient-stats",
        [Cl.principal(recipient)],
        deployer
      );

      const stats = cvToValue(recipientStats.result);
      expect(stats["total-amount-received"].value).toBe(500n);
      expect(stats["total-withdrawn"].value).toBe(500n);

      // Check stream record updated
      const streamRecord = simnet.callReadOnlyFn(
        "stream-analytics",
        "get-stream-record",
        [Cl.uint(0)],
        deployer
      );

      const record = cvToValue(streamRecord.result);
      expect(record.value["amount-withdrawn"].value).toBe(500n);
    });

    it("calculates recipient engagement score", () => {
      // Record withdrawals
      simnet.callPublicFn(
        "stream-analytics",
        "record-withdrawal",
        [Cl.uint(0), Cl.uint(800)],
        deployer
      );

      const engagement = simnet.callReadOnlyFn(
        "stream-analytics",
        "calculate-recipient-engagement",
        [Cl.principal(recipient)],
        deployer
      );

      const score = cvToValue(engagement.result);
      // 800 withdrawn out of 800 received = 100% engagement
      expect(score.value).toBe(100n);
    });
  });

  describe("reputation system", () => {
    beforeEach(() => {
      // Create and complete a stream
      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-creation",
        [
          Cl.uint(0),
          Cl.principal(sender),
          Cl.principal(recipient),
          Cl.uint(1000),
          Cl.uint(0),
          Cl.uint(100),
        ],
        deployer
      );

      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-completion",
        [Cl.uint(0)],
        deployer
      );
    });

    it("allows rating after stream completion", () => {
      const result = simnet.callPublicFn(
        "stream-analytics",
        "rate-user",
        [Cl.principal(recipient), Cl.uint(0), Cl.uint(5)],
        sender
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Check rating was recorded
      const rating = simnet.callReadOnlyFn(
        "stream-analytics",
        "get-rating",
        [Cl.principal(sender), Cl.principal(recipient), Cl.uint(0)],
        deployer
      );

      const ratingValue = cvToValue(rating.result);
      expect(ratingValue.value.rating.value).toBe(5n);
    });

    it("prevents rating from unauthorized users", () => {
      const result = simnet.callPublicFn(
        "stream-analytics",
        "rate-user",
        [Cl.principal(recipient), Cl.uint(0), Cl.uint(5)],
        sender2 // Not part of the stream
      );

      expect(result.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
    });

    it("prevents invalid ratings", () => {
      // Try rating with 6 stars (invalid)
      const result = simnet.callPublicFn(
        "stream-analytics",
        "rate-user",
        [Cl.principal(recipient), Cl.uint(0), Cl.uint(6)],
        sender
      );

      expect(result.result).toBeErr(Cl.uint(104)); // ERR_INVALID_RATING
    });

    it("updates reputation score based on ratings", () => {
      // Give a 5-star rating
      simnet.callPublicFn(
        "stream-analytics",
        "rate-user",
        [Cl.principal(recipient), Cl.uint(0), Cl.uint(5)],
        sender
      );

      const stats = simnet.callReadOnlyFn(
        "stream-analytics",
        "get-recipient-stats",
        [Cl.principal(recipient)],
        deployer
      );

      const recipientStats = cvToValue(recipientStats.result);
      // 5 stars * 20 = 100 reputation score
      expect(recipientStats["reputation-score"].value).toBe(100n);
      expect(recipientStats["total-ratings-received"].value).toBe(1n);
    });

    it("averages multiple ratings", () => {
      // First rating: 5 stars
      simnet.callPublicFn(
        "stream-analytics",
        "rate-user",
        [Cl.principal(sender), Cl.uint(0), Cl.uint(5)],
        recipient
      );

      // Create and complete another stream
      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-creation",
        [
          Cl.uint(1),
          Cl.principal(sender),
          Cl.principal(recipient2),
          Cl.uint(1000),
          Cl.uint(0),
          Cl.uint(100),
        ],
        deployer
      );

      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-completion",
        [Cl.uint(1)],
        deployer
      );

      // Second rating: 3 stars
      simnet.callPublicFn(
        "stream-analytics",
        "rate-user",
        [Cl.principal(sender), Cl.uint(1), Cl.uint(3)],
        recipient2
      );

      const stats = simnet.callReadOnlyFn(
        "stream-analytics",
        "get-sender-stats",
        [Cl.principal(sender)],
        deployer
      );

      const senderStats = cvToValue(stats.result);
      // Average: (5 + 3) / 2 = 4 stars * 20 = 80 reputation
      expect(senderStats["reputation-score"].value).toBe(80n);
      expect(senderStats["total-ratings-received"].value).toBe(2n);
    });
  });

  describe("global statistics", () => {
    it("tracks global metrics correctly", () => {
      // Create multiple streams
      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-creation",
        [
          Cl.uint(0),
          Cl.principal(sender),
          Cl.principal(recipient),
          Cl.uint(1000),
          Cl.uint(0),
          Cl.uint(100),
        ],
        deployer
      );

      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-creation",
        [
          Cl.uint(1),
          Cl.principal(sender2),
          Cl.principal(recipient2),
          Cl.uint(2000),
          Cl.uint(0),
          Cl.uint(100),
        ],
        deployer
      );

      // Complete one, cancel one
      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-completion",
        [Cl.uint(0)],
        deployer
      );

      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-cancellation",
        [Cl.uint(1)],
        deployer
      );

      const globalStats = simnet.callReadOnlyFn(
        "stream-analytics",
        "get-global-stats",
        [],
        deployer
      );

      const stats = cvToValue(globalStats.result);
      expect(stats["total-streams"].value).toBe(2n);
      expect(stats["total-volume"].value).toBe(3000n);
      expect(stats["completed-streams"].value).toBe(1n);
      expect(stats["cancelled-streams"].value).toBe(1n);
      expect(stats["completion-rate"].value).toBe(50n); // 50%
      expect(stats["average-stream-size"].value).toBe(1500n); // 3000 / 2
    });
  });

  describe("period metrics", () => {
    it("tracks metrics by time period", () => {
      // Get current period
      const currentPeriod = simnet.callReadOnlyFn(
        "stream-analytics",
        "get-current-period",
        [],
        deployer
      );

      const periodId = cvToValue(currentPeriod.result);

      // Create a stream
      simnet.callPublicFn(
        "stream-analytics",
        "record-stream-creation",
        [
          Cl.uint(0),
          Cl.principal(sender),
          Cl.principal(recipient),
          Cl.uint(1000),
          Cl.uint(0),
          Cl.uint(100),
        ],
        deployer
      );

      // Check period metrics
      const periodMetrics = simnet.callReadOnlyFn(
        "stream-analytics",
        "get-period-metrics",
        [Cl.uint(Number(periodId.value))],
        deployer
      );

      const metrics = cvToValue(periodMetrics.result);
      expect(metrics["streams-created"].value).toBe(1n);
      expect(metrics["total-volume"].value).toBe(1000n);
    });
  });
});