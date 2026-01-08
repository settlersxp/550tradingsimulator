import { beforeEach, describe, it, expect } from 'vitest'
import { ActionHistory } from '../history/ActionHistory'

describe('ActionHistory', () => {
  beforeEach(() => {
    // Clear history before each test
    const history = ActionHistory.getInstance();
    history.clear();
  });

  it('should record actions and retrieve them', () => {
    const history = ActionHistory.getInstance();
    
    // Record some actions
    history.recordAction('testAction1', 'AssetA', { param1: 'value1' });
    history.recordAction('testAction2', 'AssetB', { param2: 'value2' }, { result: 'success' });
    
    // Retrieve actions
    const actions = history.getActions();
    
    expect(actions).toHaveLength(2);
    expect(actions[0]).toEqual({
      timestamp: expect.any(String),
      actionType: 'testAction1',
      assetName: 'AssetA',
      params: { param1: 'value1' },
      result: undefined
    });
    expect(actions[1]).toEqual({
      timestamp: expect.any(String),
      actionType: 'testAction2',
      assetName: 'AssetB',
      params: { param2: 'value2' },
      result: { result: 'success' }
    });
  });

  it('should export history as JSON', () => {
    const history = ActionHistory.getInstance();
    
    history.recordAction('testAction', 'TestAsset', { testParam: 'testValue' });
    
    const jsonExport = history.exportAsJson();
    expect(jsonExport).toContain('testAction');
    expect(jsonExport).toContain('TestAsset');
    expect(jsonExport).toContain('testValue');
  });

  it('should export history as text', () => {
    const history = ActionHistory.getInstance();
    
    history.recordAction('testAction', 'TestAsset', { testParam: 'testValue' });
    
    const textExport = history.exportAsText();
    expect(textExport).toContain('[testAction] on TestAsset:');
    expect(textExport).toContain('testValue');
  });

  it('should export history as CSV', () => {
    const history = ActionHistory.getInstance();
    
    history.recordAction('testAction', 'TestAsset', { testParam: 'testValue' });
    
    const csvExport = history.exportAsCsv();
    expect(csvExport).toContain('Timestamp,Action Type,Asset Name,Parameters,Result');
    expect(csvExport).toContain('testAction');
  });

  it('should clear history', () => {
    const history = ActionHistory.getInstance();
    
    history.recordAction('testAction', 'TestAsset', { testParam: 'testValue' });
    expect(history.getActions()).toHaveLength(1);
    
    history.clear();
    expect(history.getActions()).toHaveLength(0);
  });

  it('should be a singleton', () => {
    const history1 = ActionHistory.getInstance();
    const history2 = ActionHistory.getInstance();
    
    expect(history1).toBe(history2);
  });
});
