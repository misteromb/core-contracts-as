import { context, Context, PersistentMap, storage, logging } from "near-sdk-as";

const FOUNDATION_KEY = "f";

// Use PersistentMap<string, bool> as a lookup set for whitelisted accounts
const whitelist = new PersistentMap<string, bool>("w");
const factoryWhitelist = new PersistentMap<string, bool>("fw");

/**
 * Returns the foundation account ID stored during initialization.
 */
function getFoundationAccountId(): string {
  return storage.getString(FOUNDATION_KEY)!;
}

/**
 * Asserts that the predecessor (caller) is the foundation account.
 */
function assertCalledByFoundation(): void {
  assert(
    Context.predecessor == getFoundationAccountId(),
    "Can only be called by the foundation"
  );
}

/**
 * Validates that the given account ID is valid (non-empty).
 */
function assertValidAccountId(accountId: string): void {
  assert(accountId.length > 0, "The account ID is invalid");
}

// ─── Public contract methods ───

/**
 * Initializes the contract with the given foundation account ID.
 * Can only be called once.
 */
export function new_default(foundation_account_id: string): void {
  assert(!storage.contains(FOUNDATION_KEY), "The contract is already initialized");
  assertValidAccountId(foundation_account_id);
  storage.setString(FOUNDATION_KEY, foundation_account_id);
}

/**
 * Adds a staking pool account to the whitelist.
 * Can be called by the foundation or a whitelisted factory.
 * Returns true if the pool was not already whitelisted.
 */
export function add_staking_pool(staking_pool_account_id: string): bool {
  assertValidAccountId(staking_pool_account_id);
  const predecessor = Context.predecessor;
  const foundationAccountId = getFoundationAccountId();
  if (predecessor != foundationAccountId) {
    assert(
      factoryWhitelist.contains(predecessor) && factoryWhitelist.getSome(predecessor),
      "Can only be called by the foundation or a whitelisted factory"
    );
  }
  const alreadyWhitelisted = whitelist.contains(staking_pool_account_id) && whitelist.getSome(staking_pool_account_id);
  if (!alreadyWhitelisted) {
    whitelist.set(staking_pool_account_id, true);
    logging.log("Added staking pool account " + staking_pool_account_id + " to the whitelist");
  }
  return !alreadyWhitelisted;
}

/**
 * Removes a staking pool account from the whitelist.
 * Can only be called by the foundation.
 * Returns true if the pool was previously whitelisted.
 */
export function remove_staking_pool(staking_pool_account_id: string): bool {
  assertCalledByFoundation();
  assertValidAccountId(staking_pool_account_id);
  const wasWhitelisted = whitelist.contains(staking_pool_account_id) && whitelist.getSome(staking_pool_account_id);
  if (wasWhitelisted) {
    whitelist.set(staking_pool_account_id, false);
    logging.log("Removed staking pool account " + staking_pool_account_id + " from the whitelist");
  }
  return wasWhitelisted;
}

/**
 * Returns whether the given staking pool account is whitelisted.
 */
export function is_whitelisted(staking_pool_account_id: string): bool {
  assertValidAccountId(staking_pool_account_id);
  return whitelist.contains(staking_pool_account_id) && whitelist.getSome(staking_pool_account_id);
}

/**
 * Adds a factory account to the factory whitelist.
 * Can only be called by the foundation.
 * Returns true if the factory was not already whitelisted.
 */
export function add_factory(factory_account_id: string): bool {
  assertCalledByFoundation();
  assertValidAccountId(factory_account_id);
  const alreadyWhitelisted = factoryWhitelist.contains(factory_account_id) && factoryWhitelist.getSome(factory_account_id);
  if (!alreadyWhitelisted) {
    factoryWhitelist.set(factory_account_id, true);
    logging.log("Added factory account " + factory_account_id + " to the factory whitelist");
  }
  return !alreadyWhitelisted;
}

/**
 * Removes a factory account from the factory whitelist.
 * Can only be called by the foundation.
 * Returns true if the factory was previously whitelisted.
 */
export function remove_factory(factory_account_id: string): bool {
  assertCalledByFoundation();
  assertValidAccountId(factory_account_id);
  const wasWhitelisted = factoryWhitelist.contains(factory_account_id) && factoryWhitelist.getSome(factory_account_id);
  if (wasWhitelisted) {
    factoryWhitelist.set(factory_account_id, false);
    logging.log("Removed factory account " + factory_account_id + " from the factory whitelist");
  }
  return wasWhitelisted;
}

/**
 * Returns whether the given factory account is whitelisted.
 */
export function is_factory_whitelisted(factory_account_id: string): bool {
  assertValidAccountId(factory_account_id);
  return factoryWhitelist.contains(factory_account_id) && factoryWhitelist.getSome(factory_account_id);
}
