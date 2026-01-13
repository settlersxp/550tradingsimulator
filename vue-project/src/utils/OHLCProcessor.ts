/**
 * OHLC Data Processor
 * Handles parsing of OHLC CSV/TSV files with date, open, high, low, close columns
 */

/**
 * Parses OHLC data from CSV or TSV content
 * @param content - Raw file content as string
 * @param fileExtension - File extension (.csv or .tsv)
 * @returns Array of OHLC data objects
 */
export function parseOHLCData(content: string, fileExtension: string): any[] {
  if (!content) {
    return [];
  }

  // Split content into lines
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  // Skip header line
  const dataLines = lines.slice(1);
  
  const ohlcData: any[] = [];
  
  for (const line of dataLines) {
    // Split by delimiter (comma for CSV, tab for TSV)
    const delimiter = fileExtension === '.csv' ? ',' : '\t';
    const values = line.split(delimiter).map(value => value.trim());
    
    // Check if we have the required 5 columns
    if (values.length < 5) {
      continue;
    }
    
    try {
      // Ensure we have exactly 5 values and they are not undefined
      if (values.length < 5) {
        continue;
      }
      
      const date = values[0];
      const openStr = values[1];
      const highStr = values[2];
      const lowStr = values[3];
      const closeStr = values[4];
      
      // Check if any of the values are undefined
      if (date === undefined || openStr === undefined || highStr === undefined || lowStr === undefined || closeStr === undefined) {
        continue;
      }
      
      // Convert to appropriate types
      const open = parseFloat(openStr);
      const high = parseFloat(highStr);
      const low = parseFloat(lowStr);
      const close = parseFloat(closeStr);
      
      // Validate that all values are numbers
      if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
        continue;
      }
      
      ohlcData.push({
        date,
        open,
        high,
        low,
        close
      });
    } catch (error) {
      // Skip invalid lines
      console.error('Error parsing OHLC data line:', error);
      continue;
    }
  }
  
  return ohlcData;
}

/**
 * Validates if a file is a valid OHLC file
 * @param file - File object to validate
 * @returns boolean indicating if file is valid
 */
export function isValidOHLCFile(file: File): boolean {
  if (!file) return false;
  
  const validExtensions = ['.csv', '.tsv'];
  const fileExtension = '.' + (file.name.split('.').pop() || '').toLowerCase();
  
  return validExtensions.includes(fileExtension);
}

/**
 * Gets the number of days in OHLC data
 * @param ohlcData - Array of OHLC data objects
 * @returns number of days
 */
export function getOHLCDataLength(ohlcData: any[]): number {
  return ohlcData.length;
}
