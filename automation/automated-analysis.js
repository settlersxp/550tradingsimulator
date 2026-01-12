/**
 * Automated Analysis Pipeline for Portfolio Trading Simulator
 * This script automates the complete workflow from simulation to analysis
 */

const fs = require('fs');
const path = require('path');

// Import the automated simulation runner
const { runAutomatedSimulations, generateAnalysisReport } = require('./automated-simulation-runner.js');

// Define processing functions directly since they're not exported from portfolio-simulation.js
function calculateTotalValue(portfolioAssets) {
  // Calculate the difference between closed positions and active positions
  const closedPositionsValue = calculateClosedPositionsValue(portfolioAssets);
  const activePositionsValue = calculateActivePositionsValue(portfolioAssets);
  return closedPositionsValue - activePositionsValue;
}

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

// Function to process all simulation results and create visualizations
function processSimulationResults() {
  console.log('Processing simulation results...');
  
  const simulationDir = path.join(__dirname, '..', 'simulation');
  
  // Read all files in the simulation directory
  const files = fs.readdirSync(simulationDir);
  
  // Filter for files matching the pattern automated-simulation-**-*.json
  const simulationFiles = files.filter(file => 
    file.startsWith('automated-simulation-') && file.endsWith('.json')
  );
  
  if (simulationFiles.length === 0) {
    console.log('No automated simulation files found.');
    return [];
  }
  
  console.log(`Found ${simulationFiles.length} automated simulation files.`);
  
  // Process each file
  const processedFiles = simulationFiles.map(file => {
    try {
      const filePath = path.join(simulationDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const portfolioData = JSON.parse(fileContent);
      
      // Extract the filename without path and extension for identification
      const fileName = path.basename(filePath);
      
      return {
        fileName: fileName,
        portfolio: portfolioData,
        totalValue: calculateTotalValue(portfolioData.assets),
        activeValue: calculateActivePositionsValue(portfolioData.assets),
        closedValue: calculateClosedPositionsValue(portfolioData.assets)
      };
    } catch (error) {
      console.error(`Error processing file ${file}:`, error.message);
      return null;
    }
  }).filter(result => result !== null); // Remove any failed processing
  
  // Sort by filename to ensure consistent ordering
  processedFiles.sort((a, b) => {
    const numA = parseInt(a.fileName.split('-')[3]); // Extract run number from filename
    const numB = parseInt(b.fileName.split('-')[3]);
    return numA - numB;
  });
  
  return processedFiles;
}

// Function to generate HTML visualization
function generateHTMLVisualization(simulationData) {
  console.log('Generating HTML visualization...');
  
  // Extract run numbers and values for chart data
  const labels = simulationData.map(data => data.fileName.replace('.json', '')); 
  const values = simulationData.map(data => data.totalValue);
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Automated Simulation Results</title>
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
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .data-table th, .data-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .data-table th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Automated Simulation Results</h1>
        <p>This visualization shows the final portfolio values for each automated simulation run.</p>
        
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
        
        <h3>Detailed Results</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Run #</th>
                    <th>File Name</th>
                    <th>Total Value</th>
                    <th>Active Value</th>
                    <th>Closed Value</th>
                </tr>
            </thead>
            <tbody>
                ${simulationData.map(data => {
                  const runNumber = data.fileName.split('-')[3];
                  return `
                    <tr>
                        <td>${runNumber}</td>
                        <td>${data.fileName}</td>
                        <td>$${data.totalValue.toFixed(2)}</td>
                        <td>$${data.activeValue.toFixed(2)}</td>
                        <td>$${data.closedValue.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
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
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const htmlFilename = `automated-simulation-results-${timestamp}.html`;
  const htmlPath = path.join(__dirname, '..', 'automation', htmlFilename);
  fs.writeFileSync(htmlPath, htmlContent);
  
  console.log(`Visualization generated successfully! Open ${htmlFilename} in your browser.`);
  return htmlPath;
}

// Main automated analysis pipeline
function runAutomatedAnalysis() {
  try {
    console.log('Starting Automated Analysis Pipeline...');
    
    // Step 1: Run automated simulations
    console.log('Step 1: Running automated simulations...');
    const simulationResults = runAutomatedSimulations();
    
    // Step 2: Process results
    console.log('Step 2: Processing simulation results...');
    const processedData = processSimulationResults();
    
    // Step 3: Generate analysis report
    console.log('Step 3: Generating analysis report...');
    const reportPath = generateAnalysisReport(simulationResults);
    
    // Step 4: Generate HTML visualization
    console.log('Step 4: Generating HTML visualization...');
    const htmlPath = generateHTMLVisualization(processedData);
    
    console.log('Automated analysis pipeline completed successfully!');
    console.log(`Analysis report saved to: ${reportPath}`);
    console.log(`HTML visualization saved to: ${htmlPath}`);
    
    return {
      success: true,
      simulationResults: simulationResults,
      reportPath: reportPath,
      htmlPath: htmlPath
    };
  } catch (error) {
    console.error('Error in automated analysis pipeline:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export functions for use in other modules
module.exports = {
  runAutomatedAnalysis,
  processSimulationResults,
  generateHTMLVisualization
};

// Run if this file is executed directly
if (require.main === module) {
  runAutomatedAnalysis();
}
