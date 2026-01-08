/**
 * ActionHistory - A centralized system to track all actions performed on assets
 * This replaces console.log debugging with structured, testable history tracking
 */
export class ActionHistory {
  private static instance: ActionHistory;
  private actions: any[] = [];
  
  private constructor() {}
  
  public static getInstance(): ActionHistory {
    if (!ActionHistory.instance) {
      ActionHistory.instance = new ActionHistory();
    }
    return ActionHistory.instance;
  }
  
  /**
   * Record an action with its parameters and context
   */
  public recordAction(actionType: string, assetName: string, params: any, result?: any): void {
    const timestamp = new Date().toISOString();
    const action = {
      timestamp,
      actionType,
      assetName,
      params,
      result
    };
    
    this.actions.push(action);
  }
  
  /**
   * Get all recorded actions
   */
  public getActions(): any[] {
    return this.actions;
  }
  
  /**
   * Clear all recorded actions
   */
  public clear(): void {
    this.actions = [];
  }
  
  /**
   * Export history as JSON string for easy copy-paste
   */
  public exportAsJson(): string {
    return JSON.stringify(this.actions, null, 2);
  }
  
  /**
   * Export history as formatted text for easy copy-paste
   */
  public exportAsText(): string {
    return this.actions.map(action => 
      `[${action.timestamp}] ${action.actionType} on ${action.assetName}: ${JSON.stringify(action.params)}`
    ).join('\n');
  }
  
  /**
   * Export history as CSV format
   */
  public exportAsCsv(): string {
    if (this.actions.length === 0) return '';
    
    const headers = ['Timestamp', 'Action Type', 'Asset Name', 'Parameters', 'Result'];
    const rows = this.actions.map(action => [
      action.timestamp,
      action.actionType,
      action.assetName,
      JSON.stringify(action.params),
      JSON.stringify(action.result)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}
