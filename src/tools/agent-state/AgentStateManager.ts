import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../logger/JsonLogger.js';

export interface AgentState {
  taskId: string;
  taskType: string;
  target?: string;
  currentStep: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  lastUpdate: string;
  completedSteps: string[];
  nextAction: string;
  lastOutput?: string;
  metadata?: Record<string, any>;
}

export class AgentStateManager {
  private agentDir: string;
  private stateFile: string;

  constructor(workspacePath: string) {
    this.agentDir = path.join(workspacePath, '.agent');
    this.stateFile = path.join(this.agentDir, 'current_state.json');
  }

  public ensureAgentDir(): void {
    if (!fs.existsSync(this.agentDir)) {
      fs.mkdirSync(this.agentDir, { recursive: true });
    }
  }

  public saveState(state: AgentState): void {
    this.ensureAgentDir();
    state.lastUpdate = new Date().toISOString();
    
    fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2), 'utf-8');
    
    logger.info('agent.state.saved', { 
      taskId: state.taskId, 
      step: state.currentStep,
      agentStatus: state.status 
    });
  }

  public loadState(): AgentState | null {
    if (!fs.existsSync(this.stateFile)) return null;

    try {
      const content = fs.readFileSync(this.stateFile, 'utf-8');
      const state = JSON.parse(content) as AgentState;
      
      logger.info('agent.state.loaded', { 
        taskId: state.taskId, 
        step: state.currentStep 
      });
      
      return state;
    } catch (error: any) {
      logger.error('agent.state.load.failed', { error: error.message });
      return null;
    }
  }

  public addCompletedStep(step: string, output?: string): void {
    const state = this.loadState();
    if (state) {
      state.completedSteps.push(step);
      state.lastOutput = output;
      this.saveState(state);
    }
  }

  public setCurrentStep(step: string, nextAction: string): void {
    const state = this.loadState();
    if (state) {
      state.currentStep = step;
      state.nextAction = nextAction;
      this.saveState(state);
    }
  }

  public setStatus(status: AgentState['status']): void {
    const state = this.loadState();
    if (state) {
      state.status = status;
      this.saveState(state);
    }
  }

  public clearState(): void {
    if (fs.existsSync(this.stateFile)) {
      fs.unlinkSync(this.stateFile);
      logger.info('agent.state.cleared');
    }
  }

  public hasState(): boolean {
    return fs.existsSync(this.stateFile);
  }
}