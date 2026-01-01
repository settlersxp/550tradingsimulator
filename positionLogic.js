/**
 * Adds a new position to an asset when price thresholds are crossed
 * @param {Object} asset - The asset object to add position to
 * @param {number} upThreshold - The upward threshold percentage
 * @param {number} downThreshold - The downward threshold percentage
 * @param {number} changePercentage - The percentage change in price
 * @param {number} newPrice - The new price of the asset
 */
export function addPositionWhenThresholdCrossed(asset, upThreshold, downThreshold, changePercentage, newPrice) {
    if (changePercentage >= upThreshold || changePercentage <= -downThreshold) {
        // Add a new position with current price
        const stopLossPrice = newPrice * 1.05; // 5% higher than opening price
        asset.positions.push({
            openingPrice: newPrice,
            quantity: 1,
            stopLossPrice: stopLossPrice,
            isActive: false
        });
    }
}
