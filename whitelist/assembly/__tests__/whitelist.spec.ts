import { VMContext, Context } from "near-sdk-as";
import {
  new_default,
  add_staking_pool,
  remove_staking_pool,
  is_whitelisted,
  add_factory,
  remove_factory,
  is_factory_whitelisted,
} from "../index";

const FOUNDATION = "foundation.near";
const POOL1 = "pool1.near";
const POOL2 = "pool2.near";
const FACTORY1 = "factory1.near";
const FACTORY2 = "factory2.near";
const NON_FOUNDATION = "alice.near";

function setFoundation(): void {
  VMContext.setPredecessor_account_id(FOUNDATION);
}

function init(): void {
  setFoundation();
  new_default(FOUNDATION);
}

describe("Whitelist Contract", () => {
  beforeEach(() => {
    init();
  });

  describe("Initialization", () => {
    it("should not allow double initialization", () => {
      expect(() => {
        new_default(FOUNDATION);
      }).toThrow();
    });
  });

  describe("Staking Pool Whitelist (Foundation)", () => {
    it("should add a staking pool to whitelist", () => {
      const result = add_staking_pool(POOL1);
      expect(result).toBeTruthy();
      expect(is_whitelisted(POOL1)).toBeTruthy();
    });

    it("should return false when adding already whitelisted pool", () => {
      add_staking_pool(POOL1);
      const result = add_staking_pool(POOL1);
      expect(result).toBeFalsy();
    });

    it("should remove a staking pool from whitelist", () => {
      add_staking_pool(POOL1);
      const result = remove_staking_pool(POOL1);
      expect(result).toBeTruthy();
      expect(is_whitelisted(POOL1)).toBeFalsy();
    });

    it("should return false when removing non-whitelisted pool", () => {
      const result = remove_staking_pool(POOL1);
      expect(result).toBeFalsy();
    });

    it("should handle multiple pools", () => {
      add_staking_pool(POOL1);
      add_staking_pool(POOL2);
      expect(is_whitelisted(POOL1)).toBeTruthy();
      expect(is_whitelisted(POOL2)).toBeTruthy();
    });

    it("should not whitelist a pool by default", () => {
      expect(is_whitelisted(POOL1)).toBeFalsy();
    });
  });

  describe("Access Control", () => {
    it("should not allow non-foundation to remove staking pool", () => {
      add_staking_pool(POOL1);
      VMContext.setPredecessor_account_id(NON_FOUNDATION);
      expect(() => {
        remove_staking_pool(POOL1);
      }).toThrow();
    });

    it("should not allow non-foundation/non-factory to add staking pool", () => {
      VMContext.setPredecessor_account_id(NON_FOUNDATION);
      expect(() => {
        add_staking_pool(POOL1);
      }).toThrow();
    });

    it("should not allow non-foundation to add factory", () => {
      VMContext.setPredecessor_account_id(NON_FOUNDATION);
      expect(() => {
        add_factory(FACTORY1);
      }).toThrow();
    });

    it("should not allow non-foundation to remove factory", () => {
      add_factory(FACTORY1);
      VMContext.setPredecessor_account_id(NON_FOUNDATION);
      expect(() => {
        remove_factory(FACTORY1);
      }).toThrow();
    });
  });

  describe("Factory Whitelist", () => {
    it("should add a factory to whitelist", () => {
      const result = add_factory(FACTORY1);
      expect(result).toBeTruthy();
      expect(is_factory_whitelisted(FACTORY1)).toBeTruthy();
    });

    it("should return false when adding already whitelisted factory", () => {
      add_factory(FACTORY1);
      const result = add_factory(FACTORY1);
      expect(result).toBeFalsy();
    });

    it("should remove a factory from whitelist", () => {
      add_factory(FACTORY1);
      const result = remove_factory(FACTORY1);
      expect(result).toBeTruthy();
      expect(is_factory_whitelisted(FACTORY1)).toBeFalsy();
    });

    it("should return false when removing non-whitelisted factory", () => {
      const result = remove_factory(FACTORY1);
      expect(result).toBeFalsy();
    });

    it("should not whitelist a factory by default", () => {
      expect(is_factory_whitelisted(FACTORY1)).toBeFalsy();
    });
  });

  describe("Factory Adding Staking Pool", () => {
    it("should allow whitelisted factory to add staking pool", () => {
      add_factory(FACTORY1);
      VMContext.setPredecessor_account_id(FACTORY1);
      const result = add_staking_pool(POOL1);
      expect(result).toBeTruthy();
      expect(is_whitelisted(POOL1)).toBeTruthy();
    });

    it("should not allow non-whitelisted factory to add staking pool", () => {
      VMContext.setPredecessor_account_id(FACTORY1);
      expect(() => {
        add_staking_pool(POOL1);
      }).toThrow();
    });
  });

  describe("Validation", () => {
    it("should reject empty staking pool account ID", () => {
      expect(() => {
        add_staking_pool("");
      }).toThrow();
    });

    it("should reject empty factory account ID", () => {
      expect(() => {
        add_factory("");
      }).toThrow();
    });

    it("should reject empty account ID for is_whitelisted", () => {
      expect(() => {
        is_whitelisted("");
      }).toThrow();
    });

    it("should reject empty account ID for is_factory_whitelisted", () => {
      expect(() => {
        is_factory_whitelisted("");
      }).toThrow();
    });
  });
});
