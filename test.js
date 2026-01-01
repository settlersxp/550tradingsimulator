// Unit tests for the position adding logic in generatePortfolio function
// This file contains tests for the specific code block:
// if (changePercentage >= upThreshold || changePercentage <= -downThreshold) {
//   const stopLossPrice = newPrice * 1.05;
//   asset.positions.push({
//     openingPrice: newPrice,
//     quantity: 1,
//     stopLossPrice: stopLossPrice,
//     isActive: false
//   });
// }

import { addPositionWhenThresholdCrossed } from './positionLogic.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

function runTests() {
    console.log("Starting tests for position adding logic...");
    
    // Test 1: When changePercentage >= upThreshold, should add new position
    function testUpwardThreshold() {
        console.log("Test 1: Testing upward threshold crossing");
        
        // Setup mock asset
        const asset = {
            name: "TestAsset",
            price: 100,
            prevPrice: 100,
            positions: [
                {
                    openingPrice: 100,
                    quantity: 1,
                    stopLossPrice: 105,
                    isActive: false
                }
            ]
        };
        
        const upThreshold = 10; // 10% upward threshold
        const downThreshold = 5; // 5% downward threshold
        const changePercentage = 15; // 15% increase (should trigger)
        const newPrice = asset.prevPrice * (1 + changePercentage / 100);
        
        // This is the logic we're testing - now using imported function
        addPositionWhenThresholdCrossed(asset, upThreshold, downThreshold, changePercentage, newPrice);
        
        // Assertions
        assert(asset.positions.length === 2, "Should have 2 positions after adding new one");
        assert(asset.positions[1].openingPrice === newPrice, "New position should have correct opening price");
        assert(asset.positions[1].quantity === 1, "New position should have quantity 1");
        assert(asset.positions[1].stopLossPrice === newPrice * 1.05, "Stop loss price should be 5% higher than new price");
        assert(asset.positions[1].isActive === false, "New position should have isActive = false");
        
        console.log("✓ Test 1 passed");
    }
    
    // Test 2: When changePercentage <= -downThreshold, should add new position
    function testDownwardThreshold() {
        console.log("Test 2: Testing downward threshold crossing");
        
        // Setup mock asset
        const asset = {
            name: "TestAsset",
            price: 100,
            prevPrice: 100,
            positions: [
                {
                    openingPrice: 100,
                    quantity: 1,
                    stopLossPrice: 105,
                    isActive: false
                }
            ]
        };
        
        const upThreshold = 10; // 10% upward threshold
        const downThreshold = 5; // 5% downward threshold
        const changePercentage = -7; // 7% decrease (should trigger)
        const newPrice = asset.prevPrice * (1 + changePercentage / 100);
        
        // This is the logic we're testing - now using imported function
        addPositionWhenThresholdCrossed(asset, upThreshold, downThreshold, changePercentage, newPrice);
        
        // Assertions
        assert(asset.positions.length === 2, "Should have 2 positions after adding new one");
        assert(asset.positions[1].openingPrice === newPrice, "New position should have correct opening price");
        assert(asset.positions[1].quantity === 1, "New position should have quantity 1");
        assert(asset.positions[1].stopLossPrice === newPrice * 1.05, "Stop loss price should be 5% higher than new price");
        assert(asset.positions[1].isActive === false, "New position should have isActive = false");
        
        console.log("✓ Test 2 passed");
    }
    
    // Test 3: When changePercentage is within thresholds, should NOT add new position
    function testWithinThresholds() {
        console.log("Test 3: Testing when change is within thresholds (should not add position)");
        
        // Setup mock asset
        const asset = {
            name: "TestAsset",
            price: 100,
            prevPrice: 100,
            positions: [
                {
                    openingPrice: 100,
                    quantity: 1,
                    stopLossPrice: 105,
                    isActive: false
                }
            ]
        };
        
        const upThreshold = 10; // 10% upward threshold
        const downThreshold = 5; // 5% downward threshold
        const changePercentage = 3; // 3% increase (should NOT trigger)
        const newPrice = asset.prevPrice * (1 + changePercentage / 100);
        
        // This is the logic we're testing - now using imported function
        addPositionWhenThresholdCrossed(asset, upThreshold, downThreshold, changePercentage, newPrice);
        
        // Assertions
        assert(asset.positions.length === 1, "Should still have only 1 position (no new one added)");
        
        console.log("✓ Test 3 passed");
    }
    
    // Test 4: Edge case - exactly at threshold
    function testAtThreshold() {
        console.log("Test 4: Testing when change is exactly at threshold");
        
        // Setup mock asset
        const asset = {
            name: "TestAsset",
            price: 100,
            prevPrice: 100,
            positions: [
                {
                    openingPrice: 100,
                    quantity: 1,
                    stopLossPrice: 105,
                    isActive: false
                }
            ]
        };
        
        const upThreshold = 10; // 10% upward threshold
        const downThreshold = 5; // 5% downward threshold
        const changePercentage = 10; // Exactly at up threshold (should trigger)
        const newPrice = asset.prevPrice * (1 + changePercentage / 100);
        
        // This is the logic we're testing - now using imported function
        addPositionWhenThresholdCrossed(asset, upThreshold, downThreshold, changePercentage, newPrice);
        
        // Assertions
        assert(asset.positions.length === 2, "Should have 2 positions after adding new one");
        assert(asset.positions[1].openingPrice === newPrice, "New position should have correct opening price");
        assert(asset.positions[1].quantity === 1, "New position should have quantity 1");
        assert(asset.positions[1].stopLossPrice === newPrice * 1.05, "Stop loss price should be 5% higher than new price");
        assert(asset.positions[1].isActive === false, "New position should have isActive = false");
        
        console.log("✓ Test 4 passed");
    }
    
    // Run all tests
    try {
        testUpwardThreshold();
        testDownwardThreshold();
        testWithinThresholds();
        testAtThreshold();
        
        console.log("\n🎉 All tests passed!");
        return true;
    } catch (error) {
        console.error("❌ Test failed:", error.message);
        return false;
    }
}

// Run the tests
runTests();
