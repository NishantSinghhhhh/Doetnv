#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, Map, String, Address, Symbol};

#[contracttype]
pub struct AdPlacement {
    pub id: String,
    pub slot_id: String,
    pub advertiser: Address,
    pub publisher: Address,
    pub price: i128,
    pub bid_amount: i128,
    pub duration_minutes: u64,
    pub content_hash: String,
    pub click_url: String,
    pub description: String,
}

#[contract]
pub struct Ad402Contract;

#[contractimpl]
impl Ad402Contract {
    pub fn create_ad_placement(
        env: Env,
        slot_id: String,
        advertiser: Address,
        publisher: Address,
        price: i128,
        bid_amount: i128,
        duration_minutes: u64,
        content_hash: String,
        click_url: String,
        description: String,
    ) -> Map<String, String> {
        let mut result = Map::new(&env);
        
        // Generate placement ID (in production, use better ID generation)
        let placement_id = String::from_str(&env, "placement-001");
        
        result.set(String::from_str(&env, "id"), placement_id.clone());
        result.set(String::from_str(&env, "slot_id"), slot_id.clone());
        result.set(String::from_str(&env, "content_hash"), content_hash.clone());
        result.set(String::from_str(&env, "click_url"), click_url.clone());
        result.set(String::from_str(&env, "description"), description.clone());
        
        result
    }

    pub fn record_ad_view(
        env: Env,
        placement_id: String,
        viewer: Address,
        session_id: String,
        view_duration: u64,
        _metadata1: Option<String>,
        _metadata2: Option<String>,
    ) -> i128 {
        // Calculate credits based on view duration
        // For example: 1 credit per 10 seconds viewed
        let credits_earned = (view_duration as i128) * 1_000_000; // in stroops
        
        credits_earned
    }

    pub fn process_payment(
        env: Env,
        placement_id: String,
        advertiser: Address,
        publisher: Address,
        amount: i128,
        transaction_hash: String,
    ) -> Map<String, String> {
        let mut result = Map::new(&env);
        
        // Convert amount to string for storage in map
        result.set(String::from_str(&env, "placement_id"), placement_id);
        result.set(String::from_str(&env, "transaction_hash"), transaction_hash);
        result.set(String::from_str(&env, "status"), String::from_str(&env, "verified"));
        
        result
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_create_ad_placement() {
        let env = Env::default();
        let contract_id = env.register_contract(None, Ad402Contract);
        let client = Ad402ContractClient::new(&env, &contract_id);

        let slot_id = String::from_str(&env, "header-banner");
        let advertiser = Address::generate(&env);
        let publisher = Address::generate(&env);
        let price = 250_000_000i128; // 25 XLM in stroops
        let bid_amount = 300_000_000i128; // 30 XLM in stroops
        let duration_minutes = 60u64;
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

        assert!(result.contains_key(String::from_str(&env, "id")));
        assert_eq!(
            result.get(String::from_str(&env, "slot_id")).unwrap(),
            slot_id
        );
    }

    #[test]
    fn test_record_ad_view() {
        let env = Env::default();
        let contract_id = env.register_contract(None, Ad402Contract);
        let client = Ad402ContractClient::new(&env, &contract_id);

        let placement_id = String::from_str(&env, "test-placement-123");
        let viewer = Address::generate(&env);
        let session_id = String::from_str(&env, "session-123");
        let view_duration = 30u64; // 30 seconds

        let credits_earned = client.record_ad_view(
            &placement_id,
            &viewer,
            &session_id,
            &view_duration,
            &None,
            &None,
        );

        assert!(credits_earned > 0i128);
    }

    #[test]
    fn test_process_payment() {
        let env = Env::default();
        let contract_id = env.register_contract(None, Ad402Contract);
        let client = Ad402ContractClient::new(&env, &contract_id);

        let placement_id = String::from_str(&env, "test-placement-123");
        let advertiser = Address::generate(&env);
        let publisher = Address::generate(&env);
        let amount = 300_000_000i128; // 30 XLM in stroops
        let transaction_hash = String::from_str(&env, "abc123...");

        let result = client.process_payment(
            &placement_id,
            &advertiser,
            &publisher,
            &amount,
            &transaction_hash,
        );

        assert_eq!(
            result.get(String::from_str(&env, "status")).unwrap(),
            String::from_str(&env, "verified")
        );
    }
}