#![cfg(test)]
use super::*;
use soroban_sdk::{symbol, vec, Env, String, Address, Decimal};

#[test]
fn test_create_ad_placement() {
    let env = Env::default();
    let contract = Ad402Contract;
    let contract_id = env.register_contract(None, contract);
    let client = Ad402ContractClient::new(&env, &contract_id);

    let slot_id = String::from_str(&env, "header-banner");
    let advertiser = Address::generate(&env);
    let publisher = Address::generate(&env);
    let price = Decimal::from(25u32); // 25 XLM
    let bid_amount = Decimal::from(30u32); // 30 XLM bid
    let duration_minutes = 60; // 1 hour
    let content_hash = String::from_str(&env, "QmXyz...");
    let click_url = String::from_str(&env, "https://example.com");
    let description = String::from_str(&env, "Test ad placement");

    let result = client.create_ad_placement(
        &slot_id,
        &advertiser,
        &publisher,
        &price,
        &bid_amount,
        &duration_minutes,
        &content_hash,
        &click_url,
        &description,
    );

    assert!(result.get(String::from_str(&env, "id")).is_some());
    assert_eq!(
        result.get(String::from_str(&env, "slot_id")).unwrap(),
        Val::from(slot_id)
    );
}

#[test]
fn test_record_ad_view() {
    let env = Env::default();
    let contract = Ad402Contract;
    let contract_id = env.register_contract(None, contract);
    let client = Ad402ContractClient::new(&env, &contract_id);

    let placement_id = String::from_str(&env, "test-placement-123");
    let viewer = Address::generate(&env);
    let session_id = String::from_str(&env, "session-123");
    let view_duration = 30; // 30 seconds

    let credits_earned = client.record_ad_view(
        &placement_id,
        &viewer,
        &session_id,
        &view_duration,
        &None,
        &None,
    );

    assert!(credits_earned > Decimal::from(0u32));
}

#[test]
fn test_process_payment() {
    let env = Env::default();
    let contract = Ad402Contract;
    let contract_id = env.register_contract(None, contract);
    let client = Ad402ContractClient::new(&env, &contract_id);

    let placement_id = String::from_str(&env, "test-placement-123");
    let advertiser = Address::generate(&env);
    let publisher = Address::generate(&env);
    let amount = Decimal::from(30u32); // 30 XLM
    let transaction_hash = String::from_str(&env, "abc123...");

    let result = client.process_payment(
        &placement_id,
        &advertiser,
        &publisher,
        &amount,
        &transaction_hash,
    );

    assert_eq!(
        result.get(String::from_str(&env, "amount")).unwrap(),
        Val::from(amount)
    );
    assert_eq!(
        result.get(String::from_str(&env, "status")).unwrap(),
        Val::from(symbol!("verified"))
    );
}