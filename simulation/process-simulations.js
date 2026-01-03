const fs = require('fs');
const path = require('path');

// Function to calculate total portfolio value
function calculateTotalValue(portfolioAssets) {
  // Calculate the difference between closed positions and active positions
  const closedPositionsValue = calculateClosedPositionsValue(portfolioAssets);
  const activePositionsValue = calculateActivePositionsValue(portfolioAssets);
  return closedPositionsValue - activePositionsValue; // Sum of both to get total portfolio value
}

// Calculate value of only active positions (these are still in the portfolio)
function calculateActivePositionsValue(portfolioAssets) {
  return portfolioAssets.reduce((total, asset) => {
    const assetValue = asset.positions.reduce((assetTotal, position) => {
      if (position.isActive) {
        return assetTotal + (position.openingPrice * position.quantity);
      }
      return assetTotal;
    }, 0)
    return total + assetValue
  }, 0)
}

// Calculate value of only closed positions (these are out of the portfolio)
function calculateClosedPositionsValue(portfolioAssets) {
  return portfolioAssets.reduce((total, asset) => {
    const assetValue = asset.positions.reduce((assetTotal, position) => {
      if (!position.isActive) {
        return assetTotal + (position.openingPrice * position.quantity);
      }
      return assetTotal;
    }, 0)
    return total + assetValue
  }, 0)
}

// Function to process a single simulation file
function processSimulationFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const portfolioData = JSON.parse(fileContent);
    
    // Extract the filename without path and extension for identification
    const fileName = path.basename(filePath);
    
    return {
      fileName: fileName,
      portfolio: portfolioData,
      totalValue: calculateTotalValue(portfolioData.assets)
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return null;
  }
}

// Main function to process all simulation files
function main() {
  const simulationDir = './simulation';
  
  // Read all files in the simulation directory
  fs.readdir(simulationDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    
    // Filter for files matching the pattern portfolio-simulation-**-*.json
    const simulationFiles = files.filter(file => 
      file.startsWith('portfolio-simulation-') && file.endsWith('.json')
    );
    
    if (simulationFiles.length === 0) {
      console.log('No simulation files found.');
      return;
    }
    
    console.log(`Found ${simulationFiles.length} simulation files.`);
    
    // Process each file
    const processedFiles = simulationFiles.map(file => {
      const filePath = path.join(simulationDir, file);
      return processSimulationFile(filePath);
    }).filter(result => result !== null); // Remove any failed processing
    
    // Sort by filename to ensure consistent ordering (this will order numerically by run number)
    processedFiles.sort((a, b) => {
      const numA = parseInt(a.fileName.split('-')[3]); // Extract run number from filename
      const numB = parseInt(b.fileName.split('-')[3]);
      return numA - numB;
    });
    
    // Generate HTML visualization
    generateHTMLVisualization(processedFiles);
  });
}

// Function to generate HTML with embedded Chart.js for visualization
function generateHTMLVisualization(simulationData) {
  // Extract run numbers and values for chart data
  const labels = simulationData.map(data => data.fileName.replace('.json', '')); 
  const values = simulationData.map(data => data.totalValue);
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Simulation Results</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .chart-container {
            position: relative;
            height: 600px;
            margin-top: 20px;
        }
        .summary {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Portfolio Simulation Results</h1>
        <p>This visualization shows the final portfolio values for each simulation run.</p>
        
        <div class="chart-container">
            <canvas id="portfolioChart"></canvas>
        </div>
        
        <div class="summary">
            <h3>Summary</h3>
            <p>Total simulations processed: ${simulationData.length}</p>
            <p>Best performing simulation: ${labels[values.indexOf(Math.max(...values))]}</p>
            <p>Worst performing simulation: ${labels[values.indexOf(Math.min(...values))]}</p>
            <p>Average portfolio value: ${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)}</p>
        </div>
    </div>

    <script>
        // Get the canvas element
        const ctx = document.getElementById('portfolioChart').getContext('2d');
        
        // Create the chart
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(labels)},
                datasets: [{
                    label: 'Portfolio Value',
                    data: ${JSON.stringify(values)},
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Portfolio Value'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Simulation Run'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Final Portfolio Values by Simulation Run'
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const portfolioValue = context.parsed.y;
                                const idealMax = 10000; // This is the value of 100*100
                                const ratio = portfolioValue / idealMax;
                                return 'Portfolio Value: ' + portfolioValue.toFixed(2) + ' (' + ratio.toFixed(2) + 'x idealMax)';
                            }
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>
  `;
  
  // Write the HTML file
  fs.writeFileSync('simulation-results.html', htmlContent);
  console.log('Visualization generated successfully! Open simulation-results.html in your browser.');
}

// Run the main function
main();
